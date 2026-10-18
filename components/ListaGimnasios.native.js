// ListaGimnasios (CELULAR): sección "Gimnasios cercanos (n)".
// Aquí SÍ se desliza con el dedo, así que no hay flechas: el dedo es el control.
// Con snapToInterval la fila se "pega" y al soltar se acomoda en la tarjeta
// más cercana (efecto imán).
// (La versión de la compu es ListaGimnasios.web.js y ahí se usan las flechas.)
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { COLORS, ESPACIO } from '../theme/theme'
import TarjetaGimnasio, { ANCHO_TARJETA, SEPARACION_TARJETA } from './TarjetaGimnasio'

// Distancia del borde izquierdo de una tarjeta al de la siguiente
const PASO = ANCHO_TARJETA + SEPARACION_TARJETA

export default function ListaGimnasios({ gimnasios, seleccionado, onSeleccionarGimnasio }) {
  return (
    <View>
      <Text style={styles.titulo}>
        Gimnasios cercanos <Text style={styles.contador}>({gimnasios.length})</Text>
      </Text>

      <FlatList
        data={gimnasios}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TarjetaGimnasio
            gimnasio={item}
            seleccionado={seleccionado?.id === item.id}
            onPress={() => onSeleccionarGimnasio(item)}
          />
        )}
        showsHorizontalScrollIndicator={false}
        // Imán: al soltar, la fila se acomoda alineada a una tarjeta
        snapToInterval={PASO}
        decelerationRate="fast"
        contentContainerStyle={styles.fila}
        // Mensaje cuando no hay resultados
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.vacioTitulo}>No hay gimnasios para mostrar</Text>
            <Text style={styles.vacioTexto}>
              Prueba con otra disciplina, ciudad o término de búsqueda.
            </Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  titulo: { color: COLORS.texto, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  contador: { color: COLORS.textoSuave, fontWeight: '600' },
  // gap separa las tarjetas; el padding vertical deja ver el resplandor
  // de la tarjeta seleccionada sin que se corte
  fila: { gap: SEPARACION_TARJETA, paddingVertical: 12 },
  vacio: {
    width: 300,
    backgroundColor: COLORS.superficie,
    borderWidth: 1,
    borderColor: COLORS.borde,
    borderRadius: ESPACIO.radio,
    padding: 24,
    alignItems: 'center',
  },
  vacioTitulo: { color: COLORS.texto, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  vacioTexto: { color: COLORS.textoSuave, fontSize: 14, textAlign: 'center', lineHeight: 20 },
})
