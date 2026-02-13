import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/utils/supabase";
import type { User } from "@supabase/supabase-js";
import router from "@/router";

const errorMessage = ref('');

export const useAuthStore = defineStore('authStore', () => {
    const user = ref<User | null>(null);
    const isAuthenticated = computed(() => !!user.value);
    const isInitialized = ref(false);
    
    async function initialize() {
        if (isInitialized.value) return; 

        const { data } = await supabase.auth.getSession()
        if (data.session) {
            user.value = data.session.user
        }

        supabase.auth.onAuthStateChange((_event, session) => {
            user.value = session?.user || null;
        })
        isInitialized.value = true;
    }

    async function signOut() {
        await supabase.auth.signOut();
        user.value = null;
        router.push('/login');
    }

    const loginUser = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            errorMessage.value = error.message;
            return;
        }
        const username = data.user?.user_metadata.username;

        if (username) {
            router.push(`/user/${username}`)
        }
        else router.push(`/`);
    }

    const registerUser = async (username: string, email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                }
            }
        });

        if (error) errorMessage.value = error.message;
        else router.push(`/user/${username}`);
    }
    return {
        initialize,
        signOut,
        user,
        isAuthenticated,
        isInitialized,
        loginUser,
        registerUser,
        errorMessage
    }
})