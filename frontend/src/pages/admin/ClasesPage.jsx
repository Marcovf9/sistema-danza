import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Pencil, Plus, GraduationCap, Trash2, BookOpen } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

const formatearHora = (hora) => {
  if (!hora) return '00:00';
  if (Array.isArray(hora)) {
    return `${hora[0].toString().padStart(2, '0')}:${(hora[1] || 0).toString().padStart(2, '0')}`;
  }
  return hora.toString().slice(0, 5);
};

const SelectorDias = ({ value, onChange }) => {
  const diasSeleccionados = value ? value.split(',').map(d => d.trim()).filter(Boolean) : [];
  const toggle = (dia) => {
    const set = new Set(diasSeleccionados);
    set.has(dia) ? set.delete(dia) : set.add(dia);
    onChange(DIAS.filter(d => set.has(d)).join(','));
  };
  return (
    <div className="flex flex-wrap gap-2">
      {DIAS.map(dia => (
        <button
          key={dia}
          type="button"
          onClick={() => toggle(dia)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            diasSeleccionados.includes(dia)
              ? 'bg-pink-600 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {dia.slice(0, 3)}
        </button>
      ))}
    </div>
  );
};

const ClasesPage = () => {
  const [clases, setClases] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [salones, setSalones] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claseAEditar, setClaseAEditar] = useState(null);
  const [nuevoProfesorId, setNuevoProfesorId] = useState('');
  const [nuevosDias, setNuevosDias] = useState('');
  const [nuevoSalonId, setNuevoSalonId] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Modal nueva clase
  const [isNuevaOpen, setIsNuevaOpen] = useState(false);
  const [nueva, setNueva] = useState({ disciplinaId: '', profesorId: '', salonId: '', diasSemana: '', horaInicio: '09:00', duracionMinutos: 60 });
  const [creando, setCreando] = useState(false);

  // Modal eliminar
  const [claseAEliminar, setClaseAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [clasesRes, profRes, salonesRes, discRes] = await Promise.all([
        api.get('/academico/clases').catch(() => ({ data: [] })),
        api.get('/profesores').catch(() => ({ data: [] })),
        api.get('/academico/salones').catch(() => ({ data: [] })),
        api.get('/academico/disciplinas').catch(() => ({ data: [] })),
      ]);
      const clasesData = clasesRes.data;
      setClases(clasesData);
      setProfesores(profRes.data.filter(p => p.activo !== false));
      setDisciplinas(discRes.data);
      if (salonesRes.data.length > 0) {
        setSalones(salonesRes.data);
      } else {
        const ids = new Set();
        const unique = [];
        clasesData.forEach(c => { if (c.salon && !ids.has(c.salon.id)) { ids.add(c.salon.id); unique.push(c.salon); } });
        setSalones(unique);
      }
    } catch {
      toast.error('Error al cargar los datos.');
    } finally {
      setCargando(false);
    }
  };

  // ── Editar ──
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
        horaInicio: nuevaHora,
      });
      toast.success('¡Clase actualizada correctamente!');
      setIsModalOpen(false);
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al actualizar la clase.');
    } finally {
      setGuardando(false);
    }
  };

  // ── Crear ──
  const abrirNueva = () => {
    setNueva({ disciplinaId: '', profesorId: '', salonId: '', diasSemana: '', horaInicio: '09:00', duracionMinutos: 60 });
    setIsNuevaOpen(true);
  };

  const crearClase = async () => {
    if (!nueva.disciplinaId) { toast.error('Seleccioná una disciplina.'); return; }
    if (!nueva.diasSemana)   { toast.error('Seleccioná al menos un día.'); return; }
    setCreando(true);
    try {
      await api.post('/academico/clases', {
        disciplinaId:    nueva.disciplinaId,
        profesorId:      nueva.profesorId   || null,
        salonId:         nueva.salonId      || null,
        diasSemana:      nueva.diasSemana,
        horaInicio:      nueva.horaInicio,
        duracionMinutos: nueva.duracionMinutos,
      });
      toast.success('¡Clase creada correctamente!');
      setIsNuevaOpen(false);
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear la clase.');
    } finally {
      setCreando(false);
    }
  };

  // ── Eliminar ──
  const confirmarEliminar = async () => {
    setEliminando(true);
    try {
      await api.delete(`/academico/clases/${claseAEliminar.id}`);
      toast.success('Clase eliminada correctamente.');
      setClaseAEliminar(null);
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar la clase.');
    } finally {
      setEliminando(false);
    }
  };

  const campoModal = (label, icon, children) => (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">{icon}{label}</label>
      {children}
    </div>
  );

  const selectCls = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none font-medium text-gray-700';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* CABECERA */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            Gestión de Clases <Calendar className="ml-3 w-6 h-6 text-pink-500" />
          </h2>
          <p className="text-gray-500 mt-1">Administra los horarios y asigna profesores a cada grupo.</p>
        </div>
        <button
          onClick={abrirNueva}
          className="mt-4 sm:mt-0 flex items-center px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> Nueva Clase
        </button>
      </div>

      {/* LISTADO */}
      {cargando ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clases.map(clase => (
            <div key={clase.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative group hover:border-pink-300 transition-colors">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => abrirEditor(clase)} className="p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-600 hover:text-white transition" title="Editar">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setClaseAEliminar(clase)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition" title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-black tracking-widest uppercase mb-2">
                  {clase.disciplina?.nombre || 'Disciplina General'}
                </span>
                <div className="flex items-center gap-2 text-gray-700 font-bold">
                  <Clock className="w-4 h-4 text-pink-500" />
                  <span>{clase.diasSemana} — {formatearHora(clase.horaInicio)} hs</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold uppercase flex items-center"><User className="w-3 h-3 mr-1" /> Profesor</span>
                  <span className={`text-sm font-bold ${clase.profesorTitular ? 'text-gray-800' : 'text-red-500'}`}>
                    {clase.profesorTitular ? `${clase.profesorTitular.nombre} ${clase.profesorTitular.apellido}` : 'Sin Asignar'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold uppercase flex items-center"><MapPin className="w-3 h-3 mr-1" /> Salón</span>
                  <span className="text-sm font-bold text-gray-800">{clase.salon?.nombre || 'General'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NUEVA CLASE */}
      {isNuevaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-pink-600 to-violet-600 p-6 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2"><Plus className="w-5 h-5" /> Nueva Clase</h3>
              <p className="text-pink-100 text-sm">Completá los datos para crear la clase</p>
            </div>
            <div className="p-6 space-y-4">
              {campoModal('Disciplina *', <BookOpen className="w-4 h-4 text-pink-500" />,
                <select value={nueva.disciplinaId} onChange={e => setNueva(p => ({ ...p, disciplinaId: e.target.value }))} className={selectCls}>
                  <option value="">-- Seleccionar Disciplina --</option>
                  {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              )}
              {campoModal('Días *', <Calendar className="w-4 h-4 text-pink-500" />,
                <SelectorDias value={nueva.diasSemana} onChange={v => setNueva(p => ({ ...p, diasSemana: v }))} />
              )}
              {campoModal('Horario de Inicio *', <Clock className="w-4 h-4 text-pink-500" />,
                <input type="time" value={nueva.horaInicio} onChange={e => setNueva(p => ({ ...p, horaInicio: e.target.value }))} className={selectCls} />
              )}
              {campoModal('Duración (minutos)', <Clock className="w-4 h-4 text-gray-400" />,
                <input type="number" min="30" max="180" step="15" value={nueva.duracionMinutos} onChange={e => setNueva(p => ({ ...p, duracionMinutos: parseInt(e.target.value) }))} className={selectCls} />
              )}
              {campoModal('Salón', <MapPin className="w-4 h-4 text-pink-500" />,
                <select value={nueva.salonId} onChange={e => setNueva(p => ({ ...p, salonId: e.target.value }))} className={selectCls}>
                  <option value="">-- Sin asignar --</option>
                  {salones.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              )}
              {campoModal('Profesor', <GraduationCap className="w-4 h-4 text-pink-500" />,
                <select value={nueva.profesorId} onChange={e => setNueva(p => ({ ...p, profesorId: e.target.value }))} className={selectCls}>
                  <option value="">-- Sin asignar --</option>
                  {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                </select>
              )}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setIsNuevaOpen(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">Cancelar</button>
                <button onClick={crearClase} disabled={creando} className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-violet-600 hover:opacity-90 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50">
                  {creando ? 'Creando...' : 'Crear Clase'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {claseAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-red-500 p-6 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2"><Trash2 className="w-5 h-5" /> Eliminar Clase</h3>
              <p className="text-red-100 text-sm">{claseAEliminar.disciplina?.nombre}</p>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">¿Estás segura de que querés eliminar esta clase? Se borrarán también todas las inscripciones y sesiones registradas.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setClaseAEliminar(null)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">Cancelar</button>
                <button onClick={confirmarEliminar} disabled={eliminando} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition disabled:bg-gray-400">
                  {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDICIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-pink-600 p-6 text-white">
              <h3 className="text-xl font-bold">Configurar Clase</h3>
              <p className="text-pink-200 text-sm">{claseAEditar?.disciplina?.nombre}</p>
            </div>
            <div className="p-6 space-y-4">
              {campoModal('Profesor a Cargo', <GraduationCap className="w-4 h-4 text-pink-500" />,
                <select value={nuevoProfesorId} onChange={e => setNuevoProfesorId(e.target.value)} className={selectCls}>
                  <option value="">-- Sin asignar --</option>
                  {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                </select>
              )}
              {campoModal('Salón', <MapPin className="w-4 h-4 text-pink-500" />,
                <select value={nuevoSalonId} onChange={e => setNuevoSalonId(e.target.value)} className={selectCls}>
                  <option value="">-- Sin asignar --</option>
                  {salones.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              )}
              {campoModal('Días', <Calendar className="w-4 h-4 text-pink-500" />,
                <SelectorDias value={nuevosDias} onChange={setNuevosDias} />
              )}
              {campoModal('Horario de Inicio', <Clock className="w-4 h-4 text-pink-500" />,
                <input type="time" value={nuevaHora} onChange={e => setNuevaHora(e.target.value)} className={selectCls} />
              )}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">Cancelar</button>
                <button onClick={guardarCambios} disabled={guardando} className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-md transition disabled:bg-gray-400">
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
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
