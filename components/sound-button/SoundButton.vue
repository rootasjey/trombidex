<template>
  <label class="theme">
    <input class="input" :checked="checked" type="checkbox">
    <svg width="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" height="24" fill="none" class="icon icon-speaker-muted"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
    <svg viewBox="0 0 24 24" class="icon icon-speaker"><path d="M14.47 3.12a1 1 0 0 0-1-.12L6.51 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3.51l6.93 2.89a1 1 0 0 0 1-.12A1 1 0 0 0 15 20V4a1 1 0 0 0-.53-.88ZM13 17.88l-5.07-2.12A1 1 0 0 0 7.51 15H4V9h3.51a1 1 0 0 0 .42-.09L13 6.12Zm4.36-13.24a1 1 0 0 0-.72 1.86A6.2 6.2 0 0 1 19 11.5a6.2 6.2 0 0 1-2.36 4.88 1 1 0 0 0 1.44 1.39A8.24 8.24 0 0 0 21 11.5a8.24 8.24 0 0 0-2.92-6.26 1 1 0 0 0-.72-.28Z"/></svg>
  </label>
</template>

<script lang="ts" setup>
  const checked = ref(false)
</script>

<style scoped>
  .theme {
    --bg-color: #fff;
    --main-color: #323232;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    background-color: var(--bg-color);
    border-radius: 100%;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);

    scale: 0.8;
  }

  .input {
    cursor: pointer;
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 10;
    opacity: 0;
  }

  .icon {
    position: absolute;
    top: calc(50% -13px);
    left: calc(50% -13px);
    width: 26px;
    height: 26px;
  }

  .icon.icon-speaker {
    fill: var(--main-color);
  }

  .icon.icon-speaker-muted {
    stroke: var(--main-color);
    display: none;
  }

  .input:checked ~ .icon.icon-speaker-muted {
    display: block;
  }

  .input:checked ~ .icon.icon-speaker {
    display: none;
  }

  .theme:active {
    box-shadow: 0px 0px var(--main-color);
    transform: translate(3px, 3px);
  }
</style>
