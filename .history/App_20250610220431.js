import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, Alert } from 'react-native';

export default function App() {
  const [esp32Ip, setEsp32Ip] = useState(null);
  const dispositivoId = "ESP32-ACT01";
  const backendUrl = `https://pruebas.entramadosec.com/consultar_ip.php?dispositivo_id=${dispositivoId}`;

  useEffect(() => {
    obtenerIP();
  }, []);

  const obtenerIP = async () => {
    try {
      const res = await fetch(backendUrl);
      const data = await res.json();
      if (data.success && data.data && data.data.ip_local) {
        setEsp32Ip(data.data.ip_local);
      } else {
        Alert.alert("Error", "No se pudo obtener la IP del ESP32");
      }
    } catch (error) {
      Alert.alert("Error", "Fallo al conectar al backend");
    }
  };

  const enviarComando = async (accion) => {
    if (!esp32Ip) {
      Alert.alert("Error", "IP del ESP32 no disponible");
      return;
    }

    const url = `http://${esp32Ip}/comando?accion=${accion}`;
    try {
      const res = await fetch(url);
      const texto = await res.text();
      Alert.alert("Comando enviado", `ESP32 respondió: ${texto}`);
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el comando al ESP32");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Control ESP32</Text>
      <View style={styles.row}>
        <Button title="⬆️ Adelante" onPress={() => enviarComando("adelante")} />
      </View>
      <View style={styles.row}>
        <Button title="⬅️ Izquierda" onPress={() => enviarComando("izquierda")} />
        <View style={{ width: 20 }} />
        <Button title="➡️ Derecha" onPress={() => enviarComando("derecha")} />
      </View>
      <View style={styles.row}>
        <Button title="⬇️ Atrás" onPress={() => enviarComando("atras")} />
      </View>
      <Text style={styles.ip}>IP ESP32: {esp32Ip || "Buscando..."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    marginBottom: 30
  },
  row: {
    flexDirection: 'row',
    marginVertical: 10
  },
  ip: {
    marginTop: 30,
    fontSize: 16,
    color: 'gray'
  }
});
