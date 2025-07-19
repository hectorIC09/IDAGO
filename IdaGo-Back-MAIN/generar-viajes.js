const mysql = require('mysql');

// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'idago'
});

db.connect(err => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
    generarViajesIdaVueltaParaTodasLasRutas();
});

const generarViajesIdaVueltaParaTodasLasRutas = () => {
    db.query('SELECT id FROM rutas', (err, rutas) => {
        if (err) {
            console.error('Error al obtener las rutas:', err);
            return;
        }

        rutas.forEach(ruta => {
            generarViajesIdaVuelta(ruta.id);
        });

        db.end();
    });
};

const generarViajesIdaVuelta = (rutaId) => {
    const hoy = new Date();
    const dosMesesDespues = new Date();
    dosMesesDespues.setMonth(hoy.getMonth() + 2);

    const viajes = [];

    for (let fecha = new Date(hoy); fecha <= dosMesesDespues; fecha.setDate(fecha.getDate() + 1)) {
        // Viaje 1: 08:00 AM
        const fechaIda1 = new Date(fecha);
        fechaIda1.setHours(8, 0, 0, 0);
        const hora1 = '08:00:00';

        const fechaRegreso1 = new Date(fechaIda1);
        fechaRegreso1.setDate(fechaRegreso1.getDate() + 2);
        fechaRegreso1.setHours(18, 0, 0, 0); // 6:00 PM

        // Viaje 2: 04:00 PM
        const fechaIda2 = new Date(fecha);
        fechaIda2.setHours(16, 0, 0, 0);
        const hora2 = '16:00:00';

        const fechaRegreso2 = new Date(fechaIda2);
        fechaRegreso2.setDate(fechaRegreso2.getDate() + 2);
        fechaRegreso2.setHours(18, 0, 0, 0); // 6:00 PM

        viajes.push({
            ruta_id: rutaId,
            autobus_id: 1,
            fecha_ida: fechaIda1,
            fecha_regreso: fechaRegreso1,
            hora: hora1,
            precio: 600.00
        });

        viajes.push({
            ruta_id: rutaId,
            autobus_id: 1,
            fecha_ida: fechaIda2,
            fecha_regreso: fechaRegreso2,
            hora: hora2,
            precio: 600.00
        });
    }

    const sql = 'INSERT INTO viajes (ruta_id, autobus_id, fecha_ida, fecha_regreso, hora, precio) VALUES ?';
    const values = viajes.map(viaje => [
        viaje.ruta_id,
        viaje.autobus_id,
        viaje.fecha_ida,
        viaje.fecha_regreso,
        viaje.hora,
        viaje.precio
    ]);

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error('❌ Error al insertar viajes para la ruta', rutaId, ':', err);
        } else {
            console.log('✅ Viajes generados para la ruta', rutaId);
        }
    });
};
