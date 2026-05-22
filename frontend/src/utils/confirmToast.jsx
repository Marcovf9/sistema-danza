import toast from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

/**
 * Muestra un toast de confirmación con botones "Cancelar" / acción.
 *
 * @param {object} opts
 * @param {string}   opts.titulo    - Título principal del dialog
 * @param {string}   opts.mensaje   - Descripción / advertencia
 * @param {string}   [opts.labelOk] - Texto del botón de confirmación (default: 'Confirmar')
 * @param {string}   [opts.colorOk] - Clases del botón OK (default: rojo)
 * @param {Function} opts.onConfirm - Callback al confirmar
 */
const showConfirmToast = ({
  titulo,
  mensaje,
  labelOk = 'Confirmar',
  colorOk = 'bg-red-500 hover:bg-red-600',
  onConfirm,
}) => {
  toast((t) => (
    <div className="flex flex-col gap-3 p-1">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
        <p className="font-bold text-gray-800 text-lg">{titulo}</p>
      </div>
      <p className="text-sm text-gray-600">{mensaje}</p>
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition"
        >
          Cancelar
        </button>
        <button
          onClick={() => { toast.dismiss(t.id); onConfirm(); }}
          className={`px-4 py-2 text-sm font-bold text-white rounded-xl shadow-sm transition ${colorOk}`}
        >
          {labelOk}
        </button>
      </div>
    </div>
  ), { duration: Infinity, style: { minWidth: '320px' } });
};

export default showConfirmToast;
