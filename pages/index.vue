<template>
  <div class="max-w-7xl mx-auto font-sans">
    <h2 v-if="searchQuery.length > 0"
      class="text-sm font-600 mb-4 dark:text-white">
      {{displayedPokemon.length}} pokemon{{ displayedPokemon.length > 1 ? "s" : "" }} found
    </h2>

    <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
      <input v-model="searchQuery" @input="debouncedSearch" :placeholder="translations[currentLanguage].search"
        class="font-sans flex-grow mb-4 sm:mb-0 sm:mr-4 p-2 
          border border-gray-300 rounded-md focus:outline-none 
          focus:border-dashed focus:border-gray-500
          bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg 
          dark:bg-transparent dark:text-white dark:border-gray-900" />
      
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
      <PokemonCard 
        v-for="pokemon in displayedPokemon" 
        :key="pokemon.id"
        :pokemon="pokemon"
        @play-cry="playPokemonCry"
        @show-details="showDetails"
        @like="likePokemon"
        @mouseenter="handlePokemonMouseEnter"
      />
    </div>

    <div class="mt-8">
      <UButton
        :label="isLoading ? 'loading...' : 'load more'"
        btn="outline"
        class="bg-transparent light:bg-white light:hover:bg-gray/[.05] border dark:border-white/[0.2] dark:hover:bg-dark-900 px-8 py-1 rounded-full transition-all"
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
  })

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
  
  const pokemonResults = searchResults

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

const playPokemonCry = (id: number) => {
  isMuted.value = localStorage.getItem("isMuted") === "true"
  if (isMuted.value) return

  const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`)
  audio.play()
}

const likePokemon = async (pokemon: any) => {
  const response = await $fetch('/api/like', {
      method: 'POST',
      body: {
        pokemonId: pokemon.id,
      },
  })

  if (!response.success) return
  typeof pokemon.likes === "undefined" ? pokemon.likes = 1 :  pokemon.likes++
}

const handlePokemonMouseEnter = async (pokemon: any) => {
  const likesResponse =  await getPokemonLikes(pokemon.id)
  const { likes } = likesResponse

  if (likes === 0) { return }

  const pokemonToUpdate = displayedPokemon.value.find((p) => p.id === pokemon.id)
  if (pokemonToUpdate) {
    pokemonToUpdate.likes = likes
  }

}

const getPokemonLikes = async (pokemonId: string) => {
  return await $fetch(`/api/pokemons/${pokemonId}/likes`, {
      method: 'GET',
  })
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
    scale: 1.15,
    reverse: true,
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
</style>
