<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
useHead({
  title: 'Trombidex',
  meta: [
    { name: 'description', content: 'Trombidex is a Pokémon search engine.' },
    { name: 'keywords', content: 'Pokémon, search engine, Pokédex' },
  ],
})
</script>

<style>
body {
  @apply bg-gradient-to-br from-red-400 to-blue-500 min-h-screen;
  background-attachment: fixed;
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

.dark body {
  @apply bg-gradient-to-br from-gray-800 to-gray-900;
}
</style>