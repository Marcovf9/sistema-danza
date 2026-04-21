import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, User, MapPin, X, Users } from 'lucide-react';

const formatearHora = (hora) => {
  if (!hora) return "00:00";
  if (Array.isArray(hora)) {
    return `${hora[0].toString().padStart(2, '0')}:${(hora[1] || 0).toString().padStart(2, '0')}`;
  }
  return hora.toString().slice(0, 5);
};

const obtenerHoraMinutos = (hora) => {
  if (!hora) return { h: 0, m: 0 };
  if (Array.isArray(hora)) return { h: hora[0], m: hora[1] || 0 };
  if (typeof hora === 'string') {
    const [hStr, mStr] = hora.split(':');
    return { h: parseInt(hStr), m: parseInt(mStr || 0) };
  }
  return { h: 0, m: 0 };
};

const CalendarioPage = () => {
  const [clases, setClases] = useState([]);
  const [claseDetalle, setClaseDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const rol = localStorage.getItem('rol');
  const profesorId = localStorage.getItem('profesorId');

  const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
  const horas = Array.from({ length: 15 }, (_, i) => i + 8); 

  useEffect(() => {
    fetchClases();
  }, []);

  const fetchClases = async () => {
    try {
      const res = await api.get('/calendario/clases');
      setClases(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verDetalles = async (clase) => {
    try {
      const res = await api.get(`/calendario/clase/${clase.id}/detalles`, {
        headers: { rol, profesorId }
      });
      setClaseDetalle(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setClaseDetalle({ clase, alumnos: null, error: "No tienes permiso para ver la lista de alumnos." });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl mr-4">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-800">Grilla Epifania Dance</h2>
            <p className="text-gray-500">Organización semanal de salones y disciplinas</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px] grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
            <div className="p-3 border-r border-gray-100 text-[11px] font-bold text-gray-400 text-center uppercase">Hora</div>
            {dias.map(d => (
              <div key={d} className="p-3 border-r border-gray-100 text-xs font-black text-indigo-900 text-center uppercase tracking-tighter">
                {d}
              </div>
            ))}
          </div>

          <div className="min-w-[900px] grid grid-cols-7 relative bg-white">
            {/* Columna de Horas */}
            <div className="col-span-1 border-r border-gray-50">
              {horas.map(h => (
                <div key={h} className="h-16 border-b border-gray-50 flex items-start justify-center pt-1.5 text-[11px] font-bold text-gray-400">
                  {h}:00
                </div>
              ))}
            </div>

            {/* Columnas de Días y Clases */}
            {dias.map(dia => (
              <div key={dia} className="col-span-1 border-r border-gray-50 relative h-full">
                {horas.map(h => <div key={h} className="h-16 border-b border-gray-50"></div>)}
                
                {clases.filter(c => c.diasSemana.includes(dia)).map(clase => {
                  
                  const { h: horaInt, m: minInt } = obtenerHoraMinutos(clase.horaInicio);
                  
                  const offset = (horaInt - 8) * 64 + (minInt / 60) * 64;
                  const esSuClase = profesorId && clase.profesorTitular && clase.profesorTitular.id === parseInt(profesorId);

                  return (
                    <div 
                      key={clase.id}
                      onClick={() => verDetalles(clase)}
                      style={{ top: `${offset + 4}px`, height: '56px' }}
                      className={`absolute left-1 right-1 rounded-xl p-2 shadow-sm cursor-pointer transition-all hover:scale-105 hover:shadow-md hover:z-10 overflow-hidden border-l-[3px] ${
                        esSuClase 
                          ? 'bg-indigo-600 border-indigo-900 text-white' 
                          : 'bg-indigo-50 border-indigo-400 text-indigo-900'
                      }`}
                    >
                      <p className="text-[10px] leading-tight font-black uppercase truncate">{clase.disciplina?.nombre}</p>
                      <div className="flex items-center mt-0.5 opacity-80">
                        <MapPin className="w-2.5 h-2.5 mr-1" />
                        {/* Usamos el formateador seguro */}
                        <span className="text-[9px] font-bold">{formatearHora(clase.horaInicio)}hs</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalle */}
      {claseDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black">{claseDetalle.clase.disciplina?.nombre}</h3>
                <p className="text-indigo-100 flex items-center text-sm font-medium mt-1">
                  <User className="w-4 h-4 mr-1" /> Prof. {claseDetalle.clase.profesorTitular?.nombre} {claseDetalle.clase.profesorTitular?.apellido}
                </p>
              </div>
              <button onClick={() => setClaseDetalle(null)} className="p-2 hover:bg-white/20 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Horario</p>
                  {/* Usamos el formateador seguro aquí también */}
                  <p className="font-bold text-gray-800">{formatearHora(claseDetalle.clase.horaInicio)}hs</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Salón</p>
                  <p className="font-bold text-gray-800">{claseDetalle.clase.salon?.nombre}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Días</p>
                  <p className="font-bold text-gray-800 text-xs">{claseDetalle.clase.diasSemana}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                  <Users className="w-4 h-4 mr-2" /> Alumnos Inscritos
                </h4>
                {claseDetalle.error ? (
                  <p className="p-4 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium border border-amber-100">
                    ⚠️ {claseDetalle.error}
                  </p>
                ) : claseDetalle.alumnos?.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {claseDetalle.alumnos.map((a, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="font-bold text-gray-700 text-sm">{a.nombre}</span>
                        <span className="text-xs text-indigo-600 font-mono">{a.telefono}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center italic text-sm">No hay alumnos inscritos en esta clase.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioPage;