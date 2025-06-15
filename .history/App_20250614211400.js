import React from 'react';
import { View, Text, Alert } from 'react-native';
import styles from './Styles/styles';
import ControlesMovimiento from './components/ControlesMovimiento';

const ESP32_IP = 'http://192.168.157.176/comando';

export default function App() {
  const enviarComando = async (comando) => {
    try {
      const response = await fetch(ESP32_IP, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: comando,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.text();
      console.log('📨 Respuesta:', data);
      Alert.alert('✅ Éxito', `Comando enviado: ${comando}`);
    } catch (error) {
      console.error('❌ Error al enviar comando:', error.message);
      Alert.alert('❌ Error', `No se pudo enviar: ${comando}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Control Robot ESP32</Text>
      <ControlesMovimiento onEnviarComando={enviarComando} />
    </View>
  );
}
