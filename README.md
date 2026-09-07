# Ticket Reservation System - Backend

Backend desarrollado para la prueba técnica de **Fullstack Software Developer**.

La aplicación proporciona una API REST para gestionar eventos, autenticación de usuarios y reservas de tickets, utilizando Node.js, Express, TypeScript y MongoDB.

## Tecnologías

- Node.js
- Express
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

- Listar todos los eventos disponibles.
- Obtener los detalles de un evento por ID.
- Crear eventos.
- Actualizar eventos.
- Eliminar eventos.
- Controlar la disponibilidad de tickets.

### Autenticación

- Registro de usuarios.
- Inicio de sesión.
- Autenticación mediante JWT.
- Manejo de roles `user` y `admin`.

Los usuarios registrados mediante la API son creados con rol `user`.

### Reservas

- Crear reservas para eventos.
- Validar la cantidad de tickets solicitados.
- Validar la disponibilidad antes de realizar una reserva.
- Obtener la identidad del usuario desde el token JWT.
- Reducir automáticamente los tickets disponibles.
- Utilizar transacciones de MongoDB para mantener la consistencia entre la reserva y la disponibilidad del evento.
- Evitar sobreventa mediante actualización atómica de tickets.

## Estructura del proyecto

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

test/
├── auth.test.ts
├── jwt.test.ts
└── reservation.service.test.ts
```

El proyecto utiliza una separación de responsabilidades basada en rutas, controladores, servicios, modelos y middlewares.

## Requisitos

### Ejecución local

- Node.js
- pnpm
- MongoDB

### Ejecución con contenedores

- Docker
- Docker Compose

## Variables de entorno

Crear un archivo `.env` tomando como referencia `.env.example`.

```env
PORT=3000
MONGODB_URI=
FRONTEND_URL=http://localhost:5173
JWT_SECRET=
```

Las credenciales y secretos reales no deben almacenarse en el repositorio.

## Instalación local

Instalar las dependencias:

```bash
pnpm install
```

Ejecutar el proyecto en modo desarrollo:

```bash
pnpm dev
```

El backend estará disponible en:

```text
http://localhost:3000
```

## Compilar el proyecto

Generar el build de producción:

```bash
pnpm build
```

Ejecutar la versión compilada:

```bash
pnpm start
```

## Ejecución con Docker

El backend puede ejecutarse junto con MongoDB utilizando Docker Compose.

El proyecto incluye:

- Dockerfile para el backend.
- Contenedor de MongoDB.
- Replica set de MongoDB inicializado automáticamente.
- Docker Compose para levantar el entorno requerido por el backend.

Crear previamente un archivo `.env` con las variables necesarias. Para Docker se requiere al menos:

```env
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

Levantar los servicios:

```bash
docker compose up --build
```

Los servicios estarán disponibles en:

```text
Backend -> http://localhost:3000
MongoDB -> localhost:27017
```

El servicio `mongo-init` inicializa automáticamente el replica set requerido para utilizar transacciones de MongoDB.

No es necesario configurar el replica set manualmente.

Para detener los servicios:

```bash
docker compose down
```

Para detener los servicios y eliminar también el volumen local de MongoDB:

```bash
docker compose down -v
```

> `docker compose down -v` elimina los datos almacenados en el volumen local de MongoDB.

## API

La URL base durante el desarrollo local es:

```text
http://localhost:3000
```

### Autenticación

#### Registrar usuario

```http
POST /auth/register
```

Ejemplo:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Los usuarios registrados públicamente reciben el rol `user`.

#### Iniciar sesión

```http
POST /auth/login
```

Ejemplo:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

La autenticación devuelve un token JWT.

Para acceder a endpoints protegidos se debe enviar:

```http
Authorization: Bearer <token>
```

---

### Eventos

#### Listar eventos

```http
GET /events
```

#### Obtener evento por ID

```http
GET /events/:id
```

#### Crear evento

```http
POST /events
```

Requiere autenticación y rol `admin`.

Ejemplo:

```json
{
  "name": "Tech Conference",
  "date": "2026-09-20",
  "location": "Guayaquil",
  "availableTickets": 100
}
```

#### Actualizar evento

```http
PUT /events/:id
```

#### Eliminar evento

```http
DELETE /events/:id
```

Requiere autenticación y rol `admin`.

---

### Reservas

#### Crear reserva

```http
POST /reservations
```

Requiere autenticación mediante JWT.

Ejemplo:

```json
{
  "eventId": "EVENT_ID",
  "quantity": 2
}
```

El `userId` no se recibe desde el cuerpo de la petición. Se obtiene directamente del usuario autenticado mediante el token JWT.

Si el evento no dispone de suficientes tickets, la operación es rechazada y la reserva no se crea.

## Consistencia y concurrencia en reservas

La creación de una reserva utiliza una transacción de MongoDB para mantener sincronizada la creación de la reserva con la actualización de tickets disponibles.

La disponibilidad se modifica mediante una operación atómica que comprueba que existan suficientes tickets antes de realizar el decremento.

De esta manera se evita que solicitudes concurrentes puedan generar una sobreventa de tickets.

MongoDB se ejecuta como replica set dentro del entorno Docker debido a que las transacciones requieren esta configuración.

## Autenticación y roles

El sistema dispone de dos roles:

```text
user
admin
```

El registro público crea únicamente usuarios con rol:

```text
user
```

Las operaciones administrativas de eventos requieren un usuario con rol `admin`.

Para pruebas durante el desarrollo, el rol de un usuario puede modificarse directamente en MongoDB.

## Tests

El proyecto incluye tests unitarios utilizando el runner nativo de Node.js y `tsx` para ejecutar TypeScript.

Ejecutar:

```bash
pnpm test
```

Actualmente existen **11 tests unitarios** que cubren:

- Hash de contraseñas.
- Validación de contraseñas correctas e incorrectas.
- Generación de JWT.
- Verificación de JWT.
- Recuperación de `userId` y roles desde el token.
- Validación de firma JWT.
- Manejo de ausencia de `JWT_SECRET`.
- Validaciones principales de las reservas.
- Validación de identificadores de eventos.
- Validación de cantidades de tickets inválidas.

Los tests unitarios no requieren MongoDB ni Docker para ejecutarse.

## Scripts disponibles

```bash
pnpm dev
pnpm build
pnpm start
pnpm test
```

| Script | Descripción |
| --- | --- |
| `pnpm dev` | Ejecuta el backend en modo desarrollo |
| `pnpm build` | Compila TypeScript |
| `pnpm start` | Ejecuta la versión compilada |
| `pnpm test` | Ejecuta los tests unitarios |

## Consideraciones técnicas

- TypeScript está configurado en modo estricto.
- Las contraseñas se almacenan utilizando bcrypt.
- JWT se utiliza para autenticar endpoints protegidos.
- Los permisos administrativos se validan mediante roles.
- El `userId` de una reserva se obtiene desde el usuario autenticado y no desde datos enviados por el cliente.
- Las entradas de la API son validadas antes de procesarse.
- Las reservas utilizan transacciones de MongoDB.
- La disponibilidad de tickets utiliza actualizaciones atómicas para prevenir sobreventa.
- MongoDB utiliza un replica set para permitir transacciones.
- Las variables sensibles se administran mediante variables de entorno.
- El entorno Docker inicializa automáticamente la configuración necesaria de MongoDB.

## Validación del proyecto

Durante el desarrollo el backend fue validado mediante:

- Pruebas manuales de los endpoints.
- Pruebas de autenticación y autorización.
- Pruebas de creación de reservas.
- Pruebas de disponibilidad de tickets.
- Pruebas de concurrencia en reservas.
- 11 tests unitarios automatizados.
- Compilación de TypeScript.
- Ejecución completa mediante Docker Compose.

## Autor

**Christian Arguello**

Prueba técnica - Fullstack Software Developer