// Único archivo que conoce SQL. Todas las consultas son parametrizadas (?)
const db = require('../db');

const consultas = {
  todasHabitaciones: db.prepare('SELECT numero, tipo FROM habitaciones ORDER BY numero'),
  habitacionExiste: db.prepare('SELECT 1 FROM habitaciones WHERE numero = ?'),
  reservaPorId: db.prepare('SELECT * FROM reservas WHERE id = ?'),
  // Reserva activa de la misma habitación cuyas fechas se crucen (excluye idExcluido)
  conflicto: db.prepare(`
    SELECT id FROM reservas
    WHERE habitacion = ? AND estado = 'activa' AND id != ?
      AND fecha_entrada < ? AND fecha_salida > ?
  `),
  insertar: db.prepare(`
    INSERT INTO reservas (habitacion, huesped, fecha_entrada, fecha_salida)
    VALUES (?, ?, ?, ?)
  `),
  actualizar: db.prepare(`
    UPDATE reservas
    SET habitacion = ?, huesped = ?, fecha_entrada = ?, fecha_salida = ?
    WHERE id = ?
  `),
  cancelar: db.prepare("UPDATE reservas SET estado = 'cancelada' WHERE id = ?")
};

function listarHabitaciones() {
  return consultas.todasHabitaciones.all();
}

function habitacionExiste(numero) {
  return consultas.habitacionExiste.get(numero) !== undefined;
}

function buscarReserva(id) {
  return consultas.reservaPorId.get(id); // undefined si no existe
}

function buscarConflicto(habitacion, entrada, salida, idExcluido) {
  return consultas.conflicto.get(habitacion, idExcluido, salida, entrada);
}

function listarReservas({ habitacion, estado }) {
  const condiciones = [];
  const valores = [];
  if (habitacion) { condiciones.push('habitacion = ?'); valores.push(habitacion); }
  if (estado)     { condiciones.push('estado = ?');     valores.push(estado); }
  const where = condiciones.length ? 'WHERE ' + condiciones.join(' AND ') : '';
  return db
    .prepare(`SELECT * FROM reservas ${where} ORDER BY fecha_entrada, id`)
    .all(...valores);
}

function insertarReserva(r) {
  const info = consultas.insertar.run(r.habitacion, r.huesped, r.fecha_entrada, r.fecha_salida);
  return buscarReserva(info.lastInsertRowid);
}

function actualizarReserva(id, r) {
  consultas.actualizar.run(r.habitacion, r.huesped, r.fecha_entrada, r.fecha_salida, id);
  return buscarReserva(id);
}

function cancelarReserva(id) {
  consultas.cancelar.run(id);
  return buscarReserva(id);
}

module.exports = {
  listarHabitaciones, habitacionExiste, buscarReserva, buscarConflicto,
  listarReservas, insertarReserva, actualizarReserva, cancelarReserva
};