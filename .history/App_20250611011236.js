import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, StatusBar, Dimensions } from 'react-native';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
const { width } = Dimensions.get('window');

const dispositivoId = "ESP32-ACT01";
const backendUrl = `https://pruebas.entramadosec.com/consultar_ip.php?dispositivo_id=${dispositivoId}`;
const eventosUrl = "https://pruebas.entramadosec.com/listar_eventos.php";

function ControlView({ navigation }) {
  const [ip, setIp] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    axios.get(backendUrl)
      .then(response => {
        if (response.data.success && response.data.data.ip_local) {
          setIp(response.data.data.ip_local);
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('error');
          Alert.alert("Error", "No se pudo obtener la IP del ESP32");
        }
      })
      .catch(error => {
        setConnectionStatus('error');
        Alert.alert("Error", "Error al consultar la IP del ESP32");
        console.error(error);
      });
  }, []);

  const enviarComando = async (comando) => {
    if (!ip) return;
    try {
      // Enviar solo el texto del comando, no un objeto
      const res = await axios.post(`http://${ip}/comando`, comando, {
        headers: { 'Content-Type': 'text/plain' }
      });
      Alert.alert("✅ Comando Enviado", `Acción: ${comando.toUpperCase()}`);
    } catch (err) {
      Alert.alert("❌ Error", "No se pudo enviar el comando");
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10B981';
      case 'error': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Conectado';
      case 'error': return 'Sin conexión';
      default: return 'Conectando...';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Header con estado de conexión */}
      <View style={styles.header}>
        <Text style={styles.title}>🚗 Control Vehicular</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getConnectionStatusColor() }]}>
          <Text style={styles.statusText}>{getConnectionStatusText()}</Text>
        </View>
      </View>

      {/* Control pad estilo gamepad */}
      <View style={styles.controlPad}>
        {/* Botón Adelante */}
        <TouchableOpacity 
          onPress={() => enviarComando("adelante")} 
          style={[styles.directionButton, styles.topButton]}
          activeOpacity={0.7}
        >
          <Text style={styles.arrowText}>▲</Text>
          <Text style={styles.buttonLabel}>ADELANTE</Text>
        </TouchableOpacity>

        {/* Botones Izquierda y Derecha */}
        <View style={styles.middleRow}>
          <TouchableOpacity 
            onPress={() => enviarComando("izquierda")} 
            style={[styles.directionButton, styles.leftButton]}
            activeOpacity={0.7}
          >
            <Text style={styles.arrowText}>◄</Text>
            <Text style={styles.buttonLabel}>IZQ</Text>
          </TouchableOpacity>

          <View style={styles.centerCircle}>
            <Text style={styles.centerText}>ESP32</Text>
          </View>

          <TouchableOpacity 
            onPress={() => enviarComando("derecha")} 
            style={[styles.directionButton, styles.rightButton]}
            activeOpacity={0.7}
          >
            <Text style={styles.arrowText}>►</Text>
            <Text style={styles.buttonLabel}>DER</Text>
          </TouchableOpacity>
        </View>

        {/* Botón Atrás */}
        <TouchableOpacity 
          onPress={() => enviarComando("atras")} 
          style={[styles.directionButton, styles.bottomButton]}
          activeOpacity={0.7}
        >
          <Text style={styles.arrowText}>▼</Text>
          <Text style={styles.buttonLabel}>ATRÁS</Text>
        </TouchableOpacity>
      </View>

      {/* Botón de historial */}
      <TouchableOpacity 
        onPress={() => navigation.navigate("Eventos")} 
        style={styles.historyButton}
        activeOpacity={0.8}
      >
        <Text style={styles.historyButtonText}>📊 Ver Historial de Eventos</Text>
      </TouchableOpacity>

      {/* Footer info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Dispositivo: {dispositivoId}</Text>
        {ip && <Text style={styles.footerText}>IP: {ip}</Text>}
      </View>
    </View>
  );
}

function EventosView() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const res = await axios.get(eventosUrl);
        console.log('Respuesta de eventos:', res.data); // Para debug
        
        if (Array.isArray(res.data)) {
          setEventos(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setEventos(res.data.data);
        } else {
          console.log('Formato de respuesta inesperado:', res.data);
          setEventos([]);
        }
      } catch (error) {
        console.error('Error fetching eventos:', error);
        Alert.alert("Error", "No se pudo obtener eventos");
        setEventos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  const getDirectionIcon = (posicion) => {
    switch (posicion?.toLowerCase()) {
      case 'adelante': return '⬆️';
      case 'atras': return '⬇️';
      case 'izquierda': return '⬅️';
      case 'derecha': return '➡️';
      default: return '🧭';
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return timestamp;
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.eventItem, { backgroundColor: index % 2 === 0 ? '#fff' : '#F8FAFC' }]}>
      <View style={styles.eventHeader}>
        <View style={styles.eventIconContainer}>
          <Text style={styles.eventIcon}>{getDirectionIcon(item.posicion)}</Text>
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{item.posicion?.toUpperCase() || 'COMANDO'}</Text>
          <Text style={styles.eventTimestamp}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        <View style={styles.eventNumber}>
          <Text style={styles.eventNumberText}>#{item.id}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.eventContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.eventHeaderContainer}>
        <Text style={styles.eventHeaderTitle}>📋 Historial de Comandos</Text>
        <Text style={styles.eventSubtitle}>
          {loading ? 'Cargando...' : `${eventos.length} eventos registrados`}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando eventos...</Text>
        </View>
      ) : eventos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📭</Text>
          <Text style={styles.emptyTitle}>No hay eventos</Text>
          <Text style={styles.emptySubtitle}>Los comandos enviados aparecerán aquí</Text>
        </View>
      ) : (
        <FlatList
          data={[...eventos].reverse()}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.eventList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statusIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  controlPad: {
    alignItems: 'center',
    marginBottom: 40,
  },
  directionButton: {
    backgroundColor: '#1E40AF',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  topButton: {
    marginBottom: 20,
  },
  bottomButton: {
    marginTop: 20,
  },
  leftButton: {
    marginRight: 20,
  },
  rightButton: {
    marginLeft: 20,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6B7280',
  },
  centerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  arrowText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  historyButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 4,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginVertical: 2,
  },
  eventContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  eventHeaderContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  eventHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 5,
  },
  eventSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  eventList: {
    paddingVertical: 10,
  },
  eventItem: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  eventIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventIcon: {
    fontSize: 20,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  eventTimestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  eventNumber: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventNumberText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Control"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0F172A',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Control" 
          component={ControlView} 
          options={{ 
            title: 'Control Vehículo',
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="Eventos" 
          component={EventosView} 
          options={{ 
            title: 'Historial de Eventos',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#111827',
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}