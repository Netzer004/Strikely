// App: pantalla principal de Strikely. Maneja los filtros (ciudad, disciplina y
// búsqueda) y el gimnasio seleccionado. Al seleccionarlo, todo el contenido se
// achica a la izquierda y entra el panel de detalle: cajón full-height a la
// derecha en pantallas anchas, hoja inferior en angostas. Animación de ~300 ms.
import { useEffect, useMemo, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import { COLORS, ESPACIO } from './theme/theme'
import { DISCIPLINAS } from './data/disciplinas'
import { GIMNASIOS } from './data/gimnasios'
import Header from './components/Header'
import BarraBusqueda from './components/BarraBusqueda'
import SelectorDisciplina from './components/SelectorDisciplina'
import MapaGimnasios from './components/MapaGimnasios'
import ListaGimnasios from './components/ListaGimnasios'
import PanelGimnasio from './components/PanelGimnasio'

// Ciudades disponibles en el header
const CIUDADES = ['Culiacán', 'Eldorado']
// A partir de este ancho se usa el cajón lateral derecho
const CORTE_ANCHO = 768

export default function App() {
  const { width, height } = useWindowDimensions()
  const esAncho = width >= CORTE_ANCHO

  const [ciudad, setCiudad] = useState('Culiacán')
  const [disciplina, setDisciplina] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')
  // Gimnasio seleccionado (o null). Vive aquí para compartirlo entre lista, mapa y panel.
  const [seleccionado, setSeleccionado] = useState(null)
  // Gimnasio que se muestra en el panel (se conserva durante la animación de cierre)
  const [panelGimnasio, setPanelGimnasio] = useState(null)
  // Token que cambia al terminar la animación, para que el mapa se redibuje
  const [reajuste, setReajuste] = useState(0)
  const scrollRef = useRef(null)
  const progreso = useRef(new Animated.Value(0)).current

  // Se recalcula solo cuando cambia algún filtro
  const gimnasiosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return GIMNASIOS.filter((gimnasio) => {
      const coincideCiudad = gimnasio.ciudad === ciudad
      const coincideDisciplina = disciplina === 'Todas' || gimnasio.disciplina === disciplina
      const coincideTexto = gimnasio.nombre.toLowerCase().includes(texto)
      return coincideCiudad && coincideDisciplina && coincideTexto
    })
  }, [ciudad, disciplina, busqueda])

  // Tocar el mismo gimnasio otra vez quita la selección
  const alSeleccionarGimnasio = (gimnasio) => {
    setSeleccionado((actual) => (actual?.id === gimnasio.id ? null : gimnasio))
  }

  const cerrarPanel = () => setSeleccionado(null)

  // Al elegir desde la lista, se sube al inicio para que se vea el mapa
  const alSeleccionarDesdeLista = (gimnasio) => {
    alSeleccionarGimnasio(gimnasio)
    scrollRef.current?.scrollTo({ y: 0, animated: true })
  }

  // Si el filtro o la búsqueda dejan fuera al seleccionado, se cierra el panel
  useEffect(() => {
    if (seleccionado && !gimnasiosFiltrados.some((g) => g.id === seleccionado.id)) {
      setSeleccionado(null)
    }
  }, [gimnasiosFiltrados, seleccionado])

  // Abre/cierra el panel con una sola animación suave
  useEffect(() => {
    if (seleccionado) setPanelGimnasio(seleccionado)
    const anim = Animated.timing(progreso, {
      toValue: seleccionado ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    })
    anim.start(({ finished }) => {
      if (!finished) return
      setReajuste((r) => r + 1) // el mapa se redibuja al terminar
      if (!seleccionado) setPanelGimnasio(null)
    })
    return () => anim.stop()
  }, [seleccionado, progreso])

  // Medidas del layout ancho (el panel ocupa ~40% de todo el ancho de pantalla)
  const anchoPanel = Math.round(width * 0.4)
  const anchoIzquierda = progreso.interpolate({
    inputRange: [0, 1],
    outputRange: [width, width - anchoPanel],
  })
  const trasladoX = progreso.interpolate({ inputRange: [0, 1], outputRange: [anchoPanel, 0] })
  const trasladoY = progreso.interpolate({ inputRange: [0, 1], outputRange: [height, 0] })

  return (
    <View style={styles.pantalla}>
      <StatusBar style="light" />

      {/* Columna principal: todo se achica cuando hay panel (pantallas anchas) */}
      <Animated.View style={[styles.columna, esAncho && { width: anchoIzquierda }]}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.contenido}
          showsVerticalScrollIndicator={false}
        >
          <Header
            titulo="Strikely"
            lema="Encuentra tu disciplina"
            ciudades={CIUDADES}
            ciudadActiva={ciudad}
            onSeleccionarCiudad={setCiudad}
          />

          <View style={styles.secciones}>
            <BarraBusqueda valor={busqueda} onCambiar={setBusqueda} />
            <SelectorDisciplina
              disciplinas={DISCIPLINAS}
              seleccionada={disciplina}
              onSeleccionar={setDisciplina}
            />
            <MapaGimnasios
              gimnasios={gimnasiosFiltrados}
              seleccionado={seleccionado}
              onSeleccionar={alSeleccionarGimnasio}
              onVerTodos={cerrarPanel}
              reajuste={reajuste}
            />
            <ListaGimnasios
              gimnasios={gimnasiosFiltrados}
              seleccionado={seleccionado}
              onSeleccionarGimnasio={alSeleccionarDesdeLista}
            />
          </View>
        </ScrollView>
      </Animated.View>

      {/* Cajón lateral derecho, full-height (pantallas anchas) */}
      {esAncho && (
        <Animated.View
          style={[styles.panelAncho, { width: anchoPanel, transform: [{ translateX: trasladoX }] }]}
        >
          {panelGimnasio && (
            <PanelGimnasio
              gimnasio={panelGimnasio}
              onCerrar={cerrarPanel}
              anchoInterior={anchoPanel - 32}
            />
          )}
        </Animated.View>
      )}

      {/* Hoja inferior (pantallas angostas) */}
      {!esAncho && panelGimnasio && (
        <>
          <Animated.View style={[styles.backdrop, { opacity: progreso }]}>
            <Pressable style={styles.backdropRelleno} onPress={cerrarPanel} />
          </Animated.View>
          <Animated.View style={[styles.hoja, { transform: [{ translateY: trasladoY }] }]}>
            <PanelGimnasio
              gimnasio={panelGimnasio}
              onCerrar={cerrarPanel}
              anchoInterior={width - 32}
              radio={0}
            />
          </Animated.View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  // overflow: hidden evita scroll horizontal cuando el panel está fuera de pantalla
  pantalla: { flex: 1, backgroundColor: COLORS.fondo, overflow: 'hidden' },
  columna: { flex: 1, width: '100%' },
  scroll: { flex: 1 },
  contenido: { paddingBottom: 24 },
  secciones: { paddingHorizontal: ESPACIO.lateral, paddingTop: ESPACIO.seccion, gap: ESPACIO.seccion },

  // Cajón lateral derecho (ocupa toda la altura)
  panelAncho: { position: 'absolute', top: 0, right: 0, bottom: 0 },

  // Hoja inferior (celular)
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  backdropRelleno: { flex: 1 },
  hoja: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '75%',
    backgroundColor: COLORS.fondo,
    borderTopLeftRadius: ESPACIO.radioGrande,
    borderTopRightRadius: ESPACIO.radioGrande,
    overflow: 'hidden',
  },
})
