// Función pura: convierte una lista de reservas en texto CSV.
// No toca la base de datos ni HTTP.

const SEPARADOR = ';'; // Excel en español espera ';'. Cámbialo a ',' si lo necesitas
const COLUMNAS = ['id', 'habitacion', 'huesped', 'fecha_entrada', 'fecha_salida', 'estado', 'creada_en'];

function escaparCelda(valor) {
  let texto = String(valor ?? '');

  // Anti inyección de fórmulas: Excel ejecuta celdas que empiecen con = + - @ tab o CR
  if (/^[=+\-@\t\r]/.test(texto)) {
    texto = "'" + texto;
  }

  // Si contiene separador, comillas o saltos de línea, va entre comillas
  // y las comillas internas se duplican
  if (texto.includes(SEPARADOR) || /["\n\r]/.test(texto)) {
    texto = '"' + texto.replace(/"/g, '""') + '"';
  }
  return texto;
}

function generarCsv(reservas) {
  const encabezado = COLUMNAS.join(SEPARADOR);
  const filas = reservas.map((r) =>
    COLUMNAS.map((columna) => escaparCelda(r[columna])).join(SEPARADOR)
  );
  // \uFEFF (BOM) hace que Excel lea el archivo como UTF-8 y respete tildes y ñ
  return '\uFEFF' + [encabezado, ...filas].join('\r\n') + '\r\n';
}

module.exports = { generarCsv, escaparCelda };