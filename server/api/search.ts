import { algoliasearch } from "algoliasearch"

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID ?? "", 
  process.env.ALGOLIA_API_KEY ?? ""
)

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event).query
  if (!query || typeof query !== 'string') return []

  const { hits } = await client.searchSingleIndex({
    indexName: 'pokemons',
    searchParams: {
      query,
      hitsPerPage: 300,
      attributesToRetrieve: ['id', 'name', 'names', 'types'],
    }
  })

  return hits.map((hit: any) => {
    const { id, name, names, types } = hit
    const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
    return {
      id: `${id}`,
      image,
      name,
      names,
      types: types.map((typeRecord: any) => typeRecord.name ?? ""),
    }
  })
}, {
  maxAge: 60 * 10,
})
