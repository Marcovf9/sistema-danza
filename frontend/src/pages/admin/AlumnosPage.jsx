import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, FileText, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import AlumnoModal from '../../components/admin/AlumnoModal';
import FichaAlumnoPanel from './FichaAlumnoPanel';
import ConfirmModal from '../../components/ui/ConfirmModal';

const AlumnosPage = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [mostrarActivos, setMostrarActivos] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alumnoEditando, setAlumnoEditando] = useState(null);
  const [fichaActiva, setFichaActiva] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    titulo: '',
    mensaje: '',
    tipo: 'danger',
    textoConfirmar: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    cargarAlumnos();
  }, []);

  const cargarAlumnos = async () => {
    setCargando(true);
    try {
      const response = await api.get('/alumnos');
      setAlumnos(response.data);
    } catch (error) {
      toast.error("Error al cargar la lista de alumnos.");
    } finally {
      setCargando(false);
    }
  };

  const handleGuardarAlumno = async (datosAlumno) => {
    try {
      if (alumnoEditando) {
        await api.put(`/alumnos/${alumnoEditando.id}`, datosAlumno);
        toast.success("¡Alumno actualizado!");
      } else {
        await api.post('/alumnos', datosAlumno);
        toast.success("¡Alumno creado!");
      }
      setIsModalOpen(false);
      cargarAlumnos();
    } catch (error) {
      toast.error("Hubo un error al guardar el alumno.");
    }
  };

  const solicitarBaja = (id, nombre) => {
    setConfirmConfig({
      isOpen: true,
      titulo: 'Dar de Baja',
      mensaje: `¿Estás seguro de que deseas dar de baja a ${nombre}? Se anularán sus inscripciones activas.`,
      tipo: 'danger',
      textoConfirmar: 'Sí, dar de baja',
      onConfirm: async () => {
        try {
          await api.delete(`/alumnos/${id}`);
          toast.success("Alumno dado de baja correctamente.");
          cargarAlumnos();
        } catch (error) {
          if (error.response && error.response.status === 400 && error.response.data) {
            toast.error(error.response.data, { duration: 5000 });
          } else {
            toast.error("Ocurrió un error al intentar dar de baja al alumno.");
          }
        }
      }
    });
  };

  const solicitarReactivacion = (id, nombre) => {
    setConfirmConfig({
      isOpen: true,
      titulo: 'Reactivar Alumno',
      mensaje: `¿Deseas volver a activar el perfil de ${nombre}? Podrá volver a inscribirse a clases.`,
      tipo: 'info',
      textoConfirmar: 'Sí, reactivar',
      onConfirm: async () => {
        try {
          await api.patch(`/alumnos/${id}/reactivar`);
          toast.success("¡Alumno reactivado con éxito!");
          cargarAlumnos();
        } catch (error) {
          toast.error("Error al reactivar.");
        }
      }
    });
  };

  const abrirNuevo = () => {
    setAlumnoEditando(null);
    setIsModalOpen(true);
  };

  const abrirEdicion = (alumno) => {
    setAlumnoEditando(alumno);
    setIsModalOpen(true);
  };

  const alumnosFiltrados = alumnos
    .filter(a => a.activo === mostrarActivos)
    .filter(a => `${a.nombre} ${a.apellido} ${a.dni}`.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => a.apellido.localeCompare(b.apellido));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight flex items-center">
            <Users className="w-8 h-8 mr-3 text-indigo-600" /> Directorio de Alumnos
          </h2>
          <p className="text-gray-500 mt-1">Gestiona las inscripciones y legajos de la academia.</p>
        </div>
        <button onClick={abrirNuevo} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center transition shadow-md active:scale-95">
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
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setMostrarActivos(true)}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${mostrarActivos ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {cargando ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
        ) : (
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
                {alumnosFiltrados.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-500">No se encontraron alumnos con estos filtros.</td></tr>
                ) : (
                  alumnosFiltrados.map((alumno) => (
                    <tr key={alumno.id} className={`hover:bg-gray-50 transition ${!alumno.activo ? 'opacity-70' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black mr-3">
                            {alumno.nombre.charAt(0)}{alumno.apellido.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{alumno.apellido}, {alumno.nombre}</p>
                            {alumno.esMenor && <span className="text-[10px] font-black text-amber-600 bg-amber-10 px-2 py-0.5 rounded-full uppercase tracking-wider">Menor</span>}
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
                          <button onClick={() => setFichaActiva(alumno)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Ficha Completa">
                            <FileText className="w-5 h-5" />
                          </button>
                          <button onClick={() => abrirEdicion(alumno)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar">
                            <Edit className="w-5 h-5" />
                          </button>
                          
                          {/* BOTONES ACTUALIZADOS */}
                          {mostrarActivos ? (
                            <button onClick={() => solicitarBaja(alumno.id, alumno.nombre)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Dar de baja">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          ) : (
                            <button onClick={() => solicitarReactivacion(alumno.id, alumno.nombre)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition" title="Reactivar">
                              <RotateCcw className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlumnoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleGuardarAlumno} 
        alumnoAEditar={alumnoEditando} 
      />

      <FichaAlumnoPanel 
        isOpen={!!fichaActiva} 
        onClose={() => setFichaActiva(null)} 
        alumno={fichaActiva} 
      />

      {/* RENDERIZADO DEL MODAL */}
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        titulo={confirmConfig.titulo}
        mensaje={confirmConfig.mensaje}
        tipo={confirmConfig.tipo}
        textoConfirmar={confirmConfig.textoConfirmar}
      />
    </div>
  );
};

export default AlumnosPage;