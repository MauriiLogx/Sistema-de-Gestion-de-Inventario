import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Platform, StyleSheet, TextInput, Button, Modal, Alert, TouchableOpacity } from 'react-native';
import { API_URL } from '@env'; // Importar API_URL desde el archivo .env

const TipoDispositivoScreen = () => {
    const [tipos, setTipos] = useState([]);
    const [filteredTipos, setFilteredTipos] = useState([]); // Estado para tipos filtrados
    const [searchText, setSearchText] = useState(''); // Estado para el texto de búsqueda
    const [modalVisible, setModalVisible] = useState(false);
    const [nombre, setNombre] = useState('');
    const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

// Construir el endpoint usando API_URL
const tiposEndpoint = `${API_URL}/tipos`;

// Obtener los tipos de dispositivos desde la API
useEffect(() => {
    fetch(tiposEndpoint)
        .then((response) => response.json())
        .then((data) => {
            setTipos(data);
            setFilteredTipos(data); // Inicializar tipos filtrados
        })
        .catch((error) => console.error('Error fetching data:', error));
}, []);

useEffect(() => {
    setFilteredTipos(
        tipos.filter((tipo) =>
            tipo.Nombre.toLowerCase().includes(searchText.toLowerCase())
        )
    );
}, [searchText, tipos]);

// Manejar la edición o agregar un nuevo tipo de dispositivo
const manejarTipo = () => {
    const nuevoTipo = {
        Nombre: nombre,
    };

    if (!nombre) {
        Alert.alert('Error', 'El nombre del tipo de dispositivo es obligatorio.');
        return;
    }

    if (tipoSeleccionado) {
        // Editar tipo de dispositivo
        fetch(`${tiposEndpoint}/${tipoSeleccionado.ID_Tipo_Dispositivo}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoTipo),
        })
            .then((response) => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then(() => {
                const tiposActualizados = tipos.map((tipo) =>
                    tipo.ID_Tipo_Dispositivo === tipoSeleccionado.ID_Tipo_Dispositivo ? { ...tipo, ...nuevoTipo } : tipo
                );
                setTipos(tiposActualizados);
                cerrarModal();
            })
            .catch((error) => {
                console.error('Error al editar tipo de dispositivo:', error);
                Alert.alert('Error', 'No se pudo editar el tipo de dispositivo.');
            });
    } else {
        // Agregar nuevo tipo de dispositivo
        fetch(tiposEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoTipo),
        })
            .then((response) => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then((data) => {
                console.log('Respuesta del servidor al agregar tipo de dispositivo:', data);

                // Verificamos que 'data' contenga el 'ID_Tipo_Dispositivo'
                if (data && data.ID_Tipo_Dispositivo) {
                    const nuevoTipoConID = {
                        ID_Tipo_Dispositivo: data.ID_Tipo_Dispositivo,
                        Nombre: data.Nombre,
                    };
                    setTipos([...tipos, nuevoTipoConID]);
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

const editarTipo = (tipo) => {
    setTipoSeleccionado(tipo);
    setNombre(tipo.Nombre);
    setModalVisible(true);
};

const eliminarTipo = (id, nombreTipo) => {
    if (Platform.OS === 'web') {
        const confirmar = window.confirm(`¿Está seguro de que desea eliminar el tipo de dispositivo "${nombreTipo}"?`);
        if (confirmar) {
            fetch(`${tiposEndpoint}/${id}`, { method: 'DELETE' })
                .then((response) => {
                    if (!response.ok) throw new Error('Error al eliminar el tipo de dispositivo');
                    setTipos(tipos.filter((tipo) => tipo.ID_Tipo_Dispositivo !== id));
                })
                .catch((error) => {
                    console.error('Error al eliminar tipo de dispositivo:', error);
                    alert('No se pudo eliminar el tipo de dispositivo.');
                });
        }
    } else {
        Alert.alert(
            'Eliminar Tipo de Dispositivo',
            `¿Está seguro de que desea eliminar el tipo de dispositivo "${nombreTipo}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    onPress: () => {
                        fetch(`${tiposEndpoint}/${id}`, { method: 'DELETE' })
                            .then((response) => {
                                if (!response.ok) throw new Error('Error al eliminar el tipo de dispositivo');
                                setTipos(tipos.filter((tipo) => tipo.ID_Tipo_Dispositivo !== id));
                            })
                            .catch((error) => {
                                console.error('Error al eliminar tipo de dispositivo:', error);
                                Alert.alert('Error', 'No se pudo eliminar el tipo de dispositivo.');
                            });
                    },
                },
            ]
        );
    }
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
                <TouchableOpacity style={styles.editButton} onPress={() => editarTipo(item)}>
                    <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => eliminarTipo(item.ID_Tipo_Dispositivo, item.Nombre)}
                >
                <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de Tipos de Dispositivos</Text>
            
            {/* Barra de Búsqueda */}
            <TextInput
                style={styles.searchBar}
                placeholder="Buscar por Nombre de Tipo"
                value={searchText}
                onChangeText={setSearchText}
            />
    
            <FlatList
                data={filteredTipos} // Usar tipos filtrados en lugar de todos los tipos
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
                    <Button title={tipoSeleccionado ? 'Actualizar' : 'Agregar'} onPress={manejarTipo} />
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

export default TipoDispositivoScreen;