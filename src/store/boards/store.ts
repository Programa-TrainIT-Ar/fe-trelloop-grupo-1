import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware';
import { useAuthStore } from '../auth';
import { projectGetSourceForAsset } from 'next/dist/build/swc/generated-native';
import Background from "@/assets/background-card-image.png"
import { ExpandedBoardCard } from '@/components/board/ExpandedBoardCard';
import Member from "@/assets/member.png"


const API_URL = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
}

export interface Tag {
    id: string;
    name: string;
}
export interface AuthState {
    user: User | null;
    toker: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}
export interface Board {
    id: number;
    name: string;
    description?: string;
    image?: string;
    creationDate: string;
    userId: number;
    members: User[];
    tags: Tag[];
    isPublic: boolean;
}
export interface BoardState {
    boards: Board[];
    expandedBoardID: number | null;
    isLoading?: boolean;
    error?: string;

    //busqueda y filtros
    searchQuery: string;
    filteredBoards: Board[];
    // Acciones
    setBoards: (boards: Board[]) => void;
    expandBoard: (id: number) => void;
    removeBoard: (boardId: number) => void;
    setLoading: (isLoading: boolean) => void;
    getBoards: () => Promise<boolean>;

    setSearchQuery: (query: string) => void;
    filterBoards: () => void;
}

export const useBoardStore = create<BoardState>()(
    (set, get) => ({
        // Estado inicial
        boards: [],
        expandedBoardID: null,
        isLoading: false,
        error: undefined,

        //busqueda
        searchQuery: '',
        filteredBoards: [],

        // Acciones
        setBoards: (boards) => set({ boards }),
        expandBoard: (id) => set({ expandedBoardID: id }),
        removeBoard: (boardId:number) =>
            set({ boards: get().boards.filter((b) => b.id !== boardId) }),
        setLoading: (isLoading) => set({ isLoading }),
        getBoards: async () => {

            try {
                set({ isLoading: true });
                const token = useAuthStore.getState().accessToken
                console.log(token)
                const response = await fetch(`${API_URL}/board/getMyBoards`, {
                    method: 'GET',
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                const data = await response.json();
                set({
                    boards: data,
                    filteredBoards: data,
                    isLoading: false,
                    error: undefined,
                });


                console.log(data)
                set({ boards: data })


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

        setSearchQuery: (query) => set({ searchQuery: query }),
        filterBoards: () => {
            const { boards, searchQuery } = get();
            const filtered = boards.filter((board: Board) =>
                board.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            set({ filteredBoards: filtered });
        },


    })


);
