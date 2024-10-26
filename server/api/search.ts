import Fuse from 'fuse.js'
import { storage } from '../utils/cache'

let fuse = new Fuse(<any>[], {
  keys: ['name', 'types', 'names.name', 'id'],
  threshold: 0.3 // Adjust this for search sensitivity
})

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event).query
  if (!query) return []
  if (typeof query !== 'string') return []
  
  const cachedData = await storage.getItem('pokemon-list')
  if (cachedData) { return fuse.search(query) }

  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
  const data = await response.json();

  const pokemonDetails = await Promise.all(data.results.map(async (pokemon: { url: string | URL | Request; name: any; }) => {
    const detailResponse = await fetch(pokemon.url);
    const detailData = await detailResponse.json();
    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${detailData.id}/`);
    const speciesData = await speciesResponse.json();

    return {
      name: pokemon.name,
      image: detailData.sprites.front_default,
      types: detailData.types.map((type: { type: { name: any; }; }) => type.type.name),
      id: detailData.id,
      names: speciesData.names,
    };
  }));

  await storage.setItem('pokemon-list', pokemonDetails, { ttl: 3600 * 72 }) // Cache for 72 hours

  fuse = new Fuse(pokemonDetails, {
    keys: ['id', 'name', 'names.name', 'types'],
    threshold: 0.3
  });

  return fuse.search(query)
})
