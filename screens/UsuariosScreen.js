// Ya documentado
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TextInput, Button, Modal, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from '@env';

const UsuariosScreen = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [run, setRun] = useState('');
    const [unidad, setUnidad] = useState('');
    const [unidades, setUnidades] = useState([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    const usuariosEndpoint = `${API_URL}/usuarios`;
    const unidadesEndpoint = `${API_URL}/unidades`;

    useEffect(() => {
        // {endpoint de usuarios}
        fetch(usuariosEndpoint)
            .then((response) => response.json())
            .then((data) => setUsuarios(data))
            .catch((error) => console.error('Error fetching usuarios:', error));

        // {endpoint de unidades}
        fetch(unidadesEndpoint)
            .then((response) => response.json())
            .then((data) => setUnidades(data))
            .catch((error) => console.error('Error fetching unidades:', error));
    }, []);

    const filteredUsuarios = usuarios.filter((usuario) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            (usuario.Nombre && usuario.Nombre.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (usuario.Unidad && usuario.Unidad.toLowerCase().includes(lowerCaseSearchTerm))
        );
    });

    const manejarUsuario = () => {
        const nuevoUsuario = {
            Nombre: nombre,
            Email: email,
            RUN: run,
            Unidad: unidad,
        };

        if (!nombre || !email || !run || !unidad) {
            Alert.alert('Error', 'Todos los campos son obligatorios.');
            return;
        }

        if (usuarioSeleccionado) {
            // Modo edición
            fetch(`${usuariosEndpoint}/${usuarioSeleccionado.RUN}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoUsuario),
            })
                .then((response) => {
                    if (!response.ok) throw new Error('Error en la respuesta del servidor');
                    return response.json();
                })
                .then(() => {
                    const usuariosActualizados = usuarios.map((user) =>
                        user.RUN === usuarioSeleccionado.RUN ? { ...user, ...nuevoUsuario } : user
                    );
                    setUsuarios(usuariosActualizados);
                    cerrarModal();
                })
                .catch((error) => {
                    console.error('Error al editar usuario:', error);
                    Alert.alert('Error', 'No se pudo editar el usuario.');
                });
        } else {
            // Fetch para agregar Usuario
            fetch(usuariosEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoUsuario),
        })
            .then((response) => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then((data) => {
            // Después de que añadimos el usuario, haremos un fetch para obtener la lista actualizada
                return fetch(usuariosEndpoint); // Cambiado a usuariosEndpoint
            })
            .then((response) => {
                if (!response.ok) throw new Error('Error en la respuesta al obtener la lista actualizada');
                return response.json();
            })
            .then((usuariosActualizados) => {
                setUsuarios(usuariosActualizados); // Actualiza la lista completa
                cerrarModal();
            })
            .catch((error) => {
                console.error('Error al agregar usuario:', error);
                Alert.alert('Error', 'No se pudo agregar el usuario.');
            });
        }
    };

    const editarUsuario = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setNombre(usuario.Nombre);
        setEmail(usuario.Email);
        setRun(usuario.RUN);
        setUnidad(usuario.Unidad);
        setModalVisible(true);
    };

    const eliminarUsuario = (run) => {
        Alert.alert(
            'Eliminar Usuario',
            '¿Estás seguro de que deseas eliminar este usuario?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Eliminar',
                    onPress: () => {
                        fetch(`${usuariosEndpoint}/${run}`, { method: 'DELETE' }) 
                            .then((response) => {
                                if (!response.ok) throw new Error('Error al eliminar el usuario');
                                setUsuarios(usuarios.filter((usuario) => usuario.RUN !== run));
                            })
                            .catch((error) => {
                                console.error('Error al eliminar usuario:', error);
                                Alert.alert('Error', 'No se pudo eliminar el usuario.');
                            });
                    },
                },
            ]
        );
    };

    const cerrarModal = () => {
        setNombre('');
        setEmail('');
        setRun('');
        setUnidad('');
        setUsuarioSeleccionado(null);
        setModalVisible(false);
    };

    const renderHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={styles.headerText}>Nombre</Text>
            <Text style={styles.headerText}>Email</Text>
            <Text style={styles.headerText}>RUN</Text>
            <Text style={styles.headerText}>Unidad</Text>
            <Text style={styles.headerText}>Acciones</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <View style={styles.tableRow}>
            <Text style={styles.cellText}>{item.Nombre}</Text>
            <Text style={styles.cellText}>{item.Email}</Text>
            <Text style={styles.cellText}>{item.RUN}</Text>
            <Text style={styles.cellText}>{item.Unidad}</Text>
            <View style={styles.cellActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => editarUsuario(item)}>
                    <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarUsuario(item.RUN)}>
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de Usuarios</Text>
            <TextInput
                style={styles.searchBar}
                placeholder="Buscar por nombre o unidad"
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
            <ScrollView horizontal={true} contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ width: '100%' }}>
                    {renderHeader()}
                    {filteredUsuarios.length > 0 ? (
                        <FlatList
                            data={filteredUsuarios}
                            keyExtractor={(item) => item.RUN.toString()}
                            renderItem={renderItem}
                        />
                    ) : (
                        <Text>No hay usuarios disponibles</Text>
                    )}
                </View>
            </ScrollView>

            <Button title="Añadir Usuario" onPress={() => setModalVisible(true)} />

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={cerrarModal}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>
                        {usuarioSeleccionado ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre"
                        value={nombre}
                        onChangeText={setNombre}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Correo Electrónico"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="RUN"
                        value={run}
                        onChangeText={setRun}
                        editable={!usuarioSeleccionado} // Si se está editando, no se puede cambiar el RUN
                    />
                    <Picker
                        selectedValue={unidad}
                        onValueChange={(itemValue) => setUnidad(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Seleccione una unidad" value="" />
                        {unidades.map((unidad) => (
                            <Picker.Item key={unidad.ID_Unidad} label={unidad.Nombre} value={unidad.Nombre} />
                        ))}
                    </Picker>
                    <Button title={usuarioSeleccionado ? 'Guardar Cambios' : 'Agregar'} onPress={manejarUsuario} />
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    searchBar: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    tableContainer: {
        flex: 1,
        minWidth: '100%', // Hace que la tabla se expanda por todo el ancho disponible
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f2f2f2',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
        minWidth: '100%',
    },
    headerText: {
        flex: 2,
        textAlign: 'left',
        fontWeight: 'bold',
        width: 100, // Asegúrate de que el ancho coincida con las celdas
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
        minWidth: '100%',
    },
    cellText: {
        flex: 2,
        textAlign: 'left', // Alineación centrada para las celdas
        width: 100, // Debe coincidir con el ancho de headerText
    },
    cellActions: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
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
    scrollViewContainer: {
        paddingBottom: 20, // Agrega un padding inferior para el scroll
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
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 10,
    },
});

export default UsuariosScreen;













