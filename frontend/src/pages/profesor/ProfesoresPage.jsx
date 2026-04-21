import { useState, useEffect } from 'react';
import api from '../../services/api';
import { GraduationCap, Calculator, Landmark } from 'lucide-react';

const ProfesoresPage = () => {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [mes, setMes] = useState(new Date().getMonth() + 1); // Mes actual (1-12)
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [liquidacionActiva, setLiquidacionActiva] = useState(null);
  const [calculando, setCalculando] = useState(false);

  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        const response = await api.get('/profesores');
        setProfesores(response.data);
      } catch (error) {
        console.error("Error cargando profesores:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfesores();
  }, []);

  useEffect(() => {
    setLiquidacionActiva(null);
  }, [mes, anio]);

  const handleCalcularLiquidacion = async (profesor) => {
    setCalculando(profesor.id);
    try {
      const response = await api.get(`/profesores/${profesor.id}/liquidacion`, {
        params: { mes, anio }
      });
      
      setLiquidacionActiva({
        profesor,
        ...response.data
      });
    } catch (error) {
      console.error("Error al calcular:", error);
      alert("No se pudo calcular la liquidación.");
    } finally {
      setCalculando(null);
    }
  };

  const mesesDelAno = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="space-y-6">
      {/* Cabecera y Filtros de Fecha */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mr-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Plantel Docente</h2>
            <p className="text-gray-500 mt-1">Gestión y liquidación de haberes</p>
          </div>
        </div>

        <div className="flex items-center bg-gray-50 p-2 rounded-xl border border-gray-200">
          <span className="text-sm font-medium text-gray-500 mr-3 ml-2">Período:</span>
          <select 
            value={mes} 
            onChange={(e) => setMes(Number(e.target.value))}
            className="bg-white border-none text-gray-800 font-bold py-2 px-4 rounded-lg shadow-sm outline-none cursor-pointer"
          >
            {mesesDelAno.map((m, index) => (
              <option key={index + 1} value={index + 1}>{m}</option>
            ))}
          </select>
          <select 
            value={anio} 
            onChange={(e) => setAnio(Number(e.target.value))}
            className="ml-2 bg-white border-none text-gray-800 font-bold py-2 px-4 rounded-lg shadow-sm outline-none cursor-pointer"
          >
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Tabla de Profesores */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Cargando plantel...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-100">
                  <th className="p-5 font-semibold">Profesor</th>
                  <th className="p-5 font-semibold">CBU / Alias</th>
                  <th className="p-5 font-semibold text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {profesores.map((profe) => (
                  <tr key={profe.id} className="hover:bg-gray-50/50 transition-colors text-gray-800">
                    <td className="p-5 font-medium flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mr-3">
                        {profe.nombre.charAt(0)}{profe.apellido.charAt(0)}
                      </div>
                      {profe.nombre} {profe.apellido}
                    </td>
                    <td className="p-5 text-gray-500 font-mono text-sm">
                      {profe.cbuAlias || 'No registrado'}
                    </td>
                    <td className="p-5 text-center">
                      <button 
                        onClick={() => handleCalcularLiquidacion(profe)}
                        disabled={calculando === profe.id}
                        className="inline-flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        {calculando === profe.id ? 'Calculando...' : 'Liquidar Mes'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Panel de Resultado de Liquidación */}
        <div className="xl:col-span-1">
          {liquidacionActiva ? (
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100 relative overflow-hidden animate-in slide-in-from-right-4">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Recibo de Haberes</h3>
              <p className="text-gray-500 text-sm mb-6">{mesesDelAno[liquidacionActiva.mes - 1]} {liquidacionActiva.anio}</p>
              
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <p className="text-sm text-gray-500 font-medium mb-1">Profesor/a</p>
                <p className="text-lg font-bold text-gray-800">
                  {liquidacionActiva.profesor.nombre} {liquidacionActiva.profesor.apellido}
                </p>
              </div>

              <div className="border-t border-dashed border-gray-200 py-6 mb-2">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">Total a Transferir</p>
                <div className="flex items-center justify-between">
                  <Landmark className="text-gray-400 w-8 h-8" />
                  <span className="text-4xl font-black text-indigo-600">
                    ${liquidacionActiva.totalAPagar.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-colors flex justify-center items-center">
                Marcar como Pagado
              </button>
            </div>
          ) : (
            <div className="h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 text-gray-400">
              <Calculator className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-center font-medium">Selecciona "Liquidar Mes" en un profesor para ver el desglose de su sueldo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfesoresPage;