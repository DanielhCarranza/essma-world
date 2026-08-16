import { CharacterDef, CharacterId, KartId } from '../types';

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  essma: {
    id: 'essma',
    name: 'Essma',
    tagline: 'Hecha con amor, impulsada por la amistad.',
    defaultKart: 'heart',
    color: '#EC4899', // Pink-500
    secondaryColor: '#38BDF8', // Sky-400
    icon: '❤️',
    specialDescription: 'Perfect balance with heart sparks and friendship boost.',
    stats: {
      topSpeed: 88,
      acceleration: 88,
      handling: 88,
      driftGrip: 88,
      weight: 80,
      boostPower: 88,
    },
  },
  juancito: {
    id: 'juancito',
    name: 'Juancito',
    tagline: 'Rápido y valiente, siempre listo para ganar.',
    defaultKart: 'lightning',
    color: '#EAB308', // Yellow-500
    secondaryColor: '#2563EB', // Blue-600
    icon: '⚡',
    specialDescription: 'Explosive acceleration and electric lightning drift trails.',
    stats: {
      topSpeed: 85,
      acceleration: 96,
      handling: 80,
      driftGrip: 75,
      weight: 75,
      boostPower: 92,
    },
  },
  tori: {
    id: 'tori',
    name: 'Tori',
    tagline: 'Ágil y travieso, nadie lo puede alcanzar.',
    defaultKart: 'acorn',
    color: '#D97706', // Amber-600
    secondaryColor: '#16A34A', // Green-600
    icon: '🐾',
    specialDescription: 'Sharp cornering and maximum drift stability on sandy curves.',
    stats: {
      topSpeed: 80,
      acceleration: 82,
      handling: 96,
      driftGrip: 96,
      weight: 88,
      boostPower: 80,
    },
  },
  anita: {
    id: 'anita',
    name: 'Anita',
    tagline: 'Dulce y cariñosa, su encanto te da alas.',
    defaultKart: 'butterfly',
    color: '#A855F7', // Purple-500
    secondaryColor: '#2DD4BF', // Teal-400
    icon: '🦋',
    specialDescription: 'Lightweight air control with sparkling butterfly flutter boost.',
    stats: {
      topSpeed: 92,
      acceleration: 78,
      handling: 90,
      driftGrip: 82,
      weight: 65,
      boostPower: 88,
    },
  },
};

export const KARTS: Record<KartId, { name: string; description: string; icon: string; color: string }> = {
  heart: {
    name: 'Heart Kart',
    description: 'Charming pink body with heart wings and smooth all-around performance.',
    icon: '💖',
    color: '#F43F5E',
  },
  lightning: {
    name: 'Lightning Kart',
    description: 'Aerodynamic electric speedster with lightning side vents and high accel.',
    icon: '⚡',
    color: '#EAB308',
  },
  acorn: {
    name: 'Bellota Kart',
    description: 'Sturdy Sonoran wood & acorn shell chassis with supreme drift grip.',
    icon: '🌰',
    color: '#92400E',
  },
  butterfly: {
    name: 'Butterfly Kart',
    description: 'Sleek wing-shaped fiberglass frame designed for swift top speed.',
    icon: '🦋',
    color: '#8B5CF6',
  },
};
