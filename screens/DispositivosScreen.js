import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TextInput, Button, Modal, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL } from '@env'; // Importar API_URL desde el archivo .env


const DispositivosScreen = () => {
    const [dispositivos, setDispositivos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState(null);

    const [numeroSerie, setNumeroSerie] = useState('');
    const [modelo, setModelo] = useState('');
    const [usuarioID, setUsuarioID] = useState('');
    const [marcaID, setMarcaID] = useState('');
    const [tipoID, setTipoID] = useState('');
    const [estado, setEstado] = useState('');
    const [sistemaOperativo, setSistemaOperativo] = useState('');
    const [fechaRecepcion, setFechaRecepcion] = useState(new Date());
    const [fechaBaja, setFechaBaja] = useState(null);

    const [searchText, setSearchText] = useState(''); // Estado para la barra de búsqueda
    const [filteredDispositivos, setFilteredDispositivos] = useState([]); // Estado para almacenar dispositivos filtrados

    const [showRecepcionPicker, setShowRecepcionPicker] = useState(false);
    const [showBajaPicker, setShowBajaPicker] = useState(false);

    // Construir endpoints usando API_URL
    const dispositivosEndpoint = `${API_URL}/dispositivos`;
    const usuariosEndpoint = `${API_URL}/usuarios`;
    const marcasEndpoint = `${API_URL}/marcas`;
    const tiposEndpoint = `${API_URL}/tipos`;

    useEffect(() => {
        fetchDispositivos();
        fetchUsuarios();
        fetchMarcas();
        fetchTipos();
    }, []);

    useEffect(() => {
        console.log('Estado usuarios actualizado:', usuarios);
    }, [usuarios]);

    useEffect(() => {
        setFilteredDispositivos(
            dispositivos.filter((dispositivo) =>
                dispositivo.Numero_Serie.toLowerCase().includes(searchText.toLowerCase()) ||
                dispositivo.Usuario.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [searchText, dispositivos]);

    const fetchDispositivos = async () => {
        try {
            const response = await fetch(dispositivosEndpoint);
            const data = await response.json();
            setDispositivos(data);
        } catch (error) {
            console.error('Error fetching dispositivos:', error);
        }
    };

    const fetchUsuarios = async () => {
        try {
            const response = await fetch(usuariosEndpoint);
            const data = await response.json();
            console.log('Usuarios data:', data); // Verificar la estructura aquí
            setUsuarios(data);
        } catch (error) {
            console.error('Error fetching usuarios:', error);
        }
    };

    const fetchMarcas = async () => {
        try {
            const response = await fetch(marcasEndpoint);
            const data = await response.json();
            setMarcas(data);
        } catch (error) {
            console.error('Error fetching marcas:', error);
        }
    };

    const fetchTipos = async () => {
        try {
            const response = await fetch(tiposEndpoint);
            const data = await response.json();
            setTipos(data);
        } catch (error) {
            console.error('Error fetching tipos:', error);
        }
    };

// Función para manejar la creación y edición de un dispositivo
const manejarDispositivo = () => {
    const nuevoDispositivo = {
        Numero_Serie: numeroSerie || '',
        Modelo: modelo || '',
        Sistema_Operativo: sistemaOperativo || '',
        Usuario_RUN: usuarioID || '',
        Marca_Dispositivo_ID: marcaID || '',
        Tipo_Dispositivo_ID: tipoID || '',
        Estado: (estado || '').trim().toLowerCase(),
        Fecha_Recepcion: fechaRecepcion ? fechaRecepcion.toISOString().split('T')[0] : '',
        Fecha_Baja: (estado || '').trim().toLowerCase() === 'activo' ? null : (fechaBaja ? fechaBaja.toISOString().split('T')[0] : null),
    };

    // Validación de campos
    if (
        !nuevoDispositivo.Numero_Serie ||
        !nuevoDispositivo.Modelo ||
        !nuevoDispositivo.Sistema_Operativo ||
        !nuevoDispositivo.Usuario_RUN ||
        !nuevoDispositivo.Marca_Dispositivo_ID ||
        !nuevoDispositivo.Tipo_Dispositivo_ID ||
        !nuevoDispositivo.Estado ||
        !nuevoDispositivo.Fecha_Recepcion ||
        (nuevoDispositivo.Estado !== 'activo' && !nuevoDispositivo.Fecha_Baja)
    ) {
        Alert.alert('Error', 'Todos los campos son obligatorios.');
        return;
    }

// Definir método y URL según si se está editando o creando un dispositivo
const metodo = dispositivoSeleccionado ? 'PUT' : 'POST';
const url = dispositivoSeleccionado 
    ? `${API_URL}/dispositivos/${dispositivoSeleccionado.Numero_Serie}` 
    : `${API_URL}/dispositivos`;

    console.log("Datos a enviar:", nuevoDispositivo); // Para depuración

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoDispositivo),
    })
        .then((response) => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
        })
        .then(() => {
            fetchDispositivos();
            cerrarModal();
        })
        .catch((error) => {
            console.error('Error al guardar dispositivo:', error);
            Alert.alert('Error', 'No se pudo guardar el dispositivo.');
        });
};

// Función para cerrar el modal y limpiar los estados
const cerrarModal = () => {
    setNumeroSerie('');
    setModelo('');
    setUsuarioID('');
    setMarcaID('');
    setTipoID('');
    setEstado('');
    setFechaRecepcion(new Date());
    setFechaBaja(null);
    setSistemaOperativo('');
    setDispositivoSeleccionado(null);
    setModalVisible(false);
};

// Nueva función para cargar los datos completos de un dispositivo
const cargarDatosDispositivo = (numeroSerie) => {
    const url = `${API_URL}/dispositivos/${numeroSerie}`;

    fetch(url)
        .then((response) => {
            console.log('Estado de la respuesta:', response.status); // Depuración del estado de respuesta
            if (!response.ok) throw new Error('Error al obtener datos del dispositivo');
            return response.json();
        })
        .then((data) => {
            console.log('Datos del dispositivo para editar:', data); // Depuración de datos recibidos
            // Configura todos los campos en los estados correspondientes
            setNumeroSerie(data.Numero_Serie || '');
            setModelo(data.Modelo || '');
            setUsuarioID(data.Usuario_RUN || '');
            setMarcaID(data.Marca_Dispositivo_ID || '');
            setTipoID(data.Tipo_Dispositivo_ID || '');
            setEstado(data.Estado || '');
            setFechaRecepcion(data.Fecha_Recepcion ? new Date(data.Fecha_Recepcion) : new Date());
            setFechaBaja(data.Fecha_Baja ? new Date(data.Fecha_Baja) : null);
            setSistemaOperativo(data.Sistema_Operativo || '');
            setDispositivoSeleccionado(data); // Guarda el dispositivo seleccionado
            setModalVisible(true); // Abre el modal con los datos cargados
        })
        .catch((error) => {
            console.error('Error al cargar datos del dispositivo:', error);
            Alert.alert('Error', 'No se pudieron cargar los datos del dispositivo.');
        });
};

        // Modificación en editarDispositivo para usar cargarDatosDispositivo
        const editarDispositivo = (dispositivo) => {
        console.log('Editando dispositivo:', dispositivo); // Para depuración inicial
        cargarDatosDispositivo(dispositivo.Numero_Serie);
    };
    
    const eliminarDispositivo = (numeroSerie) => {
        Alert.alert(
            'Confirmar Eliminación',
            '¿Estás seguro de que deseas eliminar este dispositivo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        fetch(`${dispositivosEndpoint}/${numeroSerie}`, { method: 'DELETE' })
                            .then((response) => {
                                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                                return response.json();
                            })
                            .then(() => fetchDispositivos())
                            .catch((error) => {
                                console.error('Error al eliminar dispositivo:', error);
                                Alert.alert('Error', 'No se pudo eliminar el dispositivo.');
                            });
                    },
                },
            ]
        );
    };

    const renderHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={styles.headerText}>N. Serie</Text>
            <Text style={styles.headerText}>Marca</Text>
            <Text style={styles.headerText}>Modelo</Text>
            <Text style={styles.headerText}>Usuario</Text>
            <Text style={styles.headerText}>Acciones</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <View style={styles.tableRow}>
            <Text style={styles.cellText}>{item.Numero_Serie}</Text>
            <Text style={styles.cellText}>{item.Marca}</Text>
            <Text style={styles.cellText}>{item.Modelo}</Text>
            <Text style={styles.cellText}>{item.Usuario}</Text>
            <View style={styles.cellActions}>
                <TouchableOpacity
                    key={`edit-${item.Numero_Serie}`}
                    style={styles.editButton}
                    onPress={() => editarDispositivo(item)}
                >
                    <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    key={`delete-${item.Numero_Serie}`}
                    style={styles.deleteButton}
                    onPress={() => eliminarDispositivo(item.Numero_Serie)}
                >
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de Dispositivos</Text>
    
            {/* Barra de Búsqueda */}
            <TextInput
                style={styles.searchBar}
                placeholder="Buscar por Número de Serie o Usuario"
                value={searchText}
                onChangeText={setSearchText}
            />
    
            <ScrollView horizontal={true} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ width: '100%' }}>
                    {renderHeader()}
                    <FlatList
                        data={filteredDispositivos} // Usar dispositivos filtrados en lugar de todos los dispositivos
                        keyExtractor={(item) => (item.Numero_Serie ? item.Numero_Serie.toString() : '')}
                        renderItem={renderItem}
                    />
                </View>
            </ScrollView>
            
            <Button title="Añadir Dispositivo" onPress={() => setModalVisible(true)} />
    
            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={cerrarModal}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Añadir Nuevo Dispositivo</Text>
                    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                    <TextInput style={styles.input} placeholder="Número de Serie" value={numeroSerie} onChangeText={setNumeroSerie} />
                    <TextInput style={styles.input} placeholder="Modelo" value={modelo} onChangeText={setModelo} />
                    <TextInput style={styles.input} placeholder="Sistema Operativo" value={sistemaOperativo} onChangeText={setSistemaOperativo} />
    
                    <Picker selectedValue={tipoID} onValueChange={(itemValue) => setTipoID(itemValue)} style={styles.picker}>
                        <Picker.Item label="Seleccione un tipo" value="" />
                        {tipos.map((tipo) => (
                            tipo.ID_Tipo_Dispositivo !== undefined ? (
                                <Picker.Item key={tipo.ID_Tipo_Dispositivo.toString()} label={tipo.Nombre} value={tipo.ID_Tipo_Dispositivo} />
                        ) : null
                    ))}
                </Picker>

                <Picker selectedValue={marcaID} onValueChange={(itemValue) => setMarcaID(itemValue)} style={styles.picker}>
                    <Picker.Item label="Seleccione una marca" value="" />
                    {marcas.map((marca) => (
                        marca.ID_Marca_Dispositivo !== undefined ? (
                            <Picker.Item key={marca.ID_Marca_Dispositivo.toString()} label={marca.Nombre} value={marca.ID_Marca_Dispositivo} />
                    ) : null
                ))}
                </Picker>

                <View style={{ marginBottom: 10 }}>
                <Picker
                    selectedValue={usuarioID}
                    onValueChange={(itemValue) => setUsuarioID(itemValue)}
                    style={styles.picker} // Asegúrate de que tenga el mismo estilo
                >
                <Picker.Item label="Seleccionar Usuario" value="" />
                    {usuarios.map((usuario, index) => (
                    <Picker.Item
                        key={index}
                        label={usuario.Nombre}
                        value={usuario.RUN}
                    />
                ))}
            </Picker>
        </View>
    
                    <Picker selectedValue={estado} onValueChange={setEstado} style={styles.picker}>
                        <Picker.Item label="Seleccione un estado" value="" />
                        <Picker.Item label="Activo" value="Activo" />
                        <Picker.Item label="Inactivo" value="Inactivo" />
                    </Picker>
    
            {/* Selector de Fecha de Recepción */}
            <Button title="Seleccionar Fecha de Recepción" onPress={() => setShowRecepcionPicker(true)} />
            {showRecepcionPicker && (
                <DateTimePicker
                    value={fechaRecepcion}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowRecepcionPicker(false);
                        if (selectedDate) {
                            setFechaRecepcion(selectedDate);
                        }
                    }}
                />
            )}
            <Text>Fecha de Recepción: {fechaRecepcion.toLocaleDateString()}</Text>

            {/* Selector de Estado */}
            <Text>Estado:</Text>
            <TextInput
                value={estado}
                onChangeText={setEstado}
                placeholder="Estado (Activo/Inactivo)"
            />

            {/* Selector de Fecha de Baja solo si el dispositivo está inactivo */}
            {estado?.toLowerCase() !== 'activo' && (
            <>
                <Button title="Seleccionar Fecha de Baja" onPress={() => setShowBajaPicker(true)} />
                {showBajaPicker && (
                    <DateTimePicker
                        value={fechaBaja || new Date()} // Usa la fecha actual si fechaBaja es null
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowBajaPicker(false);
                            if (selectedDate) {
                            setFechaBaja(selectedDate);
                        }
                    }}
                />
            )}
            <Text>Fecha de Baja: {fechaBaja ? fechaBaja.toLocaleDateString() : 'No seleccionada'}</Text>
        </>
    )}
    
                    <Button title="Guardar Dispositivo" onPress={manejarDispositivo} />
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

export default DispositivosScreen;

