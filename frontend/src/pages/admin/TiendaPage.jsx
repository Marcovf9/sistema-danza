import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, Pencil, Trash2, ShoppingBag, Package, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductoModal from '../../components/admin/ProductoModal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import showConfirmToast from '../../utils/confirmToast';

const TiendaPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);

  // ── Carga ──────────────────────────────────────────────────────────────────
  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: () => api.get('/productos').then(r => r.data),
    onError: () => toast.error('Error cargando el inventario.'),
  });

  // ── Mutaciones ─────────────────────────────────────────────────────────────
  const guardarMutation = useMutation({
    mutationFn: (formData) =>
      productoAEditar
        ? api.put(`/productos/${productoAEditar.id}`, formData)
        : api.post('/productos', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success(productoAEditar ? '¡Producto actualizado!' : '¡Producto agregado al catálogo!');
      setIsModalOpen(false);
    },
    onError: () => toast.error('Hubo un error al guardar el producto.'),
  });

  const bajaMutation = useMutation({
    mutationFn: (id) => api.patch(`/productos/${id}/baja`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto eliminado exitosamente.');
    },
    onError: () => toast.error('Error al eliminar el producto.'),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAbrirCrear = () => { setProductoAEditar(null); setIsModalOpen(true); };
  const handleAbrirEditar = (prod) => { setProductoAEditar(prod); setIsModalOpen(true); };

  const handleDarDeBaja = (id) => {
    showConfirmToast({
      titulo: '¿Eliminar producto?',
      mensaje: 'Este producto ya no estará disponible para la venta en el portal del alumno.',
      onConfirm: () => bajaMutation.mutate(id),
    });
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Inventario y Tienda</h2>
            <p className="text-sm text-gray-500 mt-1">Gestiona los productos que ven los alumnos.</p>
          </div>
        </div>
        <button
          onClick={handleAbrirCrear}
          className="mt-4 sm:mt-0 flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" /> Agregar Producto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner />
        ) : productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <Package className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">El inventario está vacío</p>
            <p className="text-sm mt-1">Comienza agregando remeras, entradas o accesorios.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-5 font-bold text-gray-500 uppercase text-xs tracking-wider">Producto</th>
                  <th className="p-5 font-bold text-gray-500 uppercase text-xs tracking-wider">Categoría</th>
                  <th className="p-5 font-bold text-gray-500 uppercase text-xs tracking-wider">Stock</th>
                  <th className="p-5 font-bold text-gray-500 uppercase text-xs tracking-wider">Precio</th>
                  <th className="p-5 font-bold text-gray-500 uppercase text-xs tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        {prod.imagenes && prod.imagenes.length > 0 ? (
                          <img src={prod.imagenes[0].datosImagen} alt={prod.nombre} className="w-12 h-12 rounded-lg object-cover shadow-sm border border-gray-200" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-800">{prod.nombre}</p>
                          {prod.descripcion && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{prod.descripcion}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest">
                        {prod.categoria}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${prod.stock > 5 ? 'bg-emerald-500' : prod.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                        <span className={`font-bold ${prod.stock === 0 ? 'text-red-500' : 'text-gray-700'}`}>{prod.stock} unid.</span>
                      </div>
                    </td>
                    <td className="p-5 font-black text-emerald-600 text-lg">
                      ${prod.precio.toLocaleString('es-AR')}
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleAbrirEditar(prod)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar">
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDarDeBaja(prod.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(formData) => guardarMutation.mutate(formData)}
        productoAEditar={productoAEditar}
      />
    </div>
  );
};

export default TiendaPage;
