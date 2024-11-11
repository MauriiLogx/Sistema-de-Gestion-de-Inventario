import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, Modal, Alert, TouchableOpacity } from 'react-native';
import { API_URL } from '@env'; // Importar API_URL desde el archivo .env

const UnidadScreen = () => {
    const [unidades, setUnidades] = useState([]);
    const [filteredUnidades, setFilteredUnidades] = useState([]); // Estado para unidades filtradas
    const [searchText, setSearchText] = useState(''); // Estado para el texto de búsqueda
    const [modalVisible, setModalVisible] = useState(false);
    const [nombreUnidad, setNombreUnidad] = useState('');
    const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);

// Construir el endpoint usando API_URL
const unidadesEndpoint = `${API_URL}/unidades`;

// Obtener las unidades desde la API
useEffect(() => {
    fetch(unidadesEndpoint)
        .then((response) => response.json())
        .then((data) => {
            setUnidades(data);
            setFilteredUnidades(data); // Inicializar unidades filtradas
        })
        .catch((error) => console.error('Error fetching data unidades:', error));
}, []);

useEffect(() => {
    setFilteredUnidades(
        unidades.filter((unidad) =>
            unidad.Nombre.toLowerCase().includes(searchText.toLowerCase())
        )
    );
}, [searchText, unidades]);

// Manejar la edición o agregar una nueva unidad
const manejarUnidad = () => {
    const nuevaUnidad = {
        Nombre: nombreUnidad,
    };

    if (!nombreUnidad) {
        Alert.alert('Error', 'El nombre de la unidad es obligatorio.');
        return;
    }

    if (unidadSeleccionada) {
        // Editar unidad
        fetch(`${unidadesEndpoint}/${unidadSeleccionada.ID_Unidad}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaUnidad),
        })
            .then((response) => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then(() => {
                const unidadesActualizadas = unidades.map((unidad) =>
                    unidad.ID_Unidad === unidadSeleccionada.ID_Unidad ? { ...unidad, ...nuevaUnidad } : unidad
                );
                setUnidades(unidadesActualizadas);
                cerrarModal();
            })
            .catch((error) => {
                console.error('Error al editar unidad:', error);
                Alert.alert('Error', 'No se pudo editar la unidad.');
            });
    } else {
        // Agregar nueva unidad
        fetch(unidadesEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaUnidad),
        })
            .then((response) => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then((data) => {
                if (data && data.ID_Unidad) {
                    const nuevaUnidadConID = {
                        ID_Unidad: data.ID_Unidad,
                        Nombre: data.Nombre,
                    };
                    setUnidades([...unidades, nuevaUnidadConID]);
                    cerrarModal();
                } else {
                    throw new Error('La respuesta no contiene un ID válido');
                }
            })
            .catch((error) => {
                console.error('Error al agregar unidad:', error);
                Alert.alert('Error', 'No se pudo agregar la unidad.');
            });
    }
};

const editarUnidad = (unidad) => {
    setUnidadSeleccionada(unidad);
    setNombreUnidad(unidad.Nombre);
    setModalVisible(true);
};

const eliminarUnidad = (id) => {
    Alert.alert(
        'Eliminar Unidad',
        '¿Estás seguro de que deseas eliminar esta unidad?',
        [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Eliminar',
                onPress: () => {
                    fetch(`${unidadesEndpoint}/${id}`, { method: 'DELETE' })
                        .then((response) => {
                            if (!response.ok) throw new Error('Error al eliminar la unidad');
                            setUnidades(unidades.filter((unidad) => unidad.ID_Unidad !== id));
                        })
                        .catch((error) => {
                            console.error('Error al eliminar unidad:', error);
                            Alert.alert('Error', 'No se pudo eliminar la unidad.');
                        });
                },
            },
        ]
    );
};

    const cerrarModal = () => {
        setNombreUnidad('');
        setUnidadSeleccionada(null);
        setModalVisible(false);
    };

    const renderHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={styles.headerTextNombre}>Nombre</Text>
            <Text style={styles.headerTextAcciones}>Acciones</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <View style={styles.tableRow}>
            <Text style={styles.cellText}>{item.Nombre}</Text>
            <View style={styles.cellActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => editarUnidad(item)}>
                    <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarUnidad(item.ID_Unidad)}>
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Lista de Unidades</Text>
        
        {/* Barra de Búsqueda */}
        <TextInput
            style={styles.searchBar}
            placeholder="Buscar por Nombre de Unidad"
            value={searchText}
            onChangeText={setSearchText}
        />

        <FlatList
            data={filteredUnidades} // Usar unidades filtradas en lugar de todas las unidades
            keyExtractor={(item) => item.ID_Unidad.toString()}
            ListHeaderComponent={renderHeader}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
        />
            <Button title="Agregar Unidad" onPress={() => setModalVisible(true)} />
            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{unidadSeleccionada ? 'Editar Unidad' : 'Agregar Unidad'}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre de la Unidad"
                        value={nombreUnidad}
                        onChangeText={setNombreUnidad}
                    />
                    <Button title={unidadSeleccionada ? 'Actualizar' : 'Agregar'} onPress={manejarUnidad} />
                    <Button title="Cancelar" onPress={cerrarModal} />
                </View>
            </Modal>
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
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    searchBar: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f2f2f2',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
    },
    headerTextNombre: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'left',
    },
    headerTextAcciones: {
        flex: 2,
        fontWeight: 'bold',
        textAlign: 'right',
        marginRight: 3,
    },    
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
    },
    cellText: {
        flex: 1,
    },
    cellActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    editButton: {
        backgroundColor: '#b326f7',
        padding: 10,
        borderRadius: 5,
    },
    deleteButton: {
        backgroundColor: '#f44336',
        padding: 10,
        borderRadius: 5,
    },
    editButtonText: {
        color: '#fff',
    },
    deleteButtonText: {
        color: '#fff',
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#b0b0b0',
        padding: 20,
        margin: 20,
        borderRadius: 20,
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        width: '80%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
});

export default UnidadScreen;

