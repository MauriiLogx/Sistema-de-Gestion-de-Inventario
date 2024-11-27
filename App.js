import 'react-native-gesture-handler'; // Importamos el handler de gestos
import React from 'react'; // Importamos React
import { NavigationContainer } from '@react-navigation/native'; // Importamos el contenedor de navegacion
import { createDrawerNavigator } from '@react-navigation/drawer'; // Importamos el navegador de menu lateral
import { MaterialIcons } from '@expo/vector-icons'; // Importamos los iconos
import InicioScreen from './screens/InicioScreen'; // Importamos la pantalla de inicio
import UsuariosScreen from './screens/UsuariosScreen'; // Importamos la pantalla de usuarios
import UnidadScreen from './screens/UnidadScreen'; // Importamos la pantalla de Unidad
import DispositivosScreen from './screens/DispositivosScreen'; // Importamos la pantalla de dispositivos
import TipoDispositivosScreen from './screens/TipoDispositivosScreen'; // Importamos la pantalla de tipos de dispositivos
import MarcaDispositivosScreen from './screens/MarcaDispositivosScreen'; // Importamos la pantalla de marcas de dispositivos
import MantenimientoScreen from './screens/MantenimientoScreen'; // Importamos la pantalla de mantenimiento
import ReporteScreen from './screens/ReporteScreen'; // Importamos la pantalla de Reportes
import AjustesScreen from './screens/AjustesScreen'; // Importamos la pantalla de ajustes

const Drawer = createDrawerNavigator(); // Creamos el navegador de menu lateral

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
          name="Unidad" 
          component={UnidadScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="apartment" size={24} color="#4A4A4A" />
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
          name="Reporte" 
          component={ReporteScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="assessment" size={24} color="#4A4A4A" />
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