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

export default defineCachedEventHandler(async (event) => {
  let { limit : max = 24, offset = 0 } = getQuery(event)
  
  max = typeof max === "string" ? parseInt(max as string) : max
  offset = typeof offset === "string" ? parseInt(offset as string) : offset

  max = typeof max !== "number" || max < 1 ? 24 : max
  offset = typeof offset !== "number" || offset < 0 ? 0 : offset

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
}, 
{ maxAge: 3600 * 1, }
);
