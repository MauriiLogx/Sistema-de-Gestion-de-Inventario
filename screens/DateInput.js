import React, { useState } from 'react'; // Asegúrate de que useState está importado
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Platform, Button, View } from 'react-native';

const DateInput = ({ date, setDate }) => {
const [showPicker, setShowPicker] = useState(false);

const handleDateChange = (selectedDate) => {
    setShowPicker(false);
    setDate(selectedDate);
};

return (
    <View>
        {Platform.OS === 'web' ? (
        <>
            <Button title="Seleccionar Fecha" onPress={() => setShowPicker(true)} />
            {showPicker && (
                <DatePicker
                    selected={date}
                    onChange={handleDateChange}
                    onClickOutside={() => setShowPicker(false)} // Para cerrar al hacer clic fuera
                    inline // Opcional: Muestra el calendario directamente en lugar de un modal
                />
            )}
            </>
        ) : (
        <>
            <Button title="Seleccionar Fecha" onPress={() => setShowPicker(true)} />
            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                    setShowPicker(false);
                    if (selectedDate) {
                        setDate(selectedDate);
                    }
                    }}
                />
            )}
        </>
        )}
    </View>
);
};

export default DateInput;