/* eslint-disable camelcase */
import {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} from "firebase-functions/v2/firestore"
import { algoliasearch } from "algoliasearch"
import { defineString } from "firebase-functions/params"

const appId = defineString("ALGOLIA_APP_ID")
const apiKey = defineString("ALGOLIA_API_KEY")

const client = algoliasearch(appId.value(), apiKey.value())

export const onIndexPokemon =
  onDocumentCreated({
    document: "pokemons/{pokemonId}",
    region: "europe-west1",
  }, (event) => {
    const snapshot = event.data
    if (!snapshot) {
      console.log("No data associated with the event")
      return
    }

    const data = snapshot.data()
    const payload = extractPokemonData(data)

    return client.saveObject({
      indexName: "pokemons",
      body: {
        objectID: snapshot.id,
        ...payload,
      },
    })
  })

export const onUpdatePokemon =
  onDocumentUpdated({
    document: "pokemons/{pokemonId}",
    region: "europe-west1",
  }, (event) => {
    const snapshot = event.data

    if (!snapshot) {
      console.log("No data associated with the event")
      return
    }

    const data = snapshot.after.data()
    const payload = extractPokemonData(data)

    return client.saveObject({
      indexName: "pokemons",
      body: {
        objectID: snapshot.after.id,
        ...payload,
      },
    })
  })

export const onDeletePokemon =
  onDocumentDeleted({
    document: "pokemons/{pokemonId}",
    region: "europe-west1",
  }, (event) => {
    const snapshot = event.data
    if (!snapshot) {
      console.log("No data associated with the event")
      return
    }
    return client.deleteObject({
      indexName: "pokemons",
      objectID: snapshot.id,
    })
  })

const extractPokemonData = (data: FirebaseFirestore.DocumentData) => {
  const {
    height,
    id,
    name,
    weight,
  } = data

  const abilities = data.abilities.map(
    (abilityGroup: Ability) => {
      return {
        name: abilityGroup.ability.name,
        is_hidden: abilityGroup.is_hidden,
        slot: abilityGroup.slot,
      }
    })

  const game_indices = data.game_indices.map(
    (gameIndice: GameIndice) => {
      return {
        game_index: gameIndice.game_index,
        version: gameIndice.version.name,
      }
    })

  const names = data.names.map(
    (nameGroup: NameLocalized) => {
      return {
        name: nameGroup.name,
        language: nameGroup.language.name,
      }
    })

  const types = data.types.map(
    (pokemonType: PokemonType) => {
      return {
        name: pokemonType.type.name,
        slot: pokemonType.slot,
      }
    })

  return {
    abilities,
    game_indices,
    height,
    id,
    name,
    names,
    types,
    weight,
  }
}
