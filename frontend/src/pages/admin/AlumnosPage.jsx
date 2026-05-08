import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Eye, Pencil, Trash2, AlertCircle } from 'lucide-react';
import AlumnoModal from '../../components/admin/AlumnoModal';
import FichaAlumnoPanel from './FichaAlumnoPanel';
import toast from 'react-hot-toast';

const AlumnosPage = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alumnoAEditar, setAlumnoAEditar] = useState(null);
  const [alumnoEnFicha, setAlumnoEnFicha] = useState(null);

  const fetchAlumnos = async () => {
    try {
      const response = await api.get('/alumnos');
      setAlumnos(response.data.filter(a => a.activo !== false));
      setAlumnos(response.data);
    } catch (error) {
      toast.error("Error cargando alumnos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const handleAbrirCrear = () => {
    setAlumnoAEditar(null);
    setIsModalOpen(true);
  };

  const handleAbrirEditar = (alumno) => {
    setAlumnoAEditar(alumno);
    setIsModalOpen(true);
  };

  const handleGuardarAlumno = async (formData) => {
    try {
      if (alumnoAEditar) {
        // MODO EDICIÓN
        await api.put(`/alumnos/${alumnoAEditar.id}`, formData);
        toast.success("¡Alumno actualizado correctamente!");
      } else {
        // MODO CREACIÓN
        await api.post('/alumnos', formData); 
        toast.success("¡Alumno guardado correctamente!");
      }
      setIsModalOpen(false); 
      fetchAlumnos(); 
    } catch (error) {
      toast.error("Hubo un error al guardar los datos del alumno.");
    }
  };

  const handleDarDeBaja = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="font-bold text-gray-800 text-lg">¿Dar de baja?</p>
        </div>
        <p className="text-sm text-gray-600">
          El alumno pasará a estado inactivo. No perderás su historial. ¿Deseas continuar?
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">
            Cancelar
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.patch(`/alumnos/${id}/baja`);
                toast.success("Alumno dado de baja exitosamente.");
                fetchAlumnos();
              } catch (error) {
                toast.error("Error al dar de baja al alumno.");
              }
            }} 
            className="px-4 py-2 text-sm font-bold bg-red-500 text-white hover:bg-red-600 rounded-xl shadow-sm transition"
          >
            Sí, dar de baja
          </button>
        </div>
      </div>
    ), { duration: Infinity, style: { minWidth: '350px' } });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Alumnos</h2>
          <p className="text-sm text-gray-500 mt-1">Administra la información y fichas de los estudiantes.</p>
        </div>
        <button 
          onClick={handleAbrirCrear}
          className="mt-4 sm:mt-0 flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" /> Nuevo Alumno
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-5 font-semibold text-gray-600">Nombre Completo</th>
                  <th className="p-5 font-semibold text-gray-600">DNI</th>
                  <th className="p-5 font-semibold text-gray-600">Teléfono</th>
                  <th className="p-5 font-semibold text-gray-600 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-lg">
                {alumnos.map((alumno) => (
                  <tr key={alumno.id} className={`hover:bg-gray-50/50 transition-colors ${alumno.activo === false ? 'opacity-50' : ''}`}>
                    <td className="p-5 font-medium text-gray-800">
                      {alumno.nombre} {alumno.apellido}
                      {alumno.activo === false && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">INACTIVO</span>}
                    </td>
                    <td className="p-5 text-gray-600">{alumno.dni}</td>
                    <td className="p-5 text-gray-600">{alumno.telefono}</td>
                    <td className="p-5">
                      <div className="flex justify-center items-center gap-2">
                        <button onClick={() => handleAbrirEditar(alumno)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar">
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button onClick={() => setAlumnoEnFicha(alumno)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Ver Ficha">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDarDeBaja(alumno.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Dar de baja">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlumnoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleGuardarAlumno}
        alumnoAEditar={alumnoAEditar} 
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