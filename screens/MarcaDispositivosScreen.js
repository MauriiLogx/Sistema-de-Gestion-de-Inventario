import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, Modal, Alert, TouchableOpacity } from 'react-native';

const MarcaDispositivosScreen = () => {
    const [marcas, setMarcas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nombre, setNombre] = useState('');
    const [marcaSeleccionada, setMarcaSeleccionada] = useState(null);
    const API_URL = 'http://192.168.100.53:4000/api/marcas'; // Reemplaza con tu URL de la API

    // Obtener las marcas de dispositivos desde la API
    useEffect(() => {
        fetch(API_URL)
            .then((response) => response.json())
            .then((data) => setMarcas(data))
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    // Manejar la edición o agregar una nueva marca
    const manejarMarca = () => {
        const nuevaMarca = {
            Nombre: nombre,
        };

        if (!nombre) {
            Alert.alert('Error', 'El nombre de la marca es obligatorio.');
            return;
        }

        if (marcaSeleccionada) {
            // Editar marca
            fetch(`${API_URL}/${marcaSeleccionada.ID_Marca_Dispositivo}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevaMarca),
            })
                .then((response) => {
                    if (!response.ok) throw new Error('Error en la respuesta del servidor');
                    return response.json();
                })
                .then(() => {
                    const marcasActualizadas = marcas.map((marca) =>
                        marca.ID_Marca_Dispositivo === marcaSeleccionada.ID_Marca_Dispositivo ? { ...marca, ...nuevaMarca } : marca
                    );
                    setMarcas(marcasActualizadas);
                    cerrarModal();
                })
                .catch((error) => {
                    console.error('Error al editar marca:', error);
                    Alert.alert('Error', 'No se pudo editar la marca.');
                });
        } else {
            // Agregar nueva marca
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevaMarca),
            })
                .then((response) => {
                    if (!response.ok) throw new Error('Error en la respuesta del servidor');
                    return response.json();
                })
                .then((data) => {
                    // Verificamos que 'data' contenga el 'ID_Marca_Dispositivo'
                    if (data && data.ID_Marca_Dispositivo) {
                        const nuevaMarcaConID = {
                            ID_Marca_Dispositivo: data.ID_Marca_Dispositivo, // Asumiendo que el backend devuelve el ID
                            Nombre: data.Nombre, // Verificar si el backend devuelve correctamente el 'Nombre'
                        };
                        setMarcas([...marcas, nuevaMarcaConID]);
                        cerrarModal();
                    } else {
                        throw new Error('La respuesta no contiene un ID válido');
                    }
                })
                .catch((error) => {
                    console.error('Error al agregar marca:', error);
                    Alert.alert('Error', 'No se pudo agregar la marca.');
                });
        }
    };

    const editarMarca = (marca) => {
        setMarcaSeleccionada(marca);
        setNombre(marca.Nombre);
        setModalVisible(true);
    };

    const eliminarMarca = (id) => {
        Alert.alert(
            'Eliminar Marca',
            '¿Estás seguro de que deseas eliminar esta marca?',
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
                                if (!response.ok) throw new Error('Error al eliminar la marca');
                                setMarcas(marcas.filter((marca) => marca.ID_Marca_Dispositivo !== id));
                            })
                            .catch((error) => {
                                console.error('Error al eliminar marca:', error);
                                Alert.alert('Error', 'No se pudo eliminar la marca.');
                            });
                    },
                },
            ]
        );
    };

    const cerrarModal = () => {
        setNombre('');
        setMarcaSeleccionada(null);
        setModalVisible(false);
    };

    const renderHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={styles.headerText}>Nombre</Text>
            <Text style={styles.headerText}>Acciones</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <View style={styles.tableRow}>
            <Text style={styles.cellText}>{item.Nombre}</Text>
            <View style={styles.cellActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => editarMarca(item)}>
                    <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarMarca(item.ID_Marca_Dispositivo)}>
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de Marcas de Dispositivos</Text>
            <FlatList
                data={marcas}
                keyExtractor={(item) => item.ID_Marca_Dispositivo.toString()}
                ListHeaderComponent={renderHeader}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
            />
            <Button title="Agregar Marca" onPress={() => setModalVisible(true)} />
            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{marcaSeleccionada ? 'Editar Marca' : 'Agregar Marca'}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre de la Marca"
                        value={nombre}
                        onChangeText={setNombre}
                    />
                    <Button title={marcaSeleccionada ? 'Actualizar' : 'Agregar'} onPress={manejarMarca} />
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
    headerText: {
        flex: 1,
        fontWeight: 'bold',
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

export default MarcaDispositivosScreen;


