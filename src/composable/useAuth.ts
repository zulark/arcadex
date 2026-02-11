import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/utils/supabase";
import type { User } from "@supabase/supabase-js";

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const isAuthenticated = ref(false);

    async function initialize() {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
            user.value = data.session.user
            isAuthenticated.value = true
        }

        supabase.auth.onAuthStateChange((_event, session) => {
            user.value = session?.user || null;
            isAuthenticated.value = true
        })
    }

    async function signOut(){
        await supabase.auth.signOut();
        user.value = null;
        isAuthenticated.value = false;
    }

    return{ 
        initialize,
        signOut,
        user,
        isAuthenticated,
    }

})