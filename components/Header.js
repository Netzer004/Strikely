// Header: encabezado con degradado rojo->negro, el logo (S + TRIKELY), el
// subtítulo y los botones de ciudad.
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, ESPACIO } from '../theme/theme'

export default function Header({ titulo, lema, ciudades, ciudadActiva, onSeleccionarCiudad }) {
  return (
    <LinearGradient
      colors={[COLORS.rojoOscuro, COLORS.fondo]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.contenedor}
    >
      {/* Logo en una sola pieza: la "S" de fuego (PNG transparente) + TRIKELY */}
      <View style={styles.logoFila}>
        <Image
          source={require('../assets/images/logo-s.png')}
          style={styles.logoImagen}
          resizeMode="contain"
        />
        <Text style={styles.logoTexto}>TRIKELY</Text>
      </View>

      {/* Subtítulo / lema */}
      <Text style={styles.lema}>{lema}</Text>

      {/* Botones de ciudad */}
      <View style={styles.ciudades}>
        {ciudades.map((ciudad) => {
          const activa = ciudad === ciudadActiva
          return (
            <Pressable
              key={ciudad}
              onPress={() => onSeleccionarCiudad(ciudad)}
              style={[styles.ciudad, activa && styles.ciudadActiva]}
            >
              <Text style={[styles.ciudadTexto, activa && styles.ciudadTextoActivo]}>{ciudad}</Text>
            </Pressable>
          )
        })}
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  contenedor: {
    width: '100%',
    paddingHorizontal: ESPACIO.lateral,
    paddingTop: 20,
    paddingBottom: 22,
  },
  logoFila: { flexDirection: 'row', alignItems: 'center' },
  // La "S" es un PNG transparente; se dimensiona alto y angosto como letra inicial
  logoImagen: { width: 30, height: 48 },
  logoTexto: {
    fontSize: 34,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
    color: COLORS.rojo,
  },
  // Lema como bajada discreta del logo (no compite con los títulos)
  lema: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textoSuave,
  },
  ciudades: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  ciudad: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.bordeBrillante,
    backgroundColor: COLORS.fondo,
  },
  ciudadActiva: { backgroundColor: COLORS.rojo, borderColor: COLORS.rojo },
  ciudadTexto: { color: COLORS.textoSuave, fontWeight: '600', fontSize: 13 },
  ciudadTextoActivo: { color: '#FFFFFF' },
})
