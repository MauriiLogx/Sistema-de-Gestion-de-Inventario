// Importación de las bibliotecas necesarias
const express = require('express'); // Framework para crear aplicaciones web
const cors = require('cors'); // Middleware para habilitar CORS
const mysql = require('mysql2'); // Biblioteca para conectarse a MySQL
const bodyParser = require('body-parser'); // Middleware para parsear cuerpos de solicitudes HTTP
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path')
const port = 4000; // Definición del puerto en el que se ejecutará el servidor
const util = require('util');

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

// Promisificar la función db.query
const query = util.promisify(db.query).bind(db);

// Conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err); // Manejo de errores en la conexion
        return;
    }
    console.log('Conectado a la base de datos MySQL'); // Mensaje de éxito en la conexión
});

// Ruta para obtener estadísticas de dispositivos y usuarios
app.get('/api/inicio', async (req, res) => {
    try {
        const dispositivosIngresadosResults = await query('SELECT COUNT(*) AS total FROM Dispositivo');
        const dispositivosActivosResults = await query('SELECT COUNT(*) AS activos FROM Dispositivo WHERE Estado = "activo"');
        const dispositivosInactivosResults = await query('SELECT COUNT(*) AS inactivos FROM Dispositivo WHERE Estado = "inactivo"');
        const usuariosIngresadosResults = await query('SELECT COUNT(*) AS total FROM Usuario');

        res.json({
            dispositivosIngresados: dispositivosIngresadosResults[0].total,
            dispositivosActivos: dispositivosActivosResults[0].activos,
            dispositivosInactivos: dispositivosInactivosResults[0].inactivos,
            usuariosIngresados: usuariosIngresadosResults[0].total,
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
});

// ------------------- Rutas para usuario -------------------

// Ruta para obtener los usuarios
app.get('/api/usuarios', (req, res) => {
    const sql = `
        SELECT 
            u.ID_Usuario,
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
            console.error('Error en la consulta SELECT de usuarios:', err);
            return res.status(500).json({ message: 'Error al obtener los usuarios' });
        }
        res.json(results);
    });
});

// Ruta para agregar un nuevo usaurios
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
            res.status(201).json({ message: 'Usuario agregado correctamente', usuario: { Nombre, Email, RUN, Unidad } });
        });
    });
});

// Ruta para editar el usuario
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

            res.json({ message: 'Usuario actualizado correctamente', usuario: { Nombre, Email, RUN: run, Unidad } });
        });
    });
});

// Ruta para eliminar el usuario
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

// ------------------- Tipo de Dispositivos --------------------------------

// Ruta para obtener los tipos de dispositivos
app.get('/api/tipos', (req, res) => {
    const sql = 'SELECT ID_Tipo_Dispositivo, Nombre FROM tipo_dispositivo';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error en la consulta SELECT de tipos de dispositivos:', err);
            return res.status(500).json({ message: 'Error al obtener los tipos de dispositivos' });
        }
        res.json(results);
    });
});

// Ruta para agregar un nuevo tipo de dispositivo
app.post('/api/tipos', (req, res) => {
    const { Nombre } = req.body;

    if (!Nombre) {
        return res.status(400).json({ message: 'El nombre del tipo de dispositivo es obligatorio' });
    }

    const insertSql = 'INSERT INTO tipo_dispositivo (Nombre) VALUES (?)';
    db.query(insertSql, [Nombre], (err, result) => {
        if (err) {
            console.error('Error al agregar el tipo de dispositivo:', err);
            return res.status(500).json({ message: 'Error al agregar el tipo de dispositivo' });
        }

        const newTipoId = result.insertId;

        res.status(201).json({ ID_Tipo_Dispositivo: newTipoId, Nombre });
    });
});

// Ruta para editar un tipo de dispositivo
app.put('/api/tipos/:id', (req, res) => {
    const { id } = req.params;
    const { Nombre } = req.body;

    if (!Nombre) {
        return res.status(400).json({ message: 'El nombre del tipo de dispositivo es obligatorio' });
    }

    const updateSql = 'UPDATE tipo_dispositivo SET Nombre = ? WHERE ID_Tipo_Dispositivo = ?';
    db.query(updateSql, [Nombre, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el tipo de dispositivo:', err);
            return res.status(500).json({ message: 'Error al editar el tipo de dispositivo' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tipo de dispositivo no encontrado' });
        }

        res.json({ message: 'Tipo de dispositivo actualizado correctamente', tipo: { ID_Tipo_Dispositivo: id, Nombre } });
    });
});

// Ruta para eliminar un tipo de dispositivo
app.delete('/api/tipos/:id', (req, res) => {
    const { id } = req.params;

    const deleteSql = 'DELETE FROM tipo_dispositivo WHERE ID_Tipo_Dispositivo = ?';
    db.query(deleteSql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el tipo de dispositivo:', err);
            return res.status(500).json({ message: 'Error al eliminar el tipo de dispositivo' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tipo de dispositivo no encontrado' });
        }

        res.json({ message: 'Tipo de dispositivo eliminado correctamente' });
    });
});


// ------------------- Rutas para Marcas de Dispositivos -------------------

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

        const newMarcaId = result.insertId;

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

        res.json({ message: 'Marca actualizada correctamente', marca: { ID_Marca_Dispositivo: id, Nombre } });
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

        const newUnidadId = result.insertId;

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

        res.json({ message: 'Unidad actualizada correctamente', unidad: { ID_Unidad: id, Nombre } });
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

// --------------------- Rutas para dispositivos ---------------------------

// Ruta para obtener los dispositivos
app.get('/api/dispositivos', (req, res) => {
    const sql = `
        SELECT 
            d.ID_Dispositivo,
            d.Numero_Serie, 
            m.Nombre AS Marca, 
            d.Modelo, 
            u.Nombre AS Usuario 
        FROM 
            Dispositivo d
            LEFT JOIN Marca_Dispositivo m ON d.Marca_Dispositivo_ID = m.ID_Marca_Dispositivo
            LEFT JOIN Usuario u ON d.Usuario_ID = u.ID_Usuario
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error en la consulta SELECT de dispositivos:', err);
            return res.status(500).json({ message: 'Error al obtener los dispositivos' });
        }
        res.json(results);
    });
});

// Ruta para agregar un nuevo dispositivo
app.post('/api/dispositivos', (req, res) => {
    const { Numero_Serie, Modelo, Sistema_Operativo, Usuario_RUN, Marca_Dispositivo_ID, Tipo_Dispositivo_ID, Estado, Fecha_Recepcion, Fecha_Baja } = req.body;

    console.log('Datos recibidos en la solicitud POST:', {
        Numero_Serie,
        Modelo,
        Sistema_Operativo,
        Usuario_RUN,
        Marca_Dispositivo_ID,
        Tipo_Dispositivo_ID,
        Estado,
        Fecha_Recepcion,
        Fecha_Baja
    });

    if (
        !Numero_Serie || 
        !Modelo || 
        !Sistema_Operativo || 
        !Usuario_RUN || 
        !Marca_Dispositivo_ID || 
        !Tipo_Dispositivo_ID || 
        !Estado || 
        !Fecha_Recepcion 
    ) {
        console.error('Error de validación - Faltan campos básicos en la solicitud POST:', req.body);
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (Estado.toLowerCase() !== 'activo' && !Fecha_Baja) {
        console.error('Error de validación - Fecha_Baja es obligatoria cuando el estado no es activo:', {
            Estado,
            Fecha_Baja
        });
        return res.status(400).json({ message: 'Fecha de baja es obligatoria cuando el estado no es activo' });
    }

    const getUserIDSql = 'SELECT ID_Usuario FROM Usuario WHERE RUN = ?';

    db.query(getUserIDSql, [Usuario_RUN], (err, userResult) => {
        if (err) {
            console.error('Error al obtener el ID del usuario:', err);
            return res.status(500).json({ message: 'Error al buscar el usuario' });
        }

        if (userResult.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const Usuario_ID = userResult[0].ID_Usuario;

        const sql = `
            INSERT INTO Dispositivo 
                (Numero_Serie, Modelo, Sistema_Operativo, Usuario_ID, Marca_Dispositivo_ID, Tipo_Dispositivo_ID, Estado, Fecha_Recepcion, Fecha_Baja) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [
            Numero_Serie,        
            Modelo,              
            Sistema_Operativo,   
            Usuario_ID,          
            Marca_Dispositivo_ID,
            Tipo_Dispositivo_ID, 
            Estado,              
            Fecha_Recepcion,     
            Estado.toLowerCase() === 'activo' ? null : Fecha_Baja // Ajuste para insertar null si el estado es activo
        ], (err, result) => {
            if (err) {
                console.error('Error al insertar el dispositivo:', err);
                return res.status(500).json({ message: 'Error al agregar el dispositivo' });
            }

            res.status(201).json({ message: 'Dispositivo agregado correctamente', dispositivo: { Numero_Serie, Modelo, Sistema_Operativo, Usuario_ID, Marca_Dispositivo_ID, Tipo_Dispositivo_ID, Estado, Fecha_Recepcion, Fecha_Baja } });
        });
    });
});

// Ruta para editar un dispositivo existente
app.put('/api/dispositivos/:numeroSerie', (req, res) => {
    const { numeroSerie } = req.params;
    const { Modelo, Sistema_Operativo, Usuario_RUN, Marca_Dispositivo_ID, Tipo_Dispositivo_ID, Estado, Fecha_Recepcion, Fecha_Baja } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!Modelo || !Sistema_Operativo || !Usuario_RUN || !Marca_Dispositivo_ID || !Tipo_Dispositivo_ID || !Estado || !Fecha_Recepcion) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Validación adicional para Fecha_Baja
    if (Estado.toLowerCase() !== 'activo' && !Fecha_Baja) {
        return res.status(400).json({ message: 'Fecha de baja es obligatoria cuando el estado no es activo' });
    }

    // Obtener el ID del usuario a partir del RUN
    const getUserIDSql = 'SELECT ID_Usuario FROM Usuario WHERE RUN = ?';
    db.query(getUserIDSql, [Usuario_RUN], (err, userResult) => {
        if (err) {
            console.error('Error al obtener el ID del usuario:', err);
            return res.status(500).json({ message: 'Error al buscar el usuario' });
        }

        if (userResult.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const Usuario_ID = userResult[0].ID_Usuario;

        // Preparar la consulta de actualización
        const updateSql = `
            UPDATE Dispositivo
            SET Marca_Dispositivo_ID = ?, Modelo = ?, Usuario_ID = ?, Tipo_Dispositivo_ID = ?, Estado = ?, Fecha_Recepcion = ?, Fecha_Baja = ?, Sistema_Operativo = ?
            WHERE Numero_Serie = ?
        `;

        db.query(updateSql, [
            Marca_Dispositivo_ID,
            Modelo,
            Usuario_ID,
            Tipo_Dispositivo_ID,
            Estado,
            Fecha_Recepcion,
            Estado.toLowerCase() === 'activo' ? null : Fecha_Baja,
            Sistema_Operativo,
            numeroSerie
        ], (err, result) => {
            if (err) {
                console.error('Error al actualizar el dispositivo:', err);
                return res.status(500).json({ message: 'Error al editar el dispositivo' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Dispositivo no encontrado' });
            }

            res.json({ message: 'Dispositivo actualizado correctamente' });
        });
    });
});


// Ruta para obtener los datos de un dispositivo específico por número de serie
app.get('/api/dispositivos/:numeroSerie', (req, res) => {
    const { numeroSerie } = req.params;

    const querySql = `
        SELECT d.Numero_Serie, d.Modelo, d.Sistema_Operativo, d.Estado, d.Fecha_Recepcion, d.Fecha_Baja,
        u.RUN AS Usuario_RUN, m.ID_Marca_Dispositivo AS Marca_Dispositivo_ID, t.ID_Tipo_Dispositivo AS Tipo_Dispositivo_ID
        FROM Dispositivo d
        JOIN Usuario u ON d.Usuario_ID = u.ID_Usuario
        JOIN Marca_Dispositivo m ON d.Marca_Dispositivo_ID = m.ID_Marca_Dispositivo
        JOIN Tipo_Dispositivo t ON d.Tipo_Dispositivo_ID = t.ID_Tipo_Dispositivo
        WHERE d.Numero_Serie = ?
    `;

    db.query(querySql, [numeroSerie], (err, result) => {
        if (err) {
            console.error('Error al obtener datos del dispositivo:', err);
            return res.status(500).json({ message: 'Error al obtener el dispositivo' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Dispositivo no encontrado' });
        }

        console.log('Datos del dispositivo obtenidos:', result[0]); // Para depuración
        res.json(result[0]);
    });
});


// Ruta para eliminar el dispositivo
app.delete('/api/dispositivos/:numeroSerie', (req, res) => {
    const { numeroSerie } = req.params;

    const sql = `DELETE FROM Dispositivo WHERE Numero_Serie = ?`;
    db.query(sql, [numeroSerie], (err, result) => {
        if (err) {
            console.error('Error al eliminar el dispositivo:', err);
            return res.status(500).json({ message: 'Error al eliminar el dispositivo' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Dispositivo no encontrado' });
        }

        res.json({ message: 'Dispositivo eliminado correctamente' });
    });
});

// --------------------- Rutas para mantenimiento ---------------------------

// Ruta para obtener los mantenimientos
app.get('/api/mantenimientos', (req, res) => {
    const sql = `
        SELECT 
            m.ID_Mantenimiento,
            m.Prioridad,
            m.Estado,
            m.Fecha_Ingreso,
            m.Fecha_Finalizacion,
            m.Comentarios,
            u.Nombre AS Encargado,
            d.Numero_Serie AS Dispositivo
        FROM 
            Mantenimiento m
            LEFT JOIN Usuario u ON m.Encargado_ID = u.ID_Usuario
            LEFT JOIN Dispositivo d ON m.Dispositivo_ID = d.ID_Dispositivo
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error en la consulta SELECT de mantenimientos:', err);
            return res.status(500).json({ message: 'Error al obtener los mantenimientos' });
        }
        res.json(results);
    });
});

// Ruta para agregar un nuevo mantenimiento
app.post('/api/mantenimientos', (req, res) => {
    const { Prioridad, Estado, Encargado_ID, Dispositivo_ID, Fecha_Ingreso, Fecha_Finalizacion, Comentarios } = req.body;

    // Mostrar datos recibidos para depuración
    console.log("Datos recibidos en el backend para agregar mantenimiento:", req.body); 

    // Validación inicial de campos obligatorios
    if (!Prioridad || !Estado || !Encargado_ID || !Fecha_Ingreso || !Dispositivo_ID) {
        console.error('Error de validación - Faltan campos obligatorios en la solicitud POST:', req.body);
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Validar Fecha_Finalizacion solo si Estado es 'completada'
    if (Estado.toLowerCase() === 'completada' && !Fecha_Finalizacion) {
        console.error('Error de validación - Fecha_Finalizacion es obligatoria cuando el estado es completada:', req.body);
        return res.status(400).json({ message: 'Fecha de finalización es obligatoria cuando el estado es completada' });
    }

    // SQL para insertar datos
    const sql = `
        INSERT INTO Mantenimiento 
            (Prioridad, Estado, Encargado_ID, Dispositivo_ID, Fecha_Ingreso, Fecha_Finalizacion, Comentarios) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        Prioridad,
        Estado,
        Encargado_ID,
        Dispositivo_ID,
        Fecha_Ingreso,
        Fecha_Finalizacion || null, 
        Comentarios || null 
    ], (err, result) => {
        if (err) {
            console.error('Error al insertar el mantenimiento en la base de datos:', err);
            return res.status(500).json({ message: 'Error al agregar el mantenimiento' });
        }

        res.status(201).json({
            message: 'Mantenimiento agregado correctamente',
            mantenimiento: { Prioridad, Estado, Encargado_ID, Dispositivo_ID, Fecha_Ingreso, Fecha_Finalizacion, Comentarios }
        });
    });
});

// Ruta para editar un mantenimiento existente
app.put('/api/mantenimientos/:id', (req, res) => {
    const { id } = req.params;
    const { Prioridad, Estado, Encargado_ID, Dispositivo_ID, Fecha_Ingreso, Fecha_Finalizacion, Comentarios } = req.body;

    // Verificación de campos obligatorios
    if (!Prioridad || !Estado || !Encargado_ID || !Dispositivo_ID || !Fecha_Ingreso || !Comentarios) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Asegurarse de que Encargado_ID y Dispositivo_ID Sean numericos
    const encargadoID = parseInt(Encargado_ID, 10);
    const dispositivoID = parseInt(Dispositivo_ID, 10);

    // Validar si la conversión fue exitosa (en caso de que el valor no sea numérico)
    if (isNaN(encargadoID) || isNaN(dispositivoID)) {
        return res.status(400).json({ message: 'Encargado_ID o Dispositivo_ID no son válidos' });
    }

    const sql = `
        UPDATE Mantenimiento
        SET Prioridad = ?, Estado = ?, Encargado_ID = ?, Dispositivo_ID = ?, Fecha_Ingreso = ?, Fecha_Finalizacion = ?, Comentarios = ?
        WHERE ID_Mantenimiento = ?
    `;

    db.query(
        sql,
        [Prioridad, Estado, encargadoID, dispositivoID, Fecha_Ingreso, Fecha_Finalizacion || null, Comentarios || null, id],
        (err, result) => {
            if (err) {
                console.error('Error al actualizar el mantenimiento:', err);
                return res.status(500).json({ message: 'Error al editar el mantenimiento' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Mantenimiento no encontrado' });
            }

            res.json({ message: 'Mantenimiento actualizado correctamente' });
        }
    );
});

// Ruta para obtener los datos de un mantenimiento específico por ID
app.get('/api/mantenimientos/:id', (req, res) => {
    const { id } = req.params;

    const querySql = `
        SELECT m.ID_Mantenimiento, m.Prioridad, m.Estado, m.Fecha_Ingreso, m.Fecha_Finalizacion, m.Comentarios,
        u.ID_Usuario AS Encargado_ID, d.ID_Dispositivo AS Dispositivo_ID
        FROM Mantenimiento m
        LEFT JOIN Usuario u ON m.Encargado_ID = u.ID_Usuario
        LEFT JOIN Dispositivo d ON m.Dispositivo_ID = d.ID_Dispositivo
        WHERE m.ID_Mantenimiento = ?
    `;

    db.query(querySql, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener datos del mantenimiento:', err);
            return res.status(500).json({ message: 'Error al obtener el mantenimiento' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Mantenimiento no encontrado' });
        }

        res.json(result[0]);
    });
});

// Ruta para eliminar un mantenimiento
app.delete('/api/mantenimientos/:id', (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM Mantenimiento WHERE ID_Mantenimiento = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el mantenimiento:', err);
            return res.status(500).json({ message: 'Error al eliminar el mantenimiento' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Mantenimiento no encontrado' });
        }

        res.json({ message: 'Mantenimiento eliminado correctamente' });
    });
});

// ------------------- Ruta para la pantalla de Reporte ----------------------

// Función para obtener los datos del reporte
async function getReporteData() {
    const queryStr = `
        SELECT 
            d.numero_serie AS 'Número de Serie',
            td.nombre AS 'Tipo de Dispositivo',
            md.nombre AS 'Marca del Dispositivo',
            d.modelo AS 'Modelo del Dispositivo',
            d.sistema_operativo AS 'Sistema Operativo',
            u.nombre AS 'Usuario Asignado',
            un.nombre AS 'Unidad',
            d.estado AS 'Estado',
            d.fecha_recepcion AS 'Fecha de Recepción',
            d.fecha_baja AS 'Fecha de Baja',
            (SELECT MAX(m.Fecha_Finalizacion) FROM Mantenimiento m WHERE m.Dispositivo_ID = d.ID_Dispositivo) AS 'Última Fecha de Mantenimiento'
        FROM 
            Dispositivo d
        JOIN 
            Tipo_Dispositivo td ON d.tipo_dispositivo_id = td.ID_Tipo_Dispositivo
        JOIN 
            Marca_Dispositivo md ON d.marca_dispositivo_id = md.ID_Marca_Dispositivo
        JOIN 
            Usuario u ON d.usuario_id = u.ID_Usuario
        JOIN 
            Unidad un ON u.unidad_id = un.ID_Unidad;
    `;
    
    const rows = await query(queryStr); // Ejecuta la consulta y obtiene los datos
    return rows; // Devuelve los datos en formato JSON
}

// Ruta para obtener los datos del reporte en formato JSON (sin descargar Excel)
app.get('/api/reporte-datos', async (req, res) => {
    try {
        const data = await getReporteData(); // Obtener los datos del reporte
        res.json(data); // Enviar los datos al cliente en formato JSON
    } catch (error) {
        console.error('Error al obtener los datos del reporte:', error);
        res.status(500).send('Error al obtener los datos del reporte');
    }
});

// Ruta para generar y descargar el reporte en Excel
app.get('/api/generar-reporte', async (req, res) => {
    try {
        const data = await getReporteData(); // Obtener datos del reporte

        // Crear hoja de cálculo con los datos
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Reporte de Inventario');

        // Guardar el archivo Excel temporalmente
        const filePath = path.join(__dirname, 'reporte_inventario.xlsx');
        xlsx.writeFile(workbook, filePath);

        // Enviar el archivo al cliente para descargar
        res.download(filePath, 'reporte_inventario.xlsx', (err) => {
            if (err) throw err;
            fs.unlinkSync(filePath); // Elimina el archivo temporal después de descargar
        });
    } catch (error) {
        console.error('Error generando el reporte:', error);
        res.status(500).send('Error generando el reporte');
    }
});

// ------------------- Iniciar el servidor -------------------
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
