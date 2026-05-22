import { Plus, Package } from 'lucide-react';

/**
 * Tab "Tienda" del portal del alumno.
 * Muestra el catálogo de productos con botón para agregar al carrito.
 */
const TiendaTabPortal = ({ productos, onAgregar }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {productos.length === 0 ? (
      <div className="col-span-full bg-white p-12 rounded-3xl border border-gray-100 text-center text-gray-500">
        No hay productos disponibles en este momento.
      </div>
    ) : (
      productos.map(prod => (
        <div
          key={prod.id}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow"
        >
          <div className="aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
            {prod.imagenes && prod.imagenes.length > 0 ? (
              <img
                src={prod.imagenes[0].datosImagen}
                alt={prod.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-12 h-12 text-gray-300" />
            )}
          </div>

          <p className="text-lg font-bold text-gray-800 leading-tight mb-1">{prod.nombre}</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{prod.categoria}</p>

          <div className="mt-auto flex items-center justify-between">
            <span className="font-black text-2xl text-emerald-600">
              ${prod.precio.toLocaleString('es-AR')}
            </span>
            <button
              onClick={() => onAgregar(prod)}
              disabled={prod.stock === 0}
              className="w-10 h-10 bg-pink-600 hover:bg-pink-700 text-white rounded-xl flex items-center justify-center disabled:bg-gray-300 active:scale-95 shadow-sm transition-colors"
              title={prod.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {prod.stock === 0 && (
            <p className="text-xs text-red-500 font-bold text-center mt-2">Sin stock</p>
          )}
        </div>
      ))
    )}
  </div>
);

export default TiendaTabPortal;
