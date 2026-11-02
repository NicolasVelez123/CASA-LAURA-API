// Error propio de la API: lleva el código HTTP y un código legible
class ErrorApi extends Error {
  constructor(status, codigo, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

// Se ejecuta cuando ninguna ruta coincidió
function rutaNoEncontrada(req, res, next) {
  next(new ErrorApi(404, 'RUTA_NO_ENCONTRADA', `No existe ${req.method} ${req.originalUrl}`));
}

// Único punto donde un error se convierte en respuesta HTTP
function manejadorErrores(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    err = new ErrorApi(400, 'JSON_INVALIDO', 'El cuerpo de la petición no es un JSON válido');
  }
  if (!(err instanceof ErrorApi)) {
    console.error(err);
    err = new ErrorApi(500, 'ERROR_INTERNO', 'Ocurrió un error inesperado en el servidor');
  }
  const cuerpo = { error: { codigo: err.codigo, mensaje: err.message } };
  if (err.detalles) cuerpo.error.detalles = err.detalles;
  res.status(err.status).json(cuerpo);
}

module.exports = { ErrorApi, rutaNoEncontrada, manejadorErrores };