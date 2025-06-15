import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, StatusBar, Dimensions, SectionList } from 'react-native';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
const { width } = Dimensions.get('window');

const dispositivoId = "ESP32-ACT01";
const backendUrl = `https://pruebas.entramadosec.com/consultar_ip.php?dispositivo_id=${dispositivoId}`;

// Función para construir la URL de eventos basada en la IP obtenida
const getEventosUrl = (ip) => {
  // Si tienes un endpoint local para eventos, usa algo como:
  // return `http://${ip}/listar_eventos`;
  // Si sigues usando el servidor externo:
  return "https://pruebas.entramadosec.com/listar_eventos.php";
};

function ControlView({ navigation }) {
  const [ip, setIp] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    axios.get(backendUrl)
      .then(response => {
        if (response.data.success && response.data.data.ip_local) {
          setIp(response.data.data.ip_local);
          setConnectionStatus('connected');
          console.log('✅ IP obtenida:', response.data.data.ip_local);
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
    if (!ip) {
      Alert.alert("❌ Error", "No hay IP disponible");
      return;
    }
    
try {
  Alert.alert(`🚀 Enviando comando: "${comando}" a http://${ip}/comando`);

  const res = await fetch(`http://${ip}/comando`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
    },
    body: comando,
  });

  const texto = await res.text();
  console.log('✅ Respuesta del ESP32:', texto);
  Alert.alert("✅ Comando Enviado", `Acción: ${comando.toUpperCase()}`);
} catch (err) {
  console.error("❌ Error al enviar comando:", err);
  Alert.alert("❌ Error", err.message || "No se pudo enviar el comando");
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
        <Text style={styles.title}>🚗 Control IoT</Text>
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

  // Función para obtener el nombre del día de la semana en español
  const getDayName = (date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[date.getDay()];
  };

  // Función para formatear la fecha
  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Comparar solo las fechas (sin hora)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Hoy';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Ayer';
    } else {
      const dayName = getDayName(date);
      const dateStr = date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      return `${dayName}, ${dateStr}`;
    }
  };

  // Función para agrupar eventos por fecha
  const groupEventsByDate = (eventos) => {
    const grouped = {};
    
    eventos.forEach(evento => {
      try {
        const date = new Date(evento.timestamp);
        const dateKey = date.toDateString(); // Usar dateString como clave única
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            title: formatDate(date),
            date: date,
            data: []
          };
        }
        
        grouped[dateKey].data.push(evento);
      } catch (e) {
        console.error('Error al procesar fecha:', e);
        // Si hay error con la fecha, agregar a "Fecha desconocida"
        if (!grouped['unknown']) {
          grouped['unknown'] = {
            title: 'Fecha desconocida',
            date: new Date(0),
            data: []
          };
        }
        grouped['unknown'].data.push(evento);
      }
    });

    // Convertir a array y ordenar por fecha (más reciente primero)
    return Object.values(grouped).sort((a, b) => b.date - a.date);
  };

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const eventosUrl = getEventosUrl(); // Usar la función helper
        console.log('🔄 Solicitando eventos desde:', eventosUrl);
        
        const res = await axios.get(eventosUrl, {
          timeout: 10000, // 10 segundos timeout
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Respuesta completa:', res);
        console.log('📊 Datos recibidos:', res.data);
        console.log('🔍 Tipo de datos:', typeof res.data);
        console.log('📋 Es array?:', Array.isArray(res.data));
        
        let eventosData = [];
        if (Array.isArray(res.data)) {
          console.log('✅ Datos es array directo, elementos:', res.data.length);
          eventosData = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          console.log('✅ Datos en res.data.data, elementos:', res.data.data.length);
          eventosData = res.data.data;
        } else if (res.data && Array.isArray(res.data.eventos)) {
          console.log('✅ Datos en res.data.eventos, elementos:', res.data.eventos.length);
          eventosData = res.data.eventos;
        } else {
          console.log('⚠️ Formato de respuesta inesperado:', res.data);
          console.log('🔍 Claves disponibles:', Object.keys(res.data || {}));
          eventosData = [];
        }

        // Agrupar eventos por fecha
        const groupedEventos = groupEventsByDate(eventosData);
        setEventos(groupedEventos);
      } catch (error) {
        console.error('❌ Error completo:', error);
        console.error('❌ Error response:', error.response);
        console.error('❌ Error message:', error.message);
        
        let errorMessage = "No se pudo obtener eventos";
        if (error.code === 'NETWORK_ERROR') {
          errorMessage = "Error de red - Verifica tu conexión";
        } else if (error.response?.status === 404) {
          errorMessage = "Servicio no encontrado";
        } else if (error.response?.status >= 500) {
          errorMessage = "Error del servidor";
        }
        
        Alert.alert("Error", errorMessage);
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
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return timestamp;
    }
  };

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
      <View style={styles.sectionHeaderBadge}>
        <Text style={styles.sectionHeaderBadgeText}>{section.data.length}</Text>
      </View>
    </View>
  );

  const renderItem = ({ item, index, section }) => (
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

  const recargarEventos = async () => {
    console.log('🔄 Recargando eventos manualmente...');
    setEventos([]);
    setLoading(true);
    try {
      const eventosUrl = getEventosUrl();
      const res = await axios.get(eventosUrl, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log('🔄 Recarga - Datos:', res.data);
      
      let eventosData = [];
      if (Array.isArray(res.data)) {
        eventosData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        eventosData = res.data.data;
      } else if (res.data && Array.isArray(res.data.eventos)) {
        eventosData = res.data.eventos;
      } else {
        eventosData = [];
      }

      // Agrupar eventos por fecha
      const groupedEventos = groupEventsByDate(eventosData);
      setEventos(groupedEventos);
    } catch (error) {
      console.error('Error en recarga:', error);
      Alert.alert("Error", "No se pudo recargar eventos");
    } finally {
      setLoading(false);
    }
  };

  // Calcular total de eventos
  const totalEventos = eventos.reduce((total, section) => total + section.data.length, 0);

  return (
    <View style={styles.eventContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.eventHeaderContainer}>
        <Text style={styles.eventHeaderTitle}>📋 Historial de Comandos</Text>
        <Text style={styles.eventSubtitle}>
          {loading ? 'Cargando...' : `${totalEventos} eventos registrados`}
        </Text>
        <TouchableOpacity 
          onPress={recargarEventos}
          style={styles.reloadButton}
          disabled={loading}
        >
          <Text style={styles.reloadButtonText}>
            {loading ? '🔄 Cargando...' : '🔄 Recargar'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando eventos...</Text>
        </View>
      ) : eventos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📭</Text>
          <Text style={styles.emptyTitle}>No hay eventos</Text>
          <Text style={styles.emptySubtitle}>Los comandos enviados aparecerán aquí organizados por fecha</Text>
          <TouchableOpacity 
            onPress={recargarEventos}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>🔄 Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={eventos}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.eventList}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
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
    marginBottom: 15,
  },
  reloadButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  reloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  eventList: {
    paddingVertical: 10,
  },
  sectionHeader: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  sectionHeaderBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  sectionHeaderBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventItem: {
    marginHorizontal: 16,
    marginVertical: 4,
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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