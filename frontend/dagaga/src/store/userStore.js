import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import i18n from '../i18n';
import stockProfile from '../assets/icons/stock_profile.jpg';

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
      language: 'ko', // Default language

      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },

      // Login with full AuthResponse
      login: (authResponse) => {
        if (authResponse.viewLangCode) {
           i18n.changeLanguage(authResponse.viewLangCode);
        }
        
        set((state) => ({ 
          user: {
            userId: authResponse.userId,
            email: authResponse.email,
            locationId: authResponse.locationId,
            viewLangCode: authResponse.viewLangCode,
            nativeLangCode: authResponse.nativeLangCode,
            nickname: authResponse.nickname,
            profileImage: authResponse.profileImage || stockProfile,
          },
          language: authResponse.viewLangCode || state.language,
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
          isLoggedIn: true 
        }));
      },
      
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
      
      updateUser: (updates) => set((state) => {
        if (updates.viewLangCode) {
            i18n.changeLanguage(updates.viewLangCode);
        }
        return {
           user: { ...state.user, ...updates },
           language: updates.viewLangCode || state.language
        };
      }),

      fetchUser: async () => {
        try {
          const { getUserMeAPI } = await import('../api/userApi');
          const userData = await getUserMeAPI();
          set((state) => ({
            user: {
              ...state.user,
              ...userData,
              profileImage: userData.profileImage || stockProfile,
            },
            // Assuming the API returns viewLangCode, we might want to update the language too
            language: userData.viewLangCode || state.language
          }));
          if (userData.viewLangCode) {
             i18n.changeLanguage(userData.viewLangCode);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      },
    }),
    {
      name: 'dagaga-user-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);
