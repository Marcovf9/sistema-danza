import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LayoutPrincipal from './components/layout/LayoutPrincipal';
import Dashboard from './pages/admin/Dashboard';
import AlumnosPage from './pages/admin/AlumnosPage';
import CajaPage from './pages/admin/CajaPage';
import ProfesoresPage from './pages/profesor/ProfesoresPage';
import AsistenciaPage from './pages/admin/AsistenciaPage';
import LoginPage from './pages/auth/LoginPage';
import CalendarioPage from './pages/admin/CalendarioPage';
import AgendaProfesorPage from './pages/profesor/AgendaProfesorPage';
import AuditoriaPage from './pages/admin/AuditoriaPage';
import ClasesPage from './pages/admin/ClasesPage';
import TiendaPage from './pages/admin/TiendaPage';
import PortalAlumnoPage from './pages/alumno/PortalAlumnoPage';


const RutaProtegida = ({ children, rolesPermitidos }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token) return <Navigate to="/login" replace />;
  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    return <Navigate to={rol === 'PROFESOR' ? '/profesor/agenda' : '/dashboard'} replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      {/* --- CONFIGURACIÓN GLOBAL DE TOASTS --- */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
            fontWeight: 'bold'
          },
          success: {
            style: { background: '#10B981', color: 'white' },
          },
          error: {
            style: { background: '#EF4444', color: 'white' },
          },
        }} 
      />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RutaProtegida><LayoutPrincipal /></RutaProtegida>}>
          
          <Route index element={
            <Navigate to={
              localStorage.getItem('rol') === 'PROFESOR' ? '/profesor/agenda' : 
              localStorage.getItem('rol') === 'ALUMNO' ? '/alumno/cuenta' : 
              '/dashboard'
            } replace />
          } />
          
          <Route path="dashboard" element={<RutaProtegida rolesPermitidos={['DIRECTOR']}><Dashboard /></RutaProtegida>} />
          <Route path="alumnos" element={<RutaProtegida rolesPermitidos={['DIRECTOR']}><AlumnosPage /></RutaProtegida>} />
          <Route path="caja" element={<RutaProtegida rolesPermitidos={['DIRECTOR']}><CajaPage /></RutaProtegida>} />
          <Route path="profesores" element={<RutaProtegida rolesPermitidos={['DIRECTOR']}><ProfesoresPage /></RutaProtegida>} />
          <Route path="auditoria" element={<RutaProtegida rolesPermitidos={['DIRECTOR']}><AuditoriaPage /></RutaProtegida>} />
          <Route path="profesor/agenda" element={<RutaProtegida rolesPermitidos={['PROFESOR']}><AgendaProfesorPage /></RutaProtegida>} />
          <Route path="clases" element={<RutaProtegida rolesPermitidos={['DIRECTOR']}><ClasesPage /></RutaProtegida>} />
          <Route path="asistencia" element={<RutaProtegida rolesPermitidos={['DIRECTOR', 'PROFESOR']}><AsistenciaPage /></RutaProtegida>} />
          <Route path="calendario" element={<RutaProtegida rolesPermitidos={['DIRECTOR', 'PROFESOR']}><CalendarioPage /></RutaProtegida>} />

          <Route path="alumno/cuenta" element={<RutaProtegida rolesPermitidos={['ALUMNO']}><PortalAlumnoPage vista="CUENTA" /></RutaProtegida>} />
          <Route path="alumno/clases" element={<RutaProtegida rolesPermitidos={['ALUMNO']}><PortalAlumnoPage vista="CLASES" /></RutaProtegida>} />
          <Route path="alumno/tienda" element={<RutaProtegida rolesPermitidos={['ALUMNO']}><PortalAlumnoPage vista="TIENDA" /></RutaProtegida>} />
        
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;