import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ClipboardCheck, ArrowRight, UserCircle, ArrowLeft, CheckCircle2, XCircle, Save, FileText, Download, Receipt, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AgendaProfesorPage = () => {
  const [tabActiva, setTabActiva] = useState('CLASES');
  const [clases, setClases] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [claseActiva, setClaseActiva] = useState(null);
  const [sesionId, setSesionId] = useState(null);
  const [listaAlumnos, setListaAlumnos] = useState([]);
  const [guardando, setGuardando] = useState(false);
  
  const maxDate = new Date().toISOString().split('T')[0];
  const [fechaAsistencia, setFechaAsistencia] = useState(maxDate);

  useEffect(() => {
    if (tabActiva === 'CLASES') {
      cargarMiAgenda();
    } else {
      cargarMisLiquidaciones();
    }
  }, [tabActiva]);

  const cargarMiAgenda = async () => {
    setCargando(true);
    try {
      const response = await api.get('/portal-profesor/agenda');
      setClases(response.data);
    } catch (err) {
      setError("No se pudo cargar la agenda.");
    } finally {
      setCargando(false);
    }
  };

  const cargarMisLiquidaciones = async () => {
    setCargando(true);
    try {
      const response = await api.get('/portal-profesor/liquidaciones');
      setLiquidaciones(response.data);
    } catch (err) {
      setError("Error al cargar el historial de recibos.");
    } finally {
      setCargando(false);
    }
  };

  const abrirTomaAsistencia = async (clase, fechaPersonalizada = null) => {
    const fecha = fechaPersonalizada || maxDate;
    if (!fechaPersonalizada) setFechaAsistencia(fecha);

    setClaseActiva(clase);
    setCargando(true);
    try {
      const response = await api.get(`/portal-profesor/agenda/${clase.id}/asistencia`, {
        params: { fecha }
      });
      setSesionId(response.data.sesionId);
      const alumnosMapeados = response.data.alumnos.map(a => ({
        ...a,
        estado: a.estado || 'PRESENTE'
      }));
      setListaAlumnos(alumnosMapeados);
    } catch (err) {
      toast.error("Error al cargar la lista de alumnos.");
      setClaseActiva(null);
    } finally {
      setCargando(false);
    }
  };

  const cambiarFechaAsistencia = (e) => {
    const nuevaFecha = e.target.value;
    setFechaAsistencia(nuevaFecha);
    abrirTomaAsistencia(claseActiva, nuevaFecha);
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
      toast.success("¡Asistencia registrada!");
      setTimeout(() => {
        setClaseActiva(null);
      }, 1500);
    } catch (err) {
      toast.error("Error al registrar la asistencia.");
    } finally {
      setGuardando(false);
    }
  };

  const descargarPdf = async (id, mes, anio) => {
    try {
      const response = await api.get(`/portal-profesor/liquidaciones/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Honorarios_${mes}_${anio}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("No fue posible generar el documento.");
    }
  };

  if (claseActiva) {
    const presentesCount = listaAlumnos.filter(a => a.estado === 'PRESENTE').length;

    return (
      <div className="max-w-lg mx-auto bg-white min-h-[80vh] shadow-xl sm:rounded-3xl flex flex-col relative overflow-hidden border border-gray-100 animate-in fade-in duration-300">
        
        <div className="bg-indigo-600 p-6 text-white shadow-md z-10">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setClaseActiva(null)} className="text-indigo-200 hover:text-white font-medium text-sm flex items-center transition">
                <ArrowLeft className="w-4 h-4 mr-1" /> Volver
            </button>
            <input 
              type="date" 
              max={maxDate}
              value={fechaAsistencia}
              onChange={cambiarFechaAsistencia}
              className="bg-indigo-500/50 border border-indigo-400 text-white rounded-lg px-2 py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-white cursor-pointer transition-colors"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <h2 className="text-2xl font-bold">{claseActiva.disciplina}</h2>
          <p className="text-indigo-200 flex items-center mt-1 text-sm">
            <Clock className="w-4 h-4 mr-1" /> {claseActiva.horaInicio}hs
          </p>
        </div>

        <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-center">
          <span className="text-indigo-800 font-medium flex items-center">
            <Users className="w-4 h-4 mr-2" /> {listaAlumnos.length} Inscritos
          </span>
          <span className="bg-white px-3 py-1 rounded-lg text-indigo-700 font-bold shadow-sm text-sm">
            {presentesCount} Presentes
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
          {cargando ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : listaAlumnos.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Sin alumnos registrados.</div>
          ) : (
            listaAlumnos.map(alumno => {
              const isPresente = alumno.estado === 'PRESENTE';
              return (
                <div 
                  key={alumno.alumnoId}
                  onClick={() => toggleAsistencia(alumno.alumnoId, isPresente ? 'AUSENTE' : 'PRESENTE')}
                  className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all active:scale-95 border-2 ${
                    isPresente 
                      ? 'bg-white border-green-500 shadow-sm' 
                      : 'bg-red-50 border-red-200 opacity-80'
                  }`}
                >
                  <span className={`text-lg font-bold ${isPresente ? 'text-gray-800' : 'text-red-700'}`}>
                    {alumno.nombre} {alumno.apellido}
                  </span>
                  <div>
                    {isPresente ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-500" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!cargando && listaAlumnos.length > 0 && (
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white via-white to-transparent pt-10">
            <button 
              onClick={guardarAsistencia}
              disabled={guardando}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-lg font-bold rounded-2xl shadow-xl transition-transform active:scale-95 flex justify-center items-center"
            >
              {guardando ? 'Procesando...' : <><Save className="w-5 h-5 mr-2"/> Confirmar Asistencia</>}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-full flex flex-col space-y-6 md:max-w-3xl pb-20 animate-in fade-in duration-500">
      
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-0 right-10 -mb-4 w-16 h-16 rounded-full bg-white opacity-10"></div>
        
        <div className="relative z-10 flex justify-between items-center mb-6">
          <div>
            <p className="text-indigo-200 font-medium text-sm">Portal Docente</p>
            <h2 className="text-3xl font-black mt-1">Autogestión</h2>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <UserCircle className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="relative z-10 flex bg-indigo-700/50 p-1 rounded-xl">
          <button 
            onClick={() => setTabActiva('CLASES')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${tabActiva === 'CLASES' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:text-white'}`}
          >
            <Calendar className="w-4 h-4" /> Mis Clases
          </button>
          <button 
            onClick={() => setTabActiva('RECIBOS')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${tabActiva === 'RECIBOS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:text-white'}`}
          >
            <Receipt className="w-4 h-4" /> Mis Recibos
          </button>
        </div>
      </div>

      {cargando && (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-sm text-center">{error}</div>
      )}

      {tabActiva === 'CLASES' && !cargando && !error && (
        <>
          {clases.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-3xl border border-gray-100 border-dashed">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No tienes clases asignadas.</p>
            </div>
          ) : (
            <div className="space-y-4">
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
                    className="w-full mt-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition-colors shadow-md active:scale-95"
                  >
                    <ClipboardCheck className="w-5 h-5" />
                    Tomar Asistencia
                    <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tabActiva === 'RECIBOS' && !cargando && !error && (
        <>
          {liquidaciones.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-3xl border border-gray-100 border-dashed">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay registros de liquidaciones abonadas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-gray-500 font-bold px-2 flex items-center gap-2 mb-4">
                <Receipt className="w-4 h-4" /> Historial de Pagos
              </h3>
              {liquidaciones.map((liq) => (
                <div key={liq.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Liquidación Mes {liq.mes}</p>
                      <p className="text-xs text-gray-500">Período {liq.anio}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-black text-gray-800">${liq.totalAPagar.toLocaleString('es-AR')}</p>
                    <button 
                      onClick={() => descargarPdf(liq.id, liq.mes, liq.anio)}
                      className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors"
                      title="Descargar PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default AgendaProfesorPage;