import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

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
      Alert.alert('✅ Éxito', `Comando enviado: ${comando}`);
    } catch (error) {
      console.error('❌ Error al enviar comando:', error.message);
      Alert.alert('❌ Error', `No se pudo enviar: ${comando}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Control Robot ESP32</Text>

      <TouchableOpacity style={styles.boton} onPress={() => enviarComando('adelante')}>
        <Text style={styles.texto}>⬆️ Adelante</Text>
      </TouchableOpacity>

      <View style={styles.fila}>
        <TouchableOpacity style={styles.boton} onPress={() => enviarComando('izquierda')}>
          <Text style={styles.texto}>⬅️ Izquierda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.boton} onPress={() => enviarComando('derecha')}>
          <Text style={styles.texto}>➡️ Derecha</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.boton} onPress={() => enviarComando('atras')}>
        <Text style={styles.texto}>⬇️ Atrás</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.boton, { backgroundColor: 'red' }]} onPress={() => enviarComando('stop')}>
        <Text style={styles.texto}>🛑 STOP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101820',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    color: '#FEE715',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  boton: {
    backgroundColor: '#FEE715',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginVertical: 10,
    minWidth: '60%',
    alignItems: 'center',
  },
  texto: {
    fontSize: 18,
    color: '#101820',
    fontWeight: '600',
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});
