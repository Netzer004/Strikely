// MapaGimnasios.web.js: mapa real para la versión web con Leaflet + OpenStreetMap.
// Sin API keys. Centrado en Culiacán y limitado a la ciudad.
import { useEffect, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { COLORS, ESPACIO } from '../theme/theme'
import CabeceraMapa from './CabeceraMapa'
import { htmlMarcador } from './iconosDisciplinas'

// Centro, límites de Culiacán y zoom al seleccionar
const CENTRO = [24.8091, -107.394]
const ZOOM = 12
const ZOOM_SELECCION = 16
const LIMITES = [
  [24.74, -107.52],
  [24.88, -107.3],
]

// Crea el marcador (chapita) con el ícono de la disciplina; más grande si está seleccionado
function crearIcono(disciplina, seleccionado) {
  return L.divIcon({
    className: '',
    html: htmlMarcador(disciplina, seleccionado),
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

// Controlador: redibuja el mapa cuando cambia de tamaño y lo mueve según la selección.
function Controlador({ seleccionado, reajuste, marcadoresRef }) {
  const map = useMap()

  // Al cambiar el ancho (abrir/cerrar el panel) se redibujan los mosaicos
  useEffect(() => {
    const contenedor = map.getContainer()
    const observador = new ResizeObserver(() => map.invalidateSize())
    observador.observe(contenedor)
    return () => observador.disconnect()
  }, [map])

  useEffect(() => {
    // invalidateSize al terminar la animación, y luego centrar/zoom
    map.invalidateSize()
    if (seleccionado) {
      // Vuela al gimnasio con zoom cercano y abre su popup al terminar el movimiento
      map.flyTo([seleccionado.latitud, seleccionado.longitud], ZOOM_SELECCION, { duration: 0.8 })
      const marcador = marcadoresRef.current[seleccionado.id]
      if (marcador) map.once('moveend', () => marcador.openPopup())
    } else {
      // Sin selección: vuelve a la vista completa de Culiacán
      map.flyTo(CENTRO, ZOOM, { duration: 0.8 })
    }
  }, [seleccionado, reajuste, map, marcadoresRef])

  return null
}

export default function MapaGimnasios({ gimnasios, seleccionado, onSeleccionar, onVerTodos, reajuste }) {
  // Guarda la referencia de cada marcador para poder abrir su popup
  const marcadoresRef = useRef({})

  // CSS propio de Leaflet: oscurece los mosaicos de OSM para el tema oscuro
  useEffect(() => {
    const estilo = document.createElement('style')
    estilo.innerHTML = `
      .osm-oscuro { filter: brightness(0.75) invert(1) contrast(2.2) hue-rotate(200deg) saturate(0.4); }
      .leaflet-container { background: ${COLORS.fondo}; }
      .leaflet-popup-content { color: #0A0F1E; font-weight: 600; }
    `
    document.head.appendChild(estilo)
    return () => document.head.removeChild(estilo)
  }, [])

  return (
    <View style={styles.contenedor}>
      {/* Título, contador y botón "Ver todos" */}
      <CabeceraMapa
        total={gimnasios.length}
        mostrarVerTodos={!!seleccionado}
        onVerTodos={onVerTodos}
      />

      {/* Recuadro del mapa (altura fija) */}
      <View style={styles.marco}>
        <MapContainer
          center={CENTRO}
          zoom={ZOOM}
          maxBounds={LIMITES}
          maxBoundsViscosity={1.0}
          minZoom={11}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Mosaicos de OpenStreetMap con su atribución obligatoria */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            className="osm-oscuro"
            maxZoom={19}
          />

          {/* Un marcador rojo por gimnasio; al tocarlo abre su popup y lo selecciona */}
          {gimnasios.map((gimnasio) => (
            <Marker
              key={gimnasio.id}
              position={[gimnasio.latitud, gimnasio.longitud]}
              icon={crearIcono(gimnasio.disciplina, seleccionado?.id === gimnasio.id)}
              ref={(ref) => {
                marcadoresRef.current[gimnasio.id] = ref
              }}
              eventHandlers={{ click: () => onSeleccionar(gimnasio) }}
            >
              <Popup>{`${gimnasio.nombre} — ${gimnasio.disciplina}`}</Popup>
            </Marker>
          ))}

          {/* Mueve/abre el mapa según la selección */}
          <Controlador seleccionado={seleccionado} reajuste={reajuste} marcadoresRef={marcadoresRef} />
        </MapContainer>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  contenedor: { marginBottom: 24 },
  marco: {
    height: 280,
    borderRadius: ESPACIO.radioGrande,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borde,
    backgroundColor: COLORS.superficie,
  },
})
