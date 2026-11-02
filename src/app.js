const path = require('path');
const express = require('express');
const rutas = require('./rutas');
const { rutaNoEncontrada, manejadorErrores } = require('./errores');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: "¡Bienvenido a la API de Hotel Casa Laura (Cuenca)!" });
});

// Panel de demostración del tiempo real
app.use('/panel', express.static(path.join(__dirname, '..', 'public')));

app.use('/api', rutas);

// Siempre al final: primero "ruta no encontrada", luego el manejador de errores
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

module.exports = app;