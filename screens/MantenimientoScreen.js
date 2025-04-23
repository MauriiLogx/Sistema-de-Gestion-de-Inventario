import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Platform, ScrollView, TextInput, Button, Modal, Alert, TouchableOpacity } from 'react-native';
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
        console.log("Primer usuario cargado:", data[0]); 
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
        console.log("Primer dispositivo cargado:", data[0]); 
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
        console.log("Encargado ID seleccionado (antes de convertir):", encargadoID);
        console.log("Dispositivo ID seleccionado (antes de convertir):", dispositivoID);
    
        // Asegurar que los IDs sean numéricos
        const encargadoIDNum = Number(encargadoID);
        const dispositivoIDNum = Number(dispositivoID);
    
        console.log("Encargado ID seleccionado (convertido):", encargadoIDNum);
        console.log("Dispositivo ID seleccionado (convertido):", dispositivoIDNum);
    
        // Encuentra el encargado y el dispositivo en las listas usando los IDs convertidos
        const encargado = usuarios.find((usuario) => usuario.ID_Usuario === encargadoIDNum);
        const dispositivo = dispositivos.find((dispositivo) => dispositivo.ID_Dispositivo === dispositivoIDNum);
    
        console.log('Encargado encontrado:', encargado);
        console.log('Dispositivo encontrado:', dispositivo);
    
        // Manejo de errores en la búsqueda
        if (!encargado) {
            console.error("Encargado no encontrado. ID seleccionado:", encargadoIDNum);
            Alert.alert("Error", "No se encontró el encargado seleccionado.");
            return;
        }
        if (!dispositivo) {
            console.error("Dispositivo no encontrado. ID seleccionado:", dispositivoIDNum);
            Alert.alert("Error", "No se encontró el dispositivo seleccionado.");
            return;
        }
    
        const nuevoMantenimiento = {
            Prioridad: prioridad || '',
            Estado: estado || '',
            Fecha_Ingreso: fechaIngreso ? fechaIngreso.toISOString().split('T')[0] : '',
            Fecha_Finalizacion:
                estado.toLowerCase() === 'completada' && fechaFinalizacion
                    ? fechaFinalizacion.toISOString().split('T')[0]
                    : null,
            Encargado_ID: encargado.ID_Usuario,
            Dispositivo_ID: dispositivo.ID_Dispositivo,
            Comentarios: comentarios || '',
        };
    
        console.log('Nuevo mantenimiento a guardar:', nuevoMantenimiento);
    
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

    const cargarDatosMantenimiento = async (id) => {
        try {
            const url = `${mantenimientosEndpoint}/${id}`;
            const response = await fetch(url);
    
            if (!response.ok) {
                throw new Error('Error al obtener datos del mantenimiento');
            }
    
            const data = await response.json();
    
            console.log('Datos del mantenimiento:', data);
    
            // Asignación de valores
            setPrioridad(data.Prioridad || '');
            setEstado(data.Estado || '');
            setComentarios(data.Comentarios || '');
    
            // Manejo de fechas
            setFechaIngreso(data.Fecha_Ingreso ? new Date(data.Fecha_Ingreso) : new Date());
            setFechaFinalizacion(data.Fecha_Finalizacion ? new Date(data.Fecha_Finalizacion) : null);
    
            // Encontrar usuario encargado y dispositivo en las listas cargadas previamente
            const encargado = usuarios.find((usuario) => usuario.ID_Usuario === data.Encargado_ID);
            const dispositivo = dispositivos.find((dispositivo) => dispositivo.ID_Dispositivo === data.Dispositivo_ID);
    
            console.log('Encargado encontrado:', encargado);
            console.log('Dispositivo encontrado:', dispositivo);
    
            // Asignar valores de ID a los estados
            setEncargadoID(encargado ? encargado.ID_Usuario : '');
            setDispositivoID(dispositivo ? dispositivo.ID_Dispositivo : '');
    
            // Guardar el mantenimiento seleccionado
            setMantenimientoSeleccionado(data);
    
            // Mostrar el modal
            setModalVisible(true);
        } catch (error) {
            console.error('Error al cargar datos del mantenimiento:', error);
            Alert.alert('Error', 'No se pudieron cargar los datos del mantenimiento.');
        }
    };

    const editarMantenimiento = (mantenimiento) => {
        cargarDatosMantenimiento(mantenimiento.ID_Mantenimiento);
    };

    const eliminarMantenimiento = (id, descripcion) => {
        if (Platform.OS === 'web') {
            const confirmar = window.confirm(`¿Está seguro de que desea eliminar el mantenimiento "${descripcion}"?`);
            if (confirmar) {
                fetch(`${mantenimientosEndpoint}/${id}`, { method: 'DELETE' })
                    .then((response) => {
                        if (!response.ok) throw new Error('Error en la respuesta del servidor');
                        return response.json();
                    })
                    .then(() => fetchMantenimientos()) // Actualiza la lista después de eliminar
                    .catch((error) => {
                        console.error('Error al eliminar mantenimiento:', error);
                        alert('No se pudo eliminar el mantenimiento.');
                    });
            }
        } else {
            Alert.alert(
                'Confirmar Eliminación',
                `¿Está seguro de que desea eliminar el mantenimiento "${descripcion}"?`,
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
                                .then(() => fetchMantenimientos()) // Actualiza la lista después de eliminar
                                .catch((error) => {
                                    console.error('Error al eliminar mantenimiento:', error);
                                    Alert.alert('Error', 'No se pudo eliminar el mantenimiento.');
                                });
                        },
                    },
                ]
            );
        }
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
                    onPress={() => eliminarMantenimiento(item.ID_Mantenimiento, item.Encargado)}
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
        <Text style={styles.modalTitle}>
            {mantenimientoSeleccionado ? 'Editar Mantenimiento' : 'Añadir Nuevo Mantenimiento'}
        </Text>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            {/* Prioridad */}
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

            {/* Estado */}
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

            {/* Encargado */}
            <View style={{ marginBottom: 10 }}>
                <Text>Encargado</Text>
                <Picker
                    selectedValue={encargadoID}
                    onValueChange={(itemValue) => setEncargadoID(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Seleccionar Usuario" value="" />
                    {usuarios.map((usuario) => (
                        usuario.ID_Usuario !== undefined ? (
                            <Picker.Item
                                key={usuario.ID_Usuario.toString()}
                                label={usuario.Nombre}
                                value={usuario.ID_Usuario}
                            />
                        ) : null
                    ))}
                </Picker>
            </View>

            {/* Dispositivo */}
            <View style={{ marginBottom: 10 }}>
                <Text>Dispositivo</Text>
                <Picker
                    selectedValue={dispositivoID}
                    onValueChange={(itemValue) => setDispositivoID(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Seleccione un dispositivo" value="" />
                    {dispositivos.map((dispositivo) => (
                        dispositivo.ID_Dispositivo !== undefined ? (
                            <Picker.Item
                                key={dispositivo.ID_Dispositivo.toString()}
                                label={`${dispositivo.Numero_Serie} - ${dispositivo.Modelo}`}
                                value={dispositivo.ID_Dispositivo}
                            />
                        ) : null
                    ))}
                </Picker>
            </View>

            {/* Fecha de Ingreso */}
            <Text>Seleccionar Fecha de Ingreso:</Text>
            <DateInput date={fechaIngreso} setDate={setFechaIngreso} />
            <Text>Fecha de Ingreso: {fechaIngreso.toLocaleDateString()}</Text>

            {/* Fecha de Finalización */}
            {estado.toLowerCase() === 'completada' && (
                <>
                    <Text>Seleccionar Fecha de Finalización:</Text>
                    <DateInput date={fechaFinalizacion || new Date()} setDate={setFechaFinalizacion} />
                    <Text>
                        Fecha de Finalización:{' '}
                        {fechaFinalizacion ? fechaFinalizacion.toLocaleDateString() : 'No seleccionada'}
                    </Text>
                </>
            )}

            {/* Comentarios */}
            <TextInput
                style={styles.input}
                placeholder="Comentarios"
                value={comentarios}
                onChangeText={setComentarios}
                multiline
            />

            {/* Botones */}
            <Button title="Guardar Mantenimiento" onPress={manejarMantenimiento} />
            <Button title="Cerrar" onPress={cerrarModal} />
        </ScrollView>
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
        flex: 2, // Ajusta el ancho proporcional para cada columna
        textAlign: 'left',
        fontWeight: 'bold',
        paddingHorizontal: 5, // Agrega un pequeño margen interno
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
        minWidth: '100%',
    },
    cellText: {
        flex: 2, // Debe coincidir con el valor de flex en headerText
        textAlign: 'left',
        paddingHorizontal: 5, // Agrega un pequeño margen interno
        overflow: 'hidden', // Evita que el contenido desborde
    },
    cellActions: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'left', // Cambiado para centrar los botones
        alignItems: 'left',
        gap: 10, // Agrega un pequeño espacio entre los botones (React Native 0.71+)
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

