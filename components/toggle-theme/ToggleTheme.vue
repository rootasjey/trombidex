
<template>
  <label class="switch">
      <input 
        type="checkbox"
        :checked="colorMode.value === 'light'"
        @change="toggleTheme"
      >
      <span class="slider"></span>
  </label>
</template>

<script lang="ts" setup>
const colorMode = useColorMode()

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<style scoped>
  /* The switch - the box around the slider */
  .switch {
    font-size: 17px;
    position: relative;
    display: inline-block;
    width: 3.5em;
    height: 2em;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    --background: #3D3BF3;
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--background);
    transition: .5s;
    border-radius: 30px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 1.4em;
    width: 1.4em;
    border-radius: 50%;
    left: 10%;
    bottom: 15%;
    box-shadow: inset 8px -4px 0px 0px #F3C623;
    background: var(--background);
    transition: .5s;
  }

  input:checked + .slider {
    background-color: #eee;
  }

  input:checked + .slider:before {
    transform: translateX(100%);
    box-shadow: inset 15px -4px 0px 15px #FFAD60;
  }
</style>
