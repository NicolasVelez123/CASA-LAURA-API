const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const eventos = require('./src/eventos');

const PORT = 3000;

const servidor = http.createServer(app);
const io = new Server(servidor);

io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);
  socket.on('disconnect', () => console.log(`Cliente desconectado: ${socket.id}`));
});

// Cada evento interno del servicio se reenvía a todos los clientes conectados
['reserva:creada', 'reserva:modificada', 'reserva:cancelada'].forEach((nombre) => {
  eventos.on(nombre, (reserva) => io.emit(nombre, reserva));
});

servidor.listen(PORT, () => {
  console.log(`Servidor de Casa Laura corriendo con éxito en http://localhost:${PORT}`);
  console.log('Rutas disponibles:');
  console.log('  GET    /api/habitaciones');
  console.log('  POST   /api/reservas');
  console.log('  GET    /api/reservas   (filtros: ?habitacion=101&estado=activa)');
  console.log('  GET    /api/reservas/exportar  (CSV; acepta los mismos filtros)');
  console.log('  GET    /api/reservas/:id');
  console.log('  PUT    /api/reservas/:id');
  console.log('  DELETE /api/reservas/:id  (cancela)');
  console.log(`Panel en tiempo real: http://localhost:${PORT}/panel/`);
});