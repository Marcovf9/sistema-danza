import { X, GraduationCap, Calendar, DollarSign, ClipboardList, CheckCircle2, XCircle, FileText, Download, Clock, User, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const formatearHora = (hora) => {
  if (!hora) return "00:00";
  if (Array.isArray(hora)) {
    return `${hora[0].toString().padStart(2, '0')}:${(hora[1] || 0).toString().padStart(2, '0')}`;
  }
  return hora.toString().slice(0, 5);
};

const FichaAlumnoPanel = ({ isOpen, onClose, alumno }) => {
  const [tabActiva, setTabActiva] = useState('INFO');
  const [inscripciones, setInscripciones] = useState([]);
  const [clasesDisponibles, setClasesDisponibles] = useState([]);
  const [historialAsistencia, setHistorialAsistencia] = useState([]);
  const [historialPagos, setHistorialPagos] = useState([]);

  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState('');
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (isOpen && alumno) {
      cargarDatos();
      setTabActiva('INFO');
      setClaseSeleccionadaId('');
      setDiasSeleccionados([]);
    }
  }, [isOpen, alumno]);

  useEffect(() => {
    if (claseSeleccionadaId) {
      const clase = clasesDisponibles.find(c => c.id.toString() === claseSeleccionadaId);
      if (clase) {
        setDiasSeleccionados(clase.diasSemana.split(',').map(d => d.trim()));
      }
    } else {
      setDiasSeleccionados([]);
    }
  }, [claseSeleccionadaId, clasesDisponibles]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [inscripcionesRes, clasesRes, asistenciaRes, pagosRes] = await Promise.all([
        api.get(`/academico/inscripciones/alumno/${alumno.id}`).catch(() => ({ data: [] })),
        api.get('/academico/clases').catch(() => ({ data: [] })),
        api.get(`/asistencias/alumno/${alumno.id}`).catch(() => ({ data: [] })),
        api.get(`/caja/recibos/alumno/${alumno.id}`).catch(() => ({ data: [] }))
      ]);

      setInscripciones(Array.isArray(inscripcionesRes.data) ? inscripcionesRes.data : []);
      setClasesDisponibles(Array.isArray(clasesRes.data) ? clasesRes.data : []);
      setHistorialAsistencia(Array.isArray(asistenciaRes.data) ? asistenciaRes.data : []);
      setHistorialPagos(Array.isArray(pagosRes.data) ? pagosRes.data : []);
    } catch (error) {
      console.error("Error cargando ficha:", error);
    } finally {
      setCargando(false);
    }
  };

  const toggleDia = (dia) => {
    setDiasSeleccionados(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);
  };

  const handleDarDeBaja = (inscripcionId, nombreDisciplina) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-bold text-gray-800 text-lg">¿Dar de baja en {nombreDisciplina}?</p>
        <p className="text-sm text-gray-600">El alumno ya no figurará en la lista de esta clase.</p>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">Cancelar</button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.patch(`/academico/inscripciones/${inscripcionId}/baja`);
                toast.success("Baja procesada correctamente.");
                cargarDatos(); // Recarga la ficha
              } catch (error) {
                toast.error("Error al dar de baja.");
              }
            }} 
            className="px-4 py-2 text-sm font-bold bg-red-500 text-white hover:bg-red-600 rounded-xl shadow-sm transition"
          >
            Confirmar Baja
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleInscribir = async () => {
    if (!claseSeleccionadaId) return;
    if (diasSeleccionados.length === 0) return toast.error("Debes seleccionar al menos un día.");

    try {
      await api.post('/academico/inscripciones', null, {
        params: { alumnoId: alumno.id, claseId: claseSeleccionadaId, diasSeleccionados: diasSeleccionados.join(',') }
      });
      setClaseSeleccionadaId('');
      setDiasSeleccionados([]);
      toast.success("¡Alumno inscrito correctamente!");
      cargarDatos();
    } catch (error) {
      toast.error("Hubo un error al inscribir al alumno.");
    }
  };

  const descargarPdf = async (reciboId) => {
    try {
      const response = await api.get(`/caja/recibos/${reciboId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Recibo_${reciboId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("No se pudo descargar el comprobante.");
    }
  };

  if (!isOpen || !alumno) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-indigo-600">
          <div>
            <h2 className="text-2xl font-bold text-white">{alumno.nombre} {alumno.apellido}</h2>
            <p className="text-indigo-200 text-sm mt-1">DNI: {alumno.dni}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 bg-gray-50">
          <button onClick={() => setTabActiva('INFO')} className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${tabActiva === 'INFO' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Info Académica</button>
          <button onClick={() => setTabActiva('CUENTA')} className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${tabActiva === 'CUENTA' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Estado de Cuenta</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50">
          
          {tabActiva === 'INFO' && (
            <>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Información de Contacto</h3>
                <div className="space-y-3 text-gray-700">
                  <p><span className="font-medium mr-2">Teléfono:</span> {alumno.telefono || 'No registrado'}</p>
                  
                  {/* MODIFICACIÓN: Si es menor muestra el Tutor, si es adulto muestra Emergencia */}
                  {alumno.esMenor && alumno.tutor ? (
                    <p className="flex items-center"><span className="font-medium mr-2">Adulto a cargo:</span> <User className="w-4 h-4 mr-1 text-indigo-500"/> {alumno.tutor.nombre} {alumno.tutor.apellido}</p>
                  ) : (
                    <p><span className="font-medium mr-2">Emergencia:</span> {alumno.contactoEmergencia || 'No registrado'}</p>
                  )}

                  {alumno.grupoFamiliar && (
                    <p><span className="font-medium mr-2">Familia:</span> 
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-md">{alumno.grupoFamiliar.nombreReferencia}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center"><GraduationCap className="w-4 h-4 mr-2" /> Clases Actuales</h3>
                {cargando ? (
                  <p className="text-gray-500 text-sm font-medium animate-pulse">Cargando expediente...</p>
                ) : Array.isArray(inscripciones) && inscripciones.length > 0 ? (
                  <ul className="space-y-3">
                    {inscripciones.map(ins => (
                      <li key={ins.id} className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between group">
                        <div>
                          <p className="font-bold text-indigo-900">{ins.clase.disciplina.nombre}</p>
                          <p className="text-sm text-indigo-700 mt-1 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" /> {ins.diasSeleccionados ? ins.diasSeleccionados : ins.clase.diasSemana} - {formatearHora(ins.clase.horaInicio)}hs
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDarDeBaja(ins.id, ins.clase.disciplina.nombre)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Dar de baja"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">El alumno no está inscrito en ninguna clase.</p>
                )}

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Inscribir en nueva clase:</label>
                  <div className="flex flex-col gap-3">
                    <select 
                      value={claseSeleccionadaId}
                      onChange={(e) => setClaseSeleccionadaId(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium bg-gray-50"
                    >
                      <option value="">Seleccione una disciplina...</option>
                      {clasesDisponibles.map(c => (
                        <option key={c.id} value={c.id}>{c.disciplina.nombre} ({c.diasSemana})</option>
                      ))}
                    </select>

                    {claseSeleccionadaId && (
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Días a cursar:</p>
                        <div className="flex flex-wrap gap-2">
                          {clasesDisponibles.find(c => c.id.toString() === claseSeleccionadaId)?.diasSemana.split(',').map(dia => {
                            const d = dia.trim();
                            const isSelected = diasSeleccionados.includes(d);
                            return (
                              <button key={d} onClick={() => toggleDia(d)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${isSelected ? 'bg-indigo-100 border-indigo-400 text-indigo-700' : 'bg-white border-gray-300 text-gray-400'}`}>
                                {d}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    
                    <button onClick={handleInscribir} disabled={!claseSeleccionadaId || diasSeleccionados.length === 0} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-bold transition-all shadow-sm">
                      Confirmar Inscripción
                    </button>
                  </div>
                </div>
              </div>

              {/* Historial Asistencias */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center"><ClipboardList className="w-4 h-4 mr-2" /> Últimas Asistencias</h3>
                {cargando ? (
                  <p className="text-gray-500 text-sm font-medium animate-pulse">Cargando registros...</p>
                ) : Array.isArray(historialAsistencia) && historialAsistencia.length > 0 ? (
                  <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {[...historialAsistencia].reverse().map((registro, idx) => (
                      <li key={idx} className="flex justify-between items-center p-3 border border-gray-50 rounded-lg hover:bg-gray-50">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{registro.disciplina}</p>
                          <p className="text-xs font-medium text-gray-500">{registro.fecha}</p>
                        </div>
                        {registro.estado === 'PRESENTE' ? (
                          <span className="flex items-center text-[10px] font-black tracking-wider text-green-700 bg-green-100 px-2 py-1 rounded-md"><CheckCircle2 className="w-3 h-3 mr-1" /> PRESENTE</span>
                        ) : (
                          <span className="flex items-center text-[10px] font-black tracking-wider text-red-700 bg-red-100 px-2 py-1 rounded-md"><XCircle className="w-3 h-3 mr-1" /> AUSENTE</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">No hay registros de asistencia aún.</p>
                )}
              </div>
            </>
          )}

          {tabActiva === 'CUENTA' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center"><FileText className="w-4 h-4 mr-2" /> Historial de Facturación</h3>
                {cargando ? (
                  <p className="text-gray-500 text-sm font-medium animate-pulse">Cargando estado de cuenta...</p>
                ) : historialPagos.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500 text-sm italic">El alumno no tiene recibos generados.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historialPagos.map((recibo) => (
                      <div key={recibo.id} className="p-4 border border-gray-100 bg-gray-50 rounded-xl flex items-center justify-between group hover:border-indigo-200 hover:bg-white transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${recibo.estado === 'PAGADO' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">Recibo #{recibo.id.toString().padStart(5, '0')}</p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">Emitido: {new Date(recibo.fechaEmision).toLocaleDateString()}</p>
                            <span className={`inline-block mt-1 text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md uppercase ${recibo.estado === 'PAGADO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {recibo.estado}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-lg font-black text-gray-800">${recibo.montoTotal.toLocaleString('es-AR')}</p>
                          {recibo.estado === 'PAGADO' && (
                            <button onClick={() => descargarPdf(recibo.id)} className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
                              <Download className="w-3 h-3" /> PDF
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default FichaAlumnoPanel;