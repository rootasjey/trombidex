// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
// const analytics = getAnalytics(app)

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app)

export default defineCachedEventHandler(async (event) => {
  const { limit, offset } = getQuery(event)

  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
  const data = await response.json()

  const pokemonDetails = await Promise.all(data.results.map(async (pokemon: { url: string | URL | Request; name: any; }) => {
    const detailResponse = await fetch(pokemon.url)
    const detailData = await detailResponse.json()
    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${detailData.id}/`);
    const speciesData = await speciesResponse.json()

    const pokemondFirebaseId = (detailData.id.toString() as string).padStart(7, "0") // 0000001 - 1 000 000
    const existingPokemon = await getDoc(doc(db, "pokemons", pokemondFirebaseId))
    if (!existingPokemon.exists()) {
      const resumeData = { ...detailData, ...{ moves: [] } }

      await setDoc(doc(db, "pokemons", pokemondFirebaseId), {
        id: detailData.id,
        name: pokemon.name,
        image: detailData.sprites.front_default,
        types: detailData.types.map((type: { type: { name: any; }; }) => type.type.name),
        ...resumeData,
        names: speciesData.names,
      })

      await setDoc(doc(db, "pokemons", pokemondFirebaseId, "data/details"), {
        ...detailData,
      })

      await setDoc(doc(db, "pokemons", pokemondFirebaseId, "data/species"), {
        ...speciesData,
      })

      await setDoc(doc(db, "pokemons", pokemondFirebaseId, "data/community_stats"), {
        likes: 0,
        views: 0,
      })
    }

    return {
      name: pokemon.name,
      image: detailData.sprites.front_default,
      types: detailData.types.map((type: { type: { name: any; }; }) => type.type.name),
      id: detailData.id,
      names: speciesData.names,
    }
  }))

  return pokemonDetails;
}, {
  maxAge: 60,
  // maxAge: 3600 * 72, // 72 hours
});
