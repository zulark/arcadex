import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/utils/supabase";

export interface Profile {
    id: string;
    username: string;
    email: string;
    avatar_url: string | null;
    bio: string | null;
    steam_id: string | null;
    created_at: string;
}

export const useProfileStore = defineStore('profileStore', () => {
    const profile = ref<Profile | null>(null);
    const loading = ref(false);
    const userNotFound = ref(false);
    const steamSyncLoading = ref(false);
    const steamSyncError = ref('');

    const fetchProfile = async (username: string) => {
        loading.value = true;
        userNotFound.value = false;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username) 
            .maybeSingle();

        if (error) {
            console.error('Erro de conexão:', error);
        }

        if (!data) {
            userNotFound.value = true;
            profile.value = null;
        } else {
            profile.value = data as Profile;
        }

        loading.value = false;
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!profile.value?.id) return false;

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', profile.value.id);

        if (error) {
            console.error('Erro ao atualizar perfil:', error);
            return false;
        }

        profile.value = { ...profile.value, ...updates } as Profile;
        return true;
    };

    // Steam sync preparation - to be implemented with Steam API
    const linkSteamAccount = async (steamId: string) => {
        steamSyncLoading.value = true;
        steamSyncError.value = '';

        try {
            // Validate Steam ID format (17 digits)
            if (!/^\d{17}$/.test(steamId)) {
                throw new Error('Steam ID inválido. Deve ter 17 dígitos.');
            }

            const success = await updateProfile({ steam_id: steamId });
            
            if (!success) {
                throw new Error('Falha ao vincular conta Steam.');
            }

            return true;
        } catch (err: any) {
            steamSyncError.value = err.message;
            return false;
        } finally {
            steamSyncLoading.value = false;
        }
    };

    const unlinkSteamAccount = async () => {
        return await updateProfile({ steam_id: null });
    };

    // Placeholder for future Steam library sync
    const syncSteamLibrary = async () => {
        if (!profile.value?.steam_id) {
            steamSyncError.value = 'Conta Steam não vinculada.';
            return false;
        }

        steamSyncLoading.value = true;
        steamSyncError.value = '';

        try {
            // TODO: Implement Steam API integration
            // 1. Fetch owned games from Steam API
            // 2. Match with existing games in database (by steam_app_id)
            // 3. Add missing games to user's library
            
            console.log('[STEAM SYNC] Placeholder - Sincronizando biblioteca Steam para:', profile.value.steam_id);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return true;
        } catch (err: any) {
            steamSyncError.value = err.message;
            return false;
        } finally {
            steamSyncLoading.value = false;
        }
    };

    return {
        profile,
        loading,
        userNotFound,
        steamSyncLoading,
        steamSyncError,
        fetchProfile,
        updateProfile,
        linkSteamAccount,
        unlinkSteamAccount,
        syncSteamLibrary
    };
});