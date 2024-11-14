import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TextInput, Button, Modal, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateInput from './DateInput';
import { API_URL } from '@env'; 

const MantenimientoScreen = () => {
    const [mantenimientos, setMantenimientos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [dispositivos, setDispositivos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [mantenimientoSeleccionado, setMantenimientoSeleccionado] = useState(null);

    const [prioridad, setPrioridad] = useState('');
    const [estado, setEstado] = useState('');
    const [encargadoID, setEncargadoID] = useState('');
    const [dispositivoID, setDispositivoID] = useState('');
    const [fechaIngreso, setFechaIngreso] = useState(new Date());
    const [fechaFinalizacion, setFechaFinalizacion] = useState(null);
    const [comentarios, setComentarios] = useState('');
    const [searchText, setSearchText] = useState('');
    const [filteredMantenimientos, setFilteredMantenimientos] = useState([]);
    const [showIngresoPicker, setShowIngresoPicker] = useState(false);
    const [showFinalizacionPicker, setShowFinalizacionPicker] = useState(false);

    // Construir endpoints usando API_URL
    const mantenimientosEndpoint = `${API_URL}/mantenimientos`;
    const usuariosEndpoint = `${API_URL}/usuarios`;
    const dispositivosEndpoint = `${API_URL}/dispositivos`;

    useEffect(() => {
        fetchMantenimientos();
        fetchUsuarios();
        fetchDispositivos();
    }, []);
    
    useEffect(() => {
        setFilteredMantenimientos(
            mantenimientos.filter((mantenimiento) =>
                mantenimiento.Prioridad.toLowerCase().includes(searchText.toLowerCase()) ||
                mantenimiento.Estado.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [searchText, mantenimientos]);
    
    const fetchMantenimientos = async () => {
        try {
            const response = await fetch(`${API_URL}/mantenimientos`);
            
            // Verificar si la respuesta fue exitosa
            if (!response.ok) {
                console.error(`Error en la respuesta del servidor: ${response.status} ${response.statusText}`);
                throw new Error('Error en la respuesta del servidor');
            }
    
            const data = await response.json();
            setMantenimientos(data);
        } catch (error) {
            console.error('Error fetching mantenimientos:', error);
            Alert.alert('Error', 'No se pudo cargar la lista de mantenimientos.');
        }
    };
    
// En fetchUsuarios, para ver los primeros registros
const fetchUsuarios = async () => {
    try {
        const response = await fetch(usuariosEndpoint);
        const data = await response.json();
        console.log("Primer usuario cargado:", data[0]); // Muestra la estructura del primer usuario cargado
        setUsuarios(data);
    } catch (error) {
        console.error('Error fetching usuarios:', error);
    }
};

// En fetchDispositivos, para ver los primeros registros
const fetchDispositivos = async () => {
    try {
        const response = await fetch(dispositivosEndpoint);
        const data = await response.json();
        console.log("Primer dispositivo cargado:", data[0]); // Muestra la estructura del primer dispositivo cargado
        setDispositivos(data);
    } catch (error) {
        console.error('Error fetching dispositivos:', error);
    }
};

    // Función para manejar la creación y edición de un mantenimiento
    const manejarMantenimiento = () => {
        console.log("Prioridad:", prioridad);
        console.log("Estado:", estado);
        console.log("Fecha de Ingreso:", fechaIngreso);
        console.log("Fecha de Finalización:", fechaFinalizacion);
        console.log("Encargado seleccionado (RUN):", encargadoID);
        console.log("Dispositivo seleccionado (Número de Serie):", dispositivoID);
        console.log("Comentarios:", comentarios);
    
        // Encuentra el ID correspondiente en usuarios y dispositivos
        const encargado = usuarios.find(usuario => usuario.RUN === encargadoID);
        const dispositivo = dispositivos.find(d => d.Numero_Serie === dispositivoID);
    
        // Si no se encuentran el encargado o el dispositivo, lanza una alerta y termina la ejecución
        if (!encargado || !dispositivo) {
            console.error('Encargado o dispositivo no válidos:', { encargado, dispositivo });
            Alert.alert('Error', 'Encargado o dispositivo no válidos.');
            return;
        }
    
        // Crear el objeto nuevo de mantenimiento con los IDs encontrados
        const nuevoMantenimiento = {
            Prioridad: prioridad || '',
            Estado: estado || '',
            Fecha_Ingreso: fechaIngreso ? fechaIngreso.toISOString().split('T')[0] : '',
            Fecha_Finalizacion: estado.toLowerCase() === 'completada' && fechaFinalizacion ? fechaFinalizacion.toISOString().split('T')[0] : null,
            Encargado_ID: encargado.ID_Usuario, // Usa el ID_Usuario del encargado
            Dispositivo_ID: dispositivo.ID_Dispositivo, // Usa el ID_Dispositivo del dispositivo
            Comentarios: comentarios || '',
        };
    
        // Verificación de campos obligatorios
        if (
            !nuevoMantenimiento.Prioridad ||
            !nuevoMantenimiento.Estado ||
            !nuevoMantenimiento.Fecha_Ingreso ||
            !nuevoMantenimiento.Encargado_ID ||
            !nuevoMantenimiento.Dispositivo_ID ||
            (nuevoMantenimiento.Estado === 'completada' && !nuevoMantenimiento.Fecha_Finalizacion)
        ) {
            console.log("Validación fallida - Campos obligatorios faltantes:", nuevoMantenimiento);
            Alert.alert('Error', 'Todos los campos son obligatorios.');
            return;
        }
    
        const metodo = mantenimientoSeleccionado ? 'PUT' : 'POST';
        const url = `${API_URL}/mantenimientos${mantenimientoSeleccionado ? `/${mantenimientoSeleccionado.ID_Mantenimiento}` : ''}`;
        
        fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoMantenimiento),
        })
            .then((response) => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then(() => {
                fetchMantenimientos();
                cerrarModal();
            })
            .catch((error) => {
                console.error('Error al guardar mantenimiento:', error);
                Alert.alert('Error', 'No se pudo guardar el mantenimiento.');
            });
    };
    

    const cerrarModal = () => {
        setPrioridad('');
        setEstado('');
        setEncargadoID('');
        setDispositivoID('');
        setFechaIngreso(new Date());
        setFechaFinalizacion(null);
        setComentarios('');
        setMantenimientoSeleccionado(null);
        setModalVisible(false);
    };

    const cargarDatosMantenimiento = (id) => {
        const url = `${mantenimientosEndpoint}/${id}`;

        fetch(url)
            .then((response) => {
                if (!response.ok) throw new Error('Error al obtener datos del mantenimiento');
                return response.json();
            })
            .then((data) => {
                setPrioridad(data.Prioridad || '');
                setEstado(data.Estado || '');
                setEncargadoID(data.Encargado_ID || '');
                setDispositivoID(data.Dispositivo_ID || '');
                setFechaIngreso(data.Fecha_Ingreso ? new Date(data.Fecha_Ingreso) : new Date());
                setFechaFinalizacion(data.Fecha_Finalizacion ? new Date(data.Fecha_Finalizacion) : null);
                setComentarios(data.Comentarios || '');
                setMantenimientoSeleccionado(data);
                setModalVisible(true);
            })
            .catch((error) => {
                console.error('Error al cargar datos del mantenimiento:', error);
                Alert.alert('Error', 'No se pudieron cargar los datos del mantenimiento.');
            });
    };

    const editarMantenimiento = (mantenimiento) => {
        cargarDatosMantenimiento(mantenimiento.ID_Mantenimiento);
    };

    const eliminarMantenimiento = (id) => {
        Alert.alert(
            'Confirmar Eliminación',
            '¿Estás seguro de que deseas eliminar este mantenimiento?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        fetch(`${mantenimientosEndpoint}/${id}`, { method: 'DELETE' })
                            .then((response) => {
                                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                                return response.json();
                            })
                            .then(() => fetchMantenimientos())
                            .catch((error) => {
                                console.error('Error al eliminar mantenimiento:', error);
                                Alert.alert('Error', 'No se pudo eliminar el mantenimiento.');
                            });
                    },
                },
            ]
        );
    };

    const renderHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={styles.headerText}>Prioridad</Text>
            <Text style={styles.headerText}>Estado</Text>
            <Text style={styles.headerText}>Encargado</Text>
            <Text style={styles.headerText}>Dispositivo</Text>
            <Text style={styles.headerText}>Acciones</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <View style={styles.tableRow}>
            <Text style={styles.cellText}>{item.Prioridad}</Text>
            <Text style={styles.cellText}>{item.Estado}</Text>
            <Text style={styles.cellText}>{item.Encargado}</Text>
            <Text style={styles.cellText}>{item.Dispositivo}</Text>
            <View style={styles.cellActions}>
                <TouchableOpacity
                    key={`edit-${item.ID_Mantenimiento}`}
                    style={styles.editButton}
                    onPress={() => editarMantenimiento(item)}
                >
                    <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    key={`delete-${item.ID_Mantenimiento}`}
                    style={styles.deleteButton}
                    onPress={() => eliminarMantenimiento(item.ID_Mantenimiento)}
                >
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
    

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de Mantenimientos</Text>

            <TextInput
                style={styles.searchBar}
                placeholder="Buscar por Prioridad o Estado"
                value={searchText}
                onChangeText={setSearchText}
            />

            <ScrollView horizontal={true} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ width: '100%' }}>
                    {renderHeader()}
                    <FlatList
                        data={filteredMantenimientos} // Usar mantenimientos filtrados en lugar de todos los mantenimientos
                        keyExtractor={(item) => item.ID_Mantenimiento ? item.ID_Mantenimiento.toString() : ''}
                        renderItem={renderItem}
                    />
                </View>
            </ScrollView>

            <Button title="Añadir Mantenimiento" onPress={() => setModalVisible(true)} />

            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={cerrarModal}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{mantenimientoSeleccionado ? 'Editar Mantenimiento' : 'Añadir Nuevo Mantenimiento'}</Text>
                    <View style={{ marginBottom: 10 }}>
                <Text>Prioridad</Text>
                <Picker
                    selectedValue={prioridad}
                    onValueChange={(itemValue) => setPrioridad(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Seleccione la prioridad" value="" />
                    <Picker.Item label="Baja" value="Baja" />
                    <Picker.Item label="Media" value="Media" />
                    <Picker.Item label="Alta" value="Alta" />
                </Picker>
            </View>

            <View style={{ marginBottom: 10 }}>
            <Text>Estado</Text>
            <Picker
                selectedValue={estado}
                onValueChange={(itemValue) => setEstado(itemValue)}
                style={styles.picker}
            >
            <Picker.Item label="Seleccione el estado" value="" />
            <Picker.Item label="En progreso" value="En progreso" />
            <Picker.Item label="Pendiente" value="Pendiente" />
            <Picker.Item label="Completada" value="Completada" />
            </Picker>
        </View>

        <View style={{ marginBottom: 10 }}>
    <Text>Encargado</Text>
    <Picker
        selectedValue={encargadoID}
        onValueChange={(itemValue) => setEncargadoID(itemValue)}
        style={styles.picker}
    >
        <Picker.Item label="Seleccionar Usuario" value="" />
        {usuarios
            .filter(usuario => usuario.RUN) // Asegura que solo se muestren usuarios con un RUN válido
            .map((usuario) => (
                <Picker.Item
                    key={usuario.RUN} // Usa RUN como clave única
                    label={usuario.Nombre}
                    value={usuario.RUN} // Usa RUN en el valor
                />
            ))}
    </Picker>
</View>

<View style={{ marginBottom: 10 }}>
    <Text>Dispositivo</Text>
    <Picker
        selectedValue={dispositivoID}
        onValueChange={(itemValue) => setDispositivoID(itemValue)}
        style={styles.picker}
    >
        <Picker.Item label="Seleccione un dispositivo" value="" />
        {dispositivos
            .filter(dispositivo => dispositivo.Numero_Serie) // Asegura que solo se muestren dispositivos con un Número de Serie válido
            .map((dispositivo, index) => (
                <Picker.Item
                    key={dispositivo.Numero_Serie} // Usa Numero_Serie como clave única
                    label={dispositivo.Numero_Serie} // Muestra el Número de Serie en el label
                    value={dispositivo.Numero_Serie} // Usa Numero_Serie en el valor
                />
            ))}
        </Picker>
    </View>

            <DateInput date={fechaIngreso} setDate={setFechaIngreso} />
            <Text>Fecha de Ingreso: {fechaIngreso.toLocaleDateString()}</Text>

                {estado.toLowerCase() === 'completada' && (
            <>
                <DateInput date={fechaFinalizacion || new Date()} setDate={setFechaFinalizacion} />
                <Text>Fecha de Finalización: {fechaFinalizacion ? fechaFinalizacion.toLocaleDateString() : 'No seleccionada'}</Text>
            </>
        )}

                    <TextInput style={styles.input} placeholder="Comentarios" value={comentarios} onChangeText={setComentarios} multiline />

                    <Button title="Guardar Mantenimiento" onPress={manejarMantenimiento} />
                    <Button title="Cerrar" onPress={cerrarModal} />
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
        flex: 1,
        textAlign: 'left', // Alineación centrada para los encabezados
        fontWeight: 'bold',
        width: 100, // Asegúrate de que el ancho coincida con las celdas
        minWidth: 100,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
        minWidth: '100%',
    },
    cellText: {
        flex: 1,
        textAlign: 'left', // Alineación centrada para las celdas
        width: 100, // Debe coincidir con el ancho de headerText
    },
    cellActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        minWidth: 150,
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

export default MantenimientoScreen;

