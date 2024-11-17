<template>
  <div class="flex">
    <MuteToggle v-model:checked="isSoundOn" />
    <div 
      class="volume-bars" 
      @click="handleVolumeChange"
      @mousemove="handleVolumeChange"
      @keydown="handleKeyDown"
      tabindex="0"
      :title="`Volume: ${Math.round(currentVolume * 100)}%`"
    >
      <div 
        v-for="(bar, index) in bars" 
        :key="index" 
        class="bar"
        :style="{ height: bar.height }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

const currentVolume = ref(0.5)
const isSoundOn = ref(true)
const lastVolume = ref(0.5)
const bars = ref(Array(15).fill({ height: '10%' }))

const updateVolumeBars = () => {
  const activeBarCount = Math.round(currentVolume.value * bars.value.length)
  bars.value = Array(15).fill(null).map((_, index) => ({
    height: index < activeBarCount ? '100%' : '10%'
  }))
}

const handleVolumeChange = (e) => {
  if (e.buttons !== 1 && e.type !== 'click') return
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left
  currentVolume.value = Math.max(0, Math.min(1, x / rect.width))

  updateVolumeBars()
  emit('volume-change', currentVolume.value)
}

const handleKeyDown = (e) => {
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      currentVolume.value = Math.min(1, currentVolume.value + 0.1)
      break
    case 'ArrowLeft':
    case 'ArrowDown':
      currentVolume.value = Math.max(0, currentVolume.value - 0.1)
      break
    default:
      return
  }
  updateVolumeBars()
  emit('volume-change', currentVolume.value)
}

const toggleMute = () => {
  if (isSoundOn.value) {
    currentVolume.value = lastVolume.value
    isSoundOn.value = false
  } else {
    lastVolume.value = currentVolume.value
    currentVolume.value = 0
    isSoundOn.value = true
  }
  updateVolumeBars()
  emit('volume-change', currentVolume.value)
  emit('mute-change', !isSoundOn.value)
}

const emit = defineEmits(['volume-change', 'mute-change'])

onMounted(() => {
  currentVolume.value = parseFloat(localStorage.getItem("volume") ?? "0.5")
  isSoundOn.value = localStorage.getItem("isMuted") !== "true"
  lastVolume.value = currentVolume.value
  updateVolumeBars()
})

watch(isSoundOn, (newIsSoundOn) => {
  if (newIsSoundOn) {
    currentVolume.value = lastVolume.value
    updateVolumeBars()
    emit('volume-change', currentVolume.value)
    emit('g', !isSoundOn.value)
    return
  }

  lastVolume.value = currentVolume.value
  currentVolume.value = 0
  updateVolumeBars()
  emit('volume-change', currentVolume.value)
  emit('mute-change', !isSoundOn.value)
})

</script>

<style scoped>
.volume-bars {
  display: flex;
  align-items: flex-end;
  width: 100px;
  height: 50px;
  padding: 15px;
  border-radius: 5px;
  cursor: pointer;
}

.bar {
  width: 10%;
  background-color: #A5A5B0;
  border-radius: 15px;
  margin: 0 1px;
  transition: height 0.2s ease;
}

.dark .bar {
  background-color: #eee;
}

</style>
