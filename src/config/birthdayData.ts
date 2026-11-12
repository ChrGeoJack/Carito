/**
 * ============================================================================
 * 🎂 ARCHIVO DE CONFIGURACIÓN Y MENSAJES DE CUMPLEAÑOS 🎂
 * ============================================================================
 * 
 * ¡Hola! Aquí puedes personalizar todos los textos, frases y dedicatorias
 * para tu amiga. Si estás editando en VS Code, simplemente modifica los
 * valores dentro de las comillas "" y guarda el archivo.
 * 
 * 1. `LETTER_DATA`    -> El texto que sale al abrir la CARTA secreta con confeti.
 * 2. `LILY_PHRASES`   -> Las frases de cariño que dice el LIRIO cuando florece o al cuidarlo.
 * 3. `SATURN_RINGS`   -> Los mensajes de aliento y reflexiones al tocar los anillos de Saturno.
 * ============================================================================
 */

export interface BirthdayLetter {
  recipientName: string;
  badge: string;
  title: string;
  salutation: string;
  paragraphs: string[];
  signature: string;
  postScriptum: string;
}

export interface RingMessage {
  id: number;
  ringName: string;
  theme: string;
  color: string;
  message: string;
  reflection: string;
}

/* ==========================================================================
   1. CARTA SECRETA (Sección 1)
   Modifica aquí el mensaje especial que se revela al hacer clic en el sobre.
   ========================================================================== */
export const DEFAULT_LETTER_DATA: BirthdayLetter = {
  recipientName: "Para la más importante en mi vida",
  badge: "Edición Especial • 18 Años",
  title: "¡Felices 18 Vueltas al Sol!",
  salutation: "Hermosa Carito",
  paragraphs: [
    "Feliz cumpleaños, Caritoooo 🥹. ¡Felices 18 años! Espero que hoy la pases increíble, un día que recuerdes superr, de momentos bonitos y de todo lo que te hace sonreír, y que esa alegría no sea solo de hoy, sino que te acompañe siempre en cada día de tu vida.",
    "Sigue cumpliendo muchos años más, que Dios te guarde, te cuide y te llene de bendiciones cada día. Y si Él quiere, deseo poder seguir estando a tu lado,  porque tenerte cerca es algo que valoro muchísimo. Te deseo lo mejor de lo mejor en todo, y el que diga que no mereces nada es por que se callo de chiquit@, te mereces absolutamente todo lo bueno que la vida tiene para darte <3",
    "Tú eres capaz de superar cualquier reto que se cruce en tu camino, de atravesar cada etapa difícil que la vida te presente, porque después de cada camino pesado siempre llega la calma y la recompensa que te mereces. Confía siempre en ti misma, porque tienes toda la fuerza necesaria para lograr lo todo",
    "Te quiero, te amo y te adoro carito eres la mejor <3"
  ],
  signature: "Con todo mi amor y cariño siempre, Geovanni ✨",
  postScriptum: "P.D. ¡Pide un deseo enorme al soplar tus 18 velitas, te mereces todo lo bonito de este universo! 🎂💖"
};

/* ==========================================================================
   2. FRASES DEL LIRIO VIRTUAL (Sección 2)
   Estas frases cariñosas aparecen en burbujas flotantes cuando cuidas el lirio,
   al regarlo, darle cariño o cuando florece en su máximo esplendor.
   ========================================================================== */
export const DEFAULT_LILY_PHRASES: string[] = [
  "¡Te quiero un montón! 💖",
  "Hermosa!! Linda!! Preciosa!!",
  "Tu sonrisa ilumina cualquier día 🌸",
  "Gracias por existir y por ser tan especial 🌷",
  "Te quierooo!!",
  "Sigue adelante tengo FE em ti ",
  "Eres tan tierna y única 🤍",
  "Especial y unica!!💫",
  "Eres inteligente, fuerte, valiente y hermosa 👑",
  "Te Adoro Bastantee 🌺",
  "No me arrepiento de aver te conocido 🌿",
  "¡Brillas más que cualquier estrella del cielo! ☀️"
];

/* ==========================================================================
   3. MENSAJES DE LOS ANILLOS DE SATURNO (Sección 3)
   Cada elemento corresponde a una zona orbital de los anillos de Saturno.
   Al tocar o hacer clic sobre los anillos interactivos, se abrirá este mensaje.
   ========================================================================== */
export const DEFAULT_SATURN_RINGS: RingMessage[] = [
  {
    id: 1,
    ringName: "Anillo D • La Chispa Inicial",
    theme: "Valentía y Nuevos Comienzos",
    color: "#f59e0b",
    message: "Todo pasa por alguna razon carito, lo importante es que sigas adelante",
    reflection: "El universo recompensa la valentía de quienes se atreven a empezar incluso cuando estan en malos momentos"
  },
  {
    id: 2,
    ringName: "Anillo C • La Órbita de la Calma",
    theme: "Paciencia y Confianza en el Tiempo",
    color: "#ec4899",
    message: "Incluso en la noche más fría y oscura, habra una luz que te ilumine y te llene de calor",
    reflection: "No corras contra el reloj. Cada flor florece en su propia estación, y tu momento para brillar es ahora y siempre."
  },
  {
    id: 3,
    ringName: "Anillo B • El Anillo Más Luminoso",
    theme: "Tu Luz Propia y Autenticidad",
    color: "#a855f7",
    message: "La felicidad no es algo hecho. Proviene de tus propias acciones.",
    reflection: "La felicidad no es un estado pasivo que se espera, sino el resultado activo de tus elecciones y comportamientos."
  },
  {
    id: 4,
    ringName: "División de Cassini • La Sabiduría Cósmica",
    theme: "Resiliencia y Crecimiento",
    color: "#06b6d4",
    message: "La vida es como una cámara. Enfócate en lo que es importante, captura los buenos momentos, saca de lo negativo y, si las cosas no salen como esperabas, simplemente toma otra foto.",
    reflection: "Compara la vida con una cámara, animando a centrarse en lo positivo y a aprender de las experiencias negativas, sugiriendo que siempre hay una nueva oportunidad para crear un buen recuerdo."
  },
  {
    id: 5,
    ringName: "Anillo A • El Horizonte Infinito",
    theme: "Sueños sin Límites",
    color: "#10b981",
    message: "La vida no se mide por los años, sino por los momentos.",
    reflection: "Anima te a valorar la calidad de tus experiencias sobre la simple dureza de tu vida. Sonrie! Cada instante cuenta"
  },
  {
    id: 6,
    ringName: "Anillo F • El Vínculo Gravitatorio",
    theme: "Amistad Incondicional",
    color: "#fb7185",
    message: "El Señor te bendecirá y te guardará; el Señor hará resplandecer su rostro sobre ti, y te dará paz.",
    reflection: "Una promesa de protección y paz. Saber que Dios está contigo y te cuida te da la confianza para enfrentar cualquier desafío con valentía."
  },
  {
    id: 7,
    ringName: "Anillo E • El Resplandor de Hielo",
    theme: "Amor Propio y Paz Interior",
    color: "#38bdf8",
    message: "Eres suficiente, eres valiosa, eres hermosa por dentro y por fuera, y mereces todo lo bueno que la vida te tiene preparado.",
    reflection: "Antes de amar al mundo, abrázate a ti misma con orgullo por todo lo que has logrado hasta hoy."
  }
];

// Helper functions for reading/writing with LocalStorage
const STORAGE_KEY_LETTER = "bday_letter_custom_v2";
const STORAGE_KEY_PHRASES = "bday_phrases_custom_v1";
const STORAGE_KEY_RINGS = "bday_rings_custom_v1";

// Data loader functions directly reflecting your config edits
export function loadLetterData(): BirthdayLetter {
  return DEFAULT_LETTER_DATA;
}

export function saveLetterData(data: BirthdayLetter): void {
  // Available if needed
}

export function loadLilyPhrases(): string[] {
  return DEFAULT_LILY_PHRASES;
}

export function saveLilyPhrases(phrases: string[]): void {
  // Available if needed
}

export function loadSaturnRings(): RingMessage[] {
  return DEFAULT_SATURN_RINGS;
}

export function saveSaturnRings(rings: RingMessage[]): void {
  // Available if needed
}

export function resetAllDataToDefault(): void {
  localStorage.removeItem(STORAGE_KEY_LETTER);
  localStorage.removeItem(STORAGE_KEY_PHRASES);
  localStorage.removeItem(STORAGE_KEY_RINGS);
}
