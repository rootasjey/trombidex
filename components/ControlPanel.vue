<template>
  <div class="flex justify-center items-center gap-8 transition-all duration-300">
    <VolumeSlider 
        @volume-change="handleVolumeChange" 
        @mute-change="handleMuteChange" 
      />
    <ToggleTheme />
    <select v-model="currentLanguage" @change="$emit('language-change', currentLanguage)"
      class="font-sans p-2 border border-gray-300 rounded-md 
      focus:outline-none focus:ring-1.2 focus:ring-white/20 bg-white bg-opacity-50 
      backdrop-filter backdrop-blur-lg dark:bg-transparent dark:text-white dark:border-gray-900">
        <option value="en">English</option>
        <option value="fr">Français</option>
    </select>
  </div>
</template>

<script setup lang="ts">
const currentLanguage = ref<'en' | 'fr'>('en')

const emit = defineEmits(['volume-change', 'mute-change', 'language-change'])

const handleVolumeChange = (volume: number) => {
  emit('volume-change', volume)
}

const handleMuteChange = (muted: boolean) => {
  emit('mute-change', muted)
}
</script>

<style scoped>
  .button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 6px 12px;
    gap: 8px;
    height: 36px;
    width: 120px;
    border: none;
    background: #5e41de33;
    border-radius: 20px;
    cursor: pointer;
  }

  .lable {
    line-height: 20px;
    font-size: 17px;
    color: #5D41DE;
    font-family: sans-serif;
    letter-spacing: 1px;
  }

  .button:hover {
    background: #5e41de4d;
  }

  .button:hover .svg-icon {
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
</style>
