import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/utils/supabase";

export const useProfileStore = defineStore('profileStore', () => {
    const profile = ref({});
    const loading = ref(false);
    const userNotFound = ref(false);

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
            profile.value = {};
        } else {
            profile.value = data;
        }

        loading.value = false;
    };

    return {
        profile,
        loading,
        userNotFound,
        fetchProfile
    };
});