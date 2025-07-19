import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Header from './components/Header';
import PlanSection from './components/PlanSection';
import SafeSpaces from './components/SafeSpace';
import BestTrips from './components/BestTrips';
import Footer from './components/Footer';
import './styles/style.css';


function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
     <NavBar /> {/* Barra de navegación */}
     <div id="header"> {/* Sección de inicio */}
  <Header />
</div>

<div id="plan-section"> {/* Sección de planes */}
  <PlanSection />
</div>
<div id="safe-spaces"> {/* Espacios seguros */}
  <SafeSpaces />
</div>
<div id="best-trips"> {/* Los mejores viajes del mes */}
  <BestTrips />
</div>
      <Footer style={{ marginTop: 'auto' }} /> {/* Footer pegado al final */}
    </div>
  );
}

export default App;