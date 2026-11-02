// Canal interno de eventos de la aplicación.
// El servicio publica aquí; quien quiera enterarse se suscribe.
const { EventEmitter } = require('events');

module.exports = new EventEmitter();