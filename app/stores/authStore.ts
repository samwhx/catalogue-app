import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
    user: null as { name: string; email: string } | null,
    isAuthModalOpen: false,
    authView: 'login' as 'login' | 'signup',
  }),

  actions: {
    openAuthModal(view: 'login' | 'signup' = 'login') {
      this.authView = view;
      this.isAuthModalOpen = true;
    },

    closeAuthModal() {
      this.isAuthModalOpen = false;
    },

    login(email: string) {
      // Mock login
      this.isAuthenticated = true;
      this.user = {
        name: email.split('@')[0],
        email: email,
      };
      this.closeAuthModal();
    },

    logout() {
      this.isAuthenticated = false;
      this.user = null;
    }
  }
});
