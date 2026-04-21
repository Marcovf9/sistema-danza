import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ClipboardCheck, ArrowRight, UserCircle, ArrowLeft, Check, X, Save } from 'lucide-react';
import api from '../../services/api';

const AgendaProfesorPage = () => {
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [claseActiva, setClaseActiva] = useState(null);
  const [sesionId, setSesionId] = useState(null);
  const [listaAlumnos, setListaAlumnos] = useState([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarMiAgenda();
  }, []);

  const cargarMiAgenda = async () => {
    setCargando(true);
    try {
      const response = await api.get('/portal-profesor/agenda');
      setClases(response.data);
    } catch (err) {
      setError("No se pudo cargar tu agenda.");
    } finally {
      setCargando(false);
    }
  };

  const abrirTomaAsistencia = async (clase) => {
    setClaseActiva(clase);
    setCargando(true);
    try {
      const response = await api.get(`/portal-profesor/agenda/${clase.id}/asistencia`);
      setSesionId(response.data.sesionId);
      const alumnosMapeados = response.data.alumnos.map(a => ({
        ...a,
        estado: a.estado || 'PRESENTE'
      }));
      setListaAlumnos(alumnosMapeados);
    } catch (err) {
      alert("Error al cargar la lista de alumnos.");
      setClaseActiva(null);
    } finally {
      setCargando(false);
    }
  };

  const toggleAsistencia = (alumnoId, nuevoEstado) => {
    setListaAlumnos(prev => prev.map(a => 
      a.alumnoId === alumnoId ? { ...a, estado: nuevoEstado } : a
    ));
  };

  const guardarAsistencia = async () => {
    setGuardando(true);
    try {
      const payload = listaAlumnos.map(a => ({
        alumnoId: a.alumnoId.toString(),
        estado: a.estado
      }));
      
      await api.post(`/portal-profesor/agenda/sesion/${sesionId}/guardar`, payload);
      alert("¡Asistencia guardada correctamente!");
      setClaseActiva(null);
    } catch (err) {
      alert("Error al guardar la asistencia.");
    } finally {
      setGuardando(false);
    }
  };

  if (claseActiva) {
    return (
      <div className="max-w-md mx-auto h-full flex flex-col md:max-w-3xl pb-24">
        {/* Cabecera Back */}
        <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
          <button onClick={() => setClaseActiva(null)} className="p-2 mr-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-200 transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="font-bold text-xl text-gray-800">{claseActiva.disciplina}</h2>
            <p className="text-sm text-gray-500">Fecha: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Lista de Alumnos */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {cargando ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : listaAlumnos.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No hay alumnos inscriptos en esta clase.</div>
          ) : (
            listaAlumnos.map(alumno => (
              <div key={alumno.alumnoId} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                    {alumno.nombre.charAt(0)}{alumno.apellido.charAt(0)}
                  </div>
                  <span className="font-semibold text-gray-800">{alumno.nombre} {alumno.apellido}</span>
                </div>
                
                {/* Botones Switch */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button 
                    onClick={() => toggleAsistencia(alumno.alumnoId, 'PRESENTE')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1 ${
                      alumno.estado === 'PRESENTE' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Check className="w-4 h-4" /> Presente
                  </button>
                  <button 
                    onClick={() => toggleAsistencia(alumno.alumnoId, 'AUSENTE')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1 ${
                      alumno.estado === 'AUSENTE' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <X className="w-4 h-4" /> Faltó
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botón Guardar Flotante */}
        {!cargando && listaAlumnos.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:max-w-3xl md:mx-auto">
            <button 
              onClick={guardarAsistencia}
              disabled={guardando}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black text-lg shadow-lg flex items-center justify-center gap-2 transition"
            >
              {guardando ? 'Guardando...' : <><Save className="w-6 h-6"/> Confirmar Asistencia</>}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-full flex flex-col space-y-6 md:max-w-3xl pb-20">
      
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-0 right-10 -mb-4 w-16 h-16 rounded-full bg-white opacity-10"></div>
        
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-indigo-200 font-medium text-sm">Portal Docente</p>
            <h2 className="text-3xl font-black mt-1">Mis Clases</h2>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <UserCircle className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {cargando && (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-sm text-center">{error}</div>
      )}

      {!cargando && !error && clases.length === 0 && (
        <div className="text-center py-12 text-gray-400 bg-white rounded-3xl border border-gray-100 border-dashed">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No tienes clases asignadas.</p>
        </div>
      )}

      {!cargando && !error && clases.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-gray-500 font-bold px-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Tus grupos activos
          </h3>
          
          {clases.map((clase) => (
            <div key={clase.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 transition-transform hover:scale-[1.01]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black tracking-wider mb-2">
                    {clase.disciplina} • {clase.horaInicio}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {clase.salon}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl px-3 py-2 border border-gray-100">
                  <Users className="w-5 h-5 text-indigo-400 mb-1" />
                  <span className="text-sm font-bold text-gray-700">{clase.cantidadAlumnos}</span>
                </div>
              </div>

              <button 
                onClick={() => abrirTomaAsistencia(clase)}
                className="w-full mt-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <ClipboardCheck className="w-5 h-5" />
                Tomar Asistencia
                <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgendaProfesorPage;