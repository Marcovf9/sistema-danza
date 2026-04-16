import { X, GraduationCap, Calendar, DollarSign, ClipboardList, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';

const FichaAlumnoPanel = ({ isOpen, onClose, alumno }) => {
  const [inscripciones, setInscripciones] = useState([]);
  const [clasesDisponibles, setClasesDisponibles] = useState([]);
  const [historialAsistencia, setHistorialAsistencia] = useState([]); // <-- NUEVO ESTADO
  const [claseSeleccionada, setClaseSeleccionada] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (isOpen && alumno) {
      cargarDatos();
    }
  }, [isOpen, alumno]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [inscripcionesRes, clasesRes, asistenciaRes] = await Promise.all([
        api.get(`/academico/inscripciones/alumno/${alumno.id}`),
        api.get('/academico/clases'),
        api.get(`/asistencias/alumno/${alumno.id}`) // <-- NUEVA LLAMADA
      ]);
      setInscripciones(inscripcionesRes.data);
      setClasesDisponibles(clasesRes.data);
      setHistorialAsistencia(asistenciaRes.data); // <-- GUARDAMOS EL HISTORIAL
    } catch (error) {
      console.error("Error cargando ficha:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleInscribir = async () => {
    if (!claseSeleccionada) return;
    try {
      await api.post('/academico/inscripciones', null, {
        params: { alumnoId: alumno.id, claseId: claseSeleccionada }
      });
      setClaseSeleccionada('');
      cargarDatos(); 
    } catch (error) {
      console.error("Error al inscribir:", error);
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

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50">
          
          {/* Info Básica */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Información de Contacto</h3>
            <div className="space-y-3 text-gray-700">
              <p><span className="font-medium mr-2">Teléfono:</span> {alumno.telefono || 'No registrado'}</p>
              <p><span className="font-medium mr-2">Emergencia:</span> {alumno.contactoEmergencia || 'No registrado'}</p>
              {alumno.grupoFamiliar && (
                <p><span className="font-medium mr-2">Familia:</span> 
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-md">{alumno.grupoFamiliar.nombreReferencia}</span>
                </p>
              )}
            </div>
          </div>

          {/* Sección Académica */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <GraduationCap className="w-4 h-4 mr-2" /> Clases Actuales
            </h3>
            
            {cargando ? (
              <p className="text-gray-500 text-sm">Cargando...</p>
            ) : inscripciones.length > 0 ? (
              <ul className="space-y-3">
                {inscripciones.map(ins => (
                  <li key={ins.id} className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <p className="font-bold text-indigo-900">{ins.clase.disciplina.nombre}</p>
                    <p className="text-sm text-indigo-700 mt-1 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" /> {ins.clase.diasSemana} - {ins.clase.horaInicio}hs
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm italic">El alumno no está inscrito en ninguna clase.</p>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Inscribir en nueva clase:</label>
              <div className="flex gap-2">
                <select 
                  value={claseSeleccionada} 
                  onChange={(e) => setClaseSeleccionada(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none"
                >
                  <option value="">Seleccione una clase...</option>
                  {clasesDisponibles.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.disciplina.nombre} ({c.diasSemana})
                    </option>
                  ))}
                </select>
                <button 
                  onClick={handleInscribir}
                  disabled={!claseSeleccionada}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 text-sm font-medium transition-colors"
                >
                  Inscribir
                </button>
              </div>
            </div>
          </div>

          {/* NUEVO: HISTORIAL DE ASISTENCIA */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <ClipboardList className="w-4 h-4 mr-2" /> Últimas Asistencias
            </h3>
            
            {cargando ? (
              <p className="text-gray-500 text-sm">Cargando...</p>
            ) : historialAsistencia.length > 0 ? (
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {/* Mostramos las asistencias ordenadas, de la más reciente a la más antigua */}
                {historialAsistencia.reverse().map((registro, idx) => (
                  <li key={idx} className="flex justify-between items-center p-3 border border-gray-50 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{registro.disciplina}</p>
                      <p className="text-xs text-gray-500">{registro.fecha}</p>
                    </div>
                    {registro.estado === 'PRESENTE' ? (
                      <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> PRESENTE
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                        <XCircle className="w-3 h-3 mr-1" /> AUSENTE
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm italic">No hay registros de asistencia aún.</p>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default FichaAlumnoPanel;