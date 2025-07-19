import React from 'react';

const SafeSpaces = () => {
  return (
    <section className="section__container lounge__container">
      <div className="lounge__image">
        <img src="src/assets/lounge1.jpg" alt="lounge" />
        <img src="src/assets/lounge2.jpg" alt="lounge" />
      </div>
      <div className="lounge__content">
        <h2 className="section__header">Espacios seguros</h2>
        <div className="lounge__grid">
          <div className="lounge__details">
            <h4>Experiencia de tranquilidad</h4>
            <p>
              Ofrecemos una tranquilidad para el pasajero, con asientos
              cómodos y un ambiente y servicio de calidad.
            </p>
          </div>
          <div className="lounge__details">
            <h4>Eleva tu experiencia</h4>
            <p>
              Diseñada para los pasajeros, con salas exclusivas de pasajeros
              premium y un ambiente privado.
            </p>
          </div>
          <div className="lounge__details">
            <h4>Espacio agradable</h4>
            <p>
              Ambiente familiar, pet-friendly, salas especiales para
              todas las edades.
            </p>
          </div>
          <div className="lounge__details">
            <h4>Calidad de comida</h4>
            <p>
              En tu viaje te ofrecemos bebidas y alimentos fríos,
              para esos viajes largos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafeSpaces;