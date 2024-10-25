import presetUno from '@unocss/preset-uno'
import presetWebFonts from '@unocss/preset-web-fonts'
import { defineConfig } from 'unocss'

export default defineConfig({
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
})
