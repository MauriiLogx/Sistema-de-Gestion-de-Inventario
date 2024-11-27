import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Platform, StyleSheet, TextInput, Button, Modal, Alert, TouchableOpacity } from 'react-native';
import { API_URL } from '@env'; // Importar API_URL desde el archivo .env

const MarcaDispositivosScreen = () => {
    const [marcas, setMarcas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nombre, setNombre] = useState('');
    const [marcaSeleccionada, setMarcaSeleccionada] = useState(null);
    const [searchText, setSearchText] = useState(''); // Estado para la barra de búsqueda
    const [filteredMarcas, setFilteredMarcas] = useState([]); // Estado para las marcas filtradas

// Construir el endpoint usando API_URL
const marcasEndpoint = `${API_URL}/marcas`;

// Obtener las marcas de dispositivos desde la API
useEffect(() => {
    fetch(marcasEndpoint)
        .then((response) => response.json())
        .then((data) => {
            setMarcas(data);
            setFilteredMarcas(data); // Inicializar marcas filtradas
        })
        .catch((error) => console.error('Error fetching data:', error));
}, []);

// Filtrar marcas en base al texto de búsqueda
useEffect(() => {
    if (searchText === '') {
        setFilteredMarcas(marcas);
    } else {
        const filtered = marcas.filter((marca) =>
            marca.Nombre.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredMarcas(filtered);
    }
}, [searchText, marcas]);

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
        fetch(`${marcasEndpoint}/${marcaSeleccionada.ID_Marca_Dispositivo}`, {
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
        fetch(marcasEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaMarca),
        })
            .then((response) => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then((data) => {
                console.log('Respuesta del servidor al agregar marca:', data);

                if (data && data.ID_Marca_Dispositivo) {
                    const nuevaMarcaConID = {
                        ID_Marca_Dispositivo: data.ID_Marca_Dispositivo,
                        Nombre: data.Nombre,
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

const eliminarMarca = (id, nombreMarca) => {
    if (Platform.OS === 'web') {
        const confirmar = window.confirm(`¿Está seguro de que desea eliminar la marca "${nombreMarca}"?`);
        if (confirmar) {
            fetch(`${marcasEndpoint}/${id}`, { method: 'DELETE' })
                .then((response) => {
                    if (!response.ok) throw new Error('Error al eliminar la marca');
                    setMarcas(marcas.filter((marca) => marca.ID_Marca_Dispositivo !== id));
                })
                .catch((error) => {
                    console.error('Error al eliminar marca:', error);
                    alert('No se pudo eliminar la marca.');
                });
        }
    } else {
        Alert.alert(
            'Eliminar Marca',
            `¿Está seguro de que desea eliminar la marca "${nombreMarca}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    onPress: () => {
                        fetch(`${marcasEndpoint}/${id}`, { method: 'DELETE' })
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
    }
};

    const cerrarModal = () => {
        setNombre('');
        setMarcaSeleccionada(null);
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
                <TouchableOpacity style={styles.editButton} onPress={() => editarMarca(item)}>
                    <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => eliminarMarca(item.ID_Marca_Dispositivo, item.Nombre)}
                >
                <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de Marcas de Dispositivos</Text>

            {/* Barra de búsqueda */}
            <TextInput
                style={styles.searchBar}
                placeholder="Buscar marca..."
                value={searchText}
                onChangeText={setSearchText}
            />

            <FlatList
                data={filteredMarcas} // Usamos las marcas filtradas
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

export default MarcaDispositivosScreen;



