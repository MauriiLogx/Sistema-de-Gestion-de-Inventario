const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors()); // Habilita CORS para permitir peticiones desde tu app React Native

// Configura la conexión a la base de datos
const db = mysql.createConnection({
host: 'localhost', // Cambia esto si tu base de datos está en otro lugar
user: 'root', // Reemplaza con tu usuario de MySQL
password: 'm7470', // Reemplaza con tu contraseña de MySQL
database: 'gestion_inventarios', // Reemplaza con el nombre de tu base de datos
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
    });
    
    // Define tu endpoint
    app.get('/usuarios', (req, res) => {
    const query = `
        SELECT 
        u.ID_Usuario, u.Nombre, u.Email, u.RUN, un.Nombre AS Unidad
        FROM 
        Usuario u
        LEFT JOIN 
        Unidad un ON u.Unidad_ID = un.ID_Unidad
            `;
        
    db.query(query, (err, results) => {
        if (err) {
        return res.status(500).send(err);
        }
        res.json(results);
    });
    });
    
    app.listen(4000, () => {
    console.log('Servidor corriendo en el puerto 4000');
});
