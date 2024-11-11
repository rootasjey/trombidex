<template>
  <div class="pokemon-card group
    bg-white bg-opacity-30 backdrop-filter flex flex-col backdrop-blur-lg 
    rounded-lg shadow-lg p-4 cursor-pointer transition-all 
    hover:bg-opacity-40 dark:bg-gray-800 
    dark:bg-opacity-30 dark:text-white relative overflow-hidden
    cursor-pointer border border-black/[0.1] dark:border-white/[0.05]
  hover:border-black/[0.2] hover:border-dashed hover:transform-scale-110
    dark:hover:border-white/[0.2]"
    @click="$emit('play-cry', pokemon.id)"
    @mouseenter="$emit('mouseenter', pokemon)"
    @mouseleave="$emit('mouseleave', pokemon)">
    <div class="flex flex-row justify-between mb-2 pokemon-card-id">
        <UTooltip 
          size="xs" 
          :_tooltip-provider="{
            delayDuration: 0,
          }"
        >
          <template #default>
            <span 
              class="text-xs font-mono font-600"
              @click="$emit('show-details', pokemon)">
              • {{ pokemon.id?.toString().padStart(3, '0') }}
            </span>
          </template>

          <template #content>
            <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="getTypeClass(pokemon.types[0] || '')">
              {{ pokemon.translatedName || pokemon.name }}
            </span>
          </template>
        </UTooltip>

        <div class="flex flex-wrap justify-center items-center gap-2">
          <UTooltip v-for="type in pokemon.types" :key="type" tooltip="gray" :_tooltip-provider="{
            delayDuration: 0,
          }">
            <template #default>
              <span class="w-4 h-4 md:w-2 md:h-2 rounded-full text-xs font-semibold" :class="getTypeClass(type)">
              </span>
            </template>

            <template #content>
              <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="getTypeClass(type)">
                {{ type }}
              </span>
            </template>
          </UTooltip>
        </div>
      </div>
      <div class="flex flex-col items-center pokemon-card-img">
        <NuxtImg
          :src="pokemon.image" 
          :alt="pokemon.name" 
          class="w-24 h-24 mx-auto"
          height="48"
          width="48"
        />
      </div>
      
      <div class="flex flex-row items-center gap-2
          opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out
          absolute right-2 bottom-2 ">
        <span>{{ pokemon.likes }}</span>
        <NuxtImg
        src="/images/heart.svg"
        alt="like"
        class="w-4 h-4 
          rounded-full 
          dark:invert"
        @click="$emit('like', pokemon)"
      />
      </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  pokemon: {
    id: number;
    likes: number | undefined;
    name: string;
    translatedName?: string;
    types: string[];
    image: string;
  }
}>()

defineEmits<{
  'play-cry': [id: number];
  'show-details': [pokemon: any];
  'like': [pokemon: any];
  'mouseenter': [pokemon: any];
  'mouseleave': [pokemon: any];
}>()

const getTypeClass = (type: string) => {
  const typeClasses: Record<string, string> = {
    normal: 'bg-gray-400 text-white',
    fire: 'bg-red-500 text-white',
    water: 'bg-blue-500 text-white',
    electric: 'bg-yellow-400 text-gray-800',
    grass: 'bg-green-500 text-white',
    ice: 'bg-blue-200 text-gray-800',
    fighting: 'bg-red-700 text-white',
    poison: 'bg-purple-500 text-white',
    ground: 'bg-yellow-600 text-white',
    flying: 'bg-indigo-400 text-white',
    psychic: 'bg-pink-500 text-white',
    bug: 'bg-green-400 text-gray-800',
    rock: 'bg-yellow-700 text-white',
    ghost: 'bg-purple-700 text-white',
    dragon: 'bg-indigo-700 text-white',
    dark: 'bg-gray-700 text-white',
    steel: 'bg-gray-500 text-white',
    fairy: 'bg-pink-300 text-gray-800',
  };

  return typeClasses[type.toLowerCase()] || 'bg-gray-400 text-white';
};

const getGradientStyle = (type: string) => {
  const gradientColors: Record<string, [string, string]> = {
    normal: ['#A8A878', '#C6C6A7'],
    fire: ['#F08030', '#F5AC78'],
    water: ['#6890F0', '#9DB7F5'],
    electric: ['#F8D030', '#FAE078'],
    grass: ['#78C850', '#A7DB8D'],
    ice: ['#98D8D8', '#BCE6E6'],
    fighting: ['#C03028', '#D67873'],
    poison: ['#A040A0', '#C183C1'],
    ground: ['#E0C068', '#EBD69D'],
    flying: ['#A890F0', '#C6B7F5'],
    psychic: ['#F85888', '#FA92B2'],
    bug: ['#A8B820', '#C6D16E'],
    rock: ['#B8A038', '#D1C17D'],
    ghost: ['#705898', '#A292BC'],
    dragon: ['#7038F8', '#A27DFA'],
    dark: ['#705848', '#A29288'],
    steel: ['#B8B8D0', '#D1D1E0'],
    fairy: ['#EE99AC', '#F4BDC9'],
  };

  const colors = gradientColors[type.toLowerCase()] || gradientColors.normal;
  return {
    background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
  };
};

</script>

<style scoped>
.pokemon-card {
  transform-style: preserve-3d;
  transform: perspective(1000px);
}

.pokemon-card-id {
  transform: translateZ(50px);
}

.pokemon-card-img {
  transform: translateZ(120px);
}
</style>
