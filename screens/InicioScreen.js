import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { API_URL } from '@env';

const InicioScreen = () => {
    const [inicioData, setInicioData] = useState(null);
    const [loading, setLoading] = useState(true);

    const inicioEndpoint = `${API_URL}/inicio`;

    // Función para obtener estadísticas
    const fetchData = () => {
        setLoading(true); // Mostrar indicador de carga al hacer fetch
        fetch(inicioEndpoint)
            .then((response) => response.json())
            .then((data) => {
                setInicioData(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching inicio data:', error);
                setLoading(false);
            });
    };

    // Fetch de las estadísticas al montar el componente
    useEffect(() => {
        fetchData();
    }, []);

    // Datos para cada tarjeta
    const statCards = [
        { label: 'Total de Dispositivos', value: inicioData?.dispositivosIngresados },
        { label: 'Dispositivos Activos', value: inicioData?.dispositivosActivos },
        { label: 'Dispositivos Inactivos', value: inicioData?.dispositivosInactivos },
        { label: 'Total de Usuarios', value: inicioData?.usuariosIngresados },
    ];

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.label}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={statCards}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.label}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 8,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    cardValue: {
        fontSize: 24,
        color: '#007bff',
        fontWeight: 'bold',
    },
});

export default InicioScreen;

