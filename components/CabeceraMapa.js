// CabeceraMapa: título "Explora el mapa", contador y botón "Ver todos".
// Se comparte entre la versión web y la nativa del mapa.
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { COLORS, ESPACIO } from '../theme/theme'

export default function CabeceraMapa({ total, mostrarVerTodos, onVerTodos }) {
  return (
    <View style={styles.encabezado}>
      <Text style={styles.titulo}>Explora el mapa</Text>

      <View style={styles.acciones}>
        {/* Botón para quitar la selección y volver a la vista completa */}
        {mostrarVerTodos && (
          <Pressable style={styles.verTodos} onPress={onVerTodos}>
            <Text style={styles.verTodosTexto}>Ver todos</Text>
          </Pressable>
        )}

        {/* Contador de gimnasios mostrados (singular/plural) */}
        <View style={styles.contador}>
          <Text style={styles.contadorTexto}>
            {total} {total === 1 ? 'gimnasio' : 'gimnasios'}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titulo: { color: COLORS.texto, fontSize: 18, fontWeight: '700' },
  acciones: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  verTodos: {
    backgroundColor: COLORS.rojo,
    borderRadius: ESPACIO.radioSm,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  verTodosTexto: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  // Contador neutro, para no duplicar el rojo del botón de al lado
  contador: {
    backgroundColor: COLORS.superficieClara,
    borderWidth: 1,
    borderColor: COLORS.borde,
    borderRadius: ESPACIO.radioSm,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  contadorTexto: { color: COLORS.textoSuave, fontWeight: '700', fontSize: 12 },
})
