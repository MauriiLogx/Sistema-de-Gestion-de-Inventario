import 'react-native-gesture-handler'; // Importamos el handler de gestos
import React, { useState, useEffect } from 'react'; // Combina ambas importaciones de React
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StyleSheet, Text, View, FlatList } from 'react-native'; // Agrega FlatList aquí
import { MaterialIcons } from '@expo/vector-icons'; // Importamos los iconos

const Drawer = createDrawerNavigator();

function InicioScreen() {
  return (
    <View style={styles.container}>
      <Text>Pantalla de inicio</Text>
    </View>
  );
}

function UsuariosScreen() {
  const [usuarios, setUsuarios] = useState([])

  // Aca colocamos nuestra IP local y el puerto correcto donde corre
  const API_URL ='http://192.168.100.73:4000/usuarios';

  useEffect(() => {
    // Hacemos la solicitud a la API
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        setUsuarios(data); // Guardamos los usuarios en el estado
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Usuarios</Text>
      {/* Mostramos los usuarios en una lista */}
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.ID_Usuario.toString()}
        renderItem={({ item }) => (
          <View style={styles.userContainer}>
            <Text style={styles.userText}>Nombre: {item.Nombre}</Text>
            <Text style={styles.userText}>Email: {item.Email}</Text>
            <Text style={styles.userText}>RUN: {item.RUN}</Text>
            <Text style={styles.userText}>Unidad: {item.Unidad}</Text>
          </View>
        )}
      />
    </View>
  );
}

function DispositivosScreen() {
  return (
    <View style={styles.container}>
      <Text>Pantalla de Dispositivos</Text>
    </View>
  );
}

function TipoDispositivosScreen() {
  return (
    <View style={styles.container}>
      <Text>Pantalla de Tipo de Dispositivos</Text>
    </View>
  );
}

function MarcaDispositivosScreen() {
  return (
    <View style={styles.container}>
      <Text>Pantalla de Marca de Dispositivos</Text>
    </View>
  );
}

function MantenimientoScreen() {
  return (
    <View style={styles.container}>
      <Text>Pantalla de Mantenimiento</Text>
    </View>
  );
}

function AjustesScreen() {
  return (
    <View style={styles.container}>
      <Text>Pantalla de configuración</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Inicio">
        <Drawer.Screen 
          name="Inicio" 
          component={InicioScreen} 
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={24} color="#4A4A4A" />
            ),
          }}
        />
        <Drawer.Screen 
          name="Usuarios" 
          component={UsuariosScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="people" size={24} color="#4A4A4A" />
            ),
          }} 
        />
        <Drawer.Screen 
          name="Dispositivos" 
          component={DispositivosScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="devices" size={24} color="#4A4A4A" />
            ),
          }} 
        />
        <Drawer.Screen 
          name="Tipo de Dispositivos" 
          component={TipoDispositivosScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="category" size={24} color="#4A4A4A" />
            ),
          }} 
        />
        <Drawer.Screen 
          name="Marca de Dispositivos" 
          component={MarcaDispositivosScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="branding-watermark" size={24} color="#4A4A4A" />
            ),
          }} 
        />
        <Drawer.Screen 
          name="Mantenimiento" 
          component={MantenimientoScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="build" size={24} color="#4A4A4A" />
            ),
          }} 
        />
      <Drawer.Screen 
          name="Ajustes" 
          component={AjustesScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="settings" size={24} color="#4A4A4A" />
            ),
          }} 
          />
          </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  userContainer: {
    marginBottom: 10,
  },
  userText: {
    fontSize: 16,
  },
});

