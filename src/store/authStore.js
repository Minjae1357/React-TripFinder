import { create } from "zustand";
import { persist } from "zustand/middleware";


export const useAuthStore = create(
    persist(
        (set) => ({
            user : null,
            isLoggedIn: false,
            login:(userData,token) =>
                set({user:userData, accessToken:token, isLoggedIn:true}),
            logout: () => set({user : null, accessToken:null, isLoggedIn: false}), 
        }),
        {name:'auth-storage'}
    )
);