// Funciones puras: reciben datos y devuelven un resultado, sin base de datos ni HTTP

function esFechaValida(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(texto + 'T00:00:00Z');
  // Comparamos de vuelta para rechazar fechas imposibles como 2026-02-31
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto;
}

function validarReserva(datos) {
  const d = datos && typeof datos === 'object' ? datos : {};
  const errores = [];

  if (typeof d.habitacion !== 'string' || d.habitacion.trim() === '') {
    errores.push('habitacion es obligatoria (ejemplo: "101")');
  }
  if (typeof d.huesped !== 'string' || d.huesped.trim().length < 3) {
    errores.push('huesped es obligatorio (mínimo 3 caracteres)');
  }
  if (!esFechaValida(d.fecha_entrada)) {
    errores.push('fecha_entrada debe tener formato AAAA-MM-DD y ser una fecha real');
  }
  if (!esFechaValida(d.fecha_salida)) {
    errores.push('fecha_salida debe tener formato AAAA-MM-DD y ser una fecha real');
  }
  if (esFechaValida(d.fecha_entrada) && esFechaValida(d.fecha_salida)
      && d.fecha_salida <= d.fecha_entrada) {
    errores.push('fecha_salida debe ser posterior a fecha_entrada');
  }

  // Devolvemos un objeto nuevo y limpio; no modificamos el original
  const reserva = errores.length === 0 ? {
    habitacion: d.habitacion.trim(),
    huesped: d.huesped.trim(),
    fecha_entrada: d.fecha_entrada,
    fecha_salida: d.fecha_salida
  } : null;

  return { errores, reserva };
}

function interpretarId(texto) {
  const n = Number(texto);
  return Number.isInteger(n) && n > 0 ? n : null;
}

module.exports = { esFechaValida, validarReserva, interpretarId };