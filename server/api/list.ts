export default defineCachedEventHandler(async (event) => {
  const { limit, offset } = getQuery(event)

  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
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

  return pokemonDetails;
}, {
  maxAge: 3600 * 72, // 72 hours
});
