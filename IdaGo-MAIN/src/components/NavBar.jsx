import React, { useState, useEffect } from 'react';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import Swal from 'sweetalert2';
import emailjs from 'emailjs-com';
import logo from '../assets/idagologo.png';

const SERVICE_ID = 'service_vy5a25e';
const TEMPLATE_ID = 'template_8tjnu97';
const PUBLIC_KEY = '-vhAycM9S3ZbcGZIb';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [logoutTimer, setLogoutTimer] = useState(null);

  // Función para iniciar el temporizador de cierre (5 minutos)
  const startLogoutTimer = () => {
    // Limpiar temporizador anterior si existe
    if (logoutTimer) clearTimeout(logoutTimer);

    // Configurar nuevo temporizador (5 minutos)
    const timer = setTimeout(() => {
      handleAutoLogout();
    }, 5 * 60 * 1000); // 300,000 ms = 5 minutos

    setLogoutTimer(timer);
  };

  // Cierre automático de sesión
  const handleAutoLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    localStorage.removeItem('userEmail');
    Swal.fire({
      title: "Sesión finalizada",
      text: "Tu sesión ha caducado automáticamente después de 5 minutos",
      icon: "info"
    });
  };

  // Función de cierre de sesión manual
  const handleLogout = () => {
    if (logoutTimer) clearTimeout(logoutTimer);
    setIsLoggedIn(false);
    setUserEmail('');
    localStorage.removeItem('userEmail');
    Swal.fire("Sesión cerrada", "Has salido de tu cuenta.", "success");
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
      startLogoutTimer(); // Iniciar temporizador al cargar si hay sesión activa
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (logoutTimer) clearTimeout(logoutTimer); // Limpiar al desmontar
    };
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Función mejorada de validación de contraseña
  const getPasswordStrength = (password) => {
    if (!password) return { label: "", color: "transparent" };
    
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    const hasRepeatingChars = /(.)\1{3,}/.test(password);
    const hasCommonSequences = /(123|abc|qwerty|password|admin|1111|0000)/i.test(password);
    const hasUserInfo = userEmail && password.includes(userEmail.split('@')[0]);

    let score = 0;
    if (hasMinLength) score += 1;
    if (password.length >= 12) score += 1;
    if (hasUpperCase) score += 1;
    if (hasLowerCase) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecialChar) score += 1;
    
    if (hasRepeatingChars) score -= 2;
    if (hasCommonSequences) score -= 2;
    if (hasUserInfo) score -= 1;

    if (!hasMinLength) {
      return { label: "Muy corta", color: "red", requirements: { hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar } };
    }
    if (score <= 2 || hasRepeatingChars || hasCommonSequences) {
      return { label: "Muy débil", color: "red", requirements: { hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar } };
    }
    if (score <= 4) {
      return { label: "Débil", color: "orange", requirements: { hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar } };
    }
    if (score <= 6) {
      return { label: "Media", color: "#ffcc00", requirements: { hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar } };
    }
    return { label: "Fuerte", color: "green", requirements: { hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar } };
  };

  // Función para mostrar detalles de requisitos
  const renderPasswordRequirements = (requirements) => {
    return `
      <div style="text-align: left; font-size: 12px; margin-top: 5px;">
        <div>${requirements.hasMinLength ? '✓' : '✗'} Mínimo 8 caracteres</div>
        <div>${requirements.hasUpperCase ? '✓' : '✗'} Al menos una mayúscula</div>
        <div>${requirements.hasLowerCase ? '✓' : '✗'} Al menos una minúscula</div>
        <div>${requirements.hasNumber ? '✓' : '✗'} Al menos un número</div>
        <div>${requirements.hasSpecialChar ? '✓' : '✗'} Al menos un carácter especial</div>
      </div>
    `;
  };

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

  const showRegisterForm = () => {
    Swal.fire({
      title: "Registrarse",
      html: `
        <input type="email" id="register-email" class="swal2-input" placeholder="Correo electrónico">
        <input type="password" id="register-password" class="swal2-input" placeholder="Contraseña">
        <div id="password-strength" style="text-align: left; margin: 5px 0 5px; font-size: 14px; min-height: 20px;"></div>
        <div id="password-requirements" style="margin-bottom: 10px;"></div>
        <div style="text-align: center; margin-top: 10px; font-size: 14px;">
          ¿Ya tienes cuenta? <a href="#" id="switch-to-login" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">Inicia sesión aquí</a>
        </div>
      `,
      focusConfirm: false,
      confirmButtonText: "Enviar código",
      didOpen: () => {
        const passwordInput = Swal.getPopup().querySelector('#register-password');
        const strengthText = Swal.getPopup().querySelector('#password-strength');
        const requirementsText = Swal.getPopup().querySelector('#password-requirements');

        passwordInput.addEventListener('input', () => {
          const strength = getPasswordStrength(passwordInput.value);
          strengthText.innerHTML = `Seguridad: <span style="color: ${strength.color}; font-weight: bold;">${strength.label}</span>`;
          requirementsText.innerHTML = renderPasswordRequirements(strength.requirements);
        });

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
        const strength = getPasswordStrength(password);

        if (!email || !password) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }
        if (!validateEmail(email)) {
          Swal.showValidationMessage("Correo inválido");
          return false;
        }
        if (strength.label === "Muy corta" || strength.label === "Muy débil") {
          Swal.showValidationMessage("La contraseña no cumple con los requisitos mínimos de seguridad");
          return false;
        }

        const exists = await checkIfEmailExists(email);
        if (exists) {
          Swal.showValidationMessage("Ya existe una cuenta con ese correo");
          return false;
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const success = await sendVerificationEmail(email, code);
        if (!success) return false;

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

            if (inputCode !== storedCode) {
              Swal.showValidationMessage("Código incorrecto");
              return false;
            }

            const result = await registerUser(email, password);
            if (!result.success) {
              Swal.showValidationMessage(result.message);
              return false;
            }

            setIsLoggedIn(true);
            setUserEmail(email);
            localStorage.setItem('userEmail', email);
            startLogoutTimer(); // Iniciar temporizador después del registro

            localStorage.removeItem("verify_code");
            localStorage.removeItem("verify_email");
            localStorage.removeItem("verify_password");
            Swal.fire("¡Registrado!", "Tu cuenta ha sido creada.", "success");
          }
        });
      }
    });
  };

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

  const loginUser = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Contraseña: password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al iniciar sesión');

      setIsLoggedIn(true);
      setUserEmail(email);
      localStorage.setItem('userEmail', email);
      startLogoutTimer(); // Iniciar temporizador después del login
      
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

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

        if (!email || !password) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }
        if (!validateEmail(email)) {
          Swal.showValidationMessage("Correo inválido");
          return false;
        }

        const result = await loginUser(email, password);
        if (!result.success) {
          Swal.showValidationMessage(result.message);
          return false;
        }
        
        Swal.fire("¡Bienvenido!", "Has iniciado sesión correctamente.", "success");
        return true;
      }  
    });
  };

  return (
    <nav className={`nav ${isScrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav_logo">
        <img src={logo} alt="IdaGo Logo" className="logo" />
      </div>
      <ul className="nav_links">
        <li className="link"><AnchorLink href="#header">Inicio</AnchorLink></li>
        <li className="link"><AnchorLink href="#plan-section">Aventuras</AnchorLink></li>
        <li className="link"><AnchorLink href="#safe-spaces">Espacios</AnchorLink></li>
        <li className="link"><AnchorLink href="#best-trips">Top viajes</AnchorLink></li>
      </ul>
      <div className="nav_buttons">
        {isLoggedIn ? (
          <div className="user-menu">
            <span className="user-email">{userEmail}</span>
            <button className="btn btn-logout" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        ) : (
          <button className="btn" onClick={handleLoginClick}>Iniciar Sesión</button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;