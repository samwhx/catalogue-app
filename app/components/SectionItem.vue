<script setup lang="ts">
import type { Section } from "~/types/catalogue";
import ItemList from "./ItemList.vue";

interface Props {
  section: Section;
}

const props = defineProps<Props>();

const hasContent = computed(() => {
  return (
    (props.section.items && props.section.items.length > 0) ||
    (props.section.sub_sections && props.section.sub_sections.length > 0)
  );
});
</script>

<template>
  <div :id="`section-${section.id}`" class="mb-20 scroll-mt-32">
    <h2 class="text-xl font-black text-gray-900 mb-8 uppercase tracking-wider">
      {{ section.name }}
    </h2>

    <div v-if="hasContent">
      <ItemList v-if="section.items && section.items.length > 0" :items="section.items" />

      <!-- Render sub-sections recursively but flatter -->
      <div v-if="section.sub_sections && section.sub_sections.length > 0" class="mt-12 space-y-12">
        <SectionItem
          v-for="sub in section.sub_sections"
          :key="sub.id"
          :section="sub"
        />
      </div>
    </div>
  </div>
</template>
