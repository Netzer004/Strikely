// theme.js: paleta y medidas centralizadas de Strikely.
// Tema oscuro "de pelea": negro con capas, rojo de marca SOLO como acento y
// gris neutro para los bordes. Menos rojo por todos lados, más orden.
export const COLORS = {
  fondo: '#0A0A0C',           // fondo general (negro con un toque frío)
  superficie: '#121216',      // tarjetas, panel y menú (una capa por encima)
  superficieClara: '#1A1A20', // elementos elevados (fotos, campos, contador)
  rojo: '#E11D2E',            // rojo de marca (acentos, íconos, botones)
  rojoBrillante: '#FF2E3F',   // rojo más claro para lo seleccionado
  rojoOscuro: '#5C0810',      // arriba del degradado del encabezado
  bordeBrillante: '#E11D2E',  // borde de acento (píldoras y etiquetas)
  borde: '#26262C',           // borde neutro de contenedores
  bordeTenue: '#1C1C22',      // separadores y recuadros sutiles
  bordeRojo: '#E11D2E',
  texto: '#F5F6F7',           // texto principal
  textoSuave: '#9A9AA3',      // texto secundario
  naranja: '#FF8A00',         // tonos cálidos
  doradoBrillante: '#FFD24A', // insignia "¡RECOMENDADO!" (brilla sobre el negro)
}

// Medidas reutilizables (una sola escala de redondeados para toda la app)
export const ESPACIO = {
  lateral: 16,
  seccion: 16,
  radioSm: 8,      // campos, botones y etiquetas
  radio: 12,       // tarjetas y listas
  radioGrande: 18, // mapa, panel y hojas
}

// Color de acento por disciplina (un solo objeto reutilizable)
export const COLORES_DISCIPLINA = {
  MMA: '#E11D2E',
  Boxeo: '#F5A524',
  'Jiu-jitsu': '#3B82F6',
  Judo: '#22C55E',
  Lucha: '#A855F7',
  'Muay Thai': '#EAB308',
  
}
export const COLOR_DISCIPLINA_DEFECTO = '#22D3EE'

// Devuelve el color de una disciplina (o el color por defecto)
export function colorDisciplina(disciplina) {
  return COLORES_DISCIPLINA[disciplina] || COLOR_DISCIPLINA_DEFECTO
}

// Convierte un hex (#RRGGBB) en rgba con la opacidad dada
export function colorConAlpha(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
