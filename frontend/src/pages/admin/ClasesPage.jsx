import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Pencil, Plus, GraduationCap } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const formatearHora = (hora) => {
  if (!hora) return "00:00";
  if (Array.isArray(hora)) {
    return `${hora[0].toString().padStart(2, '0')}:${(hora[1] || 0).toString().padStart(2, '0')}`;
  }
  return hora.toString().slice(0, 5);
};

const ClasesPage = () => {
  const [clases, setClases] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [salones, setSalones] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claseAEditar, setClaseAEditar] = useState(null);
  const [nuevoProfesorId, setNuevoProfesorId] = useState('');
  const [nuevosDias, setNuevosDias] = useState('');
  const [nuevoSalonId, setNuevoSalonId] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [clasesRes, profRes, salonesRes] = await Promise.all([
        api.get('/academico/clases').catch(() => ({ data: [] })),
        api.get('/profesores').catch(() => ({ data: [] })),
        api.get('/academico/salones').catch(() => ({ data: [] }))
      ]);
      
      const clasesData = clasesRes.data;
      setClases(clasesData);
      setProfesores(profRes.data.filter(p => p.activo !== false));
      
      if (salonesRes.data.length > 0) {
        setSalones(salonesRes.data);
      } else {
        const uniqueSalones = [];
        const ids = new Set();
        clasesData.forEach(c => {
          if (c.salon && !ids.has(c.salon.id)) {
            ids.add(c.salon.id);
            uniqueSalones.push(c.salon);
          }
        });
        setSalones(uniqueSalones);
      }

    } catch (error) {
      toast.error("Error al cargar los datos.");
    } finally {
      setCargando(false);
    }
  };

  const abrirEditor = (clase) => {
    setClaseAEditar(clase);
    setNuevoProfesorId(clase.profesorTitular?.id || '');
    setNuevosDias(clase.diasSemana || '');
    setNuevoSalonId(clase.salon?.id || '');
    setNuevaHora(formatearHora(clase.horaInicio));
    setIsModalOpen(true);
  };

  const guardarCambios = async () => {
    setGuardando(true);
    try {
      await api.put(`/academico/clases/${claseAEditar.id}`, {
        profesorId: nuevoProfesorId,
        diasSemana: nuevosDias,
        salonId: nuevoSalonId,
        horaInicio: nuevaHora
      });
      toast.success("¡Clase actualizada correctamente!");
      setIsModalOpen(false);
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data || "Error al actualizar la clase.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* CABECERA */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            Gestión de Clases <Calendar className="ml-3 w-6 h-6 text-indigo-500" />
          </h2>
          <p className="text-gray-500 mt-1">Administra los horarios y asigna profesores a cada grupo.</p>
        </div>
        <button 
          onClick={() => toast.success("Módulo de creación en desarrollo")}
          className="mt-4 sm:mt-0 flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> Nueva Clase
        </button>
      </div>

      {/* LISTADO DE CLASES */}
      {cargando ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clases.map(clase => (
            <div key={clase.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative group hover:border-indigo-300 transition-colors">
              <button 
                onClick={() => abrirEditor(clase)}
                className="absolute top-4 right-4 p-2 bg-indigo-50 text-indigo-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-600 hover:text-white"
                title="Editar Profesor y Horarios"
              >
                <Pencil className="w-4 h-4" />
              </button>

              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-black tracking-widest uppercase mb-2">
                  {clase.disciplina?.nombre || 'Disciplina General'}
                </span>
                <div className="flex items-center gap-2 text-gray-700 font-bold">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>{clase.diasSemana} - {formatearHora(clase.horaInicio)} hs</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold uppercase flex items-center"><User className="w-3 h-3 mr-1"/> Profesor</span>
                  <span className={`text-sm font-bold ${clase.profesorTitular ? 'text-gray-800' : 'text-red-500'}`}>
                    {clase.profesorTitular ? `${clase.profesorTitular.nombre} ${clase.profesorTitular.apellido}` : 'Sin Asignar'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold uppercase flex items-center"><MapPin className="w-3 h-3 mr-1"/> Salón</span>
                  <span className="text-sm font-bold text-gray-800">{clase.salon?.nombre || 'General'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE EDICIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-indigo-600 p-6 text-white">
              <h3 className="text-xl font-bold">Configurar Clase</h3>
              <p className="text-indigo-200 text-sm">{claseAEditar?.disciplina?.nombre}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-indigo-500" />
                  Profesor a Cargo
                </label>
                <select 
                  value={nuevoProfesorId} 
                  onChange={(e) => setNuevoProfesorId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-700"
                >
                  <option value="">-- Seleccionar Profesor --</option>
                  {profesores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                  Salón
                </label>
                <select 
                  value={nuevoSalonId} 
                  onChange={(e) => setNuevoSalonId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-700"
                >
                  <option value="">-- Seleccionar Salón --</option>
                  {salones.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                    Días (Ej: LUNES, MARTES)
                  </label>
                  <input 
                    type="text" 
                    value={nuevosDias} 
                    onChange={(e) => setNuevosDias(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-700 uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                    Horario de Inicio
                  </label>
                  <input 
                    type="time" 
                    value={nuevaHora} 
                    onChange={(e) => setNuevaHora(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-700"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">Cancelar</button>
                <button 
                  onClick={guardarCambios} 
                  disabled={guardando}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition disabled:bg-gray-400"
                >
                  {guardando ? 'Verificando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClasesPage;