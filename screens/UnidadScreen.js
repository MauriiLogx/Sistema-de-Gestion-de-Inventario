import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, Modal, Alert, TouchableOpacity } from 'react-native';

const UnidadScreen = () => {
    const [unidades, setUnidades] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nombreUnidad, setNombreUnidad] = useState('');
    const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
    const API_URL = 'http://192.168.100.51:4000/api/unidades'; // Asegúrate de que esta URL sea correcta y accesible

    // Obtener las unidades desde la API
    useEffect(() => {
        fetch(API_URL)
            .then((response) => response.json())
            .then((data) => setUnidades(data))
            .catch((error) => console.error('Error fetching data unidadess:', error));
    }, []);

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
            fetch(`${API_URL}/${unidadSeleccionada.ID_Unidad}`, {
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
            fetch(API_URL, {
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
                        fetch(`${API_URL}/${id}`, { method: 'DELETE' })
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
            <FlatList
                data={unidades}
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
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f4f4f4',
        paddingVertical: 10,
        paddingHorizontal: 5,
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
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    cellText: {
        flex: 1,
    },
    cellActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    editButton: {
        backgroundColor: 'blue',
        padding: 5,
        marginRight: 5,
    },
    editButtonText: {
        color: 'white',
    },
    deleteButton: {
        backgroundColor: 'red',
        padding: 5,
    },
    deleteButtonText: {
        color: 'white',
    },
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10,
        padding: 5,
    },
});

export default UnidadScreen;

