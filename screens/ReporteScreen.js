import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_URL } from '@env';

const ReporteScreen = () => {
    const [reporteData, setReporteData] = useState([]);

    // Función para obtener los datos más recientes del reporte
    const fetchReporteData = async () => {
        try {
            const response = await fetch(`${API_URL}/reporte-datos`);
            const data = await response.json();
            setReporteData(data); // Actualiza los datos en el estado
        } catch (error) {
            console.error('Error al obtener datos del reporte:', error);
            Alert.alert('Error', 'No se pudieron cargar los datos del reporte.');
        }
    };

    // Actualizar datos del reporte al cargar la pantalla
    useEffect(() => {
        fetchReporteData();
    }, []);

    // Función para manejar la descarga y compartir en entornos móviles (Android e iOS)
    const handleGenerarReporteMobile = async () => {
        try {
            // Define la ruta en la carpeta de documentos de la aplicación
            const fileUri = FileSystem.documentDirectory + 'reporte_inventario.xlsx';

            const downloadResumable = FileSystem.createDownloadResumable(
                `${API_URL}/generar-reporte`,
                fileUri
            );

            const { uri } = await downloadResumable.downloadAsync();
            Alert.alert('Éxito', `Reporte descargado correctamente. Preparando para compartir...`);

            // Verificar si la funcionalidad de compartir está disponible
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert('Error', 'No se puede compartir el archivo en este dispositivo.');
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            Alert.alert('Error', 'Ocurrió un error al descargar el reporte en móvil.');
        }
    };

    // Función para manejar la descarga en entornos web
    const handleGenerarReporteWeb = async () => {
        try {
            const response = await fetch(`${API_URL}/generar-reporte`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte_inventario.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            Alert.alert('Éxito', 'Reporte descargado correctamente.');
        } catch (error) {
            console.error('Error en la solicitud:', error);
            Alert.alert('Error', 'Ocurrió un error al descargar el reporte en web.');
        }
    };

    // Detecta la plataforma y selecciona la función de descarga adecuada
    const handleGenerarReporte = () => {
        if (Platform.OS === 'web') {
            handleGenerarReporteWeb();
        } else {
            handleGenerarReporteMobile();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Presione para descargar reporte</Text>
            <Button title="Reporte en Excel" onPress={handleGenerarReporte} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default ReporteScreen;

