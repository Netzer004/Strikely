// ListaGimnasios (WEB): sección "Gimnasios cercanos (n)".
// En la compu la fila se mueve de dos maneras:
//   1) ARRASTRANDO con el mouse: clic sostenido y mover a los lados; al soltar,
//      la fila se acomoda sola a la tarjeta más cercana (efecto imán).
//   2) Con las flechas ‹ ›, que avanzan de DOS en DOS con una transición animada.
// (La versión del celular es ListaGimnasios.native.js y ahí se desliza con el dedo.)
import { useEffect, useRef, useState } from 'react'
import { Animated, Easing, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native'
import { COLORS, ESPACIO } from '../theme/theme'
import TarjetaGimnasio, { ANCHO_TARJETA, SEPARACION_TARJETA } from './TarjetaGimnasio'

// Cuántas tarjetas salta cada toque de flecha
const TARJETAS_POR_PASO = 2
// Distancia del borde izquierdo de una tarjeta al de la siguiente
const PASO = ANCHO_TARJETA + SEPARACION_TARJETA
// Cuántos píxeles hay que mover el mouse para que cuente como arrastre (y no como clic)
const UMBRAL_ARRASTRE = 6

export default function ListaGimnasios({ gimnasios, seleccionado, onSeleccionarGimnasio }) {
  const [anchoVentana, setAnchoVentana] = useState(0)
  // Hasta dónde queremos desplazar la fila (en píxeles)
  const [objetivo, setObjetivo] = useState(0)
  const desplazamiento = useRef(new Animated.Value(0)).current

  // Ancho total de la fila de tarjetas
  const contenido =
    gimnasios.length * ANCHO_TARJETA + Math.max(0, gimnasios.length - 1) * SEPARACION_TARJETA
  // Cuánto se puede desplazar sin dejar hueco al final (0 = todo cabe)
  const maximo = Math.max(0, contenido - anchoVentana)
  // Si la ventana se achica, el objetivo se recorta solo
  const actual = Math.min(objetivo, maximo)

  const puedeAtras = actual > 0
  const puedeAdelante = actual < maximo - 1
  const hayFlechas = anchoVentana > 0 && maximo > 1

  // La fila se mueve hacia la IZQUIERDA, así que el desplazamiento va en negativo
  const trasladoX = useRef(Animated.multiply(desplazamiento, -1)).current

  // Espejos en "ref": el arrastre los necesita para leer siempre el valor al día
  const desplazamientoRef = useRef(0)
  const inicioRef = useRef(0)
  const maximoRef = useRef(0)
  const actualRef = useRef(0)
  maximoRef.current = maximo
  actualRef.current = actual

  // Va guardando cuánto está desplazada la fila en este momento
  useEffect(() => {
    const id = desplazamiento.addListener(({ value }) => {
      desplazamientoRef.current = value
    })
    return () => desplazamiento.removeListener(id)
  }, [desplazamiento])

  // Cada vez que cambia el destino, se anima suavemente hacia él
  useEffect(() => {
    const anim = Animated.timing(desplazamiento, {
      toValue: actual,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // en web no hay driver nativo; false evita avisos
    })
    anim.start()
    return () => anim.stop()
  }, [actual, desplazamiento])

  // Al cambiar los filtros (ciudad, disciplina o búsqueda) la fila vuelve al inicio
  useEffect(() => {
    setObjetivo(0)
  }, [gimnasios])

  // Mueve la fila dos tarjetas, sin salirse de los límites
  const mover = (dir) => {
    setObjetivo((o) => {
      const base = Math.min(o, maximo)
      return Math.min(Math.max(base + dir * TARJETAS_POR_PASO * PASO, 0), maximo)
    })
  }

  // --- ARRASTRE CON EL MOUSE ---
  // Al empezar: guardamos desde dónde arranca y frenamos cualquier animación
  const empezarArrastre = () => {
    inicioRef.current = desplazamientoRef.current
    desplazamiento.stopAnimation()
  }

  // Al soltar: la fila se acomoda a la tarjeta más cercana
  const soltarArrastre = () => {
    const donde = Math.min(Math.max(desplazamientoRef.current, 0), maximoRef.current)
    const destino = Math.min(Math.max(Math.round(donde / PASO) * PASO, 0), maximoRef.current)
    if (destino === actualRef.current) {
      // El valor no cambió por estado: lo acomodamos a mano
      Animated.timing(desplazamiento, {
        toValue: destino,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start()
    } else {
      setObjetivo(destino)
    }
  }

  // El gesto: solo se toma si de verdad hay movimiento horizontal
  const pan = useRef(
    PanResponder.create({
      // Un clic sencillo NO cuenta como arrastre: así la tarjeta se puede seleccionar
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesto) =>
        Math.abs(gesto.dx) > UMBRAL_ARRASTRE && Math.abs(gesto.dx) > Math.abs(gesto.dy),
      onPanResponderGrant: empezarArrastre,
      onPanResponderMove: (_, gesto) => {
        // Posición nueva = desde dónde empezó, menos lo que se movió el mouse
        const bruto = Math.min(Math.max(inicioRef.current - gesto.dx, 0), maximoRef.current)
        desplazamiento.setValue(bruto)
      },
      onPanResponderRelease: soltarArrastre,
      onPanResponderTerminate: soltarArrastre,
    })
  ).current

  return (
    <View>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>
          Gimnasios cercanos <Text style={styles.contador}>({gimnasios.length})</Text>
        </Text>

        {/* Las flechas solo aparecen si hay tarjetas de sobra */}
        {hayFlechas && (
          <View style={styles.flechas}>
            <Flecha direccion="izq" activa={puedeAtras} onPress={() => mover(-1)} />
            <Flecha direccion="der" activa={puedeAdelante} onPress={() => mover(1)} />
          </View>
        )}
      </View>

      {gimnasios.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioTitulo}>No hay gimnasios para mostrar</Text>
          <Text style={styles.vacioTexto}>
            Prueba con otra disciplina, ciudad o término de búsqueda.
          </Text>
        </View>
      ) : (
        // "Ventana": recorta la fila y captura el arrastre del mouse.
        // El padding vertical deja ver el resplandor de la tarjeta seleccionada.
        <View
          style={styles.ventana}
          onLayout={(e) => setAnchoVentana(e.nativeEvent.layout.width)}
          {...pan.panHandlers}
        >
          <Animated.View style={[styles.fila, { transform: [{ translateX: trasladoX }] }]}>
            {gimnasios.map((gimnasio) => (
              <TarjetaGimnasio
                key={gimnasio.id}
                gimnasio={gimnasio}
                seleccionado={seleccionado?.id === gimnasio.id}
                onPress={() => onSeleccionarGimnasio(gimnasio)}
              />
            ))}
          </Animated.View>
        </View>
      )}
    </View>
  )
}

// Botón de flecha. Se ve apagado cuando ya no se puede mover en ese sentido.
function Flecha({ direccion, activa, onPress }) {
  const esIzq = direccion === 'izq'
  return (
    <Pressable
      onPress={onPress}
      disabled={!activa}
      accessibilityRole="button"
      accessibilityLabel={esIzq ? 'Ver gimnasios anteriores' : 'Ver más gimnasios'}
      style={[styles.flecha, activa && styles.flechaActiva]}
    >
      <Text style={[styles.flechaTexto, activa && styles.flechaTextoActivo]}>
        {esIzq ? '‹' : '›'}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titulo: { color: COLORS.texto, fontSize: 18, fontWeight: '700' },
  contador: { color: COLORS.textoSuave, fontWeight: '600' },

  flechas: { flexDirection: 'row', gap: 8 },
  flecha: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: COLORS.borde,
    borderRadius: ESPACIO.radioSm,
    backgroundColor: COLORS.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Cuando sí se puede mover, la flecha toma el rojo de marca
  flechaActiva: { borderColor: COLORS.rojo },
  flechaTexto: { color: COLORS.textoSuave, fontSize: 20, fontWeight: '900', lineHeight: 22 },
  flechaTextoActivo: { color: COLORS.rojo },

  // La "ventana" recorta la fila y es la zona donde se arrastra con el mouse
  ventana: {
    overflow: 'hidden',
    paddingVertical: 12,
    // Solo web: manita abierta (invita a arrastrar) y sin seleccionar texto al mover
    cursor: 'grab',
    userSelect: 'none',
  },
  fila: { flexDirection: 'row', gap: SEPARACION_TARJETA },

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
