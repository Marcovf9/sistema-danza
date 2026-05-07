import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ProfesorModal = ({ isOpen, onClose, onSave, profesorAEditar }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cbuAlias: '',
    email: '',
    password: ''
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (isOpen) {
      setErrores({});
      if (profesorAEditar) {
        setFormData({
          nombre: profesorAEditar.nombre || '',
          apellido: profesorAEditar.apellido || '',
          cbuAlias: profesorAEditar.cbuAlias || '',
          email: profesorAEditar.usuario?.email || '',
          password: ''
        });
      } else {
        setFormData({ nombre: '', apellido: '', cbuAlias: '', email: '', password: '' });
      }
    }
  }, [isOpen, profesorAEditar]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errores[e.target.name]) {
      setErrores({ ...errores, [e.target.name]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || !formData.email) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }
    if (!profesorAEditar && !formData.password) {
      toast.error("La contraseña es obligatoria para un profesor nuevo.");
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-800">
            {profesorAEditar ? 'Editar Profesor' : 'Nuevo Profesor'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CBU o Alias (Para sueldos)</label>
            <input type="text" name="cbuAlias" value={formData.cbuAlias} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <div className="border-t border-gray-100 pt-5 mt-2">
            <h3 className="text-sm font-bold text-indigo-600 mb-3 uppercase tracking-wider">Acceso al Sistema</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña {profesorAEditar && <span className="text-gray-400 font-normal">(Dejar vacía para no cambiar)</span>}</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancelar</button>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm">
              {profesorAEditar ? 'Actualizar' : 'Crear Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfesorModal;