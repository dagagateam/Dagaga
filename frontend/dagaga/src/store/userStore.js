import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null, // { nickname, email, region, nativeLang, preferredLang, entryDate, etc. }
      isLoggedIn: false,
      savedItems: [], // Array of community objects
      likedPostIds: [], // Array of IDs

      login: (userData) => set({ 
        user: userData, 
        isLoggedIn: true 
      }),
      
      logout: () => set({ 
        user: null, 
        isLoggedIn: false,
        savedItems: [],
        likedPostIds: []
      }),
      
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
