// SelectorDisciplina: menú desplegable para elegir la disciplina.
// Pressable abre/cierra y un Modal muestra la lista de opciones.
import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { COLORS, ESPACIO } from '../theme/theme'

export default function SelectorDisciplina({ disciplinas, seleccionada, onSeleccionar }) {
  const [abierto, setAbierto] = useState(false)

  // Al elegir una opción se actualiza el filtro y se cierra la lista
  const elegir = (disciplina) => {
    onSeleccionar(disciplina)
    setAbierto(false)
  }

  return (
    <View>
      {/* Botón que muestra la disciplina elegida */}
      <Pressable style={styles.boton} onPress={() => setAbierto(true)}>
        <Text style={styles.botonTexto}>
          <Text style={styles.botonLabel}>Disciplina: </Text>
          {seleccionada}
        </Text>
        <Text style={styles.flecha}>▾</Text>
      </Pressable>

      {/* Lista desplegable */}
      <Modal
        visible={abierto}
        transparent
        animationType="fade"
        onRequestClose={() => setAbierto(false)}
      >
        <Pressable style={styles.fondo} onPress={() => setAbierto(false)}>
          <View style={styles.lista}>
            {disciplinas.map((disciplina) => {
              const activa = disciplina === seleccionada
              return (
                <Pressable
                  key={disciplina}
                  style={[styles.opcion, activa && styles.opcionActiva]}
                  onPress={() => elegir(disciplina)}
                >
                  <Text style={[styles.opcionTexto, activa && styles.opcionTextoActivo]}>
                    {disciplina}
                  </Text>
                  {activa && <Text style={styles.check}>✓</Text>}
                </Pressable>
              )
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.superficie,
    borderWidth: 1,
    borderColor: COLORS.borde,
    borderRadius: ESPACIO.radioSm,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  botonTexto: { color: COLORS.texto, fontSize: 15, flex: 1 },
  botonLabel: { color: COLORS.textoSuave, fontWeight: '700' },
  flecha: { color: COLORS.rojo, fontSize: 18, fontWeight: '900' },

  fondo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  // Lista como tarjeta limpia (radius + overflow para que el resaltado no se salga)
  lista: {
    backgroundColor: COLORS.superficie,
    borderRadius: ESPACIO.radio,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borde,
    paddingVertical: 6,
  },
  opcion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  opcionActiva: { backgroundColor: 'rgba(225, 29, 46, 0.18)' },
  opcionTexto: { color: COLORS.texto, fontSize: 16 },
  opcionTextoActivo: { color: COLORS.rojo, fontWeight: '700' },
  check: { color: COLORS.rojo, fontSize: 16, fontWeight: '900' },
})
