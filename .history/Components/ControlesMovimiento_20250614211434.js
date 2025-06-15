import React from 'react';
import { View } from 'react-native';
import styles from '../Styles/styles';
import BotonControl from './BotonControl';

export default function ControlesMovimiento({ onEnviarComando }) {
  return (
    <>
      <BotonControl titulo="⬆️ Adelante" onPress={() => onEnviarComando('adelante')} />

      <View style={styles.fila}>
        <BotonControl titulo="⬅️ Izquierda" onPress={() => onEnviarComando('izquierda')} />
        <BotonControl titulo="➡️ Derecha" onPress={() => onEnviarComando('derecha')} />
      </View>

      <BotonControl titulo="⬇️ Atrás" onPress={() => onEnviarComando('atras')} />
      <BotonControl titulo="🛑 STOP" stop onPress={() => onEnviarComando('stop')} />
    </>
  );
}
