// MapaGimnasios.native.js: mapa real para celular con Leaflet dentro de un WebView.
// Usa mosaicos de OpenStreetMap; funciona en Expo Go sin claves de API.
// El WebView captura los gestos internos, así que arrastrar el mapa NO mueve la pantalla.
import { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { COLORS, ESPACIO } from '../theme/theme'
import CabeceraMapa from './CabeceraMapa'
import { DISCIPLINAS_CON_ICONO, htmlMarcador } from './iconosDisciplinas'

// Arma el HTML del mapa con Leaflet (por CDN), los marcadores y sus íconos
function construirHtml(gimnasios) {
  // Solo se pasan los campos que necesita el mapa
  const datos = gimnasios.map((g) => ({
    id: g.id,
    nombre: g.nombre,
    disciplina: g.disciplina,
    lat: g.latitud,
    lng: g.longitud,
  }))

  // HTML de cada chapita (normal y seleccionada) reutilizando htmlMarcador
  const iconos = {}
  DISCIPLINAS_CON_ICONO.forEach((disciplina) => {
    iconos[disciplina] = {
      normal: htmlMarcador(disciplina, false),
      sel: htmlMarcador(disciplina, true),
    }
  })

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; background: ${COLORS.fondo}; }
    .osm-oscuro { filter: brightness(0.75) invert(1) contrast(2.2) hue-rotate(200deg) saturate(0.4); }
    .leaflet-popup-content { color: #0A0F1E; font-weight: 600; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var gimnasios = ${JSON.stringify(datos)};
    var ICONOS = ${JSON.stringify(iconos)};

    // Devuelve el ícono (chapita) de una disciplina, normal o seleccionada
    function iconoDe(disciplina, sel) {
      var ic = ICONOS[disciplina] || ICONOS['MMA'];
      return L.divIcon({ className: '', html: sel ? ic.sel : ic.normal, iconSize: [30, 30], iconAnchor: [15, 15] });
    }

    // Mapa centrado y limitado a Culiacán
    var map = L.map('map', {
      center: [24.8091, -107.3940],
      zoom: 12,
      maxBounds: [[24.74, -107.52], [24.88, -107.30]],
      maxBoundsViscosity: 1.0,
      minZoom: 11
    });

    // Mosaicos de OpenStreetMap con su atribución
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      className: 'osm-oscuro',
      maxZoom: 19
    }).addTo(map);

    // Un marcador por gimnasio. Al tocarlo avisa a React Native para seleccionarlo.
    var dis = {};
    var marcadores = {};
    gimnasios.forEach(function (g) {
      dis[g.id] = g.disciplina;
      var m = L.marker([g.lat, g.lng], { icon: iconoDe(g.disciplina, false) }).addTo(map);
      m.bindPopup('<b>' + g.nombre + '</b><br>' + g.disciplina);
      m.on('click', function () {
        window.ReactNativeWebView.postMessage(JSON.stringify({ tipo: 'seleccion', id: g.id }));
      });
      marcadores[g.id] = m;
    });

    // Resalta el marcador seleccionado (y quita el resaltado del anterior)
    var seleccionadoId = null;
    function resaltar(id) {
      if (seleccionadoId && marcadores[seleccionadoId]) {
        marcadores[seleccionadoId].setIcon(iconoDe(dis[seleccionadoId], false));
      }
      seleccionadoId = id;
      if (id && marcadores[id]) {
        marcadores[id].setIcon(iconoDe(dis[id], true));
      }
    }

    // Redibuja los mosaicos si cambia el tamaño del WebView (abrir/cerrar panel)
    window.addEventListener('resize', function () { map.invalidateSize(); });

    // Mueve el mapa a un gimnasio y abre su popup (lo llama React Native)
    window.irA = function (id) {
      var m = marcadores[id];
      if (!m) return;
      map.invalidateSize();
      resaltar(id);
      map.flyTo(m.getLatLng(), 16, { duration: 0.8 });
      map.once('moveend', function () { m.openPopup(); });
    };

    // Vuelve a la vista completa de Culiacán (lo llama React Native)
    window.verTodos = function () {
      map.invalidateSize();
      resaltar(null);
      map.flyTo([24.8091, -107.3940], 12, { duration: 0.8 });
    };
  </script>
</body>
</html>`
}

export default function MapaGimnasios({ gimnasios, seleccionado, onSeleccionar, onVerTodos, reajuste }) {
  const webviewRef = useRef(null)
  const [cargado, setCargado] = useState(false)

  // Cuando cambia la selección o termina la animación, mueve/redibuja el mapa
  useEffect(() => {
    if (!cargado || !webviewRef.current) return
    if (seleccionado) {
      webviewRef.current.injectJavaScript(`window.irA && window.irA(${JSON.stringify(seleccionado.id)}); true;`)
    } else {
      webviewRef.current.injectJavaScript('window.verTodos && window.verTodos(); true;')
    }
  }, [seleccionado, reajuste, cargado])

  // Recibe el click de un marcador desde el WebView y selecciona ese gimnasio
  const alRecibirMensaje = (evento) => {
    try {
      const dato = JSON.parse(evento.nativeEvent.data)
      if (dato.tipo === 'seleccion') {
        const gimnasio = gimnasios.find((g) => g.id === dato.id)
        if (gimnasio) onSeleccionar(gimnasio)
      }
    } catch (e) {
      // Se ignora cualquier mensaje que no sea JSON válido
    }
  }

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
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html: construirHtml(gimnasios) }}
          style={styles.webview}
          scrollEnabled={false}
          onLoadStart={() => setCargado(false)}
          onLoadEnd={() => setCargado(true)}
          onMessage={alRecibirMensaje}
        />
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
  webview: { flex: 1, backgroundColor: COLORS.fondo },
})
