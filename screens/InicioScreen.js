import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Componente de la pantalla de inicio.
 * Muestra un mensaje básico en la pantalla.
 */
const InicioScreen = () => {
return (
<View style={styles.container}>
    <Text>Pantalla de inicio</Text>
</View>
);
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
});

export default InicioScreen;
