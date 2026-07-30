import { Calendar, Check, PlusCircle, Trash2 } from 'lucide-react';
import showConfirmToast from '../../utils/confirmToast';

/**
 * Tab "Clases" del portal del alumno.
 * Muestra inscripciones actuales y clases disponibles para anotarse.
 */
const ClasesTab = ({ misClases, clasesDisponibles, onInscribir, onBaja }) => {

  const handleDarDeBaja = (inscripcionId, nombreDisciplina) => {
    showConfirmToast({
      titulo: `¿Cancelar inscripción a ${nombreDisciplina}?`,
      mensaje: 'Dejarás de cursar esta clase. Podrás volver a anotarte más adelante si hay cupo.',
      labelOk: 'Darme de baja',
      onConfirm: () => onBaja(inscripcionId),
    });
  };

  return (
    <div className="space-y-10">

      {/* Clases actuales */}
      <div>
        <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center">
          <Check className="w-5 h-5 mr-2 text-emerald-500" /> Clases Actuales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {misClases.length === 0 ? (
            <div className="col-span-full bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
              Sin inscripciones activas.
            </div>
          ) : (
            misClases.map(ins => (
              <div key={ins.id} className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-2 h-full bg-emerald-400"></div>
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">
                  {ins.clase.horaInicio.slice(0, 5)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-lg leading-tight">{ins.clase.disciplina.nombre}</p>
                  <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-wider">
                    {ins.diasSeleccionados || ins.clase.diasSemana}
                  </p>
                </div>
                <button
                  onClick={() => handleDarDeBaja(ins.id, ins.clase.disciplina.nombre)}
                  className="mr-3 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Anular inscripción"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Clases disponibles */}
      <div>
        <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center">
          <PlusCircle className="w-5 h-5 mr-2 text-pink-500" /> Anotar a Nuevas Clases
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clasesDisponibles.length === 0 ? (
            <div className="col-span-full bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-500">
              Ya cursa todas las clases disponibles.
            </div>
          ) : (
            clasesDisponibles.map(clase => (
              <div
                key={clase.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-pink-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-gray-800 text-lg leading-tight">{clase.disciplina.nombre}</p>
                    <p className="text-xs font-bold text-pink-500 mt-1 uppercase tracking-wider">
                      {(clase.diasDisponiblesParaInscripcion || clase.diasSemana.split(',')).join(', ')} • {clase.horaInicio.slice(0, 5)}hs
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <button
                  onClick={() => onInscribir(clase)}
                  className="w-full py-2.5 bg-gray-900 hover:bg-pink-600 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
                >
                  Inscribir
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClasesTab;
