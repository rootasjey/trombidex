<template>
  <div class="max-w-7xl mx-auto font-sans">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
      <input v-model="searchQuery" @input="debouncedSearch" :placeholder="translations[currentLanguage].search"
        class="font-sans flex-grow mb-4 sm:mb-0 sm:mr-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1.2 focus:ring-white-20 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg dark:bg-transparent dark:text-white dark:border-gray-900" />
      
      <select v-model="currentLanguage" @change="changeLanguage"
        class="
        font-sans p-2 border border-gray-300 rounded-md 
        focus:outline-none focus:ring-1.2 focus:ring-white/20 bg-white bg-opacity-50 
        backdrop-filter backdrop-blur-lg dark:bg-transparent dark:text-white dark:border-gray-900">
          <option value="en">English</option>
          <option value="fr">Français</option>
      </select>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6" 
        :class="`lg:grid-cols-${numberOfRows}`"
        ref="pokemonGrid"
    >
      <div v-for="pokemon in displayedPokemon" :key="pokemon.id"
        class="pokemon-card
           bg-white bg-opacity-30 backdrop-filter flex flex-col backdrop-blur-lg 
           rounded-lg shadow-lg p-4 cursor-pointer transition-all 
           hover:bg-opacity-40 dark:bg-gray-800 
           dark:bg-opacity-30 dark:text-white relative overflow-hidden
           cursor-pointer border border-black/[0.1] dark:border-white/[0.05]"
        @click="playPokemonCry(pokemon.id)">
        <!-- <div class="absolute inset-0 opacity-30 z-0" :style="getGradientStyle(pokemon.types?.at(0))"></div> -->
        <div class="relative z-10">
          <div class="flex flex-row justify-between mb-2">
            <UTooltip 
              size="xs" 
              :_tooltip-provider="{
                delayDuration: 0,
              }"
            >
              <template #default>
                <span 
                  class="text-xs font-mono font-600"
                  @click="showDetails(pokemon)">
                  • {{ pokemon.id.toString().padStart(3, '0') }}
                </span>
              </template>

              <template #content>
                <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="getTypeClass(pokemon.types?.at(0))">
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
          <div class="flex flex-col items-center">
            <NuxtImg
              :src="pokemon.image" 
              :alt="pokemon.name" 
              class="w-24 h-24 mx-auto pokemon-card-img"
              height="48"
              width="48"
            />
          </div>
        </div>
      </div>

      <UButton
        :label="isLoading ? 'loading...' : 'load more'"
        btn="outline"
        class="bg-transparent border border-white/[0.2] hover:bg-dark-900 px-1 py-1 rounded-full transition-all"
        :loading="isLoading"
        @click="fetchPokemons();"
      />
    </div>
    <div v-if="isLoading" class="text-center mt-6 text-white italic dark:text-gray-300">{{
      translations[currentLanguage as keyof typeof translations].loading }}</div>
    <PokemonDetails v-if="selectedPokemon" :pokemon="selectedPokemon" @close="selectedPokemon = null"
      :translations="translations[currentLanguage as keyof typeof translations]" :currentLanguage="currentLanguage" />  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import VanillaTilt from 'vanilla-tilt';

const currentLanguage   = ref<'en' | 'fr'>('en');
const pokemonList       = ref<any[]>([]);
const displayedPokemon  = ref<any[]>([]);
const searchQuery       = ref('');
const selectedPokemon   = ref(null);
const isLoading         = ref(false);
const hasMore           = ref(true);
const pokemonGrid       = ref(null);
const searchTimeout     = ref<NodeJS.Timeout | null>(null)
const isMuted           = ref<boolean>(false)

/** API limit. */
const limit = 24;

/** API offset. */
let offset  = 0;

const colorMode = useColorMode()

interface Translations {
  search: string;
  type: string;
  loading: string;
  height: string;
  weight: string;
  abilities: string;
  stats: string;
}

const translations: Record<'en' | 'fr', Translations> = {
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

/** 
 * Number of rows in the grid according to the screen width.
 * A column is added for each 60px of screen width.
 **/
const numberOfRows = ref(8) // Initial value

/**
 * An object that maps the number of grid columns to the corresponding unocss class for large screens.
 * This is used to dynamically adjust the grid layout based on the screen width.
 */
const gridColumnClass = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  7: 'lg:grid-cols-7',
  8: 'lg:grid-cols-8',
  9: 'lg:grid-cols-9',
  10: 'lg:grid-cols-10',
  11: 'lg:grid-cols-11',
  12: 'lg:grid-cols-12',
  13: 'lg:grid-cols-13',
  14: 'lg:grid-cols-14',
  15: 'lg:grid-cols-15',
  16: 'lg:grid-cols-16',
  17: 'lg:grid-cols-17',
  18: 'lg:grid-cols-18',
  19: 'lg:grid-cols-19',
  20: 'lg:grid-cols-20',
  21: 'lg:grid-cols-21',
  22: 'lg:grid-cols-22',
  23: 'lg:grid-cols-23',
  24: 'lg:grid-cols-24',
}

/**
 * Fetches a batch of Pokemon from the server and updates the displayed Pokemon list.
 *
 * This function is responsible for fetching a new batch of Pokemon from the '/api/list' endpoint, appending them to the existing Pokemon list, and updating the displayed Pokemon list accordingly.
 *
 * The function checks if a fetch is already in progress before starting a new one. It then fetches the new Pokemon, updates the Pokemon list and the displayed Pokemon list, and increments the offset for the next fetch.
 */
const fetchPokemons = async () => {
  if (isLoading.value || !hasMore.value) return;
  isLoading.value = true;

  const newPokemonList = await $fetch('/api/list', {
    params: {
      limit,
      offset
    }
  });

  pokemonList.value = [...pokemonList.value, ...newPokemonList];
  updateDisplayedPokemon();

  offset += limit
  isLoading.value = false;
  hasMore.value = newPokemonList.length === limit;
}

const updateDisplayedPokemon = () => {
  displayedPokemon.value = pokemonList.value.map(pokemon => ({
    ...pokemon,
    translatedName: getTranslatedName(pokemon, currentLanguage.value),
  }));
};

const getTranslatedName = (pokemon: any, language: string) => {
  if (!pokemon.names) return pokemon.name;
  const translation = pokemon.names.find((name: any) => name.language.name === language);
  return translation ? translation.name : pokemon.name;
};

const debouncedSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(() => {
    searchPokemon()
  }, 700)
}

/**
 * Searches for Pokemon based on the user's search query and updates the displayed Pokemon list accordingly.
 *
 * If the search query is empty, the function will update the displayed Pokemon list to show all the Pokemon in the list.
 *
 * If the search query is not empty, the function will fetch search results from the '/api/search' endpoint and update the displayed Pokemon list with the search results.
 */
const searchPokemon = async () => {
  if (searchQuery.value.trim() === '') {
    displayedPokemon.value = pokemonList.value.map(pokemon => ({
      ...pokemon,
      translatedName: getTranslatedName(pokemon, currentLanguage.value),
    }));
    return;
  }

  const searchResults = await $fetch('/api/search', {
    params: { query: searchQuery.value }
  })

  if (!searchResults || !searchResults.length) {
    displayedPokemon.value = [];
    return;
  }
  
  const pokemonResults = searchResults.map((x) => x.item)

  displayedPokemon.value = pokemonResults.map((pokemon: any) => ({
    ...pokemon,
    translatedName: getTranslatedName(pokemon, currentLanguage.value),
  }))
};

const showDetails = async (pokemon: any) => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
  const data = await response.json();
  selectedPokemon.value = {
    ...pokemon,
    height: data.height,
    weight: data.weight,
    abilities: data.abilities.map((ability: any) => ability.ability.name),
    stats: data.stats.map((stat: any) => ({ name: stat.stat.name, value: stat.base_stat })),
  };
};

const playPokemonCry = (id: string) => {
  isMuted.value = localStorage.getItem("isMuted") === "true"
  if (isMuted.value) return

  const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`)
  audio.play()
}

const handleScroll = () => {
  if (searchQuery.value.trim().length > 0) return;

  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading.value) {
    fetchPokemons();
  }
};

/**
 * Updates the user's preferred language and refreshes the displayed Pokemon.
 * This function is called when the user changes the language preference.
 */
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
  VanillaTilt.init(Array.from(document.querySelectorAll(".pokemon-card")), {
    max: 25,
    speed: 400,
    glare: true,
    "max-glare": 0.5,
  });
};
onMounted(() => {
  const savedLanguage = localStorage.getItem('preferredLanguage')
  if (savedLanguage) {
    currentLanguage.value = savedLanguage as 'fr' | 'en';
  }

  isMuted.value = localStorage.getItem("isMuted") === "true"
  
  fetchPokemons();
  window.addEventListener('scroll', handleScroll);
  initTilt();

  const updateGridColumns = () => {
    numberOfRows.value = Math.floor(window.innerWidth / 180)
  }

  window.addEventListener('resize', updateGridColumns)
  updateGridColumns() // Initial call
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);

  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
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

.pokemon-card-img {
  transform: translateZ(20px);
}

.pokemon-card h3, .pokemon-card div {
  transform: translateZ(10px);
}
</style>