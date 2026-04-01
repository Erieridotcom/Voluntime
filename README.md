# VoluntaRed — Plataforma de Voluntariado Juvenil

VoluntaRed conecta a jóvenes voluntarios con organizaciones sociales en México mediante un sistema inteligente de matching, seguimiento de horas, insignias de logros y un foro comunitario.

---

## Requisitos (instalar una sola vez)

**Windows:**
1. [Node.js LTS](https://nodejs.org/) — marcar "Add to PATH" durante la instalación
2. pnpm — abrir PowerShell y ejecutar: `npm install -g pnpm`
3. [Python 3.11+](https://www.python.org/downloads/) — marcar **"Add Python to PATH"** durante la instalación

**Mac:**
1. Homebrew — pegar en Terminal:
   `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
2. Node.js y Python — ejecutar en Terminal:
   `brew install node python && npm install -g pnpm`

---

## Cómo ejecutar el proyecto

### Desde VS Code (recomendado)

1. Abrir la carpeta del proyecto en VS Code (**File → Open Folder**)
2. Abrir la paleta de comandos con `Ctrl+Shift+P` (Windows) o `Cmd+Shift+P` (Mac)
3. Escribir **"Run Task"** y presionar Enter
4. La primera vez: seleccionar **"1. Instalar dependencias"** y esperar a que termine
5. Repetir los pasos 2 y 3, luego seleccionar **"Iniciar VoluntaRed"**
6. Se abren dos terminales integradas (backend y frontend)
7. Abrir el navegador en **http://localhost:5173**

> A partir de la segunda vez, omitir el paso 4 e ir directo a "Iniciar VoluntaRed".

---

## Cuentas de prueba

Las siguientes cuentas se crean automáticamente la primera vez que se inicia la app.

**Organizaciones** (contraseña: `password123`)
| Email | Organización | Categoría |
|---|---|---|
| `greenwave@org.mx` | GreenWave Mexico | Medio Ambiente |
| `educatodos@org.mx` | EducaTodos AC | Educación |
| `salud4all@org.mx` | Salud Para Todos | Salud |
| `artecomunidad@org.mx` | Arte Comunidad MX | Arte y Cultura |
| `patitas@org.mx` | Patitas Felices AC | Animales |

Para crear una cuenta de voluntario, ir a `/registro` en la aplicación.

---

## Funcionalidades

- **Matching inteligente** — compatibilidad de 0 a 100 pts basada en habilidades, intereses, accesibilidad y ubicación
- **Exploración de oportunidades** — filtros por estado, ciudad, categoría, esfuerzo y accesibilidad
- **Perfil de voluntario** — insignias automáticas y acumulación de horas
- **Panel de organización** — gestión de postulantes y dashboard con gráficas
- **Foro comunitario** — publicaciones de voluntarios y organizaciones

---

## Páginas

| Ruta | Descripción |
|---|---|
| `/` | Inicio |
| `/oportunidades` | Explorar oportunidades con filtros |
| `/mis-recomendaciones` | Matching personalizado |
| `/mis-postulaciones` | Seguimiento de postulaciones |
| `/perfil` | Perfil e insignias |
| `/publicar` | Publicar oportunidad (organizaciones) |
| `/dashboard` | Dashboard con estadísticas (organizaciones) |
| `/foro` | Foro comunitario |

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Python 3.11 + FastAPI + SQLAlchemy |
| Base de datos | SQLite (local, sin configuración) |
| Frontend | React + Vite + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Gráficas | Recharts |
| Animaciones | Framer Motion |

---

## Estructura del proyecto

```
voluntariado/
├── backend/                  # API en Python (FastAPI)
│   ├── main.py               # Punto de entrada
│   ├── models.py             # Modelos de base de datos
│   ├── database.py           # Conexión SQLite automática
│   ├── matching.py           # Algoritmo de compatibilidad
│   ├── requirements.txt      # Dependencias Python
│   └── routes/               # Rutas de la API
├── artifacts/
│   └── voluntariado/         # Frontend React + Vite
│       └── src/
│           ├── pages/        # Páginas de la aplicación
│           └── components/   # Componentes reutilizables
└── .vscode/
    └── tasks.json            # Tareas de VS Code para arrancar el proyecto
```
