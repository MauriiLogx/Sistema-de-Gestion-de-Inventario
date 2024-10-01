import React from 'react'; // Importamos React
import { View, Text, StyleSheet } from 'react-native'; // Importamos componentes de react native

const TipoDispositivosScreen = () => {
return (
    <View style={styles.container}>
    <Text>Pantalla de Tipo de Dispositivos</Text>
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

export default TipoDispositivosScreen;
