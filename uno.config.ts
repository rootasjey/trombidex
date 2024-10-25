import presetUno from '@unocss/preset-uno'
import presetWebFonts from '@unocss/preset-web-fonts'
import { defineConfig } from 'unocss'
import config from '@una-ui/nuxt/una.config'

export default defineConfig({
  ...config,
  presets: [
    presetUno(),
    presetWebFonts({
      provider: 'fontshare',
      fonts: {
        sans: 'Satoshi',
        serif: 'Clash Display',
        mono: 'JetBrains Mono',
        title: 'Bespoke Serif',
      }
    }),
  ],
  rules: [
    // [/^grid-cols-(\d+)$/, ([, d]) => ({ "grid-template-columns": `repeat(${d}, minmax(0, 1fr))` })],
  ],
  safelist: [
    // ...Array.from({ length: 24 }, (_, i) => `grid-cols-${i + 1}`),
  ],
})
