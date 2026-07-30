import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, User, MapPin, X, Clock } from 'lucide-react';

const formatearHora = (hora) => {
  if (!hora) return '00:00';
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

const CalendarioAlumno = () => {
  const [clases, setClases] = useState([]);
  const [claseDetalle, setClaseDetalle] = useState(null);
  const [loading, setLoading] = useState(true);

  const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
  const horas = Array.from({ length: 15 }, (_, i) => i + 8);

  useEffect(() => {
    api.get('/calendario/clases')
      .then(res => setClases(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center">
        <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl mr-4">
          <Calendar className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-800">Grilla Epifania Dance</h2>
          <p className="text-gray-500">Organización semanal de salones y disciplinas</p>
        </div>
      </div>

      {/* Grilla */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Encabezados */}
            <div className="min-w-[900px] grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
              <div className="p-3 border-r border-gray-100 text-[11px] font-bold text-gray-400 text-center uppercase">Hora</div>
              {dias.map(d => (
                <div key={d} className="p-3 border-r border-gray-100 text-xs font-black text-pink-900 text-center uppercase tracking-tighter">
                  {d}
                </div>
              ))}
            </div>

            {/* Cuerpo */}
            <div className="min-w-[900px] grid grid-cols-7 relative bg-white">
              {/* Columna horas */}
              <div className="col-span-1 border-r border-gray-50">
                {horas.map(h => (
                  <div key={h} className="h-16 border-b border-gray-50 flex items-start justify-center pt-1.5 text-[11px] font-bold text-gray-400">
                    {h}:00
                  </div>
                ))}
              </div>

              {/* Columnas días */}
              {dias.map(dia => (
                <div key={dia} className="col-span-1 border-r border-gray-50 relative h-full">
                  {horas.map(h => <div key={h} className="h-16 border-b border-gray-50" />)}

                  {clases.filter(c => c.diasSemana.includes(dia)).map(clase => {
                    const { h: horaInt, m: minInt } = obtenerHoraMinutos(clase.horaInicio);
                    const offset = (horaInt - 8) * 64 + (minInt / 60) * 64;

                    return (
                      <div
                        key={clase.id}
                        onClick={() => setClaseDetalle(clase)}
                        style={{ top: `${offset + 4}px`, height: '56px' }}
                        className="absolute left-1 right-1 rounded-xl p-2 shadow-sm cursor-pointer transition-all hover:scale-105 hover:shadow-md hover:z-10 overflow-hidden border-l-[3px] bg-pink-50 border-pink-400 text-pink-900"
                      >
                        <p className="text-[10px] leading-tight font-black uppercase truncate">{clase.disciplina?.nombre}</p>
                        <div className="flex items-center mt-0.5 opacity-80">
                          <MapPin className="w-2.5 h-2.5 mr-1" />
                          <span className="text-[9px] font-bold">{formatearHora(clase.horaInicio)}hs</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle — solo lectura, sin lista de alumnos */}
      {claseDetalle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setClaseDetalle(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-br from-pink-600 to-violet-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black">{claseDetalle.disciplina?.nombre}</h3>
                <p className="text-pink-100 flex items-center text-sm font-medium mt-1">
                  <User className="w-4 h-4 mr-1" />
                  Prof. {claseDetalle.profesorTitular?.nombre} {claseDetalle.profesorTitular?.apellido}
                </p>
              </div>
              <button onClick={() => setClaseDetalle(null)} className="p-2 hover:bg-white/20 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Info */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
                  <Clock className="w-5 h-5 text-pink-500 mb-1" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Horario</p>
                  <p className="font-black text-gray-800 text-sm">{formatearHora(claseDetalle.horaInicio)}hs</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
                  <MapPin className="w-5 h-5 text-pink-500 mb-1" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Salón</p>
                  <p className="font-black text-gray-800 text-sm text-center">{claseDetalle.salon?.nombre || '—'}</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
                  <Calendar className="w-5 h-5 text-pink-500 mb-1" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Días</p>
                  <p className="font-bold text-gray-800 text-[11px] text-center leading-tight">{claseDetalle.diasSemana?.replace(/,/g, ', ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioAlumno;
