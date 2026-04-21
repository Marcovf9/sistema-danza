import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LayoutPrincipal from './components/layout/LayoutPrincipal';
import Dashboard from './pages/admin/Dashboard';
import AlumnosPage from './pages/admin/AlumnosPage';
import CajaPage from './pages/admin/CajaPage';
import ProfesoresPage from './pages/profesor/ProfesoresPage'; // Ojo con la ruta de este archivo en tu proyecto
import AsistenciaPage from './pages/admin/AsistenciaPage';
import LoginPage from './pages/auth/LoginPage';
import CalendarioPage from './pages/admin/CalendarioPage';
import AgendaProfesorPage from './pages/profesor/AgendaProfesorPage';

const RutaProtegida = ({ children, rolesPermitidos }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token) return <Navigate to="/login" replace />;
  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    // Si no tiene permiso, lo mandamos a su pantalla principal respectiva
    return <Navigate to={rol === 'PROFESOR' ? '/profesor/agenda' : '/dashboard'} replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<RutaProtegida><LayoutPrincipal /></RutaProtegida>}>
          {/* Redirección inicial basada en el rol */}
          <Route index element={
            <Navigate to={localStorage.getItem('rol') === 'PROFESOR' ? '/profesor/agenda' : '/dashboard'} replace />
          } />
          
          {/* Rutas exclusivas del DIRECTOR */}
          <Route path="dashboard" element={<RutaProtegida rolesPermitidos={['DIRECTOR']}><Dashboard /></RutaProtegida>} />
          <Route path="alumnos" element={<RutaProtegida rolesPermitidos={['DIRECTOR']}><AlumnosPage /></RutaProtegida>} />
          <Route path="caja" element={<RutaProtegida rolesPermitidos={['DIRECTOR']}><CajaPage /></RutaProtegida>} />
          <Route path="profesores" element={<RutaProtegida rolesPermitidos={['DIRECTOR']}><ProfesoresPage /></RutaProtegida>} />
          
          {/* Ruta exclusiva del PROFESOR */}
          <Route path="profesor/agenda" element={<RutaProtegida rolesPermitidos={['PROFESOR']}><AgendaProfesorPage /></RutaProtegida>} />
          
          {/* Rutas compartidas */}
          <Route path="asistencia" element={<RutaProtegida rolesPermitidos={['DIRECTOR', 'PROFESOR']}><AsistenciaPage /></RutaProtegida>} />
          <Route path="calendario" element={<RutaProtegida rolesPermitidos={['DIRECTOR', 'PROFESOR']}><CalendarioPage /></RutaProtegida>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;