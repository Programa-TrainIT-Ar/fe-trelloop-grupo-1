# 📋 Guía de Configuración del Frontend - Equipo QA

##  Información General

**Proyecto:** fe-trello (TrelLoop Frontend)
**Framework:** Next.js 15.3.4 con TypeScript
**Puerto por defecto:** 3000
**Versión de Node.js recomendada:** 18.x o superior

---

## Prerrequisitos del Sistema

Antes de comenzar, asegúrense de tener instalado:

- **Node.js** (versión 18.x o superior)
- **npm** (viene incluido con Node.js)
- **Git** (para clonar el repositorio)

### Verificar versiones instaladas:
```bash
node --version
npm --version
git --version
```

---

##  Instalación y Configuración

### Paso 1: Clonar el repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd fe-trelloop-grupo-1
```

### Paso 2: Instalar dependencias
```bash
npm install
```

⚠️ **Nota:** La instalación puede tardar varios minutos dependiendo de la velocidad de internet.

### Paso 3: Configuración del archivo .env

** IMPORTANTE:** Deben configurar el archivo `.env` para que el frontend se conecte correctamente al backend.

1. En la raíz del proyecto, localicen el archivo `.env`
2. Abran el archivo y configuren la siguiente variable:

```bash
NEXT_PUBLIC_API=http://localhost:5000/
```

**Notas importantes sobre el .env:**
- Si el backend corre en un puerto diferente, cambien el `5000` por el puerto correspondiente
- Si el backend está en otro servidor, cambien `localhost` por la IP o dominio correspondiente
- La variable **DEBE** terminar con `/` (barra diagonal)
- La variable **DEBE** comenzar con `NEXT_PUBLIC_` para ser accesible en el frontend

### Ejemplos de configuración según el entorno:

**Backend local (puerto 5000):**
```bash
NEXT_PUBLIC_API=http://localhost:5000/
```

**Backend local (puerto 8000):**
```bash
NEXT_PUBLIC_API=http://localhost:8000/
```

**Backend en servidor de desarrollo:**
```bash
NEXT_PUBLIC_API=http://192.168.1.100:5000/
```

**Backend en servidor de staging:**
```bash
NEXT_PUBLIC_API=https://api-staging.trelloop.com/
```

---

## Comandos Disponibles

### Modo Desarrollo (Para testing diario)
```bash
npm run dev
```
- Inicia el servidor de desarrollo
- El sitio estará disponible en: http://localhost:3000
- Los cambios se reflejan automáticamente (hot reload)
- **Usar este comando para testing de QA**

### Modo Producción (Para testing final)
```bash
npm run build
npm run start
```
- Construye la aplicación optimizada
- Inicia el servidor de producción
- Usar para testing de performance y comportamiento final

### Linting (Verificar calidad del código)
```bash
npm run lint
```
- Ejecuta verificaciones de calidad del código
- Reporta errores y warnings

---

## 📁 Estructura del Proyecto (Para referencia técnica)

```
fe-trelloop-grupo-1/
├── src/
│   ├── app/           # Páginas de la aplicación (Next.js App Router)
│   ├── components/    # Componentes reutilizables
│   ├── services/      # Servicios para comunicación con API
│   ├── store/         # Estado global (Zustand)
│   ├── lib/           # Utilidades y configuraciones
│   ├── styles/        # Estilos globales
│   └── assets/        # Recursos estáticos
├── public/            # Archivos públicos
├── .env               # Variables de entorno (CONFIGURAR AQUÍ)
├── package.json       # Dependencias y scripts
└── next.config.ts     # Configuración de Next.js
```

---

## 🔧 Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 15.3.4 | Framework React |
| React | 19.0.0 | Librería UI |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 3.4.17 | Framework CSS |
| Zustand | 5.0.6 | Manejo de estado |
| React Hook Form | 7.60.0 | Manejo de formularios |
| SweetAlert2 | 11.22.2 | Alertas y modales |
| FontAwesome | 6.7.2 | Iconografía |

---

## Flujo de Testing Recomendado

### 1. Verificar conexión con Backend
- Abrir Network Tab en DevTools
- Verificar que las llamadas a la API respondan correctamente
- URL base debe ser la configurada en `.env`

### 2. Funcionalidades principales a testear
- **Autenticación:** Login/Logout
- **Tableros:** Crear, editar, eliminar tableros
- **Tarjetas:** CRUD completo de tarjetas
- **Responsividad:** Desktop, tablet, mobile

### 3. Estados de la aplicación
- **Loading states:** Verificar spinners y estados de carga
- **Error states:** Probar con backend desconectado
- **Empty states:** Verificar cuando no hay datos

---

## Troubleshooting

### Error: "Cannot connect to API"
**Solución:**
1. Verificar que el backend esté corriendo
2. Revisar la configuración en `.env`
3. Verificar que no haya errores de CORS

### Error: "npm install fails"
**Solución:**
1. Limpiar caché: `npm cache clean --force`
2. Eliminar node_modules: `rm -rf node_modules`
3. Reinstalar: `npm install`

### Error: "Port 3000 is already in use"
**Solución:**
1. Cambiar puerto: `npm run dev -- -p 3001`
2. O matar proceso: `npx kill-port 3000`

### Página en blanco
**Solución:**
1. Revisar console de DevTools
2. Verificar que `.env` esté configurado correctamente
3. Reiniciar el servidor de desarrollo

---

## ✅ Checklist de Configuración

- [ ] Node.js instalado (v18+)
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` configurado con `NEXT_PUBLIC_API`
- [ ] Backend corriendo y accesible
- [ ] Frontend iniciado (`npm run dev`)
- [ ] Sitio accesible en http://localhost:3000
- [ ] Network tab muestra conexiones exitosas a la API
