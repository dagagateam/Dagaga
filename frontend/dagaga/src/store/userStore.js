import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import i18n from '../i18n';
import stockProfile from '../assets/icons/stock_profile.jpg';

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const useUserStore = create(
  persist(
    (set) => ({
      user: null, // { userId, email, nickname, locationId, viewLangCode, nativeLangCode }
      isLoggedIn: false,
      accessToken: null,
      savedItems: [], // Array of community objects
      likedPostIds: [], // Array of IDs
      joinedChats: [], // Persisted chat rooms
      language: 'ko', // Default language

      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },

      // Login with accessToken
      login: (authResponse) => {
        const token = authResponse.accessToken;
        const decoded = decodeJWT(token);

        if (!decoded) {
          console.error("Failed to decode JWT");
          return;
        }

        if (decoded.viewLangCode) {
          i18n.changeLanguage(decoded.viewLangCode);
        }

        set((state) => ({
          user: {
            userId: decoded.userId,
            email: decoded.email,
            locationId: decoded.locationId,
            viewLangCode: decoded.viewLangCode,
            nativeLangCode: decoded.nativeLangCode,
            nickname: decoded.nickname,
            profileImage: authResponse.profileImage || state.user?.profileImage || stockProfile,
          },
          language: decoded.viewLangCode || state.language,
          accessToken: token,
          isLoggedIn: true
        }));
      },

      logout: () => set({
        user: null,
        isLoggedIn: false,
        accessToken: null,
        savedItems: [],
        likedPostIds: [],
        joinedChats: []
      }),

      // Set access token (for refresh)
      setAccessToken: (accessToken) => {
        const decoded = decodeJWT(accessToken);
        set((state) => ({
          accessToken,
          user: decoded ? {
            ...state.user,
            userId: decoded.userId,
            email: decoded.email,
            locationId: decoded.locationId,
            viewLangCode: decoded.viewLangCode,
            nativeLangCode: decoded.nativeLangCode,
            nickname: decoded.nickname,
          } : state.user
        }));
      },

      // Clear tokens only
      clearTokens: () => set({
        accessToken: null,
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

      updateUserProfile: async (updates) => {
        try {
            const { updateUserMeAPI } = await import('../api/userApi');
            const updatedUser = await updateUserMeAPI(updates);
            
            // Check if language changed
            if (updatedUser.viewLangCode) {
                // Ensure we use the exact code that matches resources keys in i18n
                // e.g., 'ko', 'zh', 'vi'
                await i18n.changeLanguage(updatedUser.viewLangCode);
            }

            set((state) => ({
                user: {
                    ...state.user,
                    ...updatedUser,
                    profileImage: updatedUser.profileImage || stockProfile,
                },
                language: updatedUser.viewLangCode || state.language
            }));

            return true;
        } catch (error) {
            console.error("Failed to update user profile:", error);
            throw error;
        }
      },
    }),
    {
      name: 'dagaga-user-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);
