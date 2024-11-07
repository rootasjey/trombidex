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
  background-attachment: fixed;
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

/* .dark body {
} */
</style>
