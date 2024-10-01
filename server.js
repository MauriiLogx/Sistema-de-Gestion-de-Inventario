// importamos los modulos necesarios
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors()); // Habilitamos CORS para permitir peticiones desde nuestra app React Native

// Configura la conexión a la base de datos
const db = mysql.createConnection({
host: 'localhost', // Aca colocamos el lugar donde esta nuestra base de datos
user: 'root', // Aca colocamos nuestro nombre de usuario
password: 'm7470', // Aca colocamos la contraseña que tiene nuestra base de datos
database: 'gestion_inventarios', // Aca colocamos el nombre de nuestra base de datos
});

// Esto conectara la base de datos.
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
    });
    
    // Definimos nuestro enpoint
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
    
    app.listen(4000, '0.0.0.0', () => {
    console.log('Servidor corriendo en el puerto 4000');
});
