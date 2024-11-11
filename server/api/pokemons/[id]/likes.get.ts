
import { doc, getDoc } from "firebase/firestore"
import { db } from "~/server/utils/firestore"

export default defineEventHandler(async (event) => {
  const pokemonId: string = getRouterParam(event, 'id') ?? ""

  if (pokemonId.trim().length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Pokemon ID is required'
    })
  }

  const pokeFirestoreId: string = `${pokemonId}`.padStart(7, '0')

  try {
    const docRef = doc(db, 'pokemons', pokeFirestoreId, 'data', 'community_stats')
    const pokeStatsDoc = await getDoc(docRef)
    const likes: number = pokeStatsDoc.exists() ? (pokeStatsDoc.data()?.likes || 0) : 0

    return {
      pokemonId,
      likes,
      statusCode: 200,
      success: true,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch likes'
    })
  }
})
