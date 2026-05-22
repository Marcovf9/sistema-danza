import { X } from 'lucide-react';

/**
 * Modal para seleccionar días e inscribirse a una clase.
 * Props:
 *  - clase          : objeto ClaseProgramada (con .disciplina.nombre, .diasSemana, .diasDisponiblesParaInscripcion?)
 *  - nombreAlumno   : string
 *  - diasSeleccionados : string[]
 *  - onToggleDia    : (dia: string) => void
 *  - onConfirmar    : () => void
 *  - onCerrar       : () => void
 */
const ModalInscripcion = ({ clase, nombreAlumno, diasSeleccionados, onToggleDia, onConfirmar, onCerrar }) => {
  if (!clase) return null;

  const diasDisponibles = clase.diasDisponiblesParaInscripcion
    || clase.diasSemana.split(',').map(d => d.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in">
        <div className="p-6 bg-pink-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Inscripción</h3>
            <p className="text-pink-200 text-sm mt-1">{clase.disciplina.nombre}</p>
          </div>
          <button onClick={onCerrar} className="p-2 hover:bg-white/20 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600 font-medium text-sm">
            Selecciona los días para inscribir a <span className="font-bold text-gray-800">{nombreAlumno}</span>:
          </p>

          <div className="flex flex-wrap gap-3">
            {diasDisponibles.map(dia => (
              <button
                key={dia}
                onClick={() => onToggleDia(dia)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${
                  diasSeleccionados.includes(dia)
                    ? 'bg-pink-50 border-pink-500 text-pink-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {dia}
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6">
            <button
              onClick={onCerrar}
              className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              disabled={diasSeleccionados.length === 0}
              className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-md disabled:bg-gray-300 transition"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalInscripcion;
