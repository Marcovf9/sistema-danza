import { Send, Minus } from 'lucide-react';

/**
 * Barra de checkout fija en la parte inferior del portal del alumno.
 * Se renderiza solo cuando granTotal > 0.
 */
const CheckoutFlotante = ({
  carrito,
  totalDeuda,
  totalCarrito,
  granTotal,
  nombreAlumno,
  enviandoPedido,
  onQuitar,
  onEnviar,
}) => {
  if (granTotal <= 0) return null;

  return (
    <div className="fixed bottom-0 left-0 lg:left-72 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">

        {/* Detalle del carrito */}
        <div className="w-full lg:w-1/2">
          {carrito.length > 0 ? (
            <div className="max-h-24 overflow-y-auto space-y-2 pr-2">
              {carrito.map(item => (
                <div key={item.producto.id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-600 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                      x{item.cantidad}
                    </span>
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                      {item.producto.nombre}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-800">
                      ${item.producto.precio * item.cantidad}
                    </span>
                    <button
                      onClick={() => onQuitar(item.producto.id)}
                      className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded-md transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            totalDeuda > 0 && (
              <p className="text-sm text-gray-500 font-medium">
                Estás a punto de abonar cuotas pendientes de {nombreAlumno}.
              </p>
            )
          )}
        </div>

        {/* Total + botón */}
        <div className="w-full lg:w-1/2 flex flex-col sm:flex-row items-center justify-end gap-6">
          <div className="text-center sm:text-right w-full sm:w-auto">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total a Pagar</p>
            <p className="text-3xl font-black text-gray-800">${granTotal.toLocaleString('es-AR')}</p>
            <div className="flex justify-center sm:justify-end gap-2 mt-1">
              {totalDeuda > 0 && (
                <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded">
                  Cuotas: ${totalDeuda.toLocaleString('es-AR')}
                </span>
              )}
              {totalCarrito > 0 && (
                <span className="text-[10px] bg-pink-50 text-pink-600 font-bold px-2 py-0.5 rounded">
                  Tienda: ${totalCarrito.toLocaleString('es-AR')}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onEnviar}
            disabled={enviandoPedido}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-black text-lg rounded-xl shadow-lg flex justify-center items-center gap-2 active:scale-95 transition-colors"
          >
            <Send className="w-5 h-5" />
            {enviandoPedido ? 'Confirmando...' : 'Informar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFlotante;
