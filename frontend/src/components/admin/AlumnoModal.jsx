import { X, Search, Users, Baby, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AlumnoModal = ({ isOpen, onClose, onSave, alumnoAEditar }) => {
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', dni: '', telefono: '', email: '',
    lugarNacimiento: '', fechaNacimiento: '', direccion: '', codigoPostal: '', localidad: '', provincia: '', 
    facebook: '', instagram: '', contactoEmergencia: '', coberturaMedica: '', nroAfiliado: '',
    grupoFamiliar: null, esMenor: false, tutor: null
  });

  const [familias, setFamilias] = useState([]);
  const [alumnos, setAlumnos] = useState([]); 
  const [busquedaFamilia, setBusquedaFamilia] = useState('');
  const [busquedaTutor, setBusquedaTutor] = useState('');
  const [mostrarSugerenciasFam, setMostrarSugerenciasFam] = useState(false);
  const [mostrarSugerenciasTut, setMostrarSugerenciasTut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarDatosBase();
      if (alumnoAEditar) {
        setFormData({
          ...alumnoAEditar,
          grupoFamiliar: alumnoAEditar.grupoFamiliar ? { id: alumnoAEditar.grupoFamiliar.id } : null,
          tutor: alumnoAEditar.tutor ? { id: alumnoAEditar.tutor.id } : null,
          fechaNacimiento: alumnoAEditar.fechaNacimiento || '',
          esMenor: alumnoAEditar.esMenor || false
        });
        setBusquedaFamilia(alumnoAEditar.grupoFamiliar ? alumnoAEditar.grupoFamiliar.nombreReferencia : '');
        setBusquedaTutor(alumnoAEditar.tutor ? `${alumnoAEditar.tutor.nombre} ${alumnoAEditar.tutor.apellido}` : '');
      } else {
        setFormData({ 
          nombre: '', apellido: '', dni: '', telefono: '', email: '', lugarNacimiento: '', fechaNacimiento: '', 
          direccion: '', codigoPostal: '', localidad: '', provincia: '', facebook: '', instagram: '', 
          contactoEmergencia: '', coberturaMedica: '', nroAfiliado: '', grupoFamiliar: null, esMenor: false, tutor: null
        });
        setBusquedaFamilia('');
        setBusquedaTutor('');
      }
    }
  }, [isOpen, alumnoAEditar]);

  const cargarDatosBase = async () => {
    try {
      const [famRes, alumRes] = await Promise.all([api.get('/grupos-familiares'), api.get('/alumnos')]);
      setFamilias(famRes.data);
      setAlumnos(alumRes.data.filter(a => !a.esMenor)); 
    } catch (error) { toast.error("Error al cargar datos."); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (name === 'apellido' && !formData.grupoFamiliar) setBusquedaFamilia(value);
    if (name === 'esMenor' && !checked) {
      setFormData(prev => ({ ...prev, tutor: null }));
      setBusquedaTutor('');
    }
  };

  const familiasFiltradas = familias.filter(f => f.nombreReferencia.toLowerCase().includes(busquedaFamilia.toLowerCase()));
  const seleccionarFamilia = (familia) => {
    setFormData({ ...formData, grupoFamiliar: { id: familia.id } });
    setBusquedaFamilia(familia.nombreReferencia);
    setMostrarSugerenciasFam(false);
  };

  const tutoresFiltrados = alumnos.filter(a => `${a.nombre} ${a.apellido} ${a.dni}`.toLowerCase().includes(busquedaTutor.toLowerCase()));
  const seleccionarTutor = (tutor) => {
    setFormData(prev => ({
      ...prev,
      tutor: { id: tutor.id },
      telefono: prev.telefono || tutor.telefono,
      direccion: prev.direccion || tutor.direccion,
      codigoPostal: prev.codigoPostal || tutor.codigoPostal,
      localidad: prev.localidad || tutor.localidad,
      provincia: prev.provincia || tutor.provincia,
      contactoEmergencia: prev.contactoEmergencia || tutor.contactoEmergencia,
      grupoFamiliar: tutor.grupoFamiliar ? { id: tutor.grupoFamiliar.id } : prev.grupoFamiliar
    }));
    setBusquedaTutor(`${tutor.nombre} ${tutor.apellido}`);
    if (tutor.grupoFamiliar && !formData.grupoFamiliar) setBusquedaFamilia(tutor.grupoFamiliar.nombreReferencia);
    setMostrarSugerenciasTut(false);
  };

  // MODIFICACIÓN: Async para auto-crear familia si no existe
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || !formData.dni) return toast.error("Nombre, Apellido y DNI son obligatorios.");
    if (formData.esMenor && !formData.tutor) return toast.error("Selecciona un Adulto Responsable para este menor.");
    if (!formData.esMenor && !formData.email) return toast.error("Los adultos necesitan un Email para el portal.");

    let datosFinales = { ...formData };

    // Auto-crear grupo familiar si escribió algo pero no seleccionó de la lista
    if (busquedaFamilia.trim() && !formData.grupoFamiliar) {
      try {
        const response = await api.post('/grupos-familiares', { nombreReferencia: busquedaFamilia });
        datosFinales.grupoFamiliar = { id: response.data.id };
      } catch (error) {
        toast.error("Error al crear el grupo familiar. Revisa tu conexión.");
        return;
      }
    }

    onSave(datosFinales);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-indigo-600 text-white rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold">FORMULARIO DE INSCRIPCIÓN</h2>
            <p className="text-indigo-200 text-sm">Ficha oficial de Epifania Dance</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>

        {/* MODIFICACIÓN: pb-32 para que el scroll permita ver los menúes absolutos */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          <form id="formAlumno" onSubmit={handleSubmit} className="space-y-6 pb-32">
            
            <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center gap-4 transition-colors ${formData.esMenor ? 'bg-amber-50 border-amber-200' : 'bg-indigo-50 border-indigo-200'}`}>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="esMenor" name="esMenor" checked={formData.esMenor} onChange={handleChange} className="w-5 h-5 rounded cursor-pointer accent-indigo-600" />
                <label htmlFor="esMenor" className="font-bold text-gray-800 flex items-center cursor-pointer">
                  <Baby className="w-5 h-5 mr-2" /> Este alumno es Menor de Edad
                </label>
              </div>

              {formData.esMenor && (
                <div className="flex-1 w-full relative">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" value={busquedaTutor}
                      onChange={(e) => {
                        setBusquedaTutor(e.target.value);
                        setFormData({ ...formData, tutor: null });
                        setMostrarSugerenciasTut(true);
                      }}
                      onFocus={() => setMostrarSugerenciasTut(true)}
                      placeholder="Buscar padre, madre o responsable..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none shadow-sm" 
                    />
                  </div>
                  {mostrarSugerenciasTut && busquedaTutor.length > 0 && (
                    <div className="absolute z-30 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                      {tutoresFiltrados.length > 0 ? (
                        <ul>
                          {tutoresFiltrados.map(tutor => (
                            <li key={tutor.id} onClick={() => seleccionarTutor(tutor)} className="px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-gray-50 flex flex-col">
                              <span className="font-bold text-gray-800">{tutor.nombre} {tutor.apellido}</span>
                              <span className="text-xs text-gray-500">DNI: {tutor.dni}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500">No se encontró al adulto.<br/><span className="font-bold text-amber-600">Registre primero al adulto en el sistema.</span></div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DATOS PERSONALES */}
            <div>
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Datos del Estudiante</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Nombre *</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Apellido *</label><input type="text" name="apellido" value={formData.apellido} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">DNI *</label><input type="text" name="dni" value={formData.dni} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>

                <div><label className="block text-xs font-bold text-gray-600 mb-1">Lugar Nacimiento</label><input type="text" name="lugarNacimiento" value={formData.lugarNacimiento} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Fecha Nacimiento</label><input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Teléfono</label><input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>

                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600 mb-1">Dirección</label><input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Cod. Postal</label><input type="text" name="codigoPostal" value={formData.codigoPostal} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>

                <div><label className="block text-xs font-bold text-gray-600 mb-1">Localidad</label><input type="text" name="localidad" value={formData.localidad} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Provincia</label><input type="text" name="provincia" value={formData.provincia} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                
                {!formData.esMenor && (
                  <div>
                    <label className="block text-xs font-bold text-indigo-600 mb-1">Email (Acceso al Portal) *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Requerido" className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                )}

                <div><label className="block text-xs font-bold text-gray-600 mb-1">Cobertura Médica</label><input type="text" name="coberturaMedica" value={formData.coberturaMedica} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600 mb-1">Nro. de Afiliado</label><input type="text" name="nroAfiliado" value={formData.nroAfiliado} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              </div>
            </div>

            {/* FAMILIA Y DESCUENTOS */}
            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">Grupo Familiar (Para descuentos automáticos)</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" value={busquedaFamilia}
                  onChange={(e) => {
                    setBusquedaFamilia(e.target.value);
                    setFormData({ ...formData, grupoFamiliar: null });
                    setMostrarSugerenciasFam(true);
                  }}
                  onFocus={() => setMostrarSugerenciasFam(true)}
                  placeholder="Escriba el nombre de la familia..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>

              {mostrarSugerenciasFam && busquedaFamilia.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                  {familiasFiltradas.length > 0 ? (
                    <ul className="max-h-48 overflow-y-auto">
                      {familiasFiltradas.map(familia => (
                        <li key={familia.id} onClick={() => seleccionarFamilia(familia)} className="px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center text-gray-700">
                          <Users className="w-4 h-4 mr-3 text-indigo-500" />
                          <span className="font-medium">{familia.nombreReferencia}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                      <p className="text-sm font-bold text-indigo-600">"{busquedaFamilia}" se creará al guardar.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </form>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
          <button type="button" onClick={onClose} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors">Cancelar</button>
          <button type="submit" form="formAlumno" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">
            {alumnoAEditar ? 'Actualizar Ficha' : 'Guardar Inscripción'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AlumnoModal;