// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  collection,
  getDocs, 
  getFirestore, 
  limit, 
  orderBy, 
  query, 
  startAt, 
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/**
 * Retrieves a list of pokemons from Firestore, with optional pagination.
 *
 * @param event - The event object containing the query parameters.
 * @returns An array of pokemon objects, with the `types` property containing an array of type names.
 */
export default defineCachedEventHandler(async (event) => {
  const { max, offset } = extractQueryParams(event)

  const collectionRef = collection(db, "pokemons")
  const q = query(collectionRef, orderBy("id"), startAt(offset), limit(max))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      types: data.types.map((typeRecord: any) => typeRecord.type.name)
    }
  })
}, { 
  maxAge: 3600 * 1,
}
);

/**
 * Extracts the `limit` and `offset` query parameters from the provided event object.
 *
 * @param event - The event object containing the query parameters.
 * @returns An object with the `max` and `offset` properties, representing the extracted query parameters.
 */
const extractQueryParams = (event: any) => {
  let { limit: max = 24, offset = 0 } = getQuery(event)

  max = typeof max === "string" ? parseInt(max as string) : max
  offset = typeof offset === "string" ? parseInt(offset as string) : offset

  max = typeof max !== "number" || max < 1 ? 24 : max
  offset = typeof offset !== "number" || offset < 0 ? 0 : offset

  max = isNaN(max) ? 24 : max
  offset = isNaN(offset) ? 0 : offset

  return {
    max,
    offset,
  }
}
