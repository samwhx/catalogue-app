<script setup lang="ts">
import { useAuthStore } from "~/stores/authStore";
import { ref } from "vue";
import BaseModal from "~/components/BaseModal.vue";
import BaseButton from "~/components/BaseButton.vue";

const authStore = useAuthStore();
const email = ref("");
const password = ref("");
const mobileNumber = ref("");
const countryCode = ref("+65");
const authMethod = ref<'email' | 'mobile'>('email');

const countryCodes = [
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+60", country: "MY", flag: "🇲🇾" },
  { code: "+62", country: "ID", flag: "🇮🇩" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
];

const handleSubmit = () => {
  const identifier = authMethod.value === 'email' ? email.value : `${countryCode.value} ${mobileNumber.value}`;
  if (identifier) {
    authStore.login(identifier);
  }
};

const socialLogin = (provider: string) => {
  authStore.login(`${provider.toLowerCase()}@user.com`);
};
</script>

<template>
  <BaseModal :is-open="authStore.isAuthModalOpen" @close="authStore.closeAuthModal">
    <div class="p-8 overflow-y-auto">
      <div class="flex justify-between items-start mb-6">
        <h2 class="text-2xl font-black uppercase tracking-wide text-gray-900">
          {{ authStore.authView === 'login' ? 'Welcome Back' : 'Create Account' }}
        </h2>
        <button @click="authStore.closeAuthModal" class="text-gray-400 hover:text-gray-900">✕</button>
      </div>

      <!-- Toggle Auth Method -->
      <div class="flex border-b border-gray-200 mb-6">
        <button
          @click="authMethod = 'email'"
          class="flex-1 pb-3 text-sm font-bold uppercase tracking-wide transition-colors"
          :class="authMethod === 'email' ? 'text-brand-olive border-b-2 border-brand-olive' : 'text-gray-400 hover:text-gray-600'"
        >
          Email
        </button>
        <button
          @click="authMethod = 'mobile'"
          class="flex-1 pb-3 text-sm font-bold uppercase tracking-wide transition-colors"
          :class="authMethod === 'mobile' ? 'text-brand-olive border-b-2 border-brand-olive' : 'text-gray-400 hover:text-gray-600'"
        >
          Mobile
        </button>
      </div>

      <div class="space-y-4">
        <!-- EMAIL FORM -->
        <div v-if="authMethod === 'email'" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              class="w-full border border-gray-300 px-4 py-3 rounded-sm focus:outline-none focus:border-brand-olive focus:ring-1 focus:ring-brand-olive transition-shadow"
              placeholder="you@example.com"
            >
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Password</label>
            <input
              v-model="password"
              type="password"
              class="w-full border border-gray-300 px-4 py-3 rounded-sm focus:outline-none focus:border-brand-olive focus:ring-1 focus:ring-brand-olive transition-shadow"
              placeholder="••••••••"
            >
          </div>
        </div>

        <!-- MOBILE FORM -->
        <div v-else class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Mobile Number</label>
            <div class="flex">
              <div class="relative">
                <select
                  v-model="countryCode"
                  class="appearance-none bg-gray-50 border border-gray-300 border-r-0 rounded-l-sm pl-3 pr-8 py-3 focus:outline-none focus:border-brand-olive focus:ring-1 focus:ring-brand-olive cursor-pointer"
                >
                  <option v-for="c in countryCodes" :key="c.code" :value="c.code">
                    {{ c.flag }} {{ c.code }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              <input
                v-model="mobileNumber"
                type="tel"
                class="flex-1 border border-gray-300 px-4 py-3 rounded-r-sm focus:outline-none focus:border-brand-olive focus:ring-1 focus:ring-brand-olive transition-shadow"
                placeholder="8123 4567"
              >
            </div>
          </div>
          <!-- OTP placeholder hint -->
          <p class="text-xs text-gray-400 italic">We'll send you a One-Time Password (OTP) via SMS.</p>
        </div>

        <BaseButton
          @click="handleSubmit"
          block
          class="mt-4 shadow-md transition-transform transform active:scale-[0.99]"
        >
          {{ authStore.authView === 'login' ? 'Login' : 'Continue' }}
        </BaseButton>
      </div>

      <!-- Divider -->
      <div class="relative my-8">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200"></div>
        </div>
        <div class="relative flex justify-center text-xs uppercase tracking-widest">
          <span class="px-2 bg-white text-gray-400 font-medium">Or continue with</span>
        </div>
      </div>

      <!-- Social Logins -->
      <div class="space-y-3">
        <BaseButton variant="outline" block @click="socialLogin('Google')">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5" alt="Google">
          Google
        </BaseButton>
        <BaseButton variant="outline" block @click="socialLogin('Facebook')">
          <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" class="w-5 h-5" alt="Facebook">
          Facebook
        </BaseButton>
        <BaseButton variant="outline" block @click="socialLogin('Apple')">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.64 3.4 1.63-3.12 1.81-2.6 6.15.6 7.56-.6 1.55-1.4 3.05-2.65 3.82zm-5.53-12.5c-.03-1.61 1.26-2.96 2.86-3.06.2.71.12 1.53-.21 2.23-.51 1.12-1.73 1.77-2.65 1.77-.12-.9-.03-1.8-.03-1.8z"/></svg>
          Apple
        </BaseButton>
      </div>

      <div class="mt-8 text-center text-sm text-gray-500">
        <span v-if="authStore.authView === 'login'">
          New here?
          <button @click="authStore.openAuthModal('signup')" class="text-brand-olive font-bold hover:underline">Create an account</button>
        </span>
        <span v-else>
          Already have an account?
          <button @click="authStore.openAuthModal('login')" class="text-brand-olive font-bold hover:underline">Login</button>
        </span>
      </div>
    </div>
  </BaseModal>
</template>
