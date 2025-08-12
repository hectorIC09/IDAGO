import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import QRCode from "react-qr-code";
import '../styles/compbo.css';

const SeatMap = ({ onSelectSeat, selectedSeats }) => {
  const leftSeatGroups = [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [9, 10]
  ];
  
  const rightSeatGroups = [
    [11, 12],
    [13, 14],
    [15, 16],
    [17, 18],
    [19, 20]
  ];

  return (
    <div className="seat-map">
      <h3>Selecciona tu asiento</h3>
      <div className="bus-layout">
        <div className="bus-seats-container">
          <div className="seats-side left-side">
            {leftSeatGroups.map((group, rowIndex) => (
              <div key={`left-row-${rowIndex}`} className="seat-row">
                {group.map(seatNumber => (
                  <button
                    key={`left-${seatNumber}`}
                    className={`seat ${selectedSeats.includes(seatNumber) ? 'selected' : ''}`}
                    onClick={() => onSelectSeat(seatNumber)}
                    disabled={selectedSeats.includes(seatNumber)}
                  >
                    {seatNumber}
                  </button>
                ))}
              </div>
            ))}
          </div>
          
          <div className="bus-aisle"></div>
          
          <div className="seats-side right-side">
            {rightSeatGroups.map((group, rowIndex) => (
              <div key={`right-row-${rowIndex}`} className="seat-row">
                {group.map(seatNumber => (
                  <button
                    key={`right-${seatNumber}`}
                    className={`seat ${selectedSeats.includes(seatNumber) ? 'selected' : ''}`}
                    onClick={() => onSelectSeat(seatNumber)}
                    disabled={selectedSeats.includes(seatNumber)}
                  >
                    {seatNumber}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bus-door">Puerta</div>
      
      <div className="seat-legend">
        <div className="legend-item">
          <span className="seat-sample available"></span> Disponible
        </div>
        <div className="legend-item">
          <span className="seat-sample selected"></span> Seleccionado
        </div>
        <div className="legend-item">
          <span className="seat-sample occupied"></span> Ocupado
        </div>
      </div>
    </div>
  );
};

const SearchPage = () => {
  const location = useLocation();
  const { viajes, origin, destination, passengers } = location.state || { viajes: [] };

  const [currentStep, setCurrentStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(300);
  const [ticket, setTicket] = useState(null);
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

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    passengerNames: Array.from({ length: passengers }, () => ''),
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    paypalEmail: ''
  });

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
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

  const handleSelectTrip = (viaje) => {
    setSelectedTrip(viaje);
    setCurrentStep(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData({ ...formData, cardNumber: value });
    if (errors.cardNumber) {
      setErrors({ ...errors, cardNumber: '' });
    }
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    setFormData({
      ...formData,
      cardExpiry: value
    });
    
    if (errors.cardExpiry) {
      setErrors({ ...errors, cardExpiry: '' });
    }
  };

  const handleCardCVVChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setFormData({
      ...formData,
      cardCVV: value
    });
    
    if (errors.cardCVV) {
      setErrors({ ...errors, cardCVV: '' });
    }
  };

  const handlePassengerNameChange = (index, value) => {
    const newPassengerNames = [...formData.passengerNames];
    newPassengerNames[index] = value;
    setFormData({ ...formData, passengerNames: newPassengerNames });
    
    // Limpiar error para este pasajero
    if (errors.passengerNames[index]) {
      const newErrors = { ...errors };
      newErrors.passengerNames[index] = '';
      setErrors(newErrors);
    }
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
    
    if (selectedSeats.length + 1 >= passengers) {
      setTimeout(() => setCurrentStep(4), 500);
    }
  };

  const validateStep2 = () => {
    let isValid = true;
    const newErrors = {...errors};

    // Validar nombre del comprador
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
      isValid = false;
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,50}$/.test(formData.name)) {
      newErrors.name = 'Solo letras (2-50 caracteres)';
      isValid = false;
    } else {
      newErrors.name = '';
    }

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
      newErrors.email = 'Ingrese un email válido';
      isValid = false;
    } else {
      newErrors.email = '';
    }

    // Validar nombres de pasajeros
    const passengerErrors = [...newErrors.passengerNames];
    formData.passengerNames.forEach((name, index) => {
      if (!name.trim()) {
        passengerErrors[index] = 'El nombre es requerido';
        isValid = false;
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,50}$/.test(name)) {
        passengerErrors[index] = 'Solo letras (2-50 caracteres)';
        isValid = false;
      } else {
        passengerErrors[index] = '';
      }
    });
    newErrors.passengerNames = passengerErrors;

    setErrors(newErrors);
    return isValid;
  };

  const validateCard = () => {
    const newErrors = {...errors};
    let isValid = true;
    const cardNumber = formData.cardNumber.replace(/\s+/g, '');

    if (!/^\d{15,19}$/.test(cardNumber)) {
      newErrors.cardNumber = 'Tarjeta inválida (15-19 dígitos)';
      isValid = false;
    } else {
      newErrors.cardNumber = '';
    }
    
    if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
      newErrors.cardExpiry = 'Formato MM/YY requerido';
      isValid = false;
    } else {
      const [month, year] = formData.cardExpiry.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.cardExpiry = 'Mes inválido';
        isValid = false;
      } else if (
        parseInt(year) < currentYear || 
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      ) {
        newErrors.cardExpiry = 'Tarjeta expirada';
        isValid = false;
      } else {
        newErrors.cardExpiry = '';
      }
    }
    
    if (!/^\d{3,4}$/.test(formData.cardCVV)) {
      newErrors.cardCVV = 'CVV inválido (3-4 dígitos)';
      isValid = false;
    } else {
      newErrors.cardCVV = '';
    }

    setErrors(newErrors);
    return isValid;
  };

  const validatePayPal = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.paypalEmail)) {
      setErrors({...errors, paypalEmail: 'Ingrese un email PayPal válido'});
      return false;
    }
    setErrors({...errors, paypalEmail: ''});
    return true;
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validar todos los pasos
    if (!validateStep2()) {
      setIsLoading(false);
      return;
    }

    if (selectedSeats.length < passengers) {
      alert(`Por favor, selecciona ${passengers} asiento(s)`);
      setIsLoading(false);
      return;
    }

    if (formData.paymentMethod === "Tarjeta de crédito" && !validateCard()) {
      setIsLoading(false);
      return;
    }

    if (formData.paymentMethod === "PayPal" && !validatePayPal()) {
      setIsLoading(false);
      return;
    }

    // Enviar datos al backend si es tarjeta
    if (formData.paymentMethod === "Tarjeta de crédito") {
      try {
        const [month, year] = formData.cardExpiry.split('/');
        const formattedDate = `20${year}-${month.padStart(2, '0')}-01`;

        const response = await fetch('http://localhost:3000/add-comprador', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Nombre: formData.name,
            Email: formData.email,
            Tarjeta: formData.cardNumber.replace(/\s+/g, ''),
            Fechaven: formattedDate,
            Cvv: formData.cardCVV
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al registrar al comprador.');
        }

        console.log('Comprador registrado con éxito');
      } catch (error) {
        console.error('Error:', error.message);
        alert('Hubo un problema al registrar los datos del comprador.');
        setIsLoading(false);
        return;
      }
    }

    const priceValue = selectedTrip?.precio ? parseFloat(selectedTrip.precio) : 0;
    const totalPrice = priceValue * passengers;
    const ticketNumber = Math.floor(Math.random() * 1000000);

    setTicket({
      number: ticketNumber,
      date: new Date().toLocaleDateString(),
      departure: selectedTrip.origen,
      arrival: selectedTrip.destino,
      seats: selectedSeats,
      price: `$${totalPrice.toFixed(2)}`,
      name: formData.name,
      email: formData.email,
      paymentMethod: formData.paymentMethod,
      passengerNames: formData.passengerNames
    });

    setCurrentStep(5);
    setPurchaseSuccess(true);
    setIsLoading(false);

    setTimeout(() => {
      setPurchaseSuccess(false);
    }, 5000);
  };

  const nextStep = () => {
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  return (
    <div className="search-page">
      <div className="container">
        <header id="header">
          <h1>IDAGO <span className="plus"></span></h1>
        </header>

        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1. Seleccionar viaje</div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2. Información personal</div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3. Seleccionar asientos</div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4. Pago</div>
          <div className={`step ${currentStep >= 5 ? 'active' : ''}`}>5. Confirmación</div>
        </div>

        {currentStep === 1 && (
          <section className="step-section">
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
                    <p><strong>Hora de salida:</strong> {new Date(`1970-01-01T${viaje.hora}`).toLocaleTimeString('es-MX', 
                      { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    <p><strong>Escala: </strong>{viaje.escala ? viaje.escala : 'Directo'}</p>
                    <p><strong>Precio:</strong> ${viaje.precio}</p>

                    <button
                      className="select-btn"
                      onClick={() => handleSelectTrip(viaje)}
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
        )}

        {currentStep === 2 && (
          <section className="step-section">
            <h2>Información del Pasajero</h2>
            <form>
              <div className="form-group">
                <label>Nombre del comprador:</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className={errors.name ? 'input-error' : ''}
                  required 
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Email del comprador:</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  className={errors.email ? 'input-error' : ''}
                  required 
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              {formData.passengerNames.map((name, index) => (
                <div className="form-group" key={index}>
                  <label>Nombre del pasajero {index + 1}:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handlePassengerNameChange(index, e.target.value)}
                    className={errors.passengerNames[index] ? 'input-error' : ''}
                    required
                  />
                  {errors.passengerNames[index] && (
                    <span className="error-text">{errors.passengerNames[index]}</span>
                  )}
                </div>
              ))}

              <div className="step-buttons">
                <button type="button" className="button secondary" onClick={prevStep}>
                  Atrás
                </button>
                <button type="button" className="button" onClick={nextStep}>
                  Continuar a Asientos
                </button>
              </div>
            </form>
          </section>
        )}

        {currentStep === 3 && (
          <section className="step-section">
            <h2>Selección de Asientos</h2>
            <SeatMap
              onSelectSeat={handleSelectSeat}
              selectedSeats={selectedSeats}
            />
            <div className="selected-seats">
              <h4>Asientos seleccionados:</h4>
              {selectedSeats.length > 0 ? (
                <ul>
                  {selectedSeats.map((seat, index) => (
                    <li key={index}>
                      Pasajero {index + 1}: Asiento {seat}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No has seleccionado asientos aún</p>
              )}
            </div>
            <div className="step-buttons">
              <button type="button" className="button secondary" onClick={prevStep}>
                Atrás
              </button>
              <button 
                type="button" 
                className="button" 
                onClick={nextStep}
                disabled={selectedSeats.length < passengers}
              >
                Continuar a Pago
              </button>
            </div>
          </section>
        )}

        {currentStep === 4 && (
          <section className="step-section">
            <h2>Información de Pago</h2>
            <form onSubmit={handlePurchase}>
              <div className="form-group">
                <label>Método de Pago:</label>
                <select 
                  name="paymentMethod" 
                  value={formData.paymentMethod} 
                  onChange={handleInputChange}
                >
                  <option value="Tarjeta de crédito">Tarjeta de crédito</option>
                  <option value="PayPal">PayPal</option>
                </select>
              </div>

              {formData.paymentMethod === "Tarjeta de crédito" && (
                <>
                  <div className="form-group">
                    <label>Número de Tarjeta:</label>
                    <input 
                      type="text" 
                      name="cardNumber" 
                      value={formData.cardNumber} 
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className={errors.cardNumber ? 'input-error' : ''}
                      required 
                    />
                    {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Fecha de Vencimiento (MM/YY):</label>
                      <input 
                        type="text" 
                        name="cardExpiry" 
                        value={formData.cardExpiry} 
                        onChange={handleCardExpiryChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        className={errors.cardExpiry ? 'input-error' : ''}
                        required 
                      />
                      {errors.cardExpiry && <span className="error-text">{errors.cardExpiry}</span>}
                    </div>

                    <div className="form-group">
                      <label>CVV:</label>
                      <input 
                        type="password" 
                        name="cardCVV" 
                        value={formData.cardCVV} 
                        onChange={handleCardCVVChange}
                        placeholder="•••"
                        maxLength="4"
                        className={errors.cardCVV ? 'input-error' : ''}
                        required 
                      />
                      {errors.cardCVV && <span className="error-text">{errors.cardCVV}</span>}
                    </div>
                  </div>
                </>
              )}

              {formData.paymentMethod === "PayPal" && (
                <div className="form-group">
                  <label>Correo de PayPal:</label>
                  <input 
                    type="email" 
                    name="paypalEmail" 
                    value={formData.paypalEmail} 
                    onChange={handleInputChange} 
                    className={errors.paypalEmail ? 'input-error' : ''}
                    required 
                  />
                  {errors.paypalEmail && <span className="error-text">{errors.paypalEmail}</span>}
                </div>
              )}

              <div className="resumen-compra">
                <h3>Resumen de Compra</h3>
                <p><strong>Origen:</strong> {selectedTrip?.origen}</p>
                <p><strong>Destino:</strong> {selectedTrip?.destino}</p>
                <p><strong>Fecha:</strong> {new Date(selectedTrip?.fecha_ida).toLocaleDateString()}</p>
                <p><strong>Hora:</strong> {selectedTrip?.hora}</p>
                <p><strong>Pasajeros:</strong> {passengers}</p>
                <p><strong>Asientos:</strong> {selectedSeats.join(', ')}</p>
                <p><strong>Total:</strong> ${(selectedTrip?.precio * passengers).toFixed(2)}</p>
              </div>

              <div className="step-buttons">
                <button type="button" className="button secondary" onClick={prevStep}>
                  Atrás
                </button>
                <button type="submit" className="button confirm-button" disabled={isLoading}>
                  {isLoading ? 'Procesando...' : 'Confirmar Compra'}
                </button>
              </div>
            </form>
          </section>
        )}

        {currentStep === 5 && ticket && (
          <section className="step-section">
            <div id="ticket" className="card">
              <h2>¡Compra Exitosa!</h2>
              <p><strong>Número de boleto:</strong> {ticket.number}</p>
              <p><strong>Nombre del comprador:</strong> {ticket.name}</p>
              {ticket.passengerNames.map((name, index) => (
                <p key={index}>
                  <strong>Pasajero {index + 1}:</strong> {name} (Asiento: {ticket.seats[index]})
                </p>
              ))}
              <p><strong>Origen:</strong> {ticket.departure}</p>
              <p><strong>Destino:</strong> {ticket.arrival}</p>
              <p><strong>Precio:</strong> {ticket.price}</p>
              <div className="qr-container">
                <QRCode value={`Boleto: ${ticket.number}, Pasajeros: ${ticket.passengerNames.join(', ')}, Asientos: ${ticket.seats.join(', ')}`} />
              </div>
              <button className="button" onClick={() => window.print()}>Imprimir Ticket</button>
            </div>
          </section>
        )}

        {purchaseSuccess && (
          <div className="success-message">
            Compra realizada con éxito. ¡Gracias por tu compra!
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;