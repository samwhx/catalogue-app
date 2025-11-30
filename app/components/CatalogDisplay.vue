<script setup lang="ts">
import type { Catalog } from "~/types/catalogue";
import SectionList from "./SectionList.vue";
import TheHeader from "./TheHeader.vue";
import HeroBanner from "./HeroBanner.vue";
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";

interface Props {
  catalog: Catalog | null;
}

const props = defineProps<Props>();

const activeSection = ref("");
const isManualScrolling = ref(false);
const observer = ref<IntersectionObserver | null>(null);

const scrollToSection = (sectionId: string) => {
  const el = document.getElementById(`section-${sectionId}`);
  if (el) {
    isManualScrolling.value = true;
    const offset = 120; // Offset for sticky header + breathing room
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });

    activeSection.value = sectionId;

    // Re-enable observer after scroll animation (approx 1s)
    setTimeout(() => {
      isManualScrolling.value = false;
    }, 1000);
  }
};

const setupObserver = () => {
  if (observer.value) observer.value.disconnect();

  // We use a large rootMargin to ensure events fire frequently,
  // but we do the actual "is active" calculation manually based on precise positions.
  observer.value = new IntersectionObserver((entries) => {
    if (isManualScrolling.value) return;

    // Calculate header height + offset
    // The "reading line" is where we consider the user to be looking.
    // Increased to 200px to handle header overlap better
    const offset = 200;

    let bestSectionId = "";
    let minDistance = Infinity;

    // Check if we are at the bottom of the page
    const isAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50;
    if (isAtBottom && props.catalog?.sections?.length) {
      // Activate last section
      activeSection.value = props.catalog!.sections[props.catalog!.sections.length - 1].id;
      return;
    }

    // Check ALL sections to find the one currently covering the reading line
    if (props.catalog?.sections) {
      props.catalog.sections.forEach(section => {
        const el = document.getElementById(`section-${section.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();

          // We want the section that starts before the line and ends after it
          // i.e. rect.top <= offset && rect.bottom > offset
          if (rect.top <= offset && rect.bottom > offset) {
            bestSectionId = section.id;
          }
        }
      });
    }

    if (bestSectionId) {
      activeSection.value = bestSectionId;
    }
  }, {
    // Trigger whenever an element enters/leaves the viewport or crosses 10% lines
    // The important part is that it triggers often enough.
    // By observing, we get a callback on intersect.
    // We check ALL sections in the callback to ensure accuracy.
    rootMargin: '0px 0px 0px 0px',
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
  });

  // Observe all sections
  if (props.catalog?.sections) {
    props.catalog.sections.forEach(section => {
      const el = document.getElementById(`section-${section.id}`);
      if (el) observer.value?.observe(el);
    });
  }
};

onMounted(() => {
  // Wait for DOM to settle
  setTimeout(setupObserver, 500);
});

onUnmounted(() => {
  if (observer.value) observer.value.disconnect();
});

// Re-setup if catalog changes
watch(() => props.catalog, () => {
  nextTick(() => setTimeout(setupObserver, 500));
});
</script>

<template>
  <div v-if="catalog" class="min-h-screen bg-brand-beige text-gray-900 font-sans selection:bg-brand-olive selection:text-white">
    <TheHeader />
    <HeroBanner />

    <div class="max-w-7xl mx-auto flex flex-col md:flex-row relative">
      <!-- Sidebar Navigation (Desktop) -->
      <aside class="hidden md:block w-64 shrink-0 py-12 px-6 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
        <h2 class="text-xl font-black uppercase tracking-wide mb-8 text-gray-900">Our Menu</h2>
        <nav class="space-y-6 border-l-2 border-gray-200/50 ml-1 pl-4">
          <button
            v-for="section in catalog.sections"
            :key="section.id"
            @click="scrollToSection(section.id)"
            class="block w-full text-left text-sm font-bold uppercase tracking-widest transition-all duration-200 relative -ml-[17px]"
            :class="activeSection === section.id ? 'text-brand-olive pl-4 border-l-2 border-brand-olive' : 'text-gray-400 hover:text-brand-olive pl-4 border-l-2 border-transparent'"
          >
            {{ section.name }}
          </button>
        </nav>
      </aside>

      <!-- Mobile Navigation (Horizontal Scroll) -->
      <div class="md:hidden overflow-x-auto flex gap-4 p-4 bg-brand-beige sticky top-[100px] z-20 border-b border-gray-200/50 shadow-sm">
        <button
          v-for="section in catalog.sections"
          :key="section.id"
          @click="scrollToSection(section.id)"
          class="whitespace-nowrap text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-sm border transition-all"
          :class="activeSection === section.id ? 'bg-brand-olive text-white border-brand-olive' : 'bg-white text-gray-600 border-gray-200'"
        >
          {{ section.name }}
        </button>
      </div>

      <!-- Main Content -->
      <main class="flex-1 p-4 md:p-8 w-full">
        <!-- Catalog Title (Optional) -->
        <h1 class="text-3xl font-black uppercase tracking-tighter mb-12 text-brand-olive hidden">
          {{ catalog.name }}
        </h1>

        <SectionList
          v-if="catalog.sections && catalog.sections.length > 0"
          :sections="catalog.sections"
        />

        <div v-else class="text-center text-gray-400 py-24 italic">
          This menu has no sections yet.
        </div>
      </main>
    </div>
  </div>
</template>
