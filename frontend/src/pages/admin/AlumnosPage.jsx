import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Users, Plus, Edit, Trash2, Search, FileText, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import AlumnoModal from '../../components/admin/AlumnoModal';
import FichaAlumnoPanel from './FichaAlumnoPanel';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import showConfirmToast from '../../utils/confirmToast';
import { mensajeError } from '../../utils/mensajeError';

const AlumnosPage = () => {
  const queryClient = useQueryClient();

  const [mostrarActivos, setMostrarActivos] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alumnoAEditar, setAlumnoAEditar] = useState(null);
  const [alumnoEnFicha, setAlumnoEnFicha] = useState(null);

  // ── Carga ──────────────────────────────────────────────────────────────────
  const { data: alumnos = [], isLoading } = useQuery({
    queryKey: ['alumnos'],
    queryFn: () => api.get('/alumnos').then(r => r.data),
    onError: () => toast.error('Error cargando alumnos.'),
  });

  // ── Mutaciones ─────────────────────────────────────────────────────────────
  const guardarMutation = useMutation({
    mutationFn: (formData) =>
      alumnoAEditar
        ? api.put(`/alumnos/${alumnoAEditar.id}`, formData)
        : api.post('/alumnos', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      toast.success(alumnoAEditar ? '¡Alumno actualizado correctamente!' : '¡Alumno guardado correctamente!');
      setIsModalOpen(false);
    },
    onError: (error) => toast.error(mensajeError(error, 'Hubo un error al guardar los datos del alumno.'), { duration: 6000 }),
  });

  const bajaMutation = useMutation({
    mutationFn: (id) => api.patch(`/alumnos/${id}/baja`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      toast.success('Alumno dado de baja exitosamente.');
    },
    onError: (error) => {
      toast.error(mensajeError(error, 'Error al dar de baja al alumno.'), { duration: 5000 });
    },
  });

  const reactivarMutation = useMutation({
    mutationFn: (id) => api.patch(`/alumnos/${id}/reactivar`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      toast.success('¡Alumno reactivado con éxito!');
    },
    onError: (error) => toast.error(mensajeError(error, 'Error al reactivar.')),
  });

  const eliminarMutation = useMutation({
    mutationFn: (id) => api.delete(`/alumnos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      toast.success('Alumno eliminado definitivamente.');
    },
    onError: (error) => toast.error(mensajeError(error, 'Error al eliminar el alumno.')),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAbrirCrear = () => { setAlumnoAEditar(null); setIsModalOpen(true); };
  const handleAbrirEditar = (alumno) => { setAlumnoAEditar(alumno); setIsModalOpen(true); };

  const handleDarDeBaja = (id, nombre) => {
    showConfirmToast({
      titulo: '¿Dar de baja?',
      mensaje: `¿Estás seguro de dar de baja a ${nombre}? Se anularán sus inscripciones activas.`,
      labelOk: 'Sí, dar de baja',
      onConfirm: () => bajaMutation.mutate(id),
    });
  };

  const handleReactivar = (id, nombre) => {
    showConfirmToast({
      titulo: '¿Reactivar alumno?',
      mensaje: `¿Deseas volver a activar el perfil de ${nombre}? Podrá volver a inscribirse a clases.`,
      labelOk: 'Sí, reactivar',
      onConfirm: () => reactivarMutation.mutate(id),
    });
  };

  const handleEliminar = (id, nombre) => {
    showConfirmToast({
      titulo: '¿Eliminar definitivamente?',
      mensaje: `Esto borrará a ${nombre} y todos sus datos. No se puede deshacer.`,
      labelOk: 'Sí, eliminar',
      onConfirm: () => eliminarMutation.mutate(id),
    });
  };

  const alumnosFiltrados = alumnos
    .filter(a => a.activo === mostrarActivos)
    .filter(a => `${a.nombre} ${a.apellido} ${a.dni}`.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => a.apellido.localeCompare(b.apellido));

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl sm:text-3xl font-black text-gray-800 tracking-tight flex items-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-pink-600" /> Directorio de Alumnos
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Gestiona las inscripciones y legajos de la academia.</p>
        </div>
        <button
          onClick={handleAbrirCrear}
          className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" /> Nuevo Alumno
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none shadow-sm"
          />
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setMostrarActivos(true)}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${mostrarActivos ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Activos
          </button>
          <button
            onClick={() => setMostrarActivos(false)}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${!mostrarActivos ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <XCircle className="w-4 h-4 mr-2" /> Inactivos
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : alumnosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-500 shadow-sm border border-gray-100">No se encontraron alumnos con estos filtros.</div>
      ) : (
        <>
          {/* Vista tarjetas — mobile */}
          <div className="md:hidden space-y-3">
            {alumnosFiltrados.map((alumno) => (
              <div key={alumno.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 ${!alumno.activo ? 'opacity-70' : ''}`}>
                <div className="w-11 h-11 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-black text-sm flex-shrink-0">
                  {alumno.nombre.charAt(0)}{alumno.apellido.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-800 text-sm">{alumno.apellido}, {alumno.nombre}</p>
                    {alumno.esMenor && <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase">Menor</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{alumno.dni || 'Sin DNI'} · {alumno.telefono || 'Sin tel.'}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setAlumnoEnFicha(alumno)} className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition" title="Ficha">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleAbrirEditar(alumno)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar">
                    <Edit className="w-4 h-4" />
                  </button>
                  {mostrarActivos ? (
                    <button onClick={() => handleDarDeBaja(alumno.id, alumno.nombre)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Dar de baja">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => handleReactivar(alumno.id, alumno.nombre)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition" title="Reactivar">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Vista tabla — desktop */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Alumno</th>
                    <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">DNI</th>
                    <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Contacto</th>
                    <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {alumnosFiltrados.map((alumno) => (
                    <tr key={alumno.id} className={`hover:bg-gray-50 transition ${!alumno.activo ? 'opacity-70' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-black mr-3">
                            {alumno.nombre.charAt(0)}{alumno.apellido.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{alumno.apellido}, {alumno.nombre}</p>
                            {alumno.esMenor && <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Menor</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 font-medium">{alumno.dni}</td>
                      <td className="p-4 text-sm">
                        <p className="text-gray-800">{alumno.telefono || 'Sin tel.'}</p>
                        <p className="text-gray-500 text-xs">{alumno.email || 'Sin email'}</p>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setAlumnoEnFicha(alumno)} className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition" title="Ficha Completa">
                            <FileText className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleAbrirEditar(alumno)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar">
                            <Edit className="w-5 h-5" />
                          </button>
                          {mostrarActivos ? (
                            <button onClick={() => handleDarDeBaja(alumno.id, alumno.nombre)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Dar de baja">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          ) : (
                            <>
                              <button onClick={() => handleReactivar(alumno.id, alumno.nombre)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition" title="Reactivar">
                                <RotateCcw className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleEliminar(alumno.id, alumno.nombre)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Eliminar definitivamente">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <AlumnoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(formData) => guardarMutation.mutate(formData)}
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
