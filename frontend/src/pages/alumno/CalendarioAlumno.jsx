import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react';
import api from '../../services/api';

const CalendarioAlumno = () => {
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(true);

  const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

  useEffect(() => {
    cargarClases();
  }, []);

  const cargarClases = async () => {
    setCargando(true);
    try {
      const response = await api.get('/academico/clases');
      setClases(response.data);
    } catch (error) {
      console.error("Error al cargar la grilla de clases:", error);
    } finally {
      setCargando(false);
    }
  };

  const clasesPorDia = (dia) => {
    return clases
      .filter((clase) => clase.diasSemana && clase.diasSemana.includes(dia))
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Cabecera un poco más compacta */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <CalendarIcon className="w-5 h-5 mr-3 text-indigo-600" /> Grilla Horaria de Clases
        </h2>
        <p className="text-sm text-gray-500 mt-1">Explorá todas las clases y horarios disponibles en Epifania Dance.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {cargando ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto p-5">
            {/* Redujimos el gap entre columnas de 4 a 3 */}
            <div className="min-w-[900px] grid grid-cols-6 gap-3">
              
              {/* Encabezados de los días */}
              {diasSemana.map(dia => (
                <div key={dia} className="text-center font-black text-gray-400 tracking-widest uppercase text-[10px] pb-3 border-b-2 border-gray-50">
                  {dia}
                </div>
              ))}

              {/* Columnas con las clases */}
              {diasSemana.map(dia => (
                <div key={`col-${dia}`} className="space-y-2.5 mt-3">
                  {clasesPorDia(dia).map(clase => (
                    // Tarjeta de clase: padding más chico (p-2 pl-3), bordes más suaves (rounded-lg)
                    <div 
                      key={`${dia}-${clase.id}`} 
                      className="bg-indigo-50 border border-indigo-100 rounded-lg p-2 pl-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                      
                      <h4 className="font-bold text-indigo-900 text-xs mb-1.5 leading-tight truncate" title={clase.disciplina?.nombre}>
                        {clase.disciplina?.nombre || 'Disciplina'}
                      </h4>
                      
                      <div className="space-y-1">
                        <div className="flex items-center text-[9px] text-indigo-700 font-medium">
                          <Clock className="w-3 h-3 mr-1 opacity-70" />
                          {clase.horaInicio?.slice(0, 5)}hs
                        </div>
                        
                        <div className="flex items-center text-[9px] text-gray-600">
                          <User className="w-3 h-3 mr-1 opacity-70" />
                          <span className="truncate" title={`${clase.profesorTitular?.nombre} ${clase.profesorTitular?.apellido}`}>
                            {clase.profesorTitular?.nombre}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-[9px] text-gray-500">
                          <MapPin className="w-3 h-3 mr-1 opacity-70" />
                          <span className="truncate" title={clase.salon?.nombre}>
                            {clase.salon?.nombre || 'Salón 1'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Tarjeta de "Sin clases" también más bajita */}
                  {clasesPorDia(dia).length === 0 && (
                    <div className="h-12 border-2 border-dashed border-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-[10px] text-gray-300 font-medium uppercase tracking-wider">Sin clases</span>
                    </div>
                  )}
                </div>
              ))}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarioAlumno;