import { X, Tag, DollarSign, Package, AlignLeft, ImagePlus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const comprimirImagen = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    };
  });
};

const ProductoModal = ({ isOpen, onClose, onSave, productoAEditar }) => {
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', precio: '', stock: '', categoria: 'INDUMENTARIA', imagenes: []
  });
  const [procesandoImagenes, setProcesandoImagenes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (productoAEditar) {
        setFormData({
          nombre: productoAEditar.nombre || '',
          descripcion: productoAEditar.descripcion || '',
          precio: productoAEditar.precio || '',
          stock: productoAEditar.stock || '',
          categoria: productoAEditar.categoria || 'INDUMENTARIA',
          imagenes: productoAEditar.imagenes ? [...productoAEditar.imagenes] : []
        });
      } else {
        setFormData({ nombre: '', descripcion: '', precio: '', stock: '', categoria: 'INDUMENTARIA', imagenes: [] });
      }
    }
  }, [isOpen, productoAEditar]);

  const handleSubirImagenes = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.imagenes.length + files.length > 4) {
      toast.error("Máximo 4 imágenes por producto.");
      return;
    }
    
    setProcesandoImagenes(true);
    const nuevasImagenes = [];
    for (let file of files) {
      if (file.type.startsWith('image/')) {
        const base64 = await comprimirImagen(file);
        nuevasImagenes.push({ datosImagen: base64 });
      }
    }
    
    setFormData(prev => ({ ...prev, imagenes: [...prev.imagenes, ...nuevasImagenes] }));
    setProcesandoImagenes(false);
  };

  const eliminarImagen = (index) => {
    setFormData(prev => {
      const nuevas = [...prev.imagenes];
      nuevas.splice(index, 1);
      return { ...prev, imagenes: nuevas };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio || !formData.stock) {
      return toast.error("Completa los campos obligatorios.");
    }
    const dataAEnviar = { ...formData, precio: parseFloat(formData.precio), stock: parseInt(formData.stock, 10) };
    onSave(dataAEnviar);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
        
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">{productoAEditar ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            <p className="text-indigo-200 text-sm">Catálogo de Epifania Dance</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* GALERÍA DE IMÁGENES */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Imágenes del Producto (Máx 4)</label>
            <div className="flex flex-wrap gap-3">
              {formData.imagenes.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-gray-200 group">
                  <img src={img.datosImagen} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => eliminarImagen(idx)} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
              
              {formData.imagenes.length < 4 && (
                <label className={`w-20 h-20 border-2 border-dashed border-indigo-200 rounded-xl flex flex-col items-center justify-center text-indigo-400 cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-colors ${procesandoImagenes ? 'opacity-50 pointer-events-none' : ''}`}>
                  {procesandoImagenes ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div> : <ImagePlus className="w-6 h-6" />}
                  <input type="file" multiple accept="image/*" onChange={handleSubirImagenes} className="hidden" disabled={procesandoImagenes} />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre del Artículo *</label>
            <div className="relative">
              <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej: Remera Epifania Talle M" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Precio ($) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input type="number" required min="0" step="0.01" value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Stock *</label>
              <div className="relative">
                <Package className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input type="number" required min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Categoría *</label>
            <select value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700">
              <option value="INDUMENTARIA">Indumentaria</option>
              <option value="EVENTOS">Eventos / Entradas</option>
              <option value="MERCHANDISING">Merchandising / Accesorios</option>
              <option value="OTROS">Otros</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Descripción <span className="font-normal">(Opcional)</span></label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows="2" placeholder="Detalles del producto..." />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition">Cancelar</button>
            <button type="submit" disabled={procesandoImagenes} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition disabled:bg-gray-400 active:scale-95">Guardar Producto</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProductoModal;