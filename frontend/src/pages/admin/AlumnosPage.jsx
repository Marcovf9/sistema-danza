import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Eye } from 'lucide-react';
import AlumnoModal from '../../components/admin/AlumnoModal';
import FichaAlumnoPanel from './FichaAlumnoPanel';

const AlumnosPage = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alumnoEnFicha, setAlumnoEnFicha] = useState(null);

  const fetchAlumnos = async () => {
    try {
      const response = await api.get('/alumnos');
      setAlumnos(response.data);
    } catch (error) {
      console.error("Error cargando alumnos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const handleGuardarAlumno = async (nuevoAlumno) => {
    try {
      await api.post('/alumnos', nuevoAlumno); 
      setIsModalOpen(false); // Cerramos el modal
      fetchAlumnos(); // Refrescamos la tabla
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar el alumno.");
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Cabecera de la página */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Gestión de Alumnos</h2>
          <p className="text-gray-500 mt-1">Listado general e inscripciones</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Alumno
        </button>
      </div>

      {/* Tabla de Datos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-xl">Cargando datos...</div>
        ) : alumnos.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xl">No hay alumnos registrados aún.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-5 font-semibold">Nombre y Apellido</th>
                  <th className="p-5 font-semibold">DNI</th>
                  <th className="p-5 font-semibold">Teléfono</th>
                  <th className="p-5 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-lg">
                {alumnos.map((alumno) => (
                  <tr key={alumno.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 font-medium text-gray-800">
                      {alumno.nombre} {alumno.apellido}
                    </td>
                    <td className="p-5 text-gray-600">{alumno.dni}</td>
                    <td className="p-5 text-gray-600">{alumno.telefono}</td>
                    <td className="p-5 text-center">
                      <button 
                        onClick={() => setAlumnoEnFicha(alumno)}
                        className="flex items-center justify-center mx-auto text-indigo-600 hover:text-indigo-800 font-medium px-4 py-2 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5 mr-2" /> Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Renderizamos el Modal pasándole las props */}
      <AlumnoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleGuardarAlumno} 
      />

      <FichaAlumnoPanel 
        isOpen={!!alumnoEnFicha} 
        onClose={() => setAlumnoEnFicha(null)} 
        alumno={alumnoEnFicha} 
      />

    </div>
  );
};

export default AlumnosPage;