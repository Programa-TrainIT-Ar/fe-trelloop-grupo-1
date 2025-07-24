import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthStore, User } from './model';

const API_URL = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // Estado inicial
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Acciones
            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(`https://2135kz5p-5000.use2.devtunnels.ms/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });

                    const data = await response.json();
                    console.log(data)
                
                    if (!response.ok) {
                        console.log("prueba error")
                        set({ isLoading: false, error: data.error || 'Error al iniciar sesión' });
                        return {error: true, type: "contrasena", message: data.error}
                    }

                    set({
                        user: data.usuario,
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    console.log(data.usuario)
              
                    return true;
                } catch (error) {
                    set({
                        isLoading: false,
                        error: 'Error de conexión con el servidor'
                    });
                    return false;
                }
            },

            register: async (firstName, lastName, email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(`${API_URL}/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ firstName, lastName, email, password }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        set({ isLoading: false, error: data.error || 'Error al registrarse' });
                        return false;
                    }

                    set({
                        user: data.usuario,
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    return true;
                } catch (error) {
                    set({
                        isLoading: false,
                        error: 'Error de conexión con el servidor'
                    });
                    return false;
                }
            },

            logout: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            checkAuth: async () => {
                // Si no hay refresh token, no estamos autenticados
                const { refreshToken } = get();
                if (!refreshToken) return false;
                // Si ya estamos autenticados, no hacemos nada

                set({ isLoading: true });
                try {
                    // Intentar obtener un nuevo access token con el refresh token
                    const response = await fetch(`${API_URL}/auth/refresh`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${refreshToken}`,
                            'Content-Type': 'application/json'
                        },
                    });

                    if (!response.ok) {
                        set({
                            isLoading: false,
                            isAuthenticated: false,
                            user: null,
                            accessToken: null,
                            refreshToken: null
                        });
                        return false;
                    }

                    const data = await response.json();
                    set({
                        accessToken: data.access_token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    // Obtener datos del perfil
                    const profileResponse = await fetch(`${API_URL}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${data.access_token}`
                        }
                    });

                    if (profileResponse.ok) {
                        const profileData = await profileResponse.json();
                        set({ user: profileData.usuario });
                    }

                    return true;
                } catch (error) {
                    set({
                        isLoading: false,
                        isAuthenticated: false,
                        error: 'Error al verificar autenticación'
                    });
                    return false;
                }
            },
            setUser: (user: User) => set({ user, isAuthenticated: true }),
            setToken: (token: string) => set({ accessToken: token }),

        }),
        {
            name: 'auth-storage', // nombre para localStorage
            partialize: (state) => ({
                // Solo guardamos estos valores en localStorage
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                user: state.user,
            }),
        }
    )

);
