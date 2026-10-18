// PanelGimnasio: detalle del gimnasio. En pantallas anchas va en el cajón derecho
// (full-height); en angostas, como hoja inferior. Fondo negro con marco rojo.
import { useRef, useState } from 'react'
import {
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { COLORS, ESPACIO, colorDisciplina, colorConAlpha } from '../theme/theme'
import IconoDisciplina from './IconoDisciplina'

const GAP = 12
const SIN_INFO = 'Información próximamente'

// Etiquetas y orden de las redes que se pueden mostrar
const REDES = [
  { id: 'instagram', etiqueta: 'Instagram' },
  { id: 'facebook', etiqueta: 'Facebook' },
  { id: 'whatsapp', etiqueta: 'WhatsApp' },
  { id: 'tiktok', etiqueta: 'TikTok' },
  { id: 'web', etiqueta: 'Sitio web' },
]

// Construye el enlace de una red: acepta URL completa o usuario/teléfono
function urlRed(tipo, valor) {
  if (!valor) return null
  if (valor.startsWith('http')) return valor
  switch (tipo) {
    case 'instagram': return `https://instagram.com/${valor.replace('@', '')}`
    case 'facebook': return `https://facebook.com/${valor}`
    case 'tiktok': return `https://tiktok.com/@${valor.replace('@', '')}`
    case 'whatsapp': return `https://wa.me/${valor.replace(/\D/g, '')}`
    case 'web': return `https://${valor}`
    default: return null
  }
}

// Sección con título y separador tenue arriba
function Seccion({ titulo, children }) {
  return (
    <View style={styles.seccion}>
      <Text style={styles.seccionTitulo}>{titulo}</Text>
      {children}
    </View>
  )
}

export default function PanelGimnasio({ gimnasio, onCerrar, anchoInterior, radio = 0 }) {
  const galeriaRef = useRef(null)
  const indiceRef = useRef(0)
  // Foto que se está viendo en grande (null = ninguna)
  const [fotoAmpliada, setFotoAmpliada] = useState(null)

  const fotos = gimnasio.fotos || []
  const redes = gimnasio.redes || {}
  const redesDisponibles = REDES.filter((r) => redes[r.id])
  const esWeb = Platform.OS === 'web'
  const color = colorDisciplina(gimnasio.disciplina)
  // Una foto a la vez, a todo lo ancho del panel (formato horizontal 4:3)
  const anchoFoto = Math.max(140, Math.floor(anchoInterior || 320))

  // Mueve la galería una foto con las flechas (solo web)
  const moverGaleria = (dir) => {
    const maximo = Math.max(0, fotos.length - 1)
    const nuevo = Math.min(Math.max(indiceRef.current + dir, 0), maximo)
    indiceRef.current = nuevo
    galeriaRef.current?.scrollToIndex({ index: nuevo, animated: true })
  }

  const abrirMapa = () =>
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${gimnasio.latitud},${gimnasio.longitud}`
    )

  return (
    <ScrollView
      style={[styles.contenedor, { borderRadius: radio }]}
      contentContainerStyle={styles.contenido}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabecera: nombre + disciplina + cerrar */}
      <View style={styles.cabecera}>
        <View style={styles.cabeceraTexto}>
          <Text style={styles.nombre}>{gimnasio.nombre}</Text>
          <View
            style={[
              styles.badge,
              { borderColor: color, backgroundColor: colorConAlpha(color, 0.15) },
            ]}
          >
            <Text style={[styles.badgeTexto, { color }]}>{gimnasio.disciplina}</Text>
          </View>
        </View>
        <Pressable style={styles.cerrar} onPress={onCerrar} hitSlop={10}>
          <Text style={styles.cerrarTexto}>✕</Text>
        </Pressable>
      </View>

      {/* Fotos: galería deslizable (o recuadros si no hay) */}
      {fotos.length > 0 ? (
        <View style={styles.galeriaWrap}>
          {esWeb && fotos.length > 1 && (
            <Flecha lado="izq" onPress={() => moverGaleria(-1)} />
          )}
          <FlatList
            ref={galeriaRef}
            data={fotos}
            horizontal
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              // Al tocar la foto se abre en grande
              <Pressable onPress={() => setFotoAmpliada(item)}>
                <Image
                  source={item}
                  style={[styles.foto, { width: anchoFoto }]}
                  resizeMode="contain"
                />
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
            showsHorizontalScrollIndicator={false}
            // Una foto por vista, con efecto imán al deslizar
            snapToInterval={anchoFoto + GAP}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({
              length: anchoFoto + GAP,
              offset: (anchoFoto + GAP) * index,
              index,
            })}
          />
          {esWeb && fotos.length > 1 && (
            <Flecha lado="der" onPress={() => moverGaleria(1)} />
          )}
        </View>
      ) : (
        <View style={[styles.fotoVacia, { width: anchoFoto }]}>
          <IconoDisciplina disciplina={gimnasio.disciplina} size={64} />
          <Text style={styles.fotoVaciaTexto}>Fotos próximamente</Text>
        </View>
      )}

      <Seccion titulo="Entrenador">
        <Text style={styles.texto}>{gimnasio.entrenador || SIN_INFO}</Text>
      </Seccion>

      <Seccion titulo="Academia">
        <Text style={styles.texto}>{gimnasio.descripcion || SIN_INFO}</Text>
      </Seccion>

      {/* Horario: solo aparece si el gimnasio ya tiene el dato */}
      {gimnasio.horario ? (
        <Seccion titulo="Horario">
          <Text style={styles.texto}>{gimnasio.horario}</Text>
        </Seccion>
      ) : null}

      <Seccion titulo="Ubicación">
        <Text style={styles.texto}>
          {gimnasio.zona} · {gimnasio.ciudad}
        </Text>
        <Text style={styles.textoSuave}>{gimnasio.direccion}</Text>
        <Pressable style={styles.botonMapa} onPress={abrirMapa}>
          <Text style={styles.botonMapaTexto}>Cómo llegar</Text>
        </Pressable>
      </Seccion>

      {redesDisponibles.length > 0 && (
        <Seccion titulo="Redes sociales">
          <View style={styles.redes}>
            {redesDisponibles.map((r) => (
              <Pressable
                key={r.id}
                style={styles.red}
                onPress={() => Linking.openURL(urlRed(r.id, redes[r.id]))}
              >
                <Text style={styles.redTexto}>{r.etiqueta}</Text>
              </Pressable>
            ))}
          </View>
        </Seccion>
      )}
      {/* Visor: la foto en grande, centrada, con botón de cerrar */}
      <Modal
        visible={fotoAmpliada !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFotoAmpliada(null)}
      >
        <View style={styles.visorFondo}>
          {/* Tocando el fondo (fuera de la foto) se cierra */}
          <Pressable style={styles.visorTapado} onPress={() => setFotoAmpliada(null)} />
          {fotoAmpliada && (
            <Image source={fotoAmpliada} style={styles.visorFoto} resizeMode="contain" />
          )}
          <Pressable
            style={styles.visorCerrar}
            onPress={() => setFotoAmpliada(null)}
            hitSlop={12}
          >
            <Text style={styles.visorCerrarTexto}>✕</Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  )
}

// Flecha de la galería (solo web)
function Flecha({ lado, onPress }) {
  return (
    <Pressable
      style={[styles.flecha, lado === 'izq' ? styles.flechaIzq : styles.flechaDer]}
      onPress={onPress}
      hitSlop={8}
    >
      <Text style={styles.flechaTexto}>{lado === 'izq' ? '‹' : '›'}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORS.fondo,
    // Separador neutro con el contenido; el rojo queda en el resplandor
    borderLeftWidth: 1,
    borderLeftColor: COLORS.borde,
    // Resplandor de marca apenas insinuado (no neón)
    shadowColor: COLORS.rojo,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  contenido: { padding: 18 },
  cabecera: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  cabeceraTexto: { flex: 1 },
  nombre: { color: COLORS.texto, fontSize: 24, fontWeight: '800' },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: ESPACIO.radioSm,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  badgeTexto: { fontSize: 12, fontWeight: '700' },
  cerrar: {
    width: 34,
    height: 34,
    borderRadius: ESPACIO.radioSm,
    borderWidth: 1,
    borderColor: COLORS.borde,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cerrarTexto: { color: COLORS.texto, fontSize: 16, fontWeight: '700' },

  galeriaWrap: { position: 'relative' },
  // Fotos con proporción 4:3 (el alto sale del ancho)
  foto: {
    aspectRatio: 4 / 3,
    borderRadius: ESPACIO.radio,
    borderWidth: 1,
    borderColor: COLORS.bordeTenue,
    backgroundColor: COLORS.superficieClara,
  },
  fotoVacia: {
    aspectRatio: 4 / 3,
    borderRadius: ESPACIO.radio,
    borderWidth: 1,
    borderColor: COLORS.bordeTenue,
    backgroundColor: COLORS.superficieClara,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fotoVaciaTexto: { color: COLORS.textoSuave, fontSize: 12, fontWeight: '600' },

  flecha: {
    position: 'absolute',
    top: '40%',
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flechaIzq: { left: 6 },
  flechaDer: { right: 6 },
  flechaTexto: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', lineHeight: 22 },

  seccion: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.bordeTenue,
  },
  // Títulos de sección tipo etiqueta (rojo de marca en mayúsculas pequeñas)
  seccionTitulo: {
    color: COLORS.rojo,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  texto: { color: COLORS.texto, fontSize: 15, lineHeight: 21 },
  textoSuave: { color: COLORS.textoSuave, fontSize: 14, marginTop: 2 },

  botonMapa: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.rojo,
    borderRadius: ESPACIO.radioSm,
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  botonMapaTexto: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  redes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  // Píldoras neutras: el color lo pone el texto, no el borde
  red: {
    borderWidth: 1,
    borderColor: COLORS.borde,
    borderRadius: 999,
    backgroundColor: COLORS.superficie,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  redTexto: { color: COLORS.texto, fontWeight: '600', fontSize: 13 },

  // Visor de la foto en grande: fondo oscuro y la foto centrada
  visorFondo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Capa invisible que cubre todo: tocar ahí cierra el visor
  visorTapado: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  // La foto se ve COMPLETA (sin recortes) dentro de esta caja
  visorFoto: { width: '88%', height: '78%' },
  visorCerrar: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borde,
    backgroundColor: COLORS.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visorCerrarTexto: { color: COLORS.texto, fontSize: 20, fontWeight: '700' },
})
