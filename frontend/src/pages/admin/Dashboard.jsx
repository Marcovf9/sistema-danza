import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, DollarSign, AlertTriangle, PieChart, TrendingUp, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/resumen')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Cargando métricas estratégicas...</div>;

  return (
    <div className="space-y-8">
      {/* Saludo y Título */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-gray-800 tracking-tight">Estado de la Academia</h2>
          <p className="text-gray-500 text-lg mt-1">Resumen operativo y financiero del mes</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center text-green-600 font-bold">
          <TrendingUp className="w-5 h-5 mr-2" />
          Sistema Operativo
        </div>
      </div>

      {/* Tarjetas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
          <div>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Alumnos Activos</p>
            <h3 className="text-4xl font-black text-gray-800">{data.alumnosActivos}</h3>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
            <Users className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-green-200 transition-all">
          <div>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Ingresos del Mes</p>
            <h3 className="text-4xl font-black text-gray-800">${data.ingresosMes.toLocaleString('es-AR')}</h3>
          </div>
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-amber-200 transition-all">
          <div>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Método Preferido</p>
            <h3 className="text-2xl font-black text-gray-800">
                {Object.keys(data.metodosPago).reduce((a, b) => data.metodosPago[a] > data.metodosPago[b] ? a : b, 'N/A')}
            </h3>
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
            <PieChart className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alertas de Retención */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-50">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-bold text-gray-800 flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-2" /> 
              Alerta de Retención (Ausencias)
            </h4>
            <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">CRÍTICO</span>
          </div>
          <div className="space-y-4">
            {data.alertasAsistencia.length > 0 ? data.alertasAsistencia.map((alerta, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="font-bold text-gray-700">{alerta.nombre}</span>
                <span className="text-red-600 font-black">{alerta.ausencias} faltas este mes</span>
              </div>
            )) : (
              <p className="text-gray-400 italic">No hay alertas de inasistencia este mes.</p>
            )}
          </div>
        </div>

        {/* Métodos de Pago Detallado */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h4 className="text-xl font-bold text-gray-800 mb-6">Distribución de Cobros</h4>
          <div className="space-y-5">
            {Object.entries(data.metodosPago).map(([metodo, cantidad]) => (
              <div key={metodo} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-600">{metodo.replace(/_/g, ' ')}</span>
                  <span className="text-indigo-600">{cantidad} recibos</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${(cantidad / Object.values(data.metodosPago).reduce((a,b) => a+b, 0)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;