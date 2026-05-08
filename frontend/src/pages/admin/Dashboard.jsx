import { useState, useEffect } from 'react';
import { Download, Users, DollarSign, Activity, TrendingUp, TrendingDown, AlertTriangle, CreditCard, Calendar, ChevronRight, Calculator, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';

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

  const descargarExcel = async () => {
    if (historico) {
      toast.error("El Excel solo se puede generar por mes específico.");
      return;
    }
    
    const toastId = toast.loading("Generando Excel contable...");
    try {
      const response = await api.get(`/dashboard/exportar-excel?mes=${mes}&anio=${anio}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Balance_Epifania_${mes}_${anio}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("¡Excel descargado con éxito!", { id: toastId });
    } catch (error) {
      toast.error("Error al descargar el Excel", { id: toastId });
    }
  };

  if (!data) return null;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* HEADER RESPONSIVO */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800">Estado de la Academia</h1>
          <p className="text-gray-500 mt-1">Resumen General de Epifania Dance</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100 shadow-inner">
          <button 
            onClick={() => setHistorico(!historico)}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${historico ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
          >
            {historico ? 'Volver a Mensual' : 'Ver Histórico Total'}
          </button>
          
          {!historico && (
            <div className="flex gap-2">
              <select value={mes} onChange={(e) => setMes(e.target.value)} className="bg-white border border-gray-200 rounded-lg text-sm p-2.5 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500">
                {MESES.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
              </select>
              <select value={anio} onChange={(e) => setAnio(e.target.value)} className="bg-white border border-gray-200 rounded-lg text-sm p-2.5 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500">
                {[2024, 2025, 2026, 2027].map(a => <option key={a} value={a}>{a}</option>)}
              </select>

              {/* BOTÓN DE EXCEL */}
              <div className="h-8 w-px bg-gray-300 mx-1"></div>
              <button 
                onClick={descargarExcel}
                className="flex items-center px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                title="Descargar Reporte Contable"
              >
                <Download className="w-4 h-4 mr-2" /> Excel
              </button>

            </div>
          )}
        </div>
      </div>

      {/* METRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Fila 1: Académico */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><Users className="w-8 h-8" /></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Población Estudiantil</p>
              <p className="text-3xl font-black text-gray-800">{data.alumnosActivos || 0} Alumnos Activos</p>
            </div>
          </div>
        </div>

        {/* Fila 2: El Triple Panel Financiero (ERP) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ingresos */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group hover:border-emerald-200 transition-colors">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform"><TrendingUp className="w-32 h-32 text-emerald-500" /></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign className="w-5 h-5" /></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cobros Acumulados</p>
            </div>
            <p className="text-3xl font-black text-gray-800 z-10">${data.ingresos?.toLocaleString('es-AR') || '0'}</p>
          </div>

          {/* Egresos */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group hover:border-red-200 transition-colors">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform"><TrendingDown className="w-32 h-32 text-red-500" /></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Activity className="w-5 h-5" /></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gastos y Sueldos</p>
            </div>
            <p className="text-3xl font-black text-gray-800 z-10">-${data.totalEgresos?.toLocaleString('es-AR') || '0'}</p>
          </div>

          {/* Balance Neto */}
          <div className="bg-indigo-600 p-6 rounded-2xl shadow-md border border-indigo-500 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform"><Calculator className="w-32 h-32 text-white" /></div>
            <div className="flex items-center gap-3 mb-2 text-indigo-100">
              <div className="p-2 bg-white/20 rounded-lg"><DollarSign className="w-5 h-5" /></div>
              <p className="text-xs font-bold uppercase tracking-wider">Ganancia Neta Real</p>
            </div>
            <p className="text-4xl font-black text-white z-10">${data.balanceNeto?.toLocaleString('es-AR') || '0'}</p>
          </div>
        </div>

      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border min-h-[350px] flex flex-col">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-500"/>Inscriptos por Disciplina</h3>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.alumnosPorDisciplina || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5}>
                  {(data.alumnosPorDisciplina || []).map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                </Pie>
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '500', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border min-h-[350px] flex flex-col">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-500"/>Métodos de Ingreso</h3>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.metodosPago || []} margin={{top: 20, right: 0, left: -20, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6b7280', fontWeight: '500'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6b7280'}} tickFormatter={(value) => `$${value}`} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value) => `$${value.toLocaleString('es-AR')}`} />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ALERTAS DE ABANDONO */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-2 h-full bg-red-500"></div>
        <h3 className="font-bold text-red-600 mb-6 flex items-center gap-2 text-lg"><AlertTriangle className="w-6 h-6"/> Alumnos en Riesgo de Abandono</h3>
        
        {data.alertasAsistencia?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.alertasAsistencia.map((alerta, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-white hover:bg-red-50 rounded-xl border border-red-100 transition-colors shadow-sm">
                <span className="font-bold text-gray-700">{alerta.nombre}</span>
                <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-widest">{alerta.ausencias} FALTAS</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
            <p className="text-gray-500 font-medium">Asistencia perfecta. No hay alertas de abandono.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelGeneral;