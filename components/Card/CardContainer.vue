<template>
  <div
    :class="['flex items-center justify-center', containerClass]"
    style="perspective: 1000px"
  >
    <div
      ref="containerRef"
      :class="[
        'relative flex items-center justify-center transition-all duration-200 ease-linear',
        $props.class,
      ]"
      style="transform-style: preserve-3d"
      @mouseenter="handleMouseEnter"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <slot />
    </div>
  </div>


    <!-- <ClientOnly>
      <CardContainer>
        <CardBody
          class="group/card relative size-auto rounded-xl border border-black/[0.1] bg-gray-50 p-6 sm:w-[30rem] dark:border-white/[0.2] dark:bg-black dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1]"
        >
          <CardItem
            :translate-z="50"
            class="text-xl font-bold text-neutral-600 dark:text-white"
          >
            Make things float in air
          </CardItem>
          <CardItem
            as="p"
            translate-z="60"
            class="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-300"
          >
            Hover over this card to unleash the power of CSS perspective
          </CardItem>
          <CardItem
            :translate-z="100"
            :rotate-x="20"
            :rotate-z="-10"
            class="mt-4 w-full"
          >
            <NuxtImg
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              height="1000"
              width="1000"
              class="h-60 w-full rounded-xl object-cover group-hover/card:shadow-xl"
              alt="thumbnail"
            />
          </CardItem>
          <div class="mt-20 flex items-center justify-between">
            <CardItem
              :translate-z="20"
              :translate-x="-40"
              as="a"
              href="https://rahulv.dev"
              target="__blank"
              class="rounded-xl px-4 py-2 text-xs font-normal dark:text-white"
            >
              Visit →
            </CardItem>
            <CardItem
              :translate-z="20"
              :translate-x="40"
              as="button"
              class="rounded-xl bg-black px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-black"
            >
              Get Started
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>
    </ClientOnly> -->
</template>

<script setup lang="ts">
import { useMouseState } from "@/lib/useMouseState";
import { provide, ref } from "vue";

const props = defineProps({
  class: String,
  containerClass: String,
});

const containerRef = ref<HTMLElement | null>(null);

const mouseState = useMouseState(); // Use the composable
provide("use3DCardMouseState", mouseState);

function handleMouseMove(e: MouseEvent) {
  if (!containerRef.value) return;
  const { left, top, width, height } = containerRef.value.getBoundingClientRect();
  const x = (e.clientX - left - width / 2) / 25;
  const y = (e.clientY - top - height / 2) / 25;
  containerRef.value.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
}

function handleMouseEnter() {
  mouseState.setMouseEntered(true);
}

function handleMouseLeave() {
  if (!containerRef.value) return;

  mouseState.setMouseEntered(false);
  containerRef.value.style.transform = `rotateY(0deg) rotateX(0deg)`;
}
</script>
