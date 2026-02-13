import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/utils/supabase';

export interface LibraryItem {
    id: string;
    user_id: string;
    game_id: string;
    status: 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'DROPPED' | 'WISHLIST';
    platform: 'PC' | 'PS5' | 'PS4' | 'XBOX' | 'SWITCH' | 'MOBILE' | 'OTHER';
    playtime_minutes: number | null;
    rating: number | null;
    review: string | null;
    started_at: string | null;
    finished_at: string | null;
    updated_at: string;
    games: { 
        title: string; 
        cover_url: string | null; 
        release_date: string | null;
        steam_app_id: number | null;
    };
}

export const STATUS_OPTIONS = [
    { value: 'PLAYING', label: 'Jogando', color: '#22c55e' },
    { value: 'COMPLETED', label: 'Zerado', color: '#3b82f6' },
    { value: 'BACKLOG', label: 'Na Fila', color: '#f59e0b' },
    { value: 'DROPPED', label: 'Abandonado', color: '#ef4444' },
    { value: 'WISHLIST', label: 'Lista de Desejos', color: '#8b5cf6' },
] as const;

export const PLATFORM_OPTIONS = [
    { value: 'PC', label: 'PC' },
    { value: 'PS5', label: 'PlayStation 5' },
    { value: 'PS4', label: 'PlayStation 4' },
    { value: 'XBOX', label: 'Xbox' },
    { value: 'SWITCH', label: 'Nintendo Switch' },
    { value: 'MOBILE', label: 'Mobile' },
    { value: 'OTHER', label: 'Outro' },
] as const;

export const useLibraryStore = defineStore('library', () => {
    const libraryItems = ref<LibraryItem[]>([]);
    const searchResults = ref<any[]>([]);
    const isLoading = ref(false);
    const searchLoading = ref(false);
    const error = ref('');

    let searchController: AbortController | null = null;

    // Computed stats
    const stats = computed(() => {
        const items = libraryItems.value;
        return {
            total: items.length,
            playing: items.filter(i => i.status === 'PLAYING').length,
            completed: items.filter(i => i.status === 'COMPLETED').length,
            backlog: items.filter(i => i.status === 'BACKLOG').length,
            dropped: items.filter(i => i.status === 'DROPPED').length,
            wishlist: items.filter(i => i.status === 'WISHLIST').length,
            totalPlaytime: items.reduce((acc, i) => acc + (i.playtime_minutes || 0), 0),
            averageRating: items.filter(i => i.rating).length > 0 
                ? items.filter(i => i.rating).reduce((acc, i) => acc + (i.rating || 0), 0) / items.filter(i => i.rating).length 
                : 0,
            ratedCount: items.filter(i => i.rating).length,
        };
    });

    async function searchGames(query: string) {
        if (searchController) {
            searchController.abort();
        }
        searchController = new AbortController();

        if (query.length < 2) {
            searchResults.value = [];
            return;
        }

        searchLoading.value = true;

        try {
            const { data, error: dbError } = await supabase
                .from('games')
                .select('id, title, cover_url, release_date')
                .ilike('title', `%${query}%`)
                .limit(10)
                .abortSignal(searchController.signal);

            if (dbError) {
                if (dbError.code !== '20') console.error(dbError);
            } else {
                searchResults.value = data || [];
            }
        } catch (err) {
        } finally {
            searchLoading.value = false;
        }
    }

    async function addGameToLibrary(userId: string, gameId: string, status: string, platform: string) {
        isLoading.value = true;
        error.value = '';

        try {
            const { data, error: dbError } = await supabase
                .from('library_items')
                .insert({
                    user_id: userId,
                    game_id: gameId,
                    status,
                    platform,
                    playtime_minutes: 0
                })
                .select();

            if (dbError) throw dbError;

            await fetchLibrary(userId);

            return true; // Sucesso

        } catch (err: any) {
            if (err.code === '23505') error.value = 'Este jogo já está na sua lista.';
            else error.value = err.message;
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateLibraryItem(itemId: string, updates: object) {
        isLoading.value = true;
        error.value = '';

        try {
            const { error: dbError } = await supabase
                .from('library_items')
                .update(updates) 
                .eq('id', itemId);

            if (dbError) throw dbError;

            const index = libraryItems.value.findIndex(item => item.id === itemId);
            if (index !== -1) {
                libraryItems.value[index] = { ...libraryItems.value[index], ...updates } as LibraryItem;
            }

            return true;
        } catch (err: any) {
            error.value = err.message;
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    async function removeLibraryItem(itemId: string) {
        isLoading.value = true;
        error.value = '';

        try {
            const { error: dbError } = await supabase
                .from('library_items')
                .delete()
                .eq('id', itemId);

            if (dbError) throw dbError;

            libraryItems.value = libraryItems.value.filter(item => item.id !== itemId);

            return true;
        } catch (err: any) {
            error.value = err.message;
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchLibrary(userId: string) {
        isLoading.value = true;
        const { data, error: dbError } = await supabase
            .from('library_items')
            .select(`
                *,
                games ( title, cover_url, release_date )
            `)
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (dbError) {
            error.value = dbError.message;
        } else {
            libraryItems.value = data as unknown as LibraryItem[] || [];
        }
        isLoading.value = false;
    }

    function clearSearch() {
        searchResults.value = [];
    }

    return {
        libraryItems,
        searchResults,
        isLoading,
        searchLoading,
        error,
        searchGames,
        addGameToLibrary,
        updateLibraryItem,
        removeLibraryItem,
        fetchLibrary,
        clearSearch,
        stats
    };
});