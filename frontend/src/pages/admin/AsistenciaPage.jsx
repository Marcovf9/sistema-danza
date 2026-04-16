import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ClipboardCheck, CheckCircle2, XCircle, Users, Clock } from 'lucide-react';

const AsistenciaPage = () => {
  const [profesores, setProfesores] = useState([]);
  const [profesorActual, setProfesorActual] = useState('');
  const [clasesHoy, setClasesHoy] = useState([]);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  
  const [alumnosLista, setAlumnosLista] = useState([]);
  const [asistencias, setAsistencias] = useState({}); // { alumnoId: 'PRESENTE' o 'AUSENTE' }
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // 1. Cargar profesores para simular el login
  useEffect(() => {
    api.get('/profesores').then(res => {
      setProfesores(res.data);
      if(res.data.length > 0) setProfesorActual(res.data[0].id);
    });
  }, []);

  // 2. Cargar clases del profesor seleccionado
  useEffect(() => {
    if (profesorActual) {
      api.get(`/asistencias/hoy/profesor/${profesorActual}`).then(res => {
        setClasesHoy(res.data);
        setClaseSeleccionada(null);
        setAlumnosLista([]);
      });
    }
  }, [profesorActual]);

  // 3. Cargar alumnos de la clase seleccionada
  useEffect(() => {
    if (claseSeleccionada) {
      setGuardadoExitoso(false);
      api.get(`/asistencias/clase/${claseSeleccionada.id}/alumnos`).then(res => {
        setAlumnosLista(res.data);
        // Inicializamos a todos como PRESENTES por defecto (es más rápido para el profe)
        const estadoInicial = {};
        res.data.forEach(a => estadoInicial[a.alumnoId] = 'PRESENTE');
        setAsistencias(estadoInicial);
      });
    }
  }, [claseSeleccionada]);

  const toggleAsistencia = (alumnoId) => {
    setAsistencias(prev => ({
      ...prev,
      [alumnoId]: prev[alumnoId] === 'PRESENTE' ? 'AUSENTE' : 'PRESENTE'
    }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    
    // Transformamos el objeto a la lista que espera Spring Boot
    const listaParaBackend = Object.keys(asistencias).map(id => ({
      alumnoId: parseInt(id),
      estado: asistencias[id]
    }));

    try {
      await api.post('/asistencias/guardar', listaParaBackend, {
        params: { claseId: claseSeleccionada.id, profesorId: profesorActual }
      });
      setGuardadoExitoso(true);
      setTimeout(() => {
        setClaseSeleccionada(null); // Volvemos al menú de clases tras 2 segundos
      }, 2000);
    } catch (error) {
      console.error("Error guardando:", error);
      alert("Hubo un error al guardar la asistencia.");
    } finally {
      setGuardando(false);
    }
  };

  // VISTA MÓVIL: Toma de Asistencia Activa
  if (claseSeleccionada) {
    const presentesCount = Object.values(asistencias).filter(e => e === 'PRESENTE').length;

    return (
      <div className="max-w-lg mx-auto bg-white min-h-[80vh] shadow-xl sm:rounded-3xl flex flex-col relative overflow-hidden border border-gray-100">
        
        {/* Cabecera Móvil */}
        <div className="bg-indigo-600 p-6 text-white shadow-md z-10">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setClaseSeleccionada(null)} className="text-indigo-200 hover:text-white font-medium text-sm">
              ← Volver
            </button>
            <span className="bg-indigo-500 px-3 py-1 rounded-full text-xs font-bold tracking-wider">HOY</span>
          </div>
          <h2 className="text-2xl font-bold">{claseSeleccionada.disciplina.nombre}</h2>
          <p className="text-indigo-200 flex items-center mt-1 text-sm">
            <Clock className="w-4 h-4 mr-1" /> {claseSeleccionada.horaInicio}hs
          </p>
        </div>

        {/* Resumen */}
        <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-center">
          <span className="text-indigo-800 font-medium flex items-center">
            <Users className="w-4 h-4 mr-2" /> {alumnosLista.length} Inscritos
          </span>
          <span className="bg-white px-3 py-1 rounded-lg text-indigo-700 font-bold shadow-sm text-sm">
            {presentesCount} Presentes
          </span>
        </div>

        {/* Lista de Alumnos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
          {alumnosLista.length === 0 ? (
            <div className="text-center p-8 text-gray-400">No hay alumnos inscritos en esta clase.</div>
          ) : (
            alumnosLista.map(alumno => {
              const isPresente = asistencias[alumno.alumnoId] === 'PRESENTE';
              return (
                <div 
                  key={alumno.alumnoId}
                  onClick={() => toggleAsistencia(alumno.alumnoId)}
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

        {/* Botón Flotante Inferior */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white via-white to-transparent pt-10">
          {guardadoExitoso ? (
            <div className="w-full py-4 bg-green-500 text-white font-bold rounded-2xl shadow-lg flex justify-center items-center">
              <CheckCircle2 className="w-6 h-6 mr-2" /> ¡Guardado con éxito!
            </div>
          ) : (
            <button 
              onClick={handleGuardar}
              disabled={guardando || alumnosLista.length === 0}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-lg font-bold rounded-2xl shadow-xl transition-transform active:scale-95 flex justify-center items-center"
            >
              {guardando ? 'Guardando...' : 'Confirmar Asistencia'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // VISTA DESKTOP: Selección de Clase (Director/Profe)
  return (
    <div className="space-y-6">
      <div className="flex items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mr-4">
          <ClipboardCheck className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Toma de Asistencia</h2>
          <p className="text-gray-500 mt-1">Selecciona una clase para pasar lista</p>
        </div>
      </div>

      {/* Simulador de Login */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-center gap-4">
        <span className="text-yellow-800 font-bold text-sm">Simular vista como:</span>
        <select 
          value={profesorActual} 
          onChange={(e) => setProfesorActual(e.target.value)}
          className="px-3 py-2 border-none rounded-lg bg-white shadow-sm font-medium text-gray-700 outline-none"
        >
          {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clasesHoy.length === 0 ? (
          <div className="col-span-3 p-12 bg-white rounded-2xl border border-gray-100 text-center text-gray-500">
            No tienes clases programadas para hoy.
          </div>
        ) : (
          clasesHoy.map(clase => (
            <div 
              key={clase.id} 
              onClick={() => setClaseSeleccionada(clase)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold">
                  {clase.horaInicio}hs
                </span>
                <Users className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{clase.disciplina.nombre}</h3>
              <p className="text-gray-500 text-sm">Salón: {clase.salon?.nombre || 'General'}</p>
              
              <div className="mt-6 w-full py-2.5 bg-gray-50 group-hover:bg-indigo-600 group-hover:text-white text-center rounded-xl font-medium text-gray-600 transition-colors">
                Pasar Lista →
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AsistenciaPage;