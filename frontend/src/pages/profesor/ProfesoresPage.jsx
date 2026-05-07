import { useState, useEffect } from 'react';
import api from '../../services/api';
import { GraduationCap, Calculator, Landmark, Plus, Pencil, Trash2, AlertCircle, Download, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ProfesorModal from '../../components/admin/ProfesorModal';

const ProfesoresPage = () => {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [mes, setMes] = useState(new Date().getMonth() + 1); 
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [liquidacionActiva, setLiquidacionActiva] = useState(null);
  const [calculando, setCalculando] = useState(false);
  
  const [liquidacionPagadaId, setLiquidacionPagadaId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profesorAEditar, setProfesorAEditar] = useState(null);

  const fetchProfesores = async () => {
    try {
      const response = await api.get('/profesores');
      setProfesores(response.data);
    } catch (error) {
      toast.error("Error cargando profesores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfesores();
  }, []);

  useEffect(() => {
    setLiquidacionActiva(null);
    setLiquidacionPagadaId(null);
  }, [mes, anio]);

  const handleAbrirCrear = () => {
    setProfesorAEditar(null);
    setIsModalOpen(true);
  };

  const handleAbrirEditar = (prof) => {
    setProfesorAEditar(prof);
    setIsModalOpen(true);
  };

  const handleGuardarProfesor = async (formData) => {
    try {
      if (profesorAEditar) {
        await api.put(`/profesores/${profesorAEditar.id}`, formData);
        toast.success("¡Profesor actualizado!");
      } else {
        await api.post('/profesores', formData);
        toast.success("¡Profesor creado con su acceso al sistema!");
      }
      setIsModalOpen(false);
      fetchProfesores();
    } catch (error) {
      toast.error("Error al guardar el profesor.");
    }
  };

  const handleDarDeBaja = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="font-bold text-gray-800 text-lg">¿Eliminar / Baja?</p>
        </div>
        <p className="text-sm text-gray-600">Este profesor ya no tendrá acceso al sistema ni aparecerá en grillas.</p>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">Cancelar</button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.patch(`/profesores/${id}/baja`);
                toast.success("Profesor dado de baja.");
                fetchProfesores();
              } catch (error) {
                toast.error("Error al realizar la baja.");
              }
            }} 
            className="px-4 py-2 text-sm font-bold bg-red-500 text-white hover:bg-red-600 rounded-xl shadow-sm transition"
          >
            Confirmar
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleCalcularLiquidacion = async (profesor) => {
    setCalculando(profesor.id);
    setLiquidacionPagadaId(null);
    try {
      const response = await api.get(`/profesores/${profesor.id}/liquidacion`, { params: { mes, anio } });
      setLiquidacionActiva({ profesor, ...response.data });
      toast.success("Liquidación calculada.");
    } catch (error) {
      toast.error(error.response?.data || "Error al calcular la liquidación.");
    } finally {
      setCalculando(false);
    }
  };

  const handleMarcarPagado = async () => {
    if (!liquidacionActiva) return;

    const confirmar = window.confirm(`¿Confirmas el pago de $${liquidacionActiva.totalAPagar} a ${liquidacionActiva.profesor.nombre}? Esto registrará un egreso en caja.`);
    
    if (!confirmar) return;

    try {
      const response = await api.post(`/profesores/${liquidacionActiva.profesor.id}/liquidaciones/pagar`, null, {
        params: {
          mes: mes,
          anio: anio,
          monto: liquidacionActiva.totalAPagar
        }
      });
      
      toast.success("¡Sueldo pagado! Se registró el egreso en la Caja.");
      setLiquidacionPagadaId(response.data.liquidacionId);
    } catch (error) {
      toast.error("Error al registrar el pago del sueldo.");
    }
  };

  const descargarPdfSueldo = async (id) => {
    try {
      const response = await api.get(`/profesores/liquidaciones/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Honorarios_Prof_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("No se pudo descargar el comprobante.");
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">Staff Docente y Sueldos</h2>
          <p className="text-gray-500 mt-1">Calcula honorarios y administra los accesos.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3 items-center">
          <button onClick={handleAbrirCrear} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition">
            <Plus className="w-5 h-5 mr-1" /> Agregar Profe
          </button>
          <div className="h-8 w-px bg-gray-200 mx-2"></div>
          <select value={mes} onChange={(e) => setMes(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>Mes {m}</option>)}
          </select>
          <input type="number" value={anio} onChange={(e) => setAnio(e.target.value)} className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none" />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-700">Listado de Profesores</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : (
              <div className="space-y-3">
                {profesores.map((prof) => (
                  <div key={prof.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow gap-4 ${prof.activo === false ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">
                          {prof.nombre} {prof.apellido}
                          {prof.activo === false && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">INACTIVO</span>}
                        </p>
                      <p className="text-sm text-gray-500 font-mono">{prof.cbuAlias || 'Sin CBU'}</p>
                    </div>
                  </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleAbrirEditar(prof)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar"><Pencil className="w-5 h-5" /></button>
                      <button onClick={() => handleDarDeBaja(prof.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Baja"><Trash2 className="w-5 h-5" /></button>
                      <button onClick={() => handleCalcularLiquidacion(prof)} disabled={calculando === prof.id} className="ml-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-bold text-sm transition flex items-center gap-2">
                        {calculando === prof.id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <><Calculator className="w-4 h-4"/> Liquidar</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          {liquidacionPagadaId ? (
             <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-300">
               <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                 <CheckCircle className="w-10 h-10 text-white" />
               </div>
               <div className="text-center">
                 <h4 className="text-2xl font-bold text-gray-800">¡Sueldo Abonado!</h4>
                 <p className="text-gray-500 mt-1 text-sm">Se registró el egreso en la Caja Central.</p>
               </div>
               
               <button 
                 onClick={() => descargarPdfSueldo(liquidacionPagadaId)}
                 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md"
               >
                 <Download className="w-5 h-5" />
                 Descargar Recibo PDF
               </button>
               
               <button 
                 onClick={() => { setLiquidacionPagadaId(null); setLiquidacionActiva(null); }}
                 className="text-sm text-gray-500 hover:text-gray-700 font-bold transition"
               >
                 ← Volver al listado
               </button>
             </div>
          ) : liquidacionActiva ? (
            <div className="p-6 flex-1 flex flex-col justify-between animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-xl font-black text-gray-800 mb-6 border-b pb-4">Detalle de Pago</h3>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Profesor/a</p>
                <p className="text-lg font-bold text-gray-800">{liquidacionActiva.profesor.nombre} {liquidacionActiva.profesor.apellido}</p>
              </div>
              <div className="border-t border-dashed border-gray-200 py-6 mb-2">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">Total a Transferir</p>
                <div className="flex items-center justify-between">
                  <Landmark className="text-gray-400 w-8 h-8" />
                  <span className="text-4xl font-black text-indigo-600">${liquidacionActiva.totalAPagar?.toLocaleString('es-AR') || '0'}</span>
                </div>
              </div>
              <button 
                onClick={handleMarcarPagado} 
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-colors flex justify-center items-center"
              >
                Confirmar Pago y Registrar Egreso
              </button>
            </div>
          ) : (
            <div className="h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 text-gray-400">
              <Calculator className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-center font-medium">Selecciona "Liquidar" para ver el desglose.</p>
            </div>
          )}
        </div>
      </div>

      <ProfesorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleGuardarProfesor}
        profesorAEditar={profesorAEditar} 
      />
    </div>
  );
};

export default ProfesoresPage;