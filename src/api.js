// All PokeAPI calls live in this file.
const BASE = 'https://pokeapi.co/api/v2';

export const TOTAL = 1025; // number of Pokémon the app covers
export const PAGE_SIZE = 20;
// Student number 02240148 -> last three digits are 148.
export const START_OFFSET = 148;

export const TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

export const STAT_ORDER = [
  'hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed',
];
export const STAT_LABELS = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

export const artworkUrl = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

// The list endpoint gives { name, url }; the id is the number at the end of the url.
export const idFromUrl = (url) => Number(url.split('/').filter(Boolean).pop());
const toItem = (p) => ({ id: idFromUrl(p.url), name: p.name });

async function getJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Server error (${res.status}). Please try again.`);
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('The request timed out.');
    if (e.message === 'Network request failed') {
      throw new Error('Cannot reach PokéAPI. Check your internet connection.');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// One page of the Pokédex list. Never reads past TOTAL.
export async function fetchPokemonPage(offset, limit = PAGE_SIZE) {
  const safeLimit = Math.min(limit, TOTAL - offset);
  if (safeLimit <= 0) return { items: [], hasMore: false };
  const data = await getJson(`${BASE}/pokemon?offset=${offset}&limit=${safeLimit}`);
  return {
    items: data.results.map(toItem),
    hasMore: offset + safeLimit < TOTAL,
  };
}

// Every name, used for searching beyond the loaded pages.
export async function fetchAllNames() {
  const data = await getJson(`${BASE}/pokemon?limit=${TOTAL}`);
  return data.results.map(toItem);
}

// The first generation (151), used by the game.
export async function fetchFirstGen() {
  const data = await getJson(`${BASE}/pokemon?limit=151`);
  return data.results.map(toItem);
}

// Own feature: filter by type.
export async function fetchPokemonByType(type) {
  const data = await getJson(`${BASE}/type/${type}`);
  return data.pokemon
    .map((p) => toItem(p.pokemon))
    .filter((p) => p.id <= TOTAL) // skip alternate forms (ids above 10000)
    .sort((a, b) => a.id - b.id);
}

export async function fetchPokemonDetail(idOrName) {
  const raw = await getJson(`${BASE}/pokemon/${idOrName}`);
  const stats = {};
  raw.stats.forEach((s) => {
    stats[s.stat.name] = s.base_stat;
  });
  return {
    id: raw.id,
    name: raw.name,
    types: [...raw.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    height: raw.height / 10, // decimetres -> metres
    weight: raw.weight / 10, // hectograms -> kilograms
    stats,
  };
}
