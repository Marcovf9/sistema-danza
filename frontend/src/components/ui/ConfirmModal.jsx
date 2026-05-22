import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, titulo, mensaje, textoConfirmar = "Confirmar", tipo = "danger" }) => {
  if (!isOpen) return null;

  const isDanger = tipo === 'danger';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className={`p-4 flex items-center justify-between border-b ${isDanger ? 'bg-red-50 border-red-100' : 'bg-indigo-50 border-indigo-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isDanger ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className={`font-bold ${isDanger ? 'text-red-700' : 'text-indigo-700'}`}>{titulo}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed text-sm">{mensaje}</p>
        </div>

        {/* Botones */}
        <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm transition-transform active:scale-95 ${
              isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {textoConfirmar}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;