<template>
  <label class="theme">
    <input class="input" :checked="checked" type="checkbox">
    <svg>
      <?xml version="1.0" encoding="UTF-8"?><svg width="24px" height="24px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M3.5 13.8571V10.1429C3.5 9.03829 4.39543 8.14286 5.5 8.14286H8.4C8.59569 8.14286 8.78708 8.08544 8.95046 7.97772L14.9495 4.02228C15.6144 3.5839 16.5 4.06075 16.5 4.85714V19.1429C16.5 19.9392 15.6144 20.4161 14.9495 19.9777L8.95046 16.0223C8.78708 15.9146 8.59569 15.8571 8.4 15.8571H5.5C4.39543 15.8571 3.5 14.9617 3.5 13.8571Z" stroke="#000000" stroke-width="1.5"></path><path d="M20.5 15L20.5 9" stroke="#000000" stroke-width="1.5" stroke-linecap="round"></path></svg>
    </svg>
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
