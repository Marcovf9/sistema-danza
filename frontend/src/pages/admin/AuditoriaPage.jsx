import { useState, useEffect } from 'react';
import { ShieldCheck, Search, Clock, User, Activity, FileText } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AuditoriaPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/dashboard/auditoria');
        setLogs(response.data);
      } catch (error) {
        toast.error("Error al cargar el registro de auditoría.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const logsFiltrados = logs.filter(log => 
    log.usuarioEmail.toLowerCase().includes(busqueda.toLowerCase()) ||
    log.accion.toLowerCase().includes(busqueda.toLowerCase()) ||
    (log.detalles && log.detalles.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const formatearFecha = (fechaString) => {
    const opciones = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fechaString).toLocaleDateString('es-AR', opciones) + ' hs';
  };

  const obtenerColorAccion = (accion) => {
    if (accion.includes('COBRO') || accion.includes('PAGO')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (accion.includes('BAJA') || accion.includes('ELIMINAR')) return 'text-red-600 bg-red-50 border-red-200';
    if (accion.includes('CREAR') || accion.includes('NUEVO')) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-indigo-600 bg-indigo-50 border-indigo-200';
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 h-full flex flex-col">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-800">Registro de Auditoría</h1>
            <p className="text-gray-500 font-medium mt-1">Trazabilidad y control de acciones del sistema</p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por usuario, acción..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm"
          />
        </div>
      </div>

      {/* LISTADO DE LOGS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> Historial de Movimientos
          </h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-200 px-2 py-1 rounded-md">
            {logsFiltrados.length} Registros
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : logsFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FileText className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-medium">No se encontraron registros de auditoría.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logsFiltrados.map((log) => (
                <div key={log.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-indigo-100 transition-all gap-4 group">
                  
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-indigo-500 transition-colors"></div>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md border uppercase ${obtenerColorAccion(log.accion)}`}>
                          {log.accion.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                          <Clock className="w-3 h-3" /> {formatearFecha(log.fecha)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mt-2">{log.detalles}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1 md:min-w-[200px] pl-6 md:pl-0 border-l-2 md:border-l-0 border-gray-50">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3" /> Usuario
                    </p>
                    <p className="text-sm font-bold text-slate-700 truncate max-w-full" title={log.usuarioEmail}>
                      {log.usuarioEmail}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 mt-1">
                      Entidad: {log.entidadAfectada} #{log.entidadId}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AuditoriaPage;