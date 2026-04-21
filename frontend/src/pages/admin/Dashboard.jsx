import { useState, useEffect } from 'react';
import { Users, DollarSign, Activity, TrendingUp, AlertTriangle, CreditCard, Calendar, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../../services/api';

const MESES = [
  { v: 1, n: 'Enero' }, { v: 2, n: 'Febrero' }, { v: 3, n: 'Marzo' }, { v: 4, n: 'Abril' },
  { v: 5, n: 'Mayo' }, { v: 6, n: 'Junio' }, { v: 7, n: 'Julio' }, { v: 8, n: 'Agosto' },
  { v: 9, n: 'Septiembre' }, { v: 10, n: 'Octubre' }, { v: 11, n: 'Noviembre' }, { v: 12, n: 'Diciembre' }
];

const COLORES = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

const PanelGeneral = () => {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [historico, setHistorico] = useState(false);
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      setCargando(true);
      try {
        const params = historico ? '?esHistorico=true' : `?mes=${mes}&anio=${anio}`;
        const res = await api.get(`/dashboard/datos${params}`);
        setData(res.data);
      } catch (e) {
        console.error("Error cargando dashboard", e);
      } finally {
        setCargando(false);
      }
    };
    fetchDatos();
  }, [mes, anio, historico]);

  if (!data) return null;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER RESPONSIVO */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800">Estado de la Academia</h1>
          <p className="text-gray-500">Resumen de Epifania Dance</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-xl border">
          <button 
            onClick={() => setHistorico(!historico)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${historico ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            {historico ? 'Ver Mes' : 'Ver Histórico'}
          </button>
          
          {!historico && (
            <>
              <select value={mes} onChange={(e) => setMes(e.target.value)} className="bg-white border rounded-lg text-sm p-2 outline-none">
                {MESES.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
              </select>
              <select value={anio} onChange={(e) => setAnio(e.target.value)} className="bg-white border rounded-lg text-sm p-2 outline-none">
                {[2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </>
          )}
        </div>
      </div>

      {/* TARJETAS: 1 col en mobile, 2 en tablet, 3 en desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Users /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Alumnos Activos</p>
            <p className="text-2xl font-black text-gray-800">{data.alumnosActivos}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4 sm:col-span-2 lg:col-span-2">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign /></div>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">{historico ? 'Total Histórico' : 'Ingresos del Mes'}</p>
              <p className="text-2xl font-black text-gray-800">${data.ingresos.toLocaleString('es-AR')}</p>
            </div>
            {!historico && data.crecimientoIngresos !== 0 && (
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${data.crecimientoIngresos > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {data.crecimientoIngresos > 0 ? '↑' : '↓'} {Math.abs(data.crecimientoIngresos)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* GRÁFICOS: Se apilan en mobile automáticamente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Disciplinas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border min-h-[350px]">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-500"/>Inscriptos por Disciplina</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.alumnosPorDisciplina} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {data.alumnosPorDisciplina.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Pagos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border min-h-[350px]">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-emerald-500"/>Métodos de Pago</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.metodosPago}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip cursor={{fill: '#f9fafb'}} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ALERTAS: Sección Inferior */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Riesgo de Abandono (Faltas)</h3>
        {data.alertasAsistencia.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.alertasAsistencia.map((alerta, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-100">
                <span className="font-medium text-gray-700">{alerta.nombre}</span>
                <span className="bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold">{alerta.ausencias} faltas</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 italic">No hay alertas para este período.</div>
        )}
      </div>
    </div>
  );
};

export default PanelGeneral;