<div align="center">

<br/>

# Sistema de Gestión de Inventario

**Solución integral para el control de inventarios, compuesta por una aplicación móvil multiplataforma y un potente servidor backend.**

<br/>

[![React Native](https://img.shields.io/badge/React_Native-0.x-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-Latest-000000?style=for-the-badge&logo=expo)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)

<br/>

</div>

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológico](#stack-tecnológico)
- [Instalación y Configuración](#instalación-y-configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Base de Datos](#base-de-datos)

---

## Descripción

Este proyecto es un sistema robusto para la administración de inventarios que permite rastrear productos, movimientos de stock y reportes en tiempo real. Utiliza una arquitectura desacoplada con un cliente móvil altamente intuitivo y un servidor centralizado para la persistencia de datos.

---

## Arquitectura

El sistema se divide en dos componentes principales:

1.  **Frontend (Móvil):** Aplicación desarrollada con React Native y Expo, diseñada para ofrecer una experiencia fluida tanto en Android como en iOS.
2.  **Backend (Servidor):** API REST robusta construida con Node.js y Express, encargada de la lógica de negocio y la comunicación con la base de datos.

---

## Funcionalidades

- Gestión completa de productos (CRUD).
- Seguimiento de existencias y alertas de stock bajo.
- Registro histórico de movimientos (entradas y salidas).
- Interfaz de usuario adaptada para dispositivos móviles.
- Sincronización de datos en tiempo real mediante API REST.

---

## Stack Tecnológico

| Componente | Tecnologías |
| :--- | :--- |
| **Frontend** | React Native, Expo, React Navigation |
| **Backend** | Node.js, Express.js |
| **Base de Datos** | MySQL / SQL Server |
| **Lenguaje** | JavaScript (ES6+) |
| **Estilos** | StyleSheet (Native) |

---

## Instalación y Configuración

### Prerrequisitos

- Node.js (v18+)
- Expo Go (en dispositivo móvil) o emulador configurado.
- Servidor de base de datos SQL.

### Configuración del Backend

```bash
# Entrar al directorio del proyecto
cd Sistema-de-Gestion-de-Inventario

# Instalar dependencias del servidor
npm install

# Configurar la base de datos
# Ejecutar el script 'database.sql' en tu servidor SQL

# Iniciar el servidor
node server.js
```

### Configuración del Frontend

```bash
# En una nueva terminal, iniciar Expo
npx expo start
```

Escanea el código QR con la app **Expo Go** para visualizar la aplicación.

---

## Estructura del Proyecto

```text
├── assets/             # Recursos estáticos (imágenes, fuentes)
├── screens/            # Pantallas de la aplicación móvil
├── App.js              # Punto de entrada de la aplicación React Native
├── server.js           # Servidor backend Node.js + Express
├── database.sql        # Esquema de la base de datos
├── app.json            # Configuración de Expo
└── package.json        # Dependencias y scripts
```

---

## Base de Datos

El sistema utiliza un esquema SQL estructurado para garantizar la integridad de los datos. El archivo `database.sql` contiene las definiciones de tablas para:
- Productos
- Categorías
- Usuarios
- Historial de Inventario

---

<div align="center">

**Sistema de Gestión de Inventario** — Versión 1.0

</div>
