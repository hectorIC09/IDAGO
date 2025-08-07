import React from 'react'; // Importa React para poder crear el componente

// Componente que muestra la sección de planificación del viaje
const PlanSection = () => {
  return (
    <section className="section__container plan__container"> {/* Contenedor principal con clases para estilo */}
      
      {/* Texto pequeño arriba del título */}
      <p className="subheader">APOYO DE TU PASAJE</p>
      
      {/* Título principal de la sección */}
      <h2 className="section__header">Planea tu viaje</h2>
      
      {/* Contenedor que guarda las dos partes: texto e imágenes */}
      <div className="plan__content">
        
        {/* Columna izquierda: lista de puntos con información */}
        <div className="plan__text-column">
          
          {/* Primer punto */}
          <div className="plan__item">
            <span className="plan__number">01</span> {/* Número del punto */}
            <div className="plan__text">
              <h4>Requisitos de viaje</h4>
              <p>Para tu viaje con ciertos requerimientos.</p>
            </div>
          </div>
          
          {/* Segundo punto */}
          <div className="plan__item">
            <span className="plan__number">02</span>
            <div className="plan__text">
              <h4>Riesgos de viaje</h4>
              <p>Protección para tu tranquilidad que cubre posibles riesgos y situaciones inesperadas.</p>
            </div>
          </div>
          
          {/* Tercer punto */}
          <div className="plan__item">
            <span className="plan__number">03</span>
            <div className="plan__text">
              <h4>Requisitos de viaje por destinos</h4>
              <p>Mantente informado y planea tu viaje con facilidad.</p>
            </div>
          </div>
        </div>
        
        {/* Columna derecha: imágenes superpuestas */}
        <div className="plan__image-stack">
          {/* Imagen 1: se coloca en la parte inferior */}
          <img src="src/assets/bus1.jpg" alt="Requisitos" className="stacked-img img-1" />
          
          {/* Imagen 2: se coloca un poco más arriba, creando efecto de pila */}
          <img src="src/assets/bus2.jpg" alt="Riesgos" className="stacked-img img-2" />
          
          {/* Imagen 3: la de arriba de todas */}
          <img src="src/assets/bus3.jpg" alt="Destinos" className="stacked-img img-3" />
        </div>
      </div>
    </section>
  );
};

export default PlanSection; // Exporta el componente para poder usarlo en otras partes
