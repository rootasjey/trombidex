<template>
  <div class="max-w-7xl mx-auto font-sans">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
      <input v-model="searchQuery" @input="searchPokemon" :placeholder="translations[currentLanguage].search"
        class="font-sans flex-grow mb-4 sm:mb-0 sm:mr-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg dark:bg-gray-700 dark:text-white dark:border-gray-600" />
      <select v-model="currentLanguage" @change="changeLanguage"
        class="font-sans p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg dark:bg-gray-700 dark:text-white dark:border-gray-600">
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6" ref="pokemonGrid">
      <div v-for="pokemon in displayedPokemon" :key="pokemon.id"
        class="pokemon-card bg-white bg-opacity-30 backdrop-filter flex flex-col backdrop-blur-lg rounded-lg shadow-lg p-4 cursor-pointer transition-all hover:bg-opacity-40 dark:bg-gray-800 dark:bg-opacity-30 dark:text-white relative overflow-hidden"
        @click="showDetails(pokemon)">
        <div class="absolute inset-0 opacity-30 z-0" :style="getGradientStyle(pokemon.types[0])"></div>
        <div class="relative z-10">
          <div class="flex flex-row justify-between mb-2">
            <span class="text-xs font-mono font-600">• {{ pokemon.id.toString().padStart(3, '0') }}</span>
            <div class="flex flex-wrap justify-center gap-2">
              <span v-for="type in pokemon.types" :key="type" class="px-2 py-1 rounded-full text-xs font-semibold"
                :class="getTypeClass(type)">
                <span class="w-4 h-4 rounded-full text-xs font-semibold" :class="getTypeClass(type)">
                </span>
              </span>
            </div>
          </div>
          <div class="flex flex-col items-center">
            <img :src="pokemon.image" :alt="pokemon.name" class="w-32 h-32 mx-auto" />
          </div>
          <!-- <h3 class="text-lg font-semibold text-center mb-2">{{ pokemon.translatedName || pokemon.name }}</h3> -->
        </div>
      </div>
    </div>
    <div v-if="isLoading" class="text-center mt-6 text-white italic dark:text-gray-300">{{
      translations[currentLanguage].loading }}</div>
    <PokemonDetails v-if="selectedPokemon" :pokemon="selectedPokemon" @close="selectedPokemon = null"
      :translations="translations[currentLanguage]" :currentLanguage="currentLanguage" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import VanillaTilt from 'vanilla-tilt';
  
const currentLanguage = ref('en');
const pokemonList = ref([]);
const displayedPokemon = ref([]);
const searchQuery = ref('');
const selectedPokemon = ref(null);
const isLoading = ref(false);
const pokemonGrid = ref(null);
const limit = 20;
let offset = 0;
  
// Add this to handle color mode changes
const colorMode = useColorMode()

const translations = {
  en: {
    search: 'Search Pokémon...',
    type: 'Type',
    loading: 'Loading more Pokémon...',
    height: 'Height',
    weight: 'Weight',
    abilities: 'Abilities',
    stats: 'Stats',
  },
  fr: {
    search: 'Rechercher un Pokémon...',
    type: 'Type',
    loading: 'Chargement de plus de Pokémon...',
    height: 'Taille',
    weight: 'Poids',
    abilities: 'Capacités',
    stats: 'Statistiques',
  },
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

const getGradientStyle = (type) => {
  const gradientColors = {
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

  
const fetchPokemon = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  const newPokemon = await Promise.all(data.results.map(async (pokemon) => {
    const detailResponse = await fetch(pokemon.url);
    const detailData = await detailResponse.json();
    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${detailData.id}/`);
    const speciesData = await speciesResponse.json();
    return {
      name: pokemon.name,
      image: detailData.sprites.front_default,
      types: detailData.types.map(type => type.type.name),
      id: detailData.id,
      names: speciesData.names,
    };
  }));
  pokemonList.value = [...pokemonList.value, ...newPokemon];
  updateDisplayedPokemon();
  offset += limit;
  isLoading.value = false;
};

const updateDisplayedPokemon = () => {
  displayedPokemon.value = pokemonList.value.map(pokemon => ({
    ...pokemon,
    translatedName: getTranslatedName(pokemon, currentLanguage.value),
  }));
};

const getTranslatedName = (pokemon, language) => {
  const translation = pokemon.names.find(name => name.language.name === language);
  return translation ? translation.name : pokemon.name;
};

const searchPokemon = () => {
  displayedPokemon.value = pokemonList.value.filter(pokemon => 
    pokemon.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    getTranslatedName(pokemon, currentLanguage.value).toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    pokemon.types.some(type => type.toLowerCase().includes(searchQuery.value.toLowerCase()))
  ).map(pokemon => ({
    ...pokemon,
    translatedName: getTranslatedName(pokemon, currentLanguage.value),
  }));
};

const showDetails = async (pokemon) => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
  const data = await response.json();
  selectedPokemon.value = {
    ...pokemon,
    height: data.height,
    weight: data.weight,
    abilities: data.abilities.map(ability => ability.ability.name),
    stats: data.stats.map(stat => ({ name: stat.stat.name, value: stat.base_stat })),
  };
};

const handleScroll = () => {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading.value) {
    fetchPokemon();
  }
};

const changeLanguage = () => {
  localStorage.setItem('preferredLanguage', currentLanguage.value);
  updateDisplayedPokemon();
};

watch(colorMode, () => {
  nextTick(() => {
    initTilt();
  });
});

watch(currentLanguage, () => {
  updateDisplayedPokemon();
});

const initTilt = () => {
  VanillaTilt.init(document.querySelectorAll(".pokemon-card"), {
    max: 25,
    speed: 400,
    glare: true,
    "max-glare": 0.5,
  });
};

onMounted(() => {
  const savedLanguage = localStorage.getItem('preferredLanguage');
  if (savedLanguage) {
    currentLanguage.value = savedLanguage;
  }
  fetchPokemon();
  window.addEventListener('scroll', handleScroll);
  initTilt();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

watch(currentLanguage, () => {
  updateDisplayedPokemon();
});

watch(displayedPokemon, () => {
  nextTick(() => {
    initTilt();
  });
});

</script>

<style scoped>
.pokemon-card {
  transform-style: preserve-3d;
  transform: perspective(1000px);
}

.pokemon-card img {
  transform: translateZ(20px);
}

.pokemon-card h3, .pokemon-card div {
  transform: translateZ(10px);
}
</style>