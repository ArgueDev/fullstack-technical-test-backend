# Sistema de Reserva de Entradas — Backend

API REST desarrollada para un sistema de reserva de entradas para eventos como parte de una prueba técnica Fullstack.

El backend permite gestionar eventos, autenticar usuarios, realizar reservas y administrar la disponibilidad de entradas.

## Tecnologías

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- express-validator
- Docker
- Docker Compose
- pnpm

## Funcionalidades

### Eventos

- Listar eventos disponibles.
- Consultar el detalle de un evento.
- Crear eventos.
- Actualizar eventos.
- Eliminar eventos.
- Controlar la disponibilidad de entradas.
- Impedir la eliminación de eventos que tengan reservas asociadas.

### Autenticación

- Registro de usuarios.
- Inicio de sesión.
- Autenticación mediante JWT.
- Roles `user` y `admin`.
- Protección de rutas administrativas.

### Reservas

- Crear reservas para un evento.
- Validar la cantidad de entradas disponibles.
- Actualizar la disponibilidad del evento de forma atómica.
- Evitar reservas cuando no existen entradas suficientes.
- Consultar las reservas del usuario autenticado.

## Arquitectura

El backend utiliza una arquitectura por capas:

```text
Routes
  ↓
Middlewares
  ↓
Controllers
  ↓
Services
  ↓
Models
  ↓
MongoDB
```

Estructura principal:

```text
src/
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── types/
├── utils/
├── app.ts
└── server.ts
```

Esta separación permite mantener independientes las responsabilidades relacionadas con HTTP, lógica de negocio, seguridad y persistencia.

## Endpoints principales

### Autenticación

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| POST | `/auth/register` | Registrar usuario | Público |
| POST | `/auth/login` | Iniciar sesión | Público |

### Eventos

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| GET | `/events` | Listar eventos | Público |
| GET | `/events/:id` | Obtener evento | Público |
| POST | `/events` | Crear evento | Admin |
| PUT | `/events/:id` | Actualizar evento | Público |
| DELETE | `/events/:id` | Eliminar evento | Admin |

Un evento que tenga reservas asociadas no puede ser eliminado. En este caso la API responde con `409 Conflict`.

### Reservas

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| POST | `/reservations` | Crear reserva | Autenticado |
| GET | `/reservations/me` | Obtener mis reservas | Autenticado |

La identidad del usuario se obtiene de `req.user`, establecido por el middleware a partir del JWT y del usuario almacenado, no desde un `userId` enviado por el cliente.

`GET /reservations/me` devuelve un array ordenado por `createdAt` descendente (y `_id` como desempate), con `id`, `quantity`, `createdAt` y `eventId` poblado con `id`, `name`, `date` y `location`. Sin reservas devuelve `[]`; una referencia a un evento inexistente se representa como `eventId: null`. Las fechas de evento se serializan como `YYYY-MM-DD`.

## Variables de entorno

Crear un archivo `.env` tomando como referencia `.env.example`.

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ticket-reservation?replicaSet=rs0&directConnection=true
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_secure_secret
```

El archivo `.env` no debe subirse al repositorio.

## Ejecución local

Instalar dependencias:

```bash
pnpm install
```

Ejecutar el servidor:

```bash
pnpm dev
```

La API estará disponible en:

```text
http://localhost:3000
```

Para la ejecución local, MongoDB debe ser un replica set inicializado (o un clúster compatible con transacciones), no una instancia standalone: tanto crear reservas como eliminar eventos utilizan transacciones. El ejemplo anterior presupone un replica set `rs0` accesible en localhost. Ajusta `MONGODB_URI` a tu entorno; `.env.example` contiene una URI de ejemplo que debe revisarse. Docker Compose configura el replica set automáticamente.

Antes de `pnpm dev`, copia `.env.example` a `.env` y configura las variables. `FRONTEND_URL` define el origen permitido por CORS; `PORT` usa 3000 por defecto y `JWT_SECRET` debe reemplazarse por un valor propio, nunca el texto de ejemplo.

## Ejecución completa con Docker

La forma recomendada de ejecutar el proyecto completo es mediante Docker Compose.

El `compose.yaml` del backend levanta:

- MongoDB.
- Inicialización del Replica Set.
- Backend.
- Frontend.

### Estructura de directorios

Los repositorios de frontend y backend deben encontrarse como carpetas hermanas:

```text
project/
├── fullstack-technical-test-backend/
└── fullstack-technical-test-frontend/
```

Desde el backend:

```bash
cp .env.example .env
```

Configurar un `JWT_SECRET` válido y ejecutar:

```bash
docker compose up --build
```

Una vez iniciado:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3000
MongoDB:  localhost:27017
```

Para ejecutar los contenedores en segundo plano:

```bash
docker compose up --build -d
```

Para detenerlos:

```bash
docker compose down
```

Los datos de MongoDB se mantienen mediante un volumen de Docker.

Para detener los servicios y eliminar también el volumen:

```bash
docker compose down -v
```

> Este último comando elimina los datos almacenados en MongoDB.

## MongoDB y transacciones

MongoDB se ejecuta como un Replica Set de un nodo (`rs0`).

Esto permite utilizar transacciones durante la creación de reservas y la eliminación de eventos. La eliminación comprueba la existencia del evento y de reservas asociadas mediante `exists`, y elimina únicamente si no encuentra reservas, dentro de la misma sesión transaccional.

El proceso de reserva realiza la actualización de entradas disponibles y la creación de la reserva dentro de una transacción:

```text
Solicitud de reserva
        ↓
Validar y disminuir entradas
        ↓
Crear reserva
        ↓
Confirmar transacción
```

Si alguna operación falla, la transacción se revierte.

Además, la actualización de disponibilidad se realiza de forma atómica para evitar inconsistencias ante reservas concurrentes.

## Acceso de administrador

Los usuarios registrados públicamente reciben el rol `user`.

Para probar las funcionalidades administrativas se puede cambiar manualmente un usuario a `admin` en MongoDB.

Utilizando Docker:

```bash
docker exec -it ticket-reservation-mongodb mongosh ticket-reservation
```

Luego:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Reemplazar el correo por el usuario registrado.

Después del cambio se debe cerrar sesión e iniciar nuevamente para obtener una nueva sesión con el rol actualizado.

## Manejo de errores

La API utiliza códigos HTTP apropiados según cada situación:

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `500 Internal Server Error`

Las validaciones, autenticación y autorización se encuentran separadas mediante middlewares.

## Pruebas

Las pruebas están en `test/*.test.ts`. `pnpm test` ejecuta `node --import tsx --test test/*.test.ts`. La suite contiene 18 tests: bcrypt, JWT, validación inicial de reservas, protección de eliminación, filtros por usuario y serialización. Las consultas/transacciones de los tests de servicios se simulan con mocks; no son pruebas de concurrencia ni de integración contra MongoDB real.

```bash
pnpm test
```

## Build de producción

Generar el proyecto compilado:

```bash
pnpm build
```

Ejecutar la versión compilada:

```bash
pnpm start
```

## Imagen de producción

El Dockerfile utiliza dos etapas con `node:22-bookworm-slim` y Corepack. Instala con pnpm y `--frozen-lockfile`; el builder compila TypeScript a `dist/`. La etapa final instala solo dependencias de producción, copia `dist/`, expone 3000 y ejecuta `pnpm start`. `.dockerignore` excluye `.env`, `node_modules`, `dist` y `.git`.

El Compose usa `mongo:7.0`, healthcheck, `mongo-init` y el volumen `mongodb_data`. El backend espera que la inicialización termine con código 0. El frontend se construye desde `../fullstack-technical-test-frontend` y publica `5173:80`.

`VITE_API_URL=http://localhost:3000` se incorpora en el build del frontend porque las peticiones salen del navegador. El backend se conecta internamente a `mongodb:27017`. Compose toma `JWT_SECRET` del `.env` local y mantiene `FRONTEND_URL` configurable, con `http://localhost:5173` por defecto.

## Arquitectura con Docker

```text
Navegador
    │
    ▼
Frontend
React + Nginx
    │
    │ HTTP / JSON
    ▼
Backend
Node.js + Express
    │
    │ Mongoose
    ▼
MongoDB
Replica Set rs0
```

## Seguridad

Se implementaron las siguientes medidas:

- Contraseñas almacenadas mediante bcrypt.
- Autenticación mediante JWT.
- Protección de rutas privadas.
- Autorización por roles.
- Identidad de las reservas obtenida desde el usuario autenticado.
- Variables sensibles mediante variables de entorno.
- `.env` excluido del repositorio.
- CORS limitado al origen configurado del frontend.

## Gestor de paquetes

El proyecto utiliza exclusivamente pnpm.

```bash
pnpm install
```
