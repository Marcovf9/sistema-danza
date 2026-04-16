import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LayoutPrincipal from './components/layout/LayoutPrincipal';
import Dashboard from './pages/admin/Dashboard';
import AlumnosPage from './pages/admin/AlumnosPage';
import CajaPage from './pages/admin/CajaPage';
import ProfesoresPage from './pages/admin/ProfesoresPage';
import AsistenciaPage from './pages/admin/AsistenciaPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutPrincipal />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="alumnos" element={<AlumnosPage />} />
          <Route path="caja" element={<CajaPage />} />
          <Route path="profesores" element={<ProfesoresPage />} />
          <Route path="asistencia" element={<AsistenciaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;