import React from 'react';

const BestTrips = () => {
  return (
    <section className="section__container travellers__container">
      <h2 className="section__header">Los mejores viajes del mes</h2>
      <div className="travellers__grid">
        {/* Ciudad de México */}
        <div className="travellers__card">
          <img src="src/assets/ciudadmexico.webp" alt="Ciudad de México" />
          <div className="travellers__card__content">
            <h4>Ciudad de México</h4>
            <p>
              Explora la capital cultural de México. Rutas disponibles a Guadalajara, Monterrey, Cancún y Tijuana.
            </p>
          </div>
        </div>

        {/* Guadalajara */}
        <div className="travellers__card">
          <img src="src/assets/guadalajara.webp" alt="Guadalajara" />
          <div className="travellers__card__content">
            <h4>Guadalajara</h4>
            <p>
              Descubre la tierra del tequila y el mariachi. Rutas disponibles a Ciudad de México, Monterrey, Cancún y Tijuana.
            </p>
          </div>
        </div>

        {/* Monterrey */}
        <div className="travellers__card">
          <img src="src/assets/Monterrey.webp" alt="Monterrey" />
          <div className="travellers__card__content">
            <h4>Monterrey</h4>
            <p>
              Conoce la ciudad de las montañas. Rutas disponibles a Ciudad de México, Guadalajara, Cancún y Tijuana.
            </p>
          </div>
        </div>

        {/* Cancún */}
        <div className="travellers__card">
          <img src="src/assets/cancun.jpg" alt="Cancún" />
          <div className="travellers__card__content">
            <h4>Cancún</h4>
            <p>
              Relájate en las playas del Caribe. Rutas disponibles a Ciudad de México, Guadalajara, Monterrey y Tijuana.
            </p>
          </div>
        </div>

        {/* Tijuana */}
        <div className="travellers__card">
          <img src="src/assets/tijuana.jpg" alt="Tijuana" />
          <div className="travellers__card__content">
            <h4>Tijuana</h4>
            <p>
              Vive la frontera entre México y Estados Unidos. Rutas disponibles a Ciudad de México, Guadalajara, Monterrey y Cancún.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestTrips;