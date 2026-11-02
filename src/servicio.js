// Reglas de negocio. No sabe de HTTP (req/res) ni de SQL.
const { ErrorApi } = require('./errores');
const { validarReserva, interpretarId } = require('./validacion');
const repo = require('./repositorio');
const eventos = require('./eventos');
const { generarCsv } = require('./csv');

const ESTADOS = ['activa', 'cancelada'];

function exigirId(texto) {
  const id = interpretarId(texto);
  if (id === null) {
    throw new ErrorApi(400, 'ID_INVALIDO', 'El id debe ser un número entero positivo');
  }
  return id;
}

function exigirReserva(id) {
  const reserva = repo.buscarReserva(id);
  if (!reserva) {
    throw new ErrorApi(404, 'RESERVA_NO_ENCONTRADA', `No existe la reserva ${id}`);
  }
  return reserva;
}

function exigirDatosValidos(datos) {
  const { errores, reserva } = validarReserva(datos);
  if (errores.length > 0) {
    throw new ErrorApi(400, 'VALIDACION', 'Los datos enviados no son válidos', errores);
  }
  return reserva;
}

// idActual = 0 al crear (no excluye ninguna reserva)
function exigirDisponible(reserva, idActual) {
  if (!repo.habitacionExiste(reserva.habitacion)) {
    throw new ErrorApi(404, 'HABITACION_NO_ENCONTRADA',
      `La habitación ${reserva.habitacion} no existe`);
  }
  const conflicto = repo.buscarConflicto(
    reserva.habitacion, reserva.fecha_entrada, reserva.fecha_salida, idActual
  );
  if (conflicto) {
    throw new ErrorApi(409, 'CONFLICTO_RESERVA',
      `La habitación ${reserva.habitacion} ya está reservada en esas fechas`,
      [`Reserva en conflicto: id ${conflicto.id}`]);
  }
}

function listarHabitaciones() {
  return repo.listarHabitaciones();
}

function listarReservas({ habitacion, estado }) {
  const detalles = [];
  if (habitacion !== undefined && typeof habitacion !== 'string') {
    detalles.push('habitacion debe ser un solo valor');
  }
  if (estado !== undefined && !ESTADOS.includes(estado)) {
    detalles.push('estado debe ser "activa" o "cancelada"');
  }
  if (detalles.length > 0) {
    throw new ErrorApi(400, 'VALIDACION', 'Parámetros inválidos', detalles);
  }
  return repo.listarReservas({ habitacion, estado });
}

// Reutiliza listarReservas, así acepta los mismos filtros y validaciones
function exportarReservasCsv(filtros) {
  return generarCsv(listarReservas(filtros));
}

function obtenerReserva(idTexto) {
  return exigirReserva(exigirId(idTexto));
}

// better-sqlite3 es síncrono: entre comprobar y guardar nadie más puede intervenir
function crearReserva(datos) {
  const reserva = exigirDatosValidos(datos);
  exigirDisponible(reserva, 0);
  const creada = repo.insertarReserva(reserva);
  eventos.emit('reserva:creada', creada);
  return creada;
}

function reemplazarReserva(idTexto, datos) {
  const id = exigirId(idTexto);
  const existente = exigirReserva(id);
  if (existente.estado === 'cancelada') {
    throw new ErrorApi(409, 'RESERVA_CANCELADA', 'No se puede modificar una reserva cancelada');
  }
  const reserva = exigirDatosValidos(datos);
  exigirDisponible(reserva, id); // excluye la propia reserva para que no choque consigo misma
  const modificada = repo.actualizarReserva(id, reserva);
  eventos.emit('reserva:modificada', modificada);
  return modificada;
}

function cancelarReserva(idTexto) {
  const id = exigirId(idTexto);
  const existente = exigirReserva(id);
  if (existente.estado === 'cancelada') {
    throw new ErrorApi(409, 'RESERVA_CANCELADA', 'La reserva ya estaba cancelada');
  }
  const cancelada = repo.cancelarReserva(id);
  eventos.emit('reserva:cancelada', cancelada);
  return cancelada;
}

module.exports = {
  listarHabitaciones, listarReservas, exportarReservasCsv, obtenerReserva,
  crearReserva, reemplazarReserva, cancelarReserva
};