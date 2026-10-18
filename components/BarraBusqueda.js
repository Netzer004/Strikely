// BarraBusqueda: campo para buscar gimnasios por nombre. Lupa roja a la izquierda.
import { StyleSheet, TextInput, View } from 'react-native'
import { COLORS, ESPACIO } from '../theme/theme'

// Lupa dibujada con Views (círculo + mango) para no usar emojis
function Lupa() {
  return (
    <View style={styles.lupa}>
      <View style={styles.lupaCirculo} />
      <View style={styles.lupaMango} />
    </View>
  )
}

export default function BarraBusqueda({ valor, onCambiar }) {
  return (
    <View style={styles.contenedor}>
      <Lupa />
      <TextInput
        style={styles.input}
        placeholder="Buscar gimnasio por nombre..."
        placeholderTextColor={COLORS.textoSuave}
        value={valor}
        onChangeText={onCambiar}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  // Campo con superficie propia y borde neutro (el rojo queda solo en la lupa)
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.superficie,
    borderWidth: 1,
    borderColor: COLORS.borde,
    borderRadius: ESPACIO.radioSm,
    paddingHorizontal: 14,
  },
  input: { flex: 1, color: COLORS.texto, fontSize: 15, paddingVertical: 12 },

  lupa: { width: 18, height: 18, marginRight: 10 },
  lupaCirculo: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 1.8,
    borderColor: COLORS.rojo,
  },
  lupaMango: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 1.8,
    height: 7,
    borderRadius: 1,
    backgroundColor: COLORS.rojo,
    transform: [{ rotate: '45deg' }],
  },
})
