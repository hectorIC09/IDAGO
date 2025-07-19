const mysql = require('mysql');

// Conexión
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'idago'
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado a MySQL');
    generarViajesConEscala();
});

const generarViajesConEscala = () => {
    db.query('SELECT * FROM rutas', (err, rutas) => {
        if (err) throw err;

        rutas.forEach(ruta => {
            const hoy = new Date();
            const fechaIda = new Date(hoy);
            fechaIda.setHours(7, 0, 0, 0); // salida a las 7:00

            const fechaRegreso = new Date(fechaIda);
            fechaRegreso.setDate(fechaRegreso.getDate() + 2);
            fechaRegreso.setHours(18, 0, 0, 0);

            // Insertamos el viaje con escala
            const viaje = {
                ruta_id: ruta.id,
                autobus_id: 1,
                fecha_ida: fechaIda,
                fecha_regreso: fechaRegreso,
                hora: '07:00:00',
                precio: 500
            };

            db.query('INSERT INTO viajes SET ?', viaje, (err, result) => {
                if (err) throw err;
                const viajeId = result.insertId;

                // Simulamos una ciudad intermedia (tú deberías elegir lógica real)
                db.query('SELECT id FROM ciudades WHERE id NOT IN (?, ?) LIMIT 1', [ruta.origen_id, ruta.destino_id], (err, rows) => {
                    if (err) throw err;
                    const ciudadEscalaId = rows[0]?.id;
                    if (!ciudadEscalaId) return;

                    const escalas = [
                        {
                            viaje_id: viajeId,
                            ciudad_id: ciudadEscalaId,
                            hora_llegada: '09:00:00',
                            hora_salida: '09:30:00',
                            orden: 1
                        }
                    ];

                    db.query('INSERT INTO escalas (viaje_id, ciudad_id, hora_llegada, hora_salida, orden) VALUES ?', 
                        [escalas.map(e => [e.viaje_id, e.ciudad_id, e.hora_llegada, e.hora_salida, e.orden])],
                        (err) => {
                            if (err) throw err;
                            console.log(`✅ Viaje con escala creado para ruta ${ruta.id}`);
                        }
                    );
                });
            });
        });
    });
};
