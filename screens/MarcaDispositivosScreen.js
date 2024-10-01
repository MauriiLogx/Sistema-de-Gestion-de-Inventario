import React from 'react'; // Importamos React
import { View, Text, StyleSheet } from 'react-native'; // Importamos componentes de ract native

const MarcaDispositivosScreen = () => {
return (
    <View style={styles.container}>
    <Text>Pantalla de Marca de Dispositivos</Text>
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

export default MarcaDispositivosScreen;
