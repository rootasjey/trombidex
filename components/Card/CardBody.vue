<template>
  <div
    :class="cn('', $props.class)"
    style="transform-style: preserve-3d"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from "~/lib/cn";

const props = defineProps({
  class: String,
});
</script>