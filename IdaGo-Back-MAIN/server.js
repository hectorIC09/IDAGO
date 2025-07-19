const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const app = express();
const SECRET_KEY = 'tu_clave_secreta';

// Clave de cifrado para datos sensibles (32 bytes para AES-256)
const ENCRYPTION_KEY = crypto.createHash('sha256').update(String('clave_super_secreta')).digest('base64').substring(0, 32);
const IV_LENGTH = 16;

// Función para cifrar
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// Función para descifrar
function decrypt(text) {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = parts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MySQL
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
});

// Prueba de conexión
app.get('/test', (req, res) => {
    res.send('El backend está funcionando correctamente');
});

// Registro de usuario
app.post('/register', (req, res) => {
  const { Email, Contraseña } = req.body;

  bcrypt.hash(Contraseña, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: 'Error al encriptar la contraseña' });
    }

    const sql = 'INSERT INTO usuario (Email, Contraseña) VALUES (?, ?)';
    db.query(sql, [Email, hash], (err, result) => {
      if (err) {
        // Manejar error de duplicado
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Ya existe una cuenta con ese correo' });
        }

        return res.status(500).json({ error: 'Error al registrar usuario' });
      }

      res.json({ message: 'Usuario registrado con éxito' });
    });
  });
});

// Obtener usuarios
app.get('/users', (req, res) => {
    db.query('SELECT * FROM usuario', (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error en la consulta' });
        } else {
            res.json(result);
        }
    });
});

// Inicio de sesión
app.post('/login', (req, res) => {
    const { Email, Contraseña } = req.body;

    const sql = 'SELECT * FROM usuario WHERE Email = ?';
    db.query(sql, [Email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la consulta' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const usuario = results[0];

        bcrypt.compare(Contraseña, usuario.Contraseña, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: 'Error al verificar la contraseña' });
            }
            if (!isMatch) {
                return res.status(401).json({ error: 'Contraseña incorrecta' });
            }

            const token = jwt.sign({ IdUser: usuario.IdUser, Email: usuario.Email }, SECRET_KEY, { expiresIn: '1h' });

            res.json({ message: 'Inicio de sesión exitoso', token });
        });
    });
});

// Agregar comprador con cifrado de tarjeta, fecha y cvv
app.post('/add-comprador', (req, res) => {
    const { Nombre, Email, Tarjeta, Fechaven, Cvv } = req.body;

    if (!Tarjeta || !Fechaven || !Cvv) {
        return res.status(400).json({ error: 'Faltan datos sensibles para cifrar.' });
    }

    const tarjetaCifrada = encrypt(Tarjeta);
    const fechavenCifrada = encrypt(Fechaven);
    const cvvCifrado = encrypt(Cvv);

    const sql = 'INSERT INTO comprador (Nombre, Email, Tarjeta, Fechaven, Cvv) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [Nombre, Email, tarjetaCifrada, fechavenCifrada, cvvCifrado], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al agregar comprador' });
        }
        res.json({ message: 'Comprador agregado con éxito' });
    });
});

// Obtener compradores con descifrado
app.get('/compradores', (req, res) => {
    const sql = 'SELECT * FROM comprador';
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los compradores' });
        }

        const compradoresDecifrados = result.map(comp => ({
            ...comp,
            Tarjeta: decrypt(comp.Tarjeta),
            Fechaven: decrypt(comp.Fechaven),
            Cvv: decrypt(comp.Cvv)
        }));

        res.json(compradoresDecifrados);
    });
});

// Buscar viajes (con escalas)
app.post('/buscar-viajes', (req, res) => {
    const { origen, destino, pasajeros, fechaIda, fechaRegreso } = req.body;

    if (!origen || !destino || !pasajeros || !fechaIda || !fechaRegreso) {
        return res.status(400).json({ error: 'Faltan parámetros en la solicitud.' });
    }

    const fechaIdaValida = new Date(fechaIda);
    const fechaRegresoValida = new Date(fechaRegreso);

    if (isNaN(fechaIdaValida.getTime()) || isNaN(fechaRegresoValida.getTime())) {
        return res.status(400).json({ error: 'Formato de fecha inválido.' });
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaIdaValida < hoy) {
        return res.status(400).json({ error: 'La fecha de ida debe ser igual o posterior a hoy.' });
    }

    if (fechaRegresoValida <= fechaIdaValida) {
        return res.status(400).json({ error: 'La fecha de regreso debe ser posterior a la de ida.' });
    }

    const query = `
    SELECT 
        v.id, 
        c1.nombre AS origen, 
        c2.nombre AS destino, 
        v.fecha_ida, 
        v.fecha_regreso, 
        v.hora,
        v.precio,
        e.ciudad_id,
        c3.nombre AS escala,
        e.hora_llegada,
        e.hora_salida,
        e.orden
    FROM viajes v
    LEFT JOIN escalas e ON v.id = e.viaje_id
    LEFT JOIN ciudades c3 ON e.ciudad_id = c3.id
    JOIN rutas r ON v.ruta_id = r.id
    JOIN ciudades c1 ON r.origen_id = c1.id
    JOIN ciudades c2 ON r.destino_id = c2.id
    WHERE c1.nombre = ? AND c2.nombre = ? AND DATE(v.fecha_ida) = ? AND DATE(v.fecha_regreso) = ?
    `;

    const params = [
        origen,
        destino,
        fechaIdaValida.toISOString().split('T')[0],
        fechaRegresoValida.toISOString().split('T')[0]
    ];

    db.query(query, params, (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (results.length === 0) {
            return res.json({ message: 'No se encontraron viajes disponibles.' });
        }

        res.json(results);
    });
});

// Placeholder para reservación
app.post('/reservacion', (req, res) => {
    res.json({ message: 'Endpoint de reservación aún no implementado' });
});

//CHEQUEO DE MAIL 
app.post('/check-email', (req, res) => {
  const { Email } = req.body;

  const sql = 'SELECT * FROM usuario WHERE Email = ?';
  db.query(sql, [Email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al verificar el correo' });
    }

    if (results.length > 0) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}/test`);
});
