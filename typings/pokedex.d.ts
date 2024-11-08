
type Ability = {
  ability: {
    name: string
  }
  is_hidden: boolean
  slot: number
}


type GameIndice = {
  game_index: number
  version: {
    name: string
    url: string
  }
}

type NameLocalized = {
  language: {
    name: string
  }
  name: string
}

type Pokemon = {
  abilities: Ability[]
  game_indices: {
    game_index: number
    version: {
      name: string
    }
  }[]
  height: number
  id: number
  name: string
  sprites: {
    front_default: string
  }
  types: {
    type: {
      name: string
    }
  }[]
  weight: number
}

type PokemonType = {
  slot: number
  type: {
    name: string
  }
}
