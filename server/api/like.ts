
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "~/server/utils/firestore"

export default defineEventHandler(async (event) => {
  const { pokemonId } = await readBody(event)
  
  if (typeof pokemonId !== 'string' && typeof pokemonId !== 'number') {
    throw createError({
      statusCode: 400,
      message: 'Pokemon ID is required'
    })
  }

  const pokeFirestoreId = `${pokemonId}`.padStart(7, '0')

  try {
    const docRef = doc(db, 'pokemons', pokeFirestoreId, 'data', 'community_stats')
    const pokeStatsDoc = await getDoc(docRef)
    const currentLikes = pokeStatsDoc.exists() ? (pokeStatsDoc.data()?.likes || 0) : 0
    
    await updateDoc(docRef, {
      likes: currentLikes + 1
    })

    return {
      pokemonId,
      likes: currentLikes + 1,
      message: 'Likes updated successfully',
      statusCode: 200,
      success: true,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to update likes'
    })
  }
})
