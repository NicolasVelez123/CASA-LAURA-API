// Capa HTTP: lee la petición, llama al servicio y responde. Sin reglas de negocio.
const express = require('express');
const servicio = require('./servicio');

const router = express.Router();

router.get('/habitaciones', (req, res) => {
  res.json(servicio.listarHabitaciones());
});

router.post('/reservas', (req, res) => {
  const creada = servicio.crearReserva(req.body);
  res.status(201).location(`/api/reservas/${creada.id}`).json(creada);
});

router.get('/reservas', (req, res) => {
  res.json(servicio.listarReservas(req.query));
});

// IMPORTANTE: va antes de /reservas/:id para que "exportar" no se tome como un id
router.get('/reservas/exportar', (req, res) => {
  const csv = servicio.exportarReservasCsv(req.query);
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="reservas-casa-laura.csv"'
  });
  res.send(csv);
});

router.get('/reservas/:id', (req, res) => {
  res.json(servicio.obtenerReserva(req.params.id));
});

router.put('/reservas/:id', (req, res) => {
  res.json(servicio.reemplazarReserva(req.params.id, req.body));
});

router.delete('/reservas/:id', (req, res) => {
  res.json(servicio.cancelarReserva(req.params.id));
});

module.exports = router;