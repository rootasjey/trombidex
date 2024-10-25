<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl p-6 max-w-md w-full dark:bg-gray-800 dark:bg-opacity-70 dark:text-white">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">{{ getTranslatedName(pokemon, currentLanguage) }}</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-300 dark:hover:text-gray-100">
          <span class="text-2xl">&times;</span>
        </button>
      </div>
      <img :src="pokemon.image" :alt="pokemon.name" class="w-40 h-40 mx-auto mb-4" />
      <div class="flex flex-wrap justify-center gap-2 mb-4">
        <span v-for="type in pokemon.types" :key="type" class="px-2 py-1 rounded-full text-xs font-semibold" :class="getTypeClass(type)">
          {{ type }}
        </span>
      </div>
      <p class="mb-2"><span class="font-semibold">{{ translations.height }}:</span> {{ pokemon.height / 10 }} m</p>
      <p class="mb-2"><span class="font-semibold">{{ translations.weight }}:</span> {{ pokemon.weight / 10 }} kg</p>
      <h3 class="text-lg font-semibold mt-4 mb-2">{{ translations.abilities }}:</h3>
      <ul class="list-disc list-inside mb-4">
        <li v-for="ability in pokemon.abilities" :key="ability">{{ ability }}</li>
      </ul>
      <h3 class="text-lg font-semibold mb-2">{{ translations.stats }}:</h3>
      <ul class="space-y-2">
        <li v-for="stat in pokemon.stats" :key="stat.name" class="flex items-center">
          <span class="w-24 font-semibold">{{ stat.name }}:</span>
          <div class="flex-grow bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div class="bg-red-600 h-2.5 rounded-full" :style="{ width: `${stat.value / 2}%` }"></div>
          </div>
          <span class="ml-2">{{ stat.value }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const colorMode = useColorMode()
const props = defineProps({
  pokemon: {
    type: Object,
    required: true,
  },
  translations: {
    type: Object,
    required: true,
  },
  currentLanguage: {
    type: String,
    required: true,
  },
});

defineEmits(['close']);

const getTranslatedName = (pokemon, language) => {
  const translation = pokemon.names.find(name => name.language.name === language);
  return translation ? translation.name : pokemon.name;
};

const getTypeClass = (type) => {
  const typeClasses = {
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
</script>