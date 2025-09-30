import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware';
import { useAuthStore } from '../auth';
import { projectGetSourceForAsset } from 'next/dist/build/swc/generated-native';
import Background from "@/assets/background-card-image.png"
import { ExpandedBoardCard } from '@/components/board/ExpandedBoardCard';
import Member from "@/assets/member.png"


const API_URL = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';


export const useBoardStore = create(
        (set, get) => ({
            // Estado inicial
            boards: [],
            expandedBoardID: null,

            // Acciones
            expandBoard: (id) => {
                set({expandedBoardID: id})
            },
            removeBoard: (boardId) => {
                set((state) => ({
                    boards: state.boards.filter(board => board.id !== boardId) 
                }))
            },
            getBoards: async () => {
            
                try {
                    const token = useAuthStore.getState().accessToken
                    console.log(token)
                    const response = await fetch(`${API_URL}/board/getMyBoards`, {
                        method: 'GET',
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        if (response.status === 403) {
                            throw new Error("Forbidden : no tienes acceso a este tablero");
                        }
                        throw new Error(`Error ${response.status}: ${response.statusText}`);
                    }
                    const data = await response.json();
                  set({
                    boards: data
                  });
                    
                  
                    console.log(data)
              
                    return true;
                } catch (error) {
                    console.log(error)
                    set({
                        isLoading: false,
                        error: 'Error de conexión con el servidor'
                    });
                    return false;
                }
            }


        })
    

);
