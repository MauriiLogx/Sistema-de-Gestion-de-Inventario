import React from 'react'; // Importamos React
import { View, Text, StyleSheet } from 'react-native'; // Importamos componentes de ract native

const UnidadScreen = () => {
return (
    <View style={styles.container}>
    <Text>Pantalla de Unidad</Text>
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

export default UnidadScreen;