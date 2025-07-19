import React from 'react';

const PlanSection = () => {
  return (
    <section className="section__container plan__container">
      <p className="subheader">APOYO DE TU PASAJE</p>
      <h2 className="section__header">Planea tu viaje</h2>
      
      <div className="plan__content">
        {/* Columna de texto a la izquierda */}
        <div className="plan__text-column">
          <div className="plan__item">
            <span className="plan__number">01</span>
            <div className="plan__text">
              <h4>Requisitos de viaje</h4>
              <p>Para tu viaje con ciertos requerimientos.</p>
            </div>
          </div>
          
          <div className="plan__item">
            <span className="plan__number">02</span>
            <div className="plan__text">
              <h4>Riesgos de viaje</h4>
              <p>Protección para tu tranquilidad que cubre posibles riesgos y situaciones inesperadas.</p>
            </div>
          </div>
          
          <div className="plan__item">
            <span className="plan__number">03</span>
            <div className="plan__text">
              <h4>Requisitos de viaje por destinos</h4>
              <p>Mantente informado y planea tu viaje con facilidad.</p>
            </div>
          </div>
        </div>
        
        {/* Contenedor de imágenes superpuestas a la derecha */}
        <div className="plan__image-stack">
          <img src="src/assets/bus1.jpg" alt="Requisitos" className="stacked-img img-1" />
          <img src="src/assets/bus2.jpg" alt="Riesgos" className="stacked-img img-2" />
          <img src="src/assets/bus3.jpg" alt="Destinos" className="stacked-img img-3" />
        </div>
      </div>
    </section>
  );
};

export default PlanSection;