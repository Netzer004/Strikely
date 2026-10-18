// iconosDisciplinas.js: los iconos de cada disciplina y la "chapita" del mapa.
// Los dibujos viven en iconosDatos.js (imágenes PNG guardadas en texto, hechas con
// herramientas/genera-iconos.ps1 a partir de la hoja de iconos).
// Ojo: la hoja no traía icono propio de MMA (se usa el de la guardia) ni de
// Taekwondo (se usa el de la patada alta).
import { COLORS, colorConAlpha } from '../theme/theme'
import {
  ICONO_POR_DISCIPLINA,
  ICONO_POR_DISCIPLINA_MAPA,
  DISCIPLINAS_CON_ICONO,
} from './iconosDatos'

// Icono grande de una disciplina (el que se ve en el panel de detalle)
export function iconoDe(disciplina) {
  return ICONO_POR_DISCIPLINA[disciplina] || ICONO_POR_DISCIPLINA.MMA
}

// Las disciplinas que ya tienen icono (el mapa las usa para armar sus chapitas)
export { DISCIPLINAS_CON_ICONO }

// Chapita del mapa: usa el icono chico; más grande y con brillo si está seleccionado
export function htmlMarcador(disciplina, seleccionado = false) {
  const src = ICONO_POR_DISCIPLINA_MAPA[disciplina] || ICONO_POR_DISCIPLINA_MAPA.MMA
  const escala = seleccionado ? 1.3 : 1
  const sombra = seleccionado
    ? `drop-shadow(0 0 6px ${colorConAlpha(COLORS.rojoBrillante, 0.95)})`
    : 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))'
  return (
    '<div style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;' +
    `transform:scale(${escala});filter:${sombra}">` +
    `<img src="${src}" width="30" height="30" style="display:block" alt="" /></div>`
  )
}
