import React from 'react'; //Importamos React
import { View, Text, StyleSheet } from 'react-native'; // Importamos los componentes de react native

const AjustesScreen = () => {
return (
<View style={styles.container}>
    <Text>Pantalla de configuración</Text>
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

export default AjustesScreen;
