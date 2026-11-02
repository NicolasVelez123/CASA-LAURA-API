//hacemos que nuestra base de datos funcione con sqlite3 para prevencion de ciertas cosas como SQLinjectionn
const Database = require('better-sqlite3');

// Crea (o abre) el archivo de base de datos
const db = new Database('casalaura.db');

// Activa la verificación de llaves foráneas
db.pragma('foreign_keys = ON');

// Tablas: se crean solo si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS habitaciones (
    numero TEXT PRIMARY KEY,
    tipo   TEXT NOT NULL CHECK (tipo IN ('Simple','Doble','Familiar','Matrimonial'))
  );

  CREATE TABLE IF NOT EXISTS reservas (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    habitacion    TEXT NOT NULL REFERENCES habitaciones(numero),
    huesped       TEXT NOT NULL,
    fecha_entrada TEXT NOT NULL,
    fecha_salida  TEXT NOT NULL,
    estado        TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa','cancelada')),
    creada_en     TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Datos iniciales: solo si la tabla está vacía
const total = db.prepare('SELECT COUNT(*) AS n FROM habitaciones').get().n;
if (total === 0) {
  const insertar = db.prepare('INSERT INTO habitaciones (numero, tipo) VALUES (?, ?)');
  const semilla = [
    ['101', 'Doble'], ['102', 'Simple'], ['103', 'Simple'], ['104', 'Familiar'],
    ['105', 'Matrimonial'], ['201', 'Simple'], ['202', 'Simple'], ['203', 'Familiar'],
    ['204', 'Matrimonial'], ['301', 'Matrimonial'], ['302', 'Matrimonial'], ['303', 'Familiar']
  ];
  // Una transacción: o se insertan todas o ninguna
  db.transaction(() => semilla.forEach(h => insertar.run(...h)))();
}

module.exports = db;