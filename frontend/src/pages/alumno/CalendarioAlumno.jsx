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

const PALETA = [
  { bg: 'bg-pink-100',    border: 'border-l-pink-500',    text: 'text-pink-900',    sub: 'text-pink-600'    },
  { bg: 'bg-violet-100',  border: 'border-l-violet-500',  text: 'text-violet-900',  sub: 'text-violet-600'  },
  { bg: 'bg-blue-100',    border: 'border-l-blue-500',    text: 'text-blue-900',    sub: 'text-blue-600'    },
  { bg: 'bg-emerald-100', border: 'border-l-emerald-500', text: 'text-emerald-900', sub: 'text-emerald-600' },
  { bg: 'bg-amber-100',   border: 'border-l-amber-500',   text: 'text-amber-900',   sub: 'text-amber-600'   },
  { bg: 'bg-orange-100',  border: 'border-l-orange-500',  text: 'text-orange-900',  sub: 'text-orange-600'  },
  { bg: 'bg-teal-100',    border: 'border-l-teal-500',    text: 'text-teal-900',    sub: 'text-teal-600'    },
  { bg: 'bg-rose-100',    border: 'border-l-rose-500',    text: 'text-rose-900',    sub: 'text-rose-600'    },
  { bg: 'bg-cyan-100',    border: 'border-l-cyan-500',    text: 'text-cyan-900',    sub: 'text-cyan-600'    },
  { bg: 'bg-indigo-100',  border: 'border-l-indigo-500',  text: 'text-indigo-900',  sub: 'text-indigo-600'  },
  { bg: 'bg-lime-100',    border: 'border-l-lime-500',    text: 'text-lime-900',    sub: 'text-lime-600'    },
  { bg: 'bg-fuchsia-100', border: 'border-l-fuchsia-500', text: 'text-fuchsia-900', sub: 'text-fuchsia-600' },
];

const colorDisciplina = (nombre) => {
  if (!nombre) return PALETA[0];
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h = ((h * 31) + nombre.charCodeAt(i)) >>> 0;
  return PALETA[h % PALETA.length];
};

const ALTURA_HORA = 72;

const CalendarioAlumno = () => {
  const [clases, setClases] = useState([]);
  const [claseDetalle, setClaseDetalle] = useState(null);
  const [loading, setLoading] = useState(true);

  const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
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
      <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center">
        <div className="p-2.5 sm:p-3 bg-pink-50 text-pink-600 rounded-2xl mr-3 sm:mr-4 flex-shrink-0">
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div>
          <h2 className="text-xl sm:text-3xl font-black text-gray-800">Grilla Epifania Dance</h2>
          <p className="text-xs sm:text-sm text-gray-500">Organización semanal de salones y disciplinas</p>
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
            {/* Cabecera de días */}
            <div className="min-w-[1100px] grid grid-cols-8 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-20">
              <div className="p-3 border-r border-gray-100 text-[11px] font-bold text-gray-400 text-center uppercase tracking-widest">Hora</div>
              {dias.map(d => (
                <div key={d} className="p-3 border-r border-gray-100 text-xs font-black text-gray-700 text-center uppercase tracking-wider last:border-r-0">
                  {d}
                </div>
              ))}
            </div>

            {/* Grilla */}
            <div className="min-w-[1100px] grid grid-cols-8 relative bg-white">
              {/* Columna de horas */}
              <div className="col-span-1 border-r border-gray-100">
                {horas.map(h => (
                  <div key={h} style={{ height: ALTURA_HORA }} className="border-b border-gray-50 flex items-start justify-center pt-2 text-[11px] font-bold text-gray-300">
                    {h}:00
                  </div>
                ))}
              </div>

              {/* Columnas por día */}
              {dias.map(dia => {
                const clasesDelDia = clases.filter(c => c.diasSemana?.includes(dia));

                const grupos = {};
                clasesDelDia.forEach(c => {
                  const k = formatearHora(c.horaInicio);
                  if (!grupos[k]) grupos[k] = [];
                  grupos[k].push(c);
                });

                return (
                  <div key={dia} className="col-span-1 border-r border-gray-100 last:border-r-0 relative">
                    {horas.map(h => (
                      <div key={h} style={{ height: ALTURA_HORA }} className="border-b border-gray-50" />
                    ))}

                    {clasesDelDia.map(clase => {
                      const { h: horaInt, m: minInt } = obtenerHoraMinutos(clase.horaInicio);
                      const top = (horaInt - 8) * ALTURA_HORA + (minInt / 60) * ALTURA_HORA + 3;
                      const altura = Math.max(36, ((clase.duracionMinutos || 60) / 60) * ALTURA_HORA - 6);
                      const color = colorDisciplina(clase.disciplina?.nombre);

                      const grupo = grupos[formatearHora(clase.horaInicio)];
                      const idx = grupo.indexOf(clase);
                      const total = grupo.length;
                      const pct = 100 / total;

                      const mostrarProfe = altura >= 60 && total <= 2;
                      const mostrarSalon = altura >= 76 && total === 1;

                      return (
                        <div
                          key={clase.id}
                          onClick={() => setClaseDetalle(clase)}
                          style={{
                            top: `${top}px`,
                            height: `${altura}px`,
                            left: `${idx * pct + 0.5}%`,
                            width: `${pct - 1}%`,
                          }}
                          className={`absolute rounded-lg cursor-pointer transition-all hover:shadow-md hover:z-10 overflow-hidden border-l-[3px] px-1.5 py-1 flex flex-col justify-between shadow-sm
                            ${color.bg} ${color.border} ${color.text}`}
                        >
                          <p className="text-[9px] leading-snug font-black uppercase truncate">
                            {clase.disciplina?.nombre}
                          </p>
                          <div className="space-y-0.5">
                            {mostrarProfe && clase.profesorTitular && (
                              <p className={`text-[8px] font-semibold truncate ${color.sub}`}>
                                {clase.profesorTitular.nombre} {clase.profesorTitular.apellido}
                              </p>
                            )}
                            {mostrarSalon && clase.salon && (
                              <p className={`text-[8px] font-semibold truncate ${color.sub}`}>
                                {clase.salon.nombre}
                              </p>
                            )}
                            <p className={`text-[8px] font-bold ${color.sub}`}>
                              {formatearHora(clase.horaInicio)}hs
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {claseDetalle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setClaseDetalle(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 bg-gradient-to-r from-pink-600 to-violet-600 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black">{claseDetalle.disciplina?.nombre}</h3>
                {claseDetalle.profesorTitular ? (
                  <p className="text-pink-100 flex items-center text-sm font-medium mt-1">
                    <User className="w-4 h-4 mr-1" />
                    Prof. {claseDetalle.profesorTitular.nombre} {claseDetalle.profesorTitular.apellido}
                  </p>
                ) : (
                  <p className="text-pink-200 text-sm mt-1 italic">Sin profesor asignado</p>
                )}
              </div>
              <button onClick={() => setClaseDetalle(null)} className="p-2 hover:bg-white/20 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Horario', valor: `${formatearHora(claseDetalle.horaInicio)}hs`, icon: <Clock className="w-4 h-4" /> },
                  { label: 'Salón', valor: claseDetalle.salon?.nombre ?? '—', icon: <MapPin className="w-4 h-4" /> },
                  { label: 'Días', valor: claseDetalle.diasSemana?.replace(/,/g, ', '), icon: <Calendar className="w-4 h-4" /> },
                ].map(({ label, valor, icon }) => (
                  <div key={label} className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
                    <div className="text-pink-500 mb-1">{icon}</div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{label}</p>
                    <p className="font-black text-gray-800 text-sm text-center break-words">{valor}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioAlumno;
