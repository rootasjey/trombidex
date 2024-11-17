<template>
  <div class="max-w-7xl mx-auto font-sans">
    <h2 v-if="searchQuery.length > 0"
      class="text-sm font-600 mb-4 dark:text-white">
      {{displayedPokemon.length}} pokemon{{ displayedPokemon.length > 1 ? "s" : "" }} found
    </h2>

    <div class="flex flex-row sm:flex-row gap-4 justify-between items-center mb-0">
      <div class="relative flex-grow sm:mb-4 sm:mb-0 sm:mr-4">
        <NuxtImg
          src="/images/search.svg"
          alt="like"
          class="w-6 h-6 rounded-full relative top-8.4 left-2 z-1 dark:invert filter-[#9CA3AF]"
          style="filter: invert(70%) sepia(12%) saturate(288%) hue-rotate(176deg) brightness(89%) contrast(84%);"
        />
        <input 
          v-model="searchQuery" 
          @input="debouncedSearch" 
          :placeholder="translations[currentLanguage].search"
          class="w-full pl-10 p-2 
            border border-gray-300 rounded-md focus:outline-none 
            focus:border-dashed focus:border-gray-500
            bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg 
            dark:bg-transparent dark:text-white dark:border-gray-900" 
        />
      </div>
      <button class="button flex sm:hidden"  @click="isSettingsOpen = !isSettingsOpen">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 20 20" height="20" fill="none" class="svg-icon"><g stroke-width="1.5" stroke-linecap="round" stroke="#5d41de"><circle r="2.5" cy="10" cx="10"></circle><path fill-rule="evenodd" d="m8.39079 2.80235c.53842-1.51424 2.67991-1.51424 3.21831-.00001.3392.95358 1.4284 1.40477 2.3425.97027 1.4514-.68995 2.9657.82427 2.2758 2.27575-.4345.91407.0166 2.00334.9702 2.34248 1.5143.53842 1.5143 2.67996 0 3.21836-.9536.3391-1.4047 1.4284-.9702 2.3425.6899 1.4514-.8244 2.9656-2.2758 2.2757-.9141-.4345-2.0033.0167-2.3425.9703-.5384 1.5142-2.67989 1.5142-3.21831 0-.33914-.9536-1.4284-1.4048-2.34247-.9703-1.45148.6899-2.96571-.8243-2.27575-2.2757.43449-.9141-.01669-2.0034-.97028-2.3425-1.51422-.5384-1.51422-2.67994.00001-3.21836.95358-.33914 1.40476-1.42841.97027-2.34248-.68996-1.45148.82427-2.9657 2.27575-2.27575.91407.4345 2.00333-.01669 2.34247-.97026z" clip-rule="evenodd"></path></g></svg>
      </button>

      <div class="gap-2 justify-center items-center hidden sm:flex">
        <VolumeSlider 
          @volume-change="handleVolumeChange" 
          @mute-change="handleMuteChange" 
        />
        <ToggleTheme />
      </div>

      <select v-model="currentLanguage" @change="changeLanguage"
        class="
        hidden sm:block
        font-sans p-2 border border-gray-300 rounded-md 
        focus:outline-none focus:ring-1.2 focus:ring-white/20 bg-white bg-opacity-50 
        backdrop-filter backdrop-blur-lg dark:bg-transparent dark:text-white dark:border-gray-900">
          <option value="en">English</option>
          <option value="fr">Français</option>
      </select>
    </div>

    <ControlPanel
      class="block sm:hidden mt-4 overflow-hidden transition-all duration-300"
      :class="isSettingsOpen ? 'h-15' : 'h-0'"
      @volume-change="handleVolumeChange"
      @mute-change="handleMuteChange"
      @language-change="changeLanguage"
    />

    <div 
      class="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-6 mt-12 sm:mt-0" 
      :class="`lg:grid-cols-${numberOfRows}`"
      ref="pokemonGrid"
    >
      <PokemonCard 
        v-for="pokemon in displayedPokemon" 
        :key="pokemon.id"
        :pokemon="pokemon"
        @click-pokemon="playPokemonCryAndLike"
        @show-details="showDetails"
        @mouseenter="handlePokemonMouseEnter"
      />
    </div>

    <div class="mt-8">
      <UButton
        :label="isLoading ? 'loading...' : 'load more'"
        btn="outline"
        class="bg-transparent light:bg-white light:hover:bg-gray/[.05] border dark:border-white/[0.2] dark:hover:bg-dark-900 px-8 py-1 rounded-sm hover:scale-98 transition-all"
        :loading="isLoading"
        @click="fetchPokemons();"
      />
    </div>

    <div v-if="isLoading" class="text-center mt-6 text-white italic dark:text-gray-300">
      {{ translations[currentLanguage as keyof typeof translations].loading }}
    </div>

      <PokemonDetails v-if="selectedPokemon" :pokemon="selectedPokemon" @close="selectedPokemon = null"
        :translations="translations[currentLanguage as keyof typeof translations]" :currentLanguage="currentLanguage" />
    </div>
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
const currentVolume     = ref<number>(0.5)
const isSettingsOpen    = ref(false)
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

const playPokemonCryAndLike = (pokemon: any) => {
  playPokemonCry(pokemon.id)
  likePokemon(pokemon)
}

const playPokemonCry = (id: number) => {
  if (isMuted.value) return
  
  const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`)
  audio.volume = currentVolume.value
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

const handleVolumeChange = (volume: number) => {
  localStorage.setItem("volume", volume.toString())
  localStorage.setItem("isMuted", "false")
  isMuted.value = false
  currentVolume.value = volume
  console.log("Volume changed to:", volume);
}

const handleMuteChange = (muted: boolean) => {
  isMuted.value = muted
  localStorage.setItem("isMuted", muted.toString())
}

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

  currentVolume.value = parseFloat(localStorage.getItem("volume") ?? "0.5")
  isMuted.value = localStorage.getItem("isMuted") === "true"
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
  .button {
    justify-content: center;
    align-items: center;
    padding: 6px 12px;
    gap: 8px;
    height: 36px;
    border: none;
    background: #5e41de33;
    border-radius: 20px;
    cursor: pointer;
  }

  .button:hover {
    background: #5e41de4d;
  }

  .button:hover .svg-icon {
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
</style>
