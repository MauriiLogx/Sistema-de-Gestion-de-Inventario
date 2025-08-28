📦 Sistema de Gestión de Inventario

This project is an inventory management system developed in JavaScript.
It allows administrators and users to manage devices, users, units, brands, device types, maintenance records, and reports in an organized and efficient way.

🚀 Main Features

🔑 Login system with roles (Administrator / User).

👥 Gestión de Usuarios: add, edit, and delete users.

🏢 Unidad management with integrated search.

💻 Gestión de Dispositivos:

- Fields: serial number, type, brand, user, status, dates, model, operating system.

- Modal for adding/editing devices.

- Search by serial number or user.

🏷️ Gestión de Marcas and Tipos de Dispositivos with CRUD and search.

🔧 Mantenimiento: register start and finish dates.

📊 Reporte:

- Export to Excel (future option for PDF).

- Reports automatically update with new devices.

📱 Responsive tables on all screens.

🛠️ Technologies Used

JavaScript

- React / React Native for the user interface

- Node.js + Express for backend logic

- MySQL as the main database

- CSS / custom styles for UI design

- fetch API for frontend-backend communication

📂 Project Structure
```
📦 inventario-app
 ┣ 📂 assets
 ┃ ┣ adaptive-icon.png
 ┃ ┣ favicon.png
 ┃ ┣ icon.png
 ┃ ┗ splash.png
 ┣ 📂 screens
 ┃ ┣ AjustesScreen.js
 ┃ ┣ DateInput.js
 ┃ ┣ DispositivosScreen.js
 ┃ ┣ InicioScreen.js
 ┃ ┣ MantenimientoScreen.js
 ┃ ┣ MarcaDispositivosScreen.js
 ┃ ┣ ReporteScreen.js
 ┃ ┣ TipoDispositivosScreen.js
 ┃ ┣ UnidadScreen.js
 ┃ ┗ UsuariosScreen.js
 ┣ .gitignore
 ┣ App.js
 ┣ app.json
 ┣ babel.config.js
 ┣ database.sql
 ┣ package-lock.json
 ┣ package.json
 ┗ server.js
```
⚙️ Installation & Usage
1. Clone the repository

```git clone https://github.com/usuario/inventario-app.git ```

```cd inventario-app```

3. Install dependencies

```npm install```

4. Run backend server

```node server.js```

5. Run the application

```npm start```

6. Open in browser or emulator

```http://localhost:3000```

📌 Project Status

✅ Fully working with all screens implemented.
🔜 Future improvements:

- Report export in PDF.

- Advanced filters in reports and devices.

- Notification system.

👨‍💻 Author

Mauricio Faundez – Professional internship project at a municipality
