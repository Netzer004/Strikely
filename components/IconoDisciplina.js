// IconoDisciplina: muestra el icono de una disciplina.
// Es el mismo archivo para web y celular (es solo una imagen).
import { Image } from 'react-native'
import { iconoDe } from './iconosDisciplinas'

export default function IconoDisciplina({ disciplina, size = 32 }) {
  return (
    <Image
      source={{ uri: iconoDe(disciplina) }}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  )
}
