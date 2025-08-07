import React from 'react';

const SafeSpaces = () => {
  return (
    // Sección que muestra imágenes y descripciones de espacios seguros
    <section className="section__container lounge__container">
      
      {/* Imágenes del área lounge */}
      <div className="lounge__image">
        <img src="src/assets/lounge1.jpg" alt="lounge" />
        <img src="src/assets/lounge2.jpg" alt="lounge" />
      </div>

      {/* Texto y detalles */}
      <div className="lounge__content">
        <h2 className="section__header">Espacios seguros</h2>
        
        {/* Cuatro bloques con diferentes características */}
        <div className="lounge__grid">
          
          <div className="lounge__details">
            <h4>Experiencia de tranquilidad</h4>
            <p>Ofrecemos tranquilidad para el pasajero, con asientos cómodos y un ambiente de calidad.</p>
          </div>

          <div className="lounge__details">
            <h4>Eleva tu experiencia</h4>
            <p>Salas exclusivas para pasajeros premium con ambiente privado.</p>
          </div>

          <div className="lounge__details">
            <h4>Espacio agradable</h4>
            <p>Ambiente familiar, pet-friendly y áreas para todas las edades.</p>
          </div>

          <div className="lounge__details">
            <h4>Calidad de comida</h4>
            <p>Ofrecemos bebidas y alimentos fríos para viajes largos.</p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SafeSpaces;
