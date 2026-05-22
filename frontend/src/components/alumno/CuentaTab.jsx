import { AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Tab "Estado de Cuenta" del portal del alumno.
 * Muestra cuotas pendientes e historial de pagos.
 */
const CuentaTab = ({ recibos, historialPagos }) => (
  <div className="space-y-8">

    {/* Cuotas pendientes */}
    <div>
      <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-500" /> Cuotas Pendientes
      </h3>

      {recibos.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center shadow-sm flex flex-col items-center">
          <CheckCircle className="w-14 h-14 text-emerald-400 mb-3" />
          <p className="font-bold text-xl text-gray-800">¡Al día!</p>
          <p className="text-gray-500 mt-1">No hay cuotas pendientes para este perfil.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recibos.map(recibo => {
            const mesString = new Date(recibo.fechaEmision).toLocaleString('es-ES', { month: 'long' });
            return (
              <div key={recibo.id} className="bg-white p-6 rounded-2xl border-l-4 border-l-red-500 shadow-sm flex flex-col justify-between">
                <div className="mb-4">
                  <p className="font-bold text-gray-800 text-lg capitalize">Cuota {mesString}</p>
                  <p className="text-sm text-gray-500 font-medium">Recibo #{recibo.id}</p>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-1 rounded-md">
                    Pendiente
                  </span>
                  <span className="text-2xl font-black text-gray-800">
                    ${recibo.montoTotal.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* Historial de pagos */}
    {historialPagos.length > 0 && (
      <div>
        <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" /> Historial de Pagos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {historialPagos.map(recibo => {
            const mesString = new Date(recibo.fechaEmision).toLocaleString('es-ES', {
              month: 'long',
              year: 'numeric',
            });
            return (
              <div key={recibo.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between opacity-80">
                <div className="mb-3">
                  <p className="font-bold text-gray-700 capitalize">{mesString}</p>
                  <p className="text-xs text-gray-400 font-medium">Recibo #{recibo.id}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    Pagado
                  </span>
                  <span className="text-xl font-black text-gray-600">
                    ${recibo.montoTotal.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);

export default CuentaTab;
