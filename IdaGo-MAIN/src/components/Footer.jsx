import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="section__container footer__container">
        <div className="footer__col">
          <h3>IdaGo</h3>
          <p>
            La excelencia de viajes en bus para darle la mejor satisfacción al
            cliente y ofrecemos la mejor calidad en asientos y el mejor servicio
            al cliente.
          </p>
          <p>
            Conectamos con nuestros clientes siendo la mejor venta de boletos, con ambiente
            familiar y experiencias únicas.
          </p>
        </div>
        <div className="section__container__ footer__bar">
          <p>Copyright © Todos los derechos reservados | IdaGo |</p>
          <div className="socials">
            <a href="https://www.facebook.com/share/1FFw5qgyxj/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
              <i className="ri-facebook-circle-fill"></i>
            </a>
            <a href="https://x.com/idago48?s=21&t=UpImn0ARbxa8GV8R1LW6Fg" target="_blank" rel="noopener noreferrer">
              <i className="ri-twitter-fill"></i>
            </a>
            <a href="https://www.instagram.com/idago51?igsh=MTJ6OTNqNHNrYjAzNg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer">
              <i className="ri-instagram-fill"></i>
            </a>
            <a href="https://www.tiktok.com/@idago8?_t=ZM-8tXANaIRSjd&_r=1" target="_blank" rel="noopener noreferrer">
              <i className="ri-tiktok-fill"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
