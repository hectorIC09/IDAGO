import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import QRCode from "react-qr-code";
import '../styles/compbo.css';

const SeatMap = ({ onSelectSeat, selectedSeats, passengerIndex }) => {
  const totalSeats = 10; // Solo 10 asientos disponibles

  return (
    <div className="seat-map">
      <h3>Selecciona tu asiento</h3>
      <div className="seats">
        {Array.from({ length: totalSeats }, (_, index) => {
          const seatNumber = index + 1; // Los asientos van del 1 al 10
          return (
            <button
              key={seatNumber}
              className={`seat ${selectedSeats.includes(seatNumber) ? 'selected' : ''}`}
              onClick={() => onSelectSeat(seatNumber)}
            >
              {seatNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SearchPage = () => {
  const location = useLocation();
  const { viajes, origin, destination, passengers } = location.state || { viajes: [] };

  const [timeLeft, setTimeLeft] = useState(300);
  const [ticket, setTicket] = useState(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    paymentMethod: 'Tarjeta de crédito',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    paypalEmail: '',
    passengerNames: Array.from({ length: passengers }, () => '')
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]); // Asientos seleccionados
  const [showSeatMap, setShowSeatMap] = useState(false); // Estado para mostrar/ocultar el mapa de asientos
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectTrip = (departure, arrival, price) => {
    setSelectedTrip({ departure, arrival, price });
    setShowLoginOptions(true);
  };

  const handleLoginOption = (option) => {
    if (option === 'guest') {
      setShowLoginOptions(false);
      setShowPurchaseForm(true); // Mostrar directamente el formulario de compra
    } else if (option === 'login') {
      setShowLoginForm(true);
      setShowLoginOptions(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Inicio de sesión exitoso. Redirigiendo...");
        setShowLoginForm(false);
        setShowPurchaseForm(true);
        // Guardar el token en localStorage o en el estado de la aplicación
        localStorage.setItem('token', data.token);
      } else {
        alert(data.error || 'Error en el inicio de sesión');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error en la conexión con el servidor');
    }
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePassengerNameChange = (index, value) => {
    const newPassengerNames = [...formData.passengerNames];
    newPassengerNames[index] = value;
    setFormData({ ...formData, passengerNames: newPassengerNames });
  };

  const handleSelectSeat = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      alert("Este asiento ya está seleccionado. Por favor, elige otro.");
      return;
    }

    if (selectedSeats.length >= passengers) {
      alert("Ya has seleccionado asientos para todos los pasajeros.");
      return;
    }

    setSelectedSeats([...selectedSeats, seatNumber]);
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.name || !formData.email) {
      alert("Por favor, completa todos los campos.");
      setIsLoading(false);
      return;
    }

    if (selectedSeats.length < passengers) {
      alert("Por favor, selecciona un asiento para cada pasajero.");
      setIsLoading(false);
      return;
    }

    let fechaven = ''; // Inicializamos la variable fechaven

    if (formData.paymentMethod === "Tarjeta de crédito") {
      if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCVV) {
        alert("Por favor, completa los datos de la tarjeta.");
        setIsLoading(false);
        return;
      }

      // Validar el formato de la fecha de vencimiento (MM/YY)
      if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
        alert("Por favor, ingresa la fecha de vencimiento en el formato MM/YY.");
        setIsLoading(false);
        return;
      }

      // Convertir la fecha de vencimiento de MM/YY a YYYY-MM-DD
      const [month, year] = formData.cardExpiry.split('/');
      fechaven = `20${year}-${month}-01`; // Asumimos el día 1 para la fecha de vencimiento
    }

    if (formData.paymentMethod === "PayPal" && !formData.paypalEmail) {
      alert("Por favor, ingresa tu correo de PayPal.");
      setIsLoading(false);
      return;
    }

    if (formData.paymentMethod === "Transferencia bancaria" && !formData.transferReference) {
      alert("Por favor, ingresa la referencia de la transferencia.");
      setIsLoading(false);
      return;
    }

    const priceValue = selectedTrip?.price ? parseFloat(selectedTrip.price.replace('$', '')) : 0;
    const totalPrice = priceValue * passengers;

    const ticketNumber = Math.floor(Math.random() * 1000000);

    try {
      const response = await fetch('http://localhost:3000/add-comprador', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          Nombre: formData.name,
          Email: formData.email,
          Tarjeta: formData.cardNumber,
          Fechaven: fechaven, // Usar la fecha convertida
          Cvv: formData.cardCVV,
          Asientos: selectedSeats,
          PrecioTotal: totalPrice,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTicket({
          number: ticketNumber,
          date: new Date().toLocaleDateString(),
          departure: selectedTrip.departure,
          arrival: selectedTrip.arrival,
          seats: selectedSeats,
          price: `$${totalPrice.toFixed(2)}`,
          name: formData.name,
          email: formData.email,
          paymentMethod: formData.paymentMethod,
          passengerNames: formData.passengerNames
        });

        setShowPurchaseForm(false);
        setPurchaseSuccess(true);

        setTimeout(() => {
          setPurchaseSuccess(false);
        }, 5000);
      } else {
        alert(data.error || 'Error en la compra');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error en la conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-page">
      <div className="container">
        <header id="header">
          <h1>IDAGO <span className="plus"></span></h1>
        </header>

        <section id="booking">
          <h2>Selecciona tu horario</h2>
          <div className="timer">{formatTime(timeLeft)}</div>
          <div className="route">
            <p><strong>Origen:</strong> {origin}</p>
            <p><strong>Destino:</strong> {destination}</p>
            <p><strong>Pasajeros:</strong> {passengers}</p>
          </div>
          <div className="trips">
            {viajes.length > 0 ? (
              viajes.map((viaje) => (
                <div className="trip" key={viaje.id}>
                  <p><strong>Origen:</strong> {viaje.origen}</p>
                  <p><strong>Destino:</strong> {viaje.destino}</p>
                  <p><strong>Fecha de ida:</strong> {new Date(viaje.fecha_ida).toLocaleDateString()}</p>
                  <p><strong>Fecha de regreso:</strong> {new Date(viaje.fecha_regreso).toLocaleDateString()}</p>
                  <p><strong>Hora de salida:</strong> { new Date(`1970-01-01T${viaje.hora}`).toLocaleTimeString('es-MX',
                   { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                  <p><strong>Escala: </strong>{viaje.escala ? viaje.escala : 'Directo'}</p>
                  <p><strong>Precio:</strong> ${viaje.precio}</p>

                  <button
                    className="select-btn"
                    onClick={() => handleSelectTrip(viaje.fecha_ida, viaje.fecha_regreso, `$${viaje.precio}`)}
                  >
                    <i className="fas fa-check"></i> Seleccionar
                  </button>
                </div>
              ))
            ) : (
              <p>No hay autobuses disponibles para esta ruta.</p>
            )}
          </div>
        </section>
      </div>

      {showLoginOptions && (
        <div className="login-options card">
          <h2>¿Cómo deseas continuar?</h2>
          <button className="button" onClick={() => handleLoginOption('guest')}>Seguir como invitado</button>
          <button className="button" onClick={() => handleLoginOption('login')}>Iniciar sesión</button>
        </div>
      )}

      {showLoginForm && (
        <div className="login-form card">
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleLogin}>
            <label>Email:</label>
            <input type="email" name="email" value={loginData.email} onChange={handleLoginInputChange} required />
            <label>Contraseña:</label>
            <input type="password" name="password" value={loginData.password} onChange={handleLoginInputChange} required />
            <button type="submit" className="button">Iniciar Sesión</button>
          </form>
        </div>
      )}

      {showPurchaseForm && (
        <div className="purchase-form card">
          <h2>Formulario de Compra</h2>
          <form onSubmit={handlePurchase}>
            <div className="form-group">
              <label>Nombre del comprador:</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label>Email del comprador:</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </div>

            {formData.passengerNames.map((name, index) => (
              <div className="form-group" key={index}>
                <label>Nombre del pasajero {index + 1}:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handlePassengerNameChange(index, e.target.value)}
                  required
                />
              </div>
            ))}

            {passengers === 1 ? (
              <SeatMap
                onSelectSeat={handleSelectSeat}
                selectedSeats={selectedSeats}
              />
            ) : (
              <>
                {!showSeatMap ? (
                  <button
                    type="button"
                    className="button"
                    onClick={() => setShowSeatMap(true)}
                  >
                    Seleccionar asientos
                  </button>
                ) : (
                  <SeatMap
                    onSelectSeat={handleSelectSeat}
                    selectedSeats={selectedSeats}
                  />
                )}
              </>
            )}

            <div className="form-group">
              <label>Método de Pago:</label>
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}>
                <option value="Tarjeta de crédito">Tarjeta de crédito</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>

            {formData.paymentMethod === "Tarjeta de crédito" && (
              <>
                <div className="form-group">
                  <label>Número de Tarjeta:</label>
                  <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha de Vencimiento (MM/YY):</label>
                    <input type="text" name="cardExpiry" value={formData.cardExpiry} onChange={handleInputChange} required />
                  </div>

                  <div className="form-group">
                    <label>CVV:</label>
                    <input type="text" name="cardCVV" value={formData.cardCVV} onChange={handleInputChange} required />
                  </div>
                </div>
              </>
            )}

            {formData.paymentMethod === "PayPal" && (
              <div className="form-group">
                <label>Correo de PayPal:</label>
                <input type="email" name="paypalEmail" value={formData.paypalEmail} onChange={handleInputChange} required />
              </div>
            )}

            {formData.paymentMethod === "Transferencia bancaria" && (
              <div className="form-group">
                <label>Referencia de la Transferencia:</label>
                <input type="text" name="transferReference" value={formData.transferReference} onChange={handleInputChange} required />
              </div>
            )}

            <button type="submit" className="button confirm-button" disabled={isLoading}>
              {isLoading ? 'Cargando...' : 'Confirmar Compra'}
            </button>
          </form>
        </div>
      )}

      {ticket && (
        <div id="ticket" className="card">
          <h2>Tu Ticket</h2>
          <p><strong>Número de boleto:</strong> {ticket.number}</p>
          <p><strong>Nombre del comprador:</strong> {ticket.name}</p>
          {ticket.passengerNames.map((name, index) => (
            <p key={index}>
              <strong>Pasajero {index + 1}:</strong> {name} (Asiento: {ticket.seats[index]})
            </p>
          ))}
          <p><strong>Precio:</strong> {ticket.price}</p>
          <QRCode value={`Boleto: ${ticket.number}, Pasajeros: ${ticket.passengerNames.join(', ')}, Asientos: ${ticket.seats.join(', ')}`} />
          <button className="button" onClick={() => window.print()}>Imprimir Ticket</button>
        </div>
      )}

      {purchaseSuccess && (
        <div className="success-message">
          Compra realizada con éxito. ¡Gracias por tu compra!
        </div>
      )}
    </div>
  );
};

export default SearchPage;