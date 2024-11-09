<template>
  <div class="min-h-screen flex flex-col">
    <div class="fixed inset-0 -z-10">
      <div class="absolute h-full w-full bg-white dark:bg-black [background-image:linear-gradient(#00000010_1px,transparent_1px),linear-gradient(to_right,#00000010_1px,transparent_1px)] dark:[background-image:linear-gradient(#ffffff10_1px,transparent_1px),linear-gradient(to_right,#ffffff10_1px,transparent_1px)] [background-size:24px_24px]"></div>
    </div>

    <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

    <header class="bg-opacity-70 p-4 dark:text-white">
      <div class="flex flex-col justify-center items-center">
        <h1 class="text-4xl font-sans font-400 mt-12">Trombidex</h1>
        <span class="text-sm opacity-50 font-sans font-200">Search tiny and big creatures, explore another world </span>
      </div>

      <div class="absolute top-2 right-6 flex justify-center items-center mt-4">
        <ThemeButton @click="toggleColorMode" />
        <SoundButton @click="toggleMute" />
      </div>
    </header>

    <main class="flex-grow p-6 md:p-8 lg:p-10 dark:text-white">
      <slot />
    </main>

    <footer class="fixed right-4 bottom-2">
      <UButton 
        as="a" 
        to="https://github.com/rootasjey/trombidex" 
        target="_blank" 
        class="bg-transparent font-mono text-3 opacity-50">
         v{{version}}
      </UButton>
    </footer>

    <div class="border-element"></div>
  </div>
</template>

<script setup>
import { version } from '../package.json'

const colorMode = useColorMode()
const isMuted = ref(false)

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
  localStorage.setItem("isMuted", isMuted.value)

  document.querySelectorAll('audio, video').forEach(el => {
    el.muted = isMuted.value
  })
}
</script>

<style scoped>
.border-element {
  height: 100%;
  width: 100%;
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
