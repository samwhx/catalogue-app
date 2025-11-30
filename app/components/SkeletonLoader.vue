<template>
  <div class="min-h-screen bg-brand-beige p-8">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      <!-- Sidebar Skeleton -->
      <div class="hidden md:block w-64 shrink-0 space-y-4 mt-20">
        <div class="h-8 w-32 bg-gray-200 rounded animate-pulse mb-8"></div>
        <div v-for="i in 6" :key="i" class="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
      </div>

      <!-- Main Content Skeleton -->
      <div class="flex-1 mt-20">
        <div class="h-8 w-48 bg-gray-200 rounded animate-pulse mb-12"></div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="bg-white rounded-sm shadow-sm h-96 flex flex-col overflow-hidden">
            <div class="h-48 bg-gray-200 animate-pulse"></div>
            <div class="p-6 flex-1 space-y-4">
              <div class="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              <div class="mt-auto flex justify-between items-center pt-4">
                <div class="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
