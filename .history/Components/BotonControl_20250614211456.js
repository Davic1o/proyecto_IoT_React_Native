import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import botonStyles from '../styles/botonStyles';

export default function BotonControl({ titulo, onPress, stop = false }) {
  return (
    <TouchableOpacity
      style={[botonStyles.boton, stop && botonStyles.botonStop]}
      onPress={onPress}
    >
      <Text style={botonStyles.texto}>{titulo}</Text>
    </TouchableOpacity>
  );
}
