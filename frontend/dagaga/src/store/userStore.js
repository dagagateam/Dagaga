import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null, // { userId, email, nickname, locationId, viewLangCode, nativeLangCode }
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null,
      savedItems: [], // Array of community objects
      likedPostIds: [], // Array of IDs
      joinedChats: [], // Persisted chat rooms

      // Login with full AuthResponse
      login: (authResponse) => set({ 
        user: {
          userId: authResponse.userId,
          email: authResponse.email,
          locationId: authResponse.locationId,
          viewLangCode: authResponse.viewLangCode,
          nativeLangCode: authResponse.nativeLangCode,
          nickname: authResponse.nickname,
        },
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        isLoggedIn: true 
      }),
      
      logout: () => set({ 
        user: null, 
        isLoggedIn: false,
        accessToken: null,
        refreshToken: null,
        savedItems: [],
        likedPostIds: [],
        joinedChats: []
      }),

      // Set tokens (for refresh)
      setTokens: (accessToken, refreshToken) => set({
        accessToken,
        refreshToken: refreshToken || undefined, // Only update if provided
      }),

      // Clear tokens only
      clearTokens: () => set({
        accessToken: null,
        refreshToken: null,
      }),
      
      setJoinedChats: (chats) => set({ joinedChats: chats }),
      
      toggleSave: (item) => set((state) => {
        const isSaved = state.savedItems.some(i => i.id === item.id);
        if (isSaved) {
          return { savedItems: state.savedItems.filter(i => i.id !== item.id) };
        } else {
          return { savedItems: [...state.savedItems, item] };
        }
      }),

      toggleLike: (id) => set((state) => {
        const isLiked = state.likedPostIds.includes(id);
        if (isLiked) {
          return { likedPostIds: state.likedPostIds.filter(postId => postId !== id) };
        } else {
          return { likedPostIds: [...state.likedPostIds, id] };
        }
      }),
      
      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),
    }),
    {
      name: 'dagaga-user-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);
