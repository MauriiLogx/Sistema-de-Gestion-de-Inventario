import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native'; // Agregamos ScrollView para poder hacer scroll si la tabla es grande

/**
 * Componente que representa la pantalla de usuarios.
 * Muestra una tabla con los datos de usuarios obtenidos de una API.
 */
const UsuariosScreen = () => {
  const [usuarios, setUsuarios] = useState([]); // Estado para almacenar usuarios
  const API_URL = 'http://192.168.100.73:4000/usuarios'; // URL de la API

useEffect(() => {
    fetch(API_URL) // Hacemos una solicitud a la API
    .then((response) => response.json()) // Convertimos la respuesta a JSON
    .then((data) => {
    setUsuarios(data); // Guardamos los usuarios en el estado
})
    .catch((error) => {
    console.error('Error fetching data:', error); // Manejo de errores
});
}, []);

const renderHeader = () => {
return (
    <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Nombre</Text>
        <Text style={styles.headerText}>Email</Text>
        <Text style={styles.headerText}>RUN</Text>
        <Text style={styles.headerText}>Unidad</Text>
    </View>
);
};

const renderItem = ({ item }) => {
return (
    <View style={styles.tableRow}>
        <Text style={styles.cellText}>{item.Nombre}</Text>
        <Text style={styles.cellText}>{item.Email}</Text>
        <Text style={styles.cellText}>{item.RUN}</Text>
        <Text style={styles.cellText}>{item.Unidad}</Text>
    </View>
);
};

return (
    <View style={styles.container}>
        <Text style={styles.title}>Lista de Usuarios</Text>
        <ScrollView horizontal={true}> 
    <View>
    {renderHeader()}
        <FlatList
        data={usuarios} // Datos a mostrar
        keyExtractor={(item) => item.ID_Usuario.toString()} // Extraemos la clave única
        renderItem={renderItem} // Función para renderizar cada fila
    />
    </View>
    </ScrollView>
    </View>
);
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
},
title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
},
tableHeader: {
    flexDirection: 'row', // Alineamos en una fila
    backgroundColor: '#f2f2f2',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
},
tableRow: {
    flexDirection: 'row', // Alineamos en una fila
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
},
headerText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    width: 100, // Ancho fijo para cada columna
},
cellText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    width: 100, // Ancho fijo para cada columna
},
});

export default UsuariosScreen;


