import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import headerImage from '../assets/img2.jpg';

const Header = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    passengers: '',
    departureDate: '',
    returnDate: '',
  });
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  const locations = ['Ciudad de México', 'Monterrey', 'Guadalajara', 'Cancún', 'Tijuana'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Mostrar campos adicionales cuando ambos campos principales estén completos
    if (name === 'destination' && formData.origin && value) {
      setShowAdditionalFields(true);
   }
  };
   const handleSearch = async (e) => {
    e.preventDefault();

    if (!formData.origin || !formData.destination || !formData.passengers || !formData.departureDate || !formData.returnDate) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/buscar-viajes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origen: formData.origin,
          destino: formData.destination,
          pasajeros: parseInt(formData.passengers, 10),
          fechaIda: formData.departureDate,
          fechaRegreso: formData.returnDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del backend:', errorData);
        throw new Error(errorData.error || 'Error al buscar viajes');
      }

      const data = await response.json();
      console.log('Datos recibidos del backend:', data);

      navigate('/search', { state: { viajes: data, ...formData } });
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Hubo un error al buscar viajes.');
    }
  };

  return (
    <header className="app-header">
      {/* Imagen de fondo del header */}
      <div className="header-image-container">
        <img 
          src={headerImage} 
          alt="Viajes" 
          className="header-image"
        />
      </div>

      {/* Contenedor del formulario */}
      <div className="booking-form-container">
        <h2 className="form-title"></h2>
        
        <form onSubmit={handleSearch} className="booking-form">
          {/* Primera línea: Origen y Destino */}
          <div className="form-main-fields">
            <div className="form-field">
              <label htmlFor="origin">Origen</label>
              <select
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona origen</option>
                {locations.map((city, index) => (
                  <option key={`origin-${index}`} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="destination">Destino</label>
              <select
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona destino</option>
                {locations.map((city, index) => (
                  <option key={`dest-${index}`} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Campos adicionales que aparecen después */}
          {showAdditionalFields && (
            <div className="form-additional-fields">
              <div className="form-field">
                <label htmlFor="departureDate">Partida</label>
                <input
                  type="text"
                  id="departureDate"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleInputChange}
                  onFocus={(e) => (e.target.type = "date")}
                  placeholder="Elige una fecha"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="returnDate">Regreso</label>
                <input
                  type="text"
                  id="returnDate"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleInputChange}
                  onFocus={(e) => (e.target.type = "date")}
                  placeholder="Elige una fecha"
                />
              </div>

              <div className="form-field">
                <label htmlFor="passengers">Pasajeros</label>
                <input
                  type="number"
                  id="passengers"
                  name="passengers"
                  value={formData.passengers}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>
          )}

          {/* Botón de búsqueda */}
          <div className="form-actions">
            <button type="submit" className="search-button">
              Buscar
            </button>
          </div>
        </form>
      </div>
    </header>
  );
};


export default Header;