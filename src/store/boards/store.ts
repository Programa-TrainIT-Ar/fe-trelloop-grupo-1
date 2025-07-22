import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from '../auth';
import { projectGetSourceForAsset } from 'next/dist/build/swc/generated-native';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const useBoardStore = create<any>()(
    
    persist(
        (set, get) => ({
            // Estado inicial
            boards: null,

            // Acciones
            getBoards: async () => {
                set({ isLoading: true, error: null });
                try {
                    const token = useAuthStore.getState().accessToken
                    console.log(token)
                    const response = await fetch(`https://2135kz5p-5000.use2.devtunnels.ms/board/getMyBoards`, {
                        method: 'GET',
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });

                    const data = await response.json();
                  set({
                    boards: data
                  })
                    
                  
                    console.log(data)
                    set({boards: data})

              
                    return true;
                } catch (error) {
                    console.log(error)
                    set({
                        isLoading: false,
                        error: 'Error de conexión con el servidor'
                    });
                    return false;
                }
            },


        }),
    )

);
