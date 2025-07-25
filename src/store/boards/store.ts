import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware';
import { useAuthStore } from '../auth';
import { projectGetSourceForAsset } from 'next/dist/build/swc/generated-native';
import Background from "@/assets/background-card-image.png"


const API_URL = "https://2135kz5p-5000.use2.devtunnels.ms"

export const useBoardStore = create(
        (set, get) => ({
            // Estado inicial
            boards: null,

            // Acciones
            getBoards: () => {
               console.log("Prueba de que si paso el null")
                set({boards: 
                    [
                    {
                        name: "Tablero 1",
                        creationDate: "2025-07-22T23:15:53.704992",
                        description: "Prueba de descripción de tablero",
                        id: 1,
                        image: "https://trainit404.s3.amazonaws.com/boards/8a3a19c3cb2543ed8efac56f90ab96b3.png",
                        isPublic: true,
                        members: [{}, {}, {}, {}, {}, {}],
                        tags: [ {id: 1, name: "General"}, {id: 1, name: "General"}, {id: 2, name: "General"},{id: 3, name: "General"},{id: 4, name: "General"},{id: 5, name: "General"}],
                        userId: 1
                    }, 
                    {
                        name: "Tablero 1",
                        creationDate: "2025-07-22T23:15:53.704992",
                        description: "Prueba de descripción de tablero",
                        id: 1,
                        image: "https://trainit404.s3.amazonaws.com/boards/8a3a19c3cb2543ed8efac56f90ab96b3.png",
                        isPublic: true,
                        members: [{}, {}, {}, {}, {}, {}],
                        tags: [ {id: 1, name: "General"}, {id: 1, name: "General"}, {id: 2, name: "General"},{id: 3, name: "General"},{id: 4, name: "General"},{id: 5, name: "General"}],
                        userId: 1
                    },
                    {
                        name: "Tablero 1",
                        creationDate: "2025-07-22T23:15:53.704992",
                        description: "Prueba de descripción de tablero",
                        id: 1,
                        image: "https://trainit404.s3.amazonaws.com/boards/8a3a19c3cb2543ed8efac56f90ab96b3.png",
                        isPublic: true,
                        members: [{}, {}, {}, {}, {}, {}],
                        tags: [ {id: 1, name: "General"}, {id: 1, name: "General"}, {id: 2, name: "General"},{id: 3, name: "General"},{id: 4, name: "General"},{id: 5, name: "General"}],
                        userId: 1
                    },
                    {
                        name: "Tablero 1",
                        creationDate: "2025-07-22T23:15:53.704992",
                        description: "Prueba de descripción de tablero",
                        id: 1,
                        image: "https://trainit404.s3.amazonaws.com/boards/8a3a19c3cb2543ed8efac56f90ab96b3.png",
                        isPublic: true,
                        members: [{}, {}, {}, {}, {}, {}],
                        tags: [ {id: 1, name: "General"}, {id: 1, name: "General"}, {id: 2, name: "General"},{id: 3, name: "General"},{id: 4, name: "General"},{id: 5, name: "General"}],
                        userId: 1
                    },
                    {
                        name: "Tablero 1",
                        creationDate: "2025-07-22T23:15:53.704992",
                        description: "Prueba de descripción de tablero",
                        id: 1,
                        image: "https://trainit404.s3.amazonaws.com/boards/8a3a19c3cb2543ed8efac56f90ab96b3.png",
                        isPublic: true,
                        members: [{}, {}, {}, {}, {}, {}],
                        tags: [ {id: 1, name: "General"}, {id: 1, name: "General"}, {id: 2, name: "General"},{id: 3, name: "General"},{id: 4, name: "General"},{id: 5, name: "General"}],
                        userId: 1
                    },
                ]
                
            })
                // try {
                //     const token = useAuthStore.getState().accessToken
                //     console.log(token)
                //     const response = await fetch(`${API_URL}/board/getMyBoards`, {
                //         method: 'GET',
                //         headers: {
                //             "Authorization": `Bearer ${token}`
                //         }
                //     });

                //     const data = await response.json();
                //   set({
                //     boards: data
                //   })
                    
                  
                //     console.log(data)
                //     set({boards: data})

              
                //     return true;
                // } catch (error) {
                //     console.log(error)
                //     set({
                //         isLoading: false,
                //         error: 'Error de conexión con el servidor'
                //     });
                //     return false;
                // }
            }


        })
    

);
