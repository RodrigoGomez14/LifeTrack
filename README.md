# 🌱 LifeTrack

> Una aplicación integral para seguimiento de finanzas personales, hábitos y plantas

![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-brightgreen)
![Versión](https://img.shields.io/badge/Versión-1.0.0-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green)

## 📋 Índice

- [Visión General](#-visión-general)
- [Características](#-características)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## 🔍 Visión General

**LifeTrack** es una aplicación web completa diseñada para ayudarte a gestionar varios aspectos de tu vida diaria en un solo lugar. Desde el seguimiento de tus finanzas personales hasta la gestión de hábitos y el cuidado de tus plantas, LifeTrack te ofrece las herramientas necesarias para mantener organizada tu vida.

> [!NOTE]
> Esta aplicación está diseñada para ser utilizada de manera personal y privada. Todos los datos se almacenan en Firebase y están protegidos por autenticación.

## ✨ Características

### 💰 Módulo Financiero

- **Gestión de Ingresos y Gastos** - Registra y categoriza todas tus transacciones financieras
- **Conversión de Moneda** - Soporte para múltiples monedas con conversión automática
- **Tarjetas de Crédito** - Seguimiento de fechas de pago, límites y gastos asociados
- **Informes y Estadísticas** - Visualiza tus hábitos de gasto e ingresos por mes y año

### 🎯 Módulo de Hábitos

- **Creación y Seguimiento** - Establece hábitos personalizados con frecuencia y metas
- **Estado de Progreso** - Visualiza el avance de tus hábitos a lo largo del tiempo
- **Recordatorios** - Configura alertas para mantener la consistencia

### 🌿 Módulo de Plantas

- **Catálogo de Plantas** - Mantén un registro de todas tus plantas
- **Calendario de Cuidados** - Programa riegos, podas, aplicación de insecticidas y transplantes
- **Registro Fotográfico** - Documenta el crecimiento y desarrollo de tus plantas
- **Aditivos** - Gestiona tus fertilizantes e insecticidas

### ⚙️ Personalización

- **Temas Predefinidos** - Elige entre varios esquemas de colores
- **Modo Oscuro/Claro** - Adapta la interfaz según tus preferencias

> [!TIP]
> Personaliza tu experiencia seleccionando uno de los temas predefinidos o ajustando los colores primarios y secundarios en la sección de configuración.

## 📱 Capturas de Pantalla

*Próximamente*

## 🛠️ Tecnologías

- **Frontend**: React, React Router, Material UI
- **Estado**: React Hooks, Context API
- **Backend/Base de Datos**: Firebase (Realtime Database, Authentication)
- **Estilos**: CSS personalizado, Material UI ThemeProvider
- **APIs**: DolarAPI para tasas de cambio

> [!IMPORTANT]
> Esta aplicación requiere una cuenta de Firebase configurada con Realtime Database y Authentication habilitados.

## 📥 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/lifetrack.git

# Navegar al directorio
cd lifetrack

# Instalar dependencias
npm install
```

## 🔧 Configuración

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Authentication con email/password
3. Configura Realtime Database
4. Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```
REACT_APP_FIREBASE_API_KEY=tu-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu-dominio.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://tu-proyecto.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=tu-proyecto-id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
REACT_APP_FIREBASE_APP_ID=tu-app-id
```

> [!WARNING]
> Nunca compartas tus credenciales de Firebase ni las incluyas en el control de versiones.

## 🚀 Uso

```bash
# Iniciar en modo desarrollo
npm start

# Compilar para producción
npm run build

# Ejecutar tests
npm test
```

## 📂 Estructura del Proyecto

```
LifeTrack/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── basics/      # Páginas básicas (Login, Home, etc.)
│   │   ├── finances/    # Módulo financiero
│   │   ├── habits/      # Módulo de hábitos
│   │   └── plants/      # Módulo de plantas
│   ├── utils/           # Utilidades y helpers
│   ├── store/           # Estado global (Context API)
│   ├── App.js           # Componente principal
│   ├── App.css          # Estilos globales
│   ├── firebase.js      # Configuración de Firebase
│   └── index.js         # Punto de entrada
└── public/              # Archivos estáticos
```

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

> [!NOTE]
> Por favor, asegúrate de seguir las convenciones de código existentes y añadir tests para las nuevas características.

## 📄 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.

---

Desarrollado con ❤️ por [Tu Nombre](https://github.com/tu-usuario)
