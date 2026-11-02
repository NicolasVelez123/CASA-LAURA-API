Casa Laura API

API REST para gestionar las reservas del Hotel Casa Laura (Cuenca), hecha con Node.js, Express, SQLite y Socket.IO.

Proyecto de Aplicaciones Web, Unidad 2, Universidad Politécnica Salesiana.
Autor: Nicolás Vélez Álvarez

Qué hace

- Crea, consulta, modifica y cancela reservas de las 12 habitaciones del hotel.
- Valida los datos y evita reservas con fechas que se cruzan (error 409).
- Guarda todo en una base de datos SQLite.
- Avisa en tiempo real cuando una reserva cambia (Socket.IO).
- Exporta las reservas a un archivo CSV.

Cómo ejecutarlo

Requisito: Node.js 18 o superior.

```bash
npm install
npm start
```

El servidor queda en http://localhost:3000. La base de datos `casalaura.db` se crea sola la primera vez.

Rutas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/habitaciones` | Lista las habitaciones |
| POST | `/api/reservas` | Crea una reserva |
| GET | `/api/reservas` | Lista reservas (filtros: `?habitacion=101&estado=activa`) |
| GET | `/api/reservas/exportar` | Descarga el CSV |
| GET | `/api/reservas/:id` | Consulta una reserva |
| PUT | `/api/reservas/:id` | Modifica una reserva |
| DELETE | `/api/reservas/:id` | Cancela una reserva |
