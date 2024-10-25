<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-opacity-70 p-4 dark:bg-gray-800 dark:text-white">
      <div class="flex flex-col justify-center items-center">
        <h1 class="text-8xl font-title font-400">Trombidex</h1>
        <span class="-mt-12 opacity-60">Search tiny and big creatures, explore another world </span>
      </div>

      <div class="absolute top-2 right-6 flex justify-center items-center mt-4">
        <button @click="toggleColorMode" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <span v-if="$colorMode.value === 'light'" class="i-carbon-moon text-2xl"></span>
          <span v-else class="i-carbon-sun text-2xl"></span>
        </button>
      </div>
    </header>
    <main class="flex-grow p-6 md:p-8 lg:p-10 dark:bg-gray-800 dark:text-white">
      <slot />
    </main>

    <div class="border-element"></div>
  </div>
</template>

<script setup>
const colorMode = useColorMode()

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<style scoped>
.border-element {
  height: calc(100% - 16px);
  width: calc(100% - 16px);
  position: fixed;
  pointer-events: none;
  border: 8px solid;
  border-image: linear-gradient(var(--angle), #ec4899, #d946ef, #a855f7, #d946ef, #ec4899) 1;
  border-radius: 16px;
  /* animation: rotate-gradient 8s linear infinite; */
}
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes rotate-gradient {
  to {
    --angle: 360deg;
  }
}
</style>
