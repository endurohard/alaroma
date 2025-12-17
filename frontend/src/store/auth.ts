import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
  hasRole: (roles: string | string[]) => boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          console.log('Получен ответ от API:', response);
          console.log('response.user:', response.user);
          console.log('typeof response.user:', typeof response.user);
          console.log('JSON.stringify(response.user):', JSON.stringify(response.user));

          const newState = {
            user: response.user,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          };

          console.log('Устанавливаем новый state:', newState);
          console.log('newState.user:', newState.user);

          // Сохраняем токены также в localStorage для axios interceptor
          localStorage.setItem('accessToken', response.access_token);
          localStorage.setItem('refreshToken', response.refresh_token);

          set(newState);

          // Проверяем что сохранилось
          const currentState = get();
          console.log('Текущий state после set:', {
            user: currentState.user,
            accessToken: currentState.accessToken,
            isAuthenticated: currentState.isAuthenticated,
          });
          console.log('Полный state:', currentState);
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Ошибка входа',
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Очищаем токены из localStorage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          // Очищаем всё независимо от результата
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshUser: async () => {
        set({ isLoading: true });
        try {
          const user = await authApi.me();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Refresh user error:', error);
          // Если не удалось обновить пользователя - разлогиниваем
          get().logout();
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      clearError: () => {
        set({ error: null });
      },

      hasRole: (roles: string | string[]) => {
        const { user } = get();
        if (!user) return false;

        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Гидрация завершена, state=', state);

        // Восстанавливаем токены в localStorage для axios interceptor
        if (state?.accessToken) {
          localStorage.setItem('accessToken', state.accessToken);
        }
        if (state?.refreshToken) {
          localStorage.setItem('refreshToken', state.refreshToken);
        }

        state?.setHasHydrated(true);
      },
    }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectUserRole = (state: AuthState) => state.user?.role;
