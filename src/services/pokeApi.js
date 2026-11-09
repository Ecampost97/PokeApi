import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Obtener lista inicial ligera (ej. 151 Pokémon)
export const getPokemonList = async (limit = 151) => {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon?limit=${limit}`);
    const results = response.data.results;
    
    const detailedPokemons = await Promise.all(
      results.map(async (pokemon) => {
        const res = await axios.get(pokemon.url);
        return res.data;
      })
    );
    return detailedPokemons;
  } catch (error) {
    console.error("Error al obtener Pokémon:", error);
    return [];
  }
};

// Obtener tipos oficiales
export const getPokemonTypes = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/type`);
    return response.data.results;
  } catch (error) {
    console.error("Error al obtener tipos:", error);
    return [];
  }
};

// Obtener generaciones
export const getPokemonGenerations = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/generation`);
    return response.data.results;
  } catch (error) {
    console.error("Error al obtener generaciones:", error);
    return [];
  }
};

// Obtener Pokémon por Tipo directamente de la API
export const getPokemonsByType = async (typeName) => {
  try {
    const response = await axios.get(`${BASE_URL}/type/${typeName}`);
    const pokemonEntries = response.data.pokemon;
    
    const detailedPokemons = await Promise.all(
      pokemonEntries.map(async (p) => {
        const res = await axios.get(p.pokemon.url);
        return res.data;
      })
    );
    return detailedPokemons;
  } catch (error) {
    console.error("Error al obtener Pokémon por tipo:", error);
    return [];
  }
};

// Obtener Pokémon por Generación directamente de la API
export const getPokemonsByGeneration = async (genName) => {
  try {
    const response = await axios.get(`${BASE_URL}/generation/${genName}`);
    const speciesEntries = response.data.pokemon_species;
    
    // Ordenar por ID para que salgan en orden ascendente
    speciesEntries.sort((a, b) => {
      const idA = parseInt(a.url.split('/').slice(-2, -1)[0]);
      const idB = parseInt(b.url.split('/').slice(-2, -1)[0]);
      return idA - idB;
    });

    const detailedPokemons = await Promise.all(
      speciesEntries.map(async (species) => {
        const pokemonId = species.url.split('/').slice(-2, -1)[0];
        const res = await axios.get(`${BASE_URL}/pokemon/${pokemonId}`);
        return res.data;
      })
    );
    return detailedPokemons;
  } catch (error) {
    console.error("Error al obtener Pokémon por generación:", error);
    return [];
  }
};