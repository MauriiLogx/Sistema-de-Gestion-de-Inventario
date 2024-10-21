import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, Modal, Alert, TouchableOpacity } from 'react-native';

const TipoDispositivosScreen = () => {
    const [tiposDispositivo, setTiposDispositivo] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nombre, setNombre] = useState('');
    const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
    const API_URL = 'http://192.168.100.51:4000/api/tipos'; // Reemplaza con tu URL de la API

    // Obtener los tipos de dispositivos desde la API
    useEffect(() => {
        fetch(API_URL)
            .then((response) => response.json())
            .then((data) => setTiposDispositivo(data))
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    // Manejar la edición o agregar un nuevo tipo de dispositivo
    const manejarTipoDispositivo = () => {
        const nuevoTipoDispositivo = {
            Nombre: nombre,
        };

        if (!nombre) {
            Alert.alert('Error', 'El nombre del tipo de dispositivo es obligatorio.');
            return;
        }

        if (tipoSeleccionado) {
            // Editar tipo de dispositivo
            fetch(`${API_URL}/${tipoSeleccionado.ID_Tipo_Dispositivo}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoTipoDispositivo),
            })
                .then((response) => {
                    if (!response.ok) throw new Error('Error en la respuesta del servidor');
                    return response.json();
                })
                .then(() => {
                    const tiposActualizados = tiposDispositivo.map((tipo) =>
                        tipo.ID_Tipo_Dispositivo === tipoSeleccionado.ID_Tipo_Dispositivo ? { ...tipo, ...nuevoTipoDispositivo } : tipo
                    );
                    setTiposDispositivo(tiposActualizados);
                    cerrarModal();
                })
                .catch((error) => {
                    console.error('Error al editar tipo de dispositivo:', error);
                    Alert.alert('Error', 'No se pudo editar el tipo de dispositivo.');
                });
        } else {
            // Agregar nuevo tipo de dispositivo
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoTipoDispositivo),
            })
                .then((response) => {
                    if (!response.ok) throw new Error('Error en la respuesta del servidor');
                    return response.json();
                })
                .then((data) => {
                    if (data && data.ID_Tipo_Dispositivo) {
                        const nuevoTipoConID = {
                            ID_Tipo_Dispositivo: data.ID_Tipo_Dispositivo,
                            Nombre: data.Nombre,
                        };
                        setTiposDispositivo([...tiposDispositivo, nuevoTipoConID]);
                        cerrarModal();
                    } else {
                        throw new Error('La respuesta no contiene un ID válido');
                    }
                })
                .catch((error) => {
                    console.error('Error al agregar tipo de dispositivo:', error);
                    Alert.alert('Error', 'No se pudo agregar el tipo de dispositivo.');
                });
        }
    };

    const editarTipoDispositivo = (tipo) => {
        setTipoSeleccionado(tipo);
        setNombre(tipo.Nombre);
        setModalVisible(true);
    };

    const eliminarTipoDispositivo = (id) => {
        Alert.alert(
            'Eliminar Tipo de Dispositivo',
            '¿Estás seguro de que deseas eliminar este tipo de dispositivo?',
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
                                if (!response.ok) throw new Error('Error al eliminar el tipo de dispositivo');
                                setTiposDispositivo(tiposDispositivo.filter((tipo) => tipo.ID_Tipo_Dispositivo !== id));
                            })
                            .catch((error) => {
                                console.error('Error al eliminar tipo de dispositivo:', error);
                                Alert.alert('Error', 'No se pudo eliminar el tipo de dispositivo.');
                            });
                    },
                },
            ]
        );
    };

    const cerrarModal = () => {
        setNombre('');
        setTipoSeleccionado(null);
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
                <TouchableOpacity style={styles.editButton} onPress={() => editarTipoDispositivo(item)}>
                    <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarTipoDispositivo(item.ID_Tipo_Dispositivo)}>
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de Tipos de Dispositivos</Text>
            <FlatList
                data={tiposDispositivo}
                keyExtractor={(item) => item.ID_Tipo_Dispositivo.toString()}
                ListHeaderComponent={renderHeader}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
            />
            <Button title="Agregar Tipo de Dispositivo" onPress={() => setModalVisible(true)} />
            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{tipoSeleccionado ? 'Editar Tipo de Dispositivo' : 'Agregar Tipo de Dispositivo'}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre del Tipo de Dispositivo"
                        value={nombre}
                        onChangeText={setNombre}
                    />
                    <Button title={tipoSeleccionado ? 'Actualizar' : 'Agregar'} onPress={manejarTipoDispositivo} />
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
    modalView: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 10,
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

export default TipoDispositivosScreen;

