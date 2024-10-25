<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-opacity-70 backdrop-filter backdrop-blur-lg p-4 shadow-lg dark:bg-gray-800 dark:text-white">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Pokédex</h1>
        <button @click="toggleColorMode" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <span v-if="$colorMode.value === 'light'" class="i-carbon-moon text-2xl"></span>
          <span v-else class="i-carbon-sun text-2xl"></span>
        </button>
      </div>
    </header>
    <main class="flex-grow p-6 md:p-8 lg:p-10 bg-white dark:bg-gray-800 dark:text-white">
      <slot />
    </main>
  </div>
</template>

<script setup>
const colorMode = useColorMode()

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>