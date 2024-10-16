// Importación de las bibliotecas necesarias
const express = require('express'); // Framework para crear aplicaciones web
const cors = require('cors'); // Middleware para habilitar CORS
const mysql = require('mysql2'); // Biblioteca para conectarse a MySQL
const bodyParser = require('body-parser'); // Middleware para parsear cuerpos de solicitudes HTTP
const port = 4000; // Definición del puerto en el que se ejecutará el servidor

const app = express(); // Crea una instancia de la aplicación Express
app.use(cors()); // Habilita CORS para permitir solicitudes desde cualquier origen
app.use(bodyParser.json()); // Middleware para parsear JSON en el cuerpo de las solicitudes

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost', // Dirección del servidor de base de datos
    user: 'root', // Usuario de la base de datos
    password: 'm7470', // Contraseña del usuario
    database: 'gestion_inventarios', // Nombre de la base de datos
});

// Conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err); // Manejo de errores en la conexión
        return;
    }
    console.log('Conectado a la base de datos MySQL'); // Mensaje de éxito en la conexión
});

// ------------------- Rutas para Usuarios -------------------

// Ruta para obtener los usuarios
app.get('/api/usuarios', (req, res) => {
    const sql = `
        SELECT 
            u.Nombre, 
            u.Email, 
            un.Nombre AS Unidad, 
            u.RUN 
        FROM 
            Usuario u
            LEFT JOIN 
        Unidad un ON u.Unidad_ID = un.ID_Unidad
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error en la consulta SELECT:', err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// Ruta para agregar un nuevo usuario
app.post('/api/usuarios', (req, res) => {
    const { Nombre, Email, RUN, Unidad } = req.body;

    if (!Nombre || !Email || !RUN || !Unidad) {
        console.error('Faltan campos requeridos en la solicitud POST:', req.body);
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const unidadSql = `SELECT ID_Unidad FROM Unidad WHERE Nombre = ?`;
    db.query(unidadSql, [Unidad], (err, results) => {
        if (err) {
            console.error('Error en la consulta de Unidad:', err);
            return res.status(500).json({ message: 'Error al buscar la unidad' });
        }

        if (results.length === 0) {
            console.error('Unidad no encontrada para:', Unidad);
            return res.status(404).json({ message: 'Unidad no encontrada' });
        }

        const unidadId = results[0].ID_Unidad;

        const insertSql = `
            INSERT INTO Usuario (Nombre, Email, RUN, Unidad_ID) 
            VALUES (?, ?, ?, ?)
        `;
        db.query(insertSql, [Nombre, Email, RUN, unidadId], (err, result) => {
            if (err) {
                console.error('Error al insertar el usuario:', err);
                return res.status(500).json({ message: 'Error al agregar el usuario' });
            }
            res.status(201).json({ message: 'Usuario agregado correctamente' });
        });
    });
});

// Nueva ruta para obtener las unidades
app.get('/api/unidades', (req, res) => {
    const sql = 'SELECT ID_Unidad, Nombre FROM Unidad';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error en la consulta SELECT de unidades:', err);
            return res.status(500).json({ message: 'Error al obtener las unidades' });
        }
        res.json(results);
    });
});

// Ruta para editar un usuario
app.put('/api/usuarios/:run', (req, res) => {
    const { run } = req.params;
    const { Nombre, Email, Unidad } = req.body;

    if (!Nombre || !Email || !Unidad) {
        console.error('Faltan campos requeridos en la solicitud PUT:', req.body);
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const unidadSql = `SELECT ID_Unidad FROM Unidad WHERE Nombre = ?`;
    db.query(unidadSql, [Unidad], (err, results) => {
        if (err) {
            console.error('Error en la consulta de Unidad:', err);
            return res.status(500).json({ message: 'Error al buscar la unidad' });
        }

        if (results.length === 0) {
            console.error('Unidad no encontrada para:', Unidad);
            return res.status(404).json({ message: 'Unidad no encontrada' });
        }

        const unidadId = results[0].ID_Unidad;

        const updateSql = `
            UPDATE Usuario 
            SET Nombre = ?, Email = ?, Unidad_ID = ? 
            WHERE RUN = ?
        `;
        db.query(updateSql, [Nombre, Email, unidadId, run], (err, result) => {
            if (err) {
                console.error('Error al actualizar el usuario:', err);
                return res.status(500).json({ message: 'Error al editar el usuario' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.json({ message: 'Usuario actualizado correctamente' });
        });
    });
});

// Ruta para eliminar un usuario
app.delete('/api/usuarios/:run', (req, res) => {
    const { run } = req.params;

    const deleteSql = `DELETE FROM Usuario WHERE RUN = ?`;
    db.query(deleteSql, [run], (err, result) => {
        if (err) {
            console.error('Error al eliminar el usuario:', err);
            return res.status(500).json({ message: 'Error al eliminar el usuario' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado correctamente' });
    });
});

// ------------------- Rutas para marcas de dispositivos -------------------

// Ruta para obtener las marcas de dispositivos
app.get('/api/marcas', (req, res) => {
    const sql = 'SELECT ID_Marca_Dispositivo, Nombre FROM marca_dispositivo';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error en la consulta SELECT de marcas:', err);
            return res.status(500).json({ message: 'Error al obtener las marcas' });
        }
        res.json(results);
    });
});

// Ruta para agregar una nueva marca
app.post('/api/marcas', (req, res) => {
    const { Nombre } = req.body;

    if (!Nombre) {
        return res.status(400).json({ message: 'El nombre de la marca es obligatorio' });
    }

    const insertSql = 'INSERT INTO marca_dispositivo (Nombre) VALUES (?)';
    db.query(insertSql, [Nombre], (err, result) => {
        if (err) {
            console.error('Error al agregar la marca:', err);
            return res.status(500).json({ message: 'Error al agregar la marca' });
        }

        // Obtener el ID de la nueva marca insertada
        const newMarcaId = result.insertId;

        // Devolver la nueva marca incluyendo su ID
        res.status(201).json({ ID_Marca_Dispositivo: newMarcaId, Nombre });
    });
});

// Ruta para editar una marca
app.put('/api/marcas/:id', (req, res) => {
    const { id } = req.params;
    const { Nombre } = req.body;

    if (!Nombre) {
        return res.status(400).json({ message: 'El nombre de la marca es obligatorio' });
    }

    const updateSql = 'UPDATE marca_dispositivo SET Nombre = ? WHERE ID_Marca_Dispositivo = ?';
    db.query(updateSql, [Nombre, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar la marca:', err);
            return res.status(500).json({ message: 'Error al editar la marca' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Marca no encontrada' });
        }

        res.json({ message: 'Marca actualizada correctamente' });
    });
});

// Ruta para eliminar una marca
app.delete('/api/marcas/:id', (req, res) => {
    const { id } = req.params;

    const deleteSql = 'DELETE FROM marca_dispositivo WHERE ID_Marca_Dispositivo = ?';
    db.query(deleteSql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar la marca:', err);
            return res.status(500).json({ message: 'Error al eliminar la marca' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Marca no encontrada' });
        }

        res.json({ message: 'Marca eliminada correctamente' });
    });
});

// ------------------- Rutas para Unidades -------------------

// Ruta para obtener las unidades
app.get('/api/unidades', (req, res) => {
    const sql = 'SELECT ID_Unidad, Nombre FROM Unidad';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error en la consulta SELECT de unidades:', err);
            return res.status(500).json({ message: 'Error al obtener las unidades' });
        }
        res.json(results);
    });
});

// Ruta para agregar una nueva unidad
app.post('/api/unidades', (req, res) => {
    const { Nombre } = req.body;

    if (!Nombre) {
        return res.status(400).json({ message: 'El nombre de la unidad es obligatorio' });
    }

    const insertSql = 'INSERT INTO Unidad (Nombre) VALUES (?)';
    db.query(insertSql, [Nombre], (err, result) => {
        if (err) {
            console.error('Error al agregar la unidad:', err);
            return res.status(500).json({ message: 'Error al agregar la unidad' });
        }

        // Obtener el ID de la nueva unidad insertada
        const newUnidadId = result.insertId;

        // Devolver la nueva unidad incluyendo su ID
        res.status(201).json({ ID_Unidad: newUnidadId, Nombre });
    });
});

// Ruta para editar una unidad
app.put('/api/unidades/:id', (req, res) => {
    const { id } = req.params;
    const { Nombre } = req.body;

    if (!Nombre) {
        return res.status(400).json({ message: 'El nombre de la unidad es obligatorio' });
    }

    const updateSql = 'UPDATE Unidad SET Nombre = ? WHERE ID_Unidad = ?';
    db.query(updateSql, [Nombre, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar la unidad:', err);
            return res.status(500).json({ message: 'Error al editar la unidad' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Unidad no encontrada' });
        }

        res.json({ message: 'Unidad actualizada correctamente' });
    });
});

// Ruta para eliminar una unidad
app.delete('/api/unidades/:id', (req, res) => {
    const { id } = req.params;

    const deleteSql = 'DELETE FROM Unidad WHERE ID_Unidad = ?';
    db.query(deleteSql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar la unidad:', err);
            return res.status(500).json({ message: 'Error al eliminar la unidad' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Unidad no encontrada' });
        }

        res.json({ message: 'Unidad eliminada correctamente' });
    });
});

// ------------------- Arranque del servidor -------------------
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});















