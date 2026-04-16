import { X, Search, Users, PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';

const AlumnoModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    contactoEmergencia: '',
    grupoFamiliar: null // Guardará el objeto { id: ... } si se selecciona
  });

  const [familias, setFamilias] = useState([]);
  const [busquedaFamilia, setBusquedaFamilia] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [creandoFamilia, setCreandoFamilia] = useState(false);

  // Cargar las familias cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarFamilias();
      // Limpiar formulario
      setFormData({ nombre: '', apellido: '', dni: '', telefono: '', contactoEmergencia: '', grupoFamiliar: null });
      setBusquedaFamilia('');
    }
  }, [isOpen]);

  const cargarFamilias = async () => {
    try {
      const response = await api.get('/grupos-familiares');
      setFamilias(response.data);
    } catch (error) {
      console.error("Error cargando familias", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Filtrar familias según lo que escribe el usuario
  const familiasFiltradas = familias.filter(f => 
    f.nombreReferencia.toLowerCase().includes(busquedaFamilia.toLowerCase())
  );

  const seleccionarFamilia = (familia) => {
    setFormData({ ...formData, grupoFamiliar: { id: familia.id } });
    setBusquedaFamilia(familia.nombreReferencia);
    setMostrarSugerencias(false);
  };

  const crearNuevaFamilia = async () => {
    if (!busquedaFamilia.trim()) return;
    setCreandoFamilia(true);
    try {
      const response = await api.post('/grupos-familiares', { nombreReferencia: busquedaFamilia });
      setFamilias([...familias, response.data]);
      seleccionarFamilia(response.data);
    } catch (error) {
      console.error("Error al crear familia", error);
    } finally {
      setCreandoFamilia(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-visible animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-800">Registrar Nuevo Alumno</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input type="text" name="apellido" required value={formData.apellido} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
              <input type="text" name="dni" required value={formData.dni} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contacto de Emergencia</label>
              <input type="text" name="contactoEmergencia" value={formData.contactoEmergencia} onChange={handleChange} placeholder="Nombre y teléfono de un familiar"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>
            
            {/* EL BUSCADOR INTELIGENTE DE FAMILIAS */}
            <div className="md:col-span-2 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Grupo Familiar (Para descuentos)</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={busquedaFamilia}
                  onChange={(e) => {
                    setBusquedaFamilia(e.target.value);
                    setFormData({ ...formData, grupoFamiliar: null }); // Desvincular si edita el texto
                    setMostrarSugerencias(true);
                  }}
                  onFocus={() => setMostrarSugerencias(true)}
                  placeholder="Buscar familia existente o escribir una nueva..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                />
              </div>

              {/* Menú desplegable de sugerencias */}
              {mostrarSugerencias && busquedaFamilia.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                  {familiasFiltradas.length > 0 ? (
                    <ul className="max-h-48 overflow-y-auto">
                      {familiasFiltradas.map(familia => (
                        <li 
                          key={familia.id} 
                          onClick={() => seleccionarFamilia(familia)}
                          className="px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center text-gray-700 transition-colors"
                        >
                          <Users className="w-4 h-4 mr-3 text-indigo-500" />
                          <span className="font-medium">{familia.nombreReferencia}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-gray-500 text-sm mb-3">No se encontraron familias con ese nombre.</p>
                    </div>
                  )}
                  
                  {/* Botón para crear nueva familia si no se seleccionó ninguna */}
                  {!formData.grupoFamiliar && (
                     <div className="bg-gray-50 p-2 border-t border-gray-100">
                       <button 
                         type="button" 
                         onClick={crearNuevaFamilia}
                         disabled={creandoFamilia}
                         className="w-full flex items-center justify-center py-2 px-4 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 font-medium transition-colors disabled:opacity-50"
                       >
                         <PlusCircle className="w-4 h-4 mr-2" />
                         {creandoFamilia ? 'Creando...' : `Crear nueva familia "${busquedaFamilia}"`}
                       </button>
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors">
              Guardar Alumno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlumnoModal;