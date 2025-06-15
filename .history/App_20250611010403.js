import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const dispositivoId = "ESP32-ACT01";
const backendUrl = `https://pruebas.entramadosec.com/consultar_ip.php?dispositivo_id=${dispositivoId}`;
const eventosUrl = "https://pruebas.entramadosec.com/listar_eventos.php";

function ControlView({ navigation }) {
  const [ip, setIp] = useState(null);

  useEffect(() => {
    axios.get(backendUrl)
      .then(response => {
        if (response.data.success && response.data.data.ip_local) {
          setIp(response.data.data.ip_local);
        } else {
          Alert.alert("Error", "No se pudo obtener la IP del ESP32");
        }
      })
      .catch(error => {
        Alert.alert("Error", "Error al consultar la IP del ESP32");
        console.error(error);
      });
  }, []);

  const enviarComando = async (comando) => {
    if (!ip) return;
    try {
      const res = await axios.post(`http://${ip}/comando`, comando, {
        headers: { 'Content-Type': 'text/plain' }
      });
      Alert.alert("Éxito", res.data);
    } catch (err) {
      Alert.alert("Error", "No se pudo enviar el comando");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Control del Vehículo</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity onPress={() => enviarComando("adelante")} style={styles.button}>
          <Text style={styles.buttonText}>Adelante</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => enviarComando("atras")} style={styles.button}>
          <Text style={styles.buttonText}>Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => enviarComando("izquierda")} style={styles.button}>
          <Text style={styles.buttonText}>Izquierda</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => enviarComando("derecha")} style={styles.button}>
          <Text style={styles.buttonText}>Derecha</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Eventos")} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Ver Historial</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EventosView() {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    axios.get(eventosUrl)
      .then(res => {
        if (Array.isArray(res.data)) {
          setEventos(res.data);
        }
      })
      .catch(error => {
        Alert.alert("Error", "No se pudo obtener eventos");
      });
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.eventItem}>
      <Text style={styles.eventTitle}>🧭 {item.posicion.toUpperCase()}</Text>
      <Text style={styles.eventTimestamp}>⏰ {item.timestamp}</Text>
    </View>
  );

  return (
    <View style={styles.eventContainer}>
      <Text style={styles.eventHeader}>📋 Historial de Eventos</Text>
      <FlatList
        data={[...eventos].reverse()}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  buttonGroup: {
    width: '100%',
    gap: 12
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 6,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18
  },
  secondaryButton: {
    marginTop: 10,
    padding: 12,
    borderColor: '#2563EB',
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 16
  },
  eventContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 20
  },
  eventHeader: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },
  eventItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  eventTimestamp: {
    color: '#4B5563',
    marginTop: 4
  }
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Control">
        <Stack.Screen name="Control" component={ControlView} />
        <Stack.Screen name="Eventos" component={EventosView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
