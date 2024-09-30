CREATE TABLE Unidad (
    ID_Unidad INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(50),
    Descripcion TEXT
);

CREATE TABLE Usuario (
    ID_Usuario INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(100),
    Email VARCHAR(100),
    RUN VARCHAR(12) UNIQUE,
    Unidad_ID INT,
    FOREIGN KEY (Unidad_ID) REFERENCES Unidad(ID_Unidad)
);

CREATE TABLE Administrador (
    ID_Administrador INT PRIMARY KEY,
    Rol VARCHAR(50),
    FOREIGN KEY (ID_Administrador) REFERENCES Usuario(ID_Usuario)
);


CREATE TABLE Tipo_Dispositivo (
    ID_Tipo_Dispositivo INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(50),
    Descripcion TEXT
);


CREATE TABLE Marca_Dispositivo (
    ID_Marca_Dispositivo INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(50),
    Descripcion TEXT
);

CREATE TABLE Dispositivo (
    ID_Dispositivo INT PRIMARY KEY AUTO_INCREMENT,
    Numero_Serie VARCHAR(50) UNIQUE,
    Tipo_Dispositivo_ID INT,
    Marca_Dispositivo_ID INT,
    Usuario_ID INT,
    Estado VARCHAR(20),
    Fecha_Recepcion DATE,
    Fecha_Baja DATE,
    FOREIGN KEY (Tipo_Dispositivo_ID) REFERENCES Tipo_Dispositivo(ID_Tipo_Dispositivo),
    FOREIGN KEY (Marca_Dispositivo_ID) REFERENCES Marca_Dispositivo(ID_Marca_Dispositivo),
    FOREIGN KEY (Usuario_ID) REFERENCES Usuario(ID_Usuario)
);

CREATE TABLE Mantenimiento (
    ID_Mantenimiento INT PRIMARY KEY AUTO_INCREMENT,
    Prioridad VARCHAR(20),
    Estado VARCHAR(20),
    Fecha_Ingreso DATE,
    Encargado_ID INT,
    Dispositivo_ID INT,
    FOREIGN KEY (Encargado_ID) REFERENCES Usuario(ID_Usuario),
    FOREIGN KEY (Dispositivo_ID) REFERENCES Dispositivo(ID_Dispositivo)
);

CREATE TABLE Reporte (
    ID_Reporte INT PRIMARY KEY AUTO_INCREMENT,
    Tipo_Reporte VARCHAR(50),
    Fecha_Generacion DATE,
    Usuario_Generador_ID INT,
    FOREIGN KEY (Usuario_Generador_ID) REFERENCES Usuario(ID_Usuario)
);