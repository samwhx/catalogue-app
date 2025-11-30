<script setup lang="ts">
import type { Section } from "~/types/catalogue";
import SectionItem from "./SectionItem.vue";
import EmptyState from "./EmptyState.vue";

interface Props {
  sections: Section[];
}

const props = defineProps<Props>();
</script>

<template>
  <div v-if="sections && sections.length > 0" class="space-y-8">
    <SectionItem v-for="section in sections" :key="section.id" :section="section" />
  </div>
  <EmptyState v-else message="No sections available" />
</template>
