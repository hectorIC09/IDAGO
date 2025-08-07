import React, { useState, useEffect } from 'react';
import AnchorLink from 'react-anchor-link-smooth-scroll'; // Para hacer scroll suave al dar clic en enlaces internos
import Swal from 'sweetalert2'; // Librería para mostrar ventanas emergentes bonitas
import emailjs from 'emailjs-com'; // Servicio para enviar correos desde el frontend
import logo from '../assets/idagologo.png'; // Logo del proyecto

// Configuración del servicio de email (EmailJS)
const SERVICE_ID = 'service_vy5a25e';
const TEMPLATE_ID = 'template_8tjnu97';
const PUBLIC_KEY = '-vhAycM9S3ZbcGZIb';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false); // Guarda si la página se desplazó hacia abajo
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Guarda si el usuario está logueado
  const [userEmail, setUserEmail] = useState(''); // Guarda el correo del usuario

  // Al cargar la página, revisa si el usuario ya había iniciado sesión antes
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail'); // Busca el correo guardado
    if (storedEmail) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
    }

    // Cambia el estado si el usuario hace scroll
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // Limpia el evento al salir
  }, []);

  // Verifica que el correo tenga un formato válido
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Calcula qué tan segura es la contraseña
  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++; // Tiene al menos 8 caracteres
    if (/[A-Z]/.test(password)) score++; // Tiene mayúsculas
    if (/[0-9]/.test(password)) score++; // Tiene números
    if (/[^A-Za-z0-9]/.test(password)) score++; // Tiene símbolos
    if (score <= 1) return { label: "Débil", color: "red" };
    if (score <= 3) return { label: "Media", color: "orange" };
    return { label: "Fuerte", color: "green" };
  };

  // Envía un código de verificación al correo del usuario
  const sendVerificationEmail = async (email, code) => {
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { to_email: email, code },
        PUBLIC_KEY
      );
      return true;
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      Swal.fire("Error", "No se pudo enviar el correo", "error");
      return false;
    }
  };

  // Muestra el formulario de registro
  const showRegisterForm = () => {
    Swal.fire({
      title: "Registrarse",
      html: `
        <input type="email" id="register-email" class="swal2-input" placeholder="Correo electrónico">
        <input type="password" id="register-password" class="swal2-input" placeholder="Contraseña">
        <div id="password-strength" style="text-align: left; margin: 5px 0 10px; font-size: 14px; min-height: 20px;"></div>
        <div style="text-align: center; margin-top: 10px; font-size: 14px;">
          ¿Ya tienes cuenta? <a href="#" id="switch-to-login" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">Inicia sesión aquí</a>
        </div>
      `,
      focusConfirm: false,
      confirmButtonText: "Enviar código",
      didOpen: () => {
        const passwordInput = Swal.getPopup().querySelector('#register-password');
        const strengthText = Swal.getPopup().querySelector('#password-strength');

        // Muestra la fortaleza de la contraseña mientras el usuario escribe
        passwordInput.addEventListener('input', () => {
          const strength = getPasswordStrength(passwordInput.value);
          strengthText.innerHTML = `Seguridad: <span style="color: ${strength.color}; font-weight: bold;">${strength.label}</span>`;
        });

        // Cambia al formulario de inicio de sesión
        const switchToLogin = document.getElementById('switch-to-login');
        if (switchToLogin) {
          switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            Swal.close();
            handleLoginClick();
          });
        }
      },
      preConfirm: async () => {
        const email = Swal.getPopup().querySelector('#register-email').value.trim();
        const password = Swal.getPopup().querySelector('#register-password').value;

        // Validaciones básicas
        if (!email || !password) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }
        if (!validateEmail(email)) {
          Swal.showValidationMessage("Correo inválido");
          return false;
        }
        if (password.length < 6) {
          Swal.showValidationMessage("La contraseña debe tener al menos 6 caracteres");
          return false;
        }

        // Revisa si ya existe el correo
        const exists = await checkIfEmailExists(email);
        if (exists) {
          Swal.showValidationMessage("Ya existe una cuenta con ese correo");
          return false;
        }

        // Genera un código de verificación y lo envía por correo
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const success = await sendVerificationEmail(email, code);
        if (!success) return false;

        // Guarda temporalmente la info para la verificación
        localStorage.setItem("verify_email", email);
        localStorage.setItem("verify_password", password);
        localStorage.setItem("verify_code", code);
        return true;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Verifica tu correo",
          html: `<input type="text" id="verif-code" class="swal2-input" placeholder="Código de verificación">`,
          confirmButtonText: "Verificar",
          preConfirm: async () => {
            const inputCode = Swal.getPopup().querySelector('#verif-code').value.trim();
            const storedCode = localStorage.getItem("verify_code");
            const email = localStorage.getItem("verify_email");
            const password = localStorage.getItem("verify_password");

            // Revisa si el código es correcto
            if (inputCode !== storedCode) {
              Swal.showValidationMessage("Código incorrecto");
              return false;
            }

            // Registra al usuario en el backend
            const result = await registerUser(email, password);
            if (!result.success) {
              Swal.showValidationMessage(result.message);
              return false;
            }

            // Guarda sesión iniciada
            setIsLoggedIn(true);
            setUserEmail(email);
            localStorage.setItem('userEmail', email);

            // Limpia datos temporales
            localStorage.removeItem("verify_code");
            localStorage.removeItem("verify_email");
            localStorage.removeItem("verify_password");
            Swal.fire("¡Registrado!", "Tu cuenta ha sido creada.", "success");
          }
        });
      }
    });
  };

  // Función para registrar al usuario en el backend
  const registerUser = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Contraseña: password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al registrar');

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Función para iniciar sesión en el backend
  const loginUser = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Contraseña: password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al iniciar sesión');

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Revisa en el backend si un correo ya está registrado
  const checkIfEmailExists = async (email) => {
    try {
      const res = await fetch('http://localhost:3000/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email })
      });

      const data = await res.json();
      return data.exists;
    } catch (error) {
      console.error("Error al verificar el correo:", error);
      return false;
    }
  };

  // Muestra formulario de inicio de sesión
  const handleLoginClick = () => {
    Swal.fire({
      title: "Iniciar Sesión",
      html: `
        <input type="email" id="login-email" class="swal2-input" placeholder="Correo electrónico">
        <input type="password" id="login-password" class="swal2-input" placeholder="Contraseña">
        <div style="text-align: center; margin-top: 15px; font-size: 14px;">
          ¿No tienes cuenta? <a href="#" id="switch-to-register" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">Regístrate aquí</a>
        </div>
      `,
      focusConfirm: false,
      confirmButtonText: "Ingresar",
      didOpen: () => {
        // Cambiar a formulario de registro
        const switchToRegister = document.getElementById('switch-to-register');
        if (switchToRegister) {
          switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            Swal.close();
            showRegisterForm();
          });
        }
      },
      preConfirm: async () => {
        const email = Swal.getPopup().querySelector('#login-email').value.trim();
        const password = Swal.getPopup().querySelector('#login-password').value;

        // Validaciones básicas
        if (!email || !password) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }
        if (!validateEmail(email)) {
          Swal.showValidationMessage("Correo inválido");
          return false;
        }

        // Intenta iniciar sesión en el backend
        const result = await loginUser(email, password);
        if (!result.success) {
          Swal.showValidationMessage(result.message);
          return false;
        }

        // Guarda sesión iniciada
        setIsLoggedIn(true);
        setUserEmail(email);
        localStorage.setItem('userEmail', email);
        
        Swal.fire("¡Bienvenido!", "Has iniciado sesión correctamente.", "success");
        return true;
      }  
    });
  };

  // Cierra sesión del usuario
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    localStorage.removeItem('userEmail');
    Swal.fire("Sesión cerrada", "Has salido de tu cuenta.", "success");
  };

  return (
    <nav className={`nav ${isScrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav_logo">
        <img src={logo} alt="IdaGo Logo" className="logo" />
      </div>
      <ul className="nav_links">
        {/* Enlaces que llevan a secciones dentro de la página */}
        <li className="link"><AnchorLink href="#header">Inicio</AnchorLink></li>
        <li className="link"><AnchorLink href="#plan-section">Aventuras</AnchorLink></li>
        <li className="link"><AnchorLink href="#safe-spaces">Espacios</AnchorLink></li>
        <li className="link"><AnchorLink href="#best-trips">Top viajes</AnchorLink></li>
      </ul>
      <div className="nav_buttons">
        {isLoggedIn ? (
          // Si está logueado, muestra el correo y botón para cerrar sesión
          <div className="user-menu">
            <span className="user-email">{userEmail}</span>
            <button className="btn btn-logout" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        ) : (
          // Si no está logueado, muestra el botón para iniciar sesión
          <button className="btn" onClick={handleLoginClick}>Iniciar Sesión</button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
