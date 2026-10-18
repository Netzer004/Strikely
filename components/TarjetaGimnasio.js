// TarjetaGimnasio: tarjeta horizontal de la lista (nombre, zona y disciplina).
// Superficie propia, franja roja de marca a la izquierda y borde neutro; al
// seleccionar se enciende con un rojo suave.
// La separación entre tarjetas la pone la fila de ListaGimnasios (gap), NO la tarjeta.
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { COLORS, ESPACIO, colorDisciplina, colorConAlpha } from '../theme/theme'

// Medidas de la tarjeta. Se exportan para que la lista sepa cuánto moverse con
// las flechas, así el ancho no queda escrito en dos archivos distintos.
export const ANCHO_TARJETA = 240
export const SEPARACION_TARJETA = 12

export default function TarjetaGimnasio({ gimnasio, seleccionado, onPress }) {
  // Color de acento según la disciplina
  const color = colorDisciplina(gimnasio.disciplina)

  return (
    <Pressable
      onPress={onPress}
      style={[styles.tarjeta, seleccionado && styles.tarjetaSeleccionada]}
    >
      {/* Barra de acento roja a la izquierda */}
      <View style={styles.acento} />
      <View style={styles.info}>
        {/* Insignia dorada: solo en los gimnasios marcados como recomendados */}
        {gimnasio.recomendado && (
          <View style={styles.recomendado}>
            <Text style={styles.recomendadoTexto}>¡RECOMENDADO!</Text>
          </View>
        )}
        <Text style={styles.nombre} numberOfLines={2}>
          {gimnasio.nombre}
        </Text>
        <Text style={styles.detalle}>
          {gimnasio.zona} · {gimnasio.ciudad}
        </Text>
        {/* Etiqueta de disciplina con el color de su disciplina */}
        <View
          style={[
            styles.badge,
            { borderColor: color, backgroundColor: colorConAlpha(color, 0.15) },
          ]}
        >
          <Text style={[styles.badgeTexto, { color }]}>{gimnasio.disciplina}</Text>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  // Tarjeta sobre superficie propia; el rojo vive en la franja y en la etiqueta
  tarjeta: {
    width: ANCHO_TARJETA,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: COLORS.superficie,
    borderWidth: 1,
    borderColor: COLORS.borde,
    borderRadius: ESPACIO.radio,
    // Recorta la franja para que respete las esquinas redondeadas
    overflow: 'hidden',
  },
  // Al seleccionar: borde rojo y resplandor suave de marca
  tarjetaSeleccionada: {
    borderColor: COLORS.rojo,
    backgroundColor: colorConAlpha(COLORS.rojo, 0.08),
    shadowColor: COLORS.rojo,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  // Franja roja de marca pegada al borde izquierdo (full-bleed)
  acento: {
    width: 4,
    backgroundColor: COLORS.rojo,
  },
  info: { flex: 1, padding: 14 },
  nombre: { color: COLORS.texto, fontSize: 16, fontWeight: '700' },
  detalle: { color: COLORS.textoSuave, fontSize: 13, marginTop: 4 },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: ESPACIO.radioSm,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  badgeTexto: { fontSize: 12, fontWeight: '700' },

  // Insignia "¡RECOMENDADO!": dorada y con brillo, resalta sobre el fondo oscuro
  recomendado: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.doradoBrillante,
    borderRadius: ESPACIO.radioSm,
    backgroundColor: colorConAlpha(COLORS.doradoBrillante, 0.12),
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginBottom: 8,
    // Resplandor de la cajita
    shadowColor: COLORS.doradoBrillante,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  recomendadoTexto: {
    color: COLORS.doradoBrillante,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    // El brillo del texto: una sombra del mismo color, pegada (sin desplazamiento)
    textShadowColor: COLORS.doradoBrillante,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
})
