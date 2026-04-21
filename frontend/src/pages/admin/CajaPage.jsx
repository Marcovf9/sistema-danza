import { useState, useEffect } from 'react';
import { DollarSign, Search, Receipt, Download, Bot, CheckCircle, AlertCircle, CreditCard, Clock } from 'lucide-react';
import api from '../../services/api';

const CajaPage = () => {
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para el Panel de Cobro (Caja)
  const [reciboSeleccionado, setReciboSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [procesando, setProcesando] = useState(false);
  const [reciboPagado, setReciboPagado] = useState(null); // Guarda el resultado exitoso
  const [filtroTexto, setFiltroTexto] = useState('');

  // 1. Cargar la lista de deudores al entrar
  const cargarPendientes = async () => {
    setCargando(true);
    try {
      const response = await api.get('/caja/pendientes');
      setPendientes(response.data);
    } catch (error) {
      console.error("Error al cargar pendientes:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPendientes();
  }, []);

  // 2. El Botón de Dios (Simular el día 1 del mes)
  const dispararRobot = async () => {
    if (!window.confirm("¿Seguro que quieres simular la facturación automática? Esto generará recibos para todos los alumnos activos.")) return;
    
    setCargando(true);
    try {
      await api.post('/caja/disparar-robot-facturacion');
      await cargarPendientes(); // Recargar la lista para ver los nuevos recibos
      alert("¡Robot ejecutado! Revisa la lista de pendientes.");
    } catch (error) {
      console.error("Error al disparar el robot:", error);
      alert("Hubo un error al ejecutar el robot.");
      setCargando(false);
    }
  };

  // 3. Procesar el Pago
  const confirmarPago = async () => {
    if (!reciboSeleccionado) return;
    setProcesando(true);
    try {
      // Llamamos al nuevo endpoint de cobro
      const response = await api.post(`/caja/cobrar-recibo?reciboId=${reciboSeleccionado.id}&metodoPago=${metodoPago}`);
      setReciboPagado(response.data); // Guardamos el recibo verde
      setReciboSeleccionado(null); // Limpiamos la selección
      cargarPendientes(); // Actualizamos la lista roja
    } catch (error) {
      console.error("Error al cobrar:", error);
      alert("Error al procesar el pago.");
    } finally {
      setProcesando(false);
    }
  };

  // 4. Descargar el PDF
  const descargarPdf = async (id) => {
    try {
      const response = await api.get(`/caja/recibos/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Recibo_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar PDF", error);
      alert("No se pudo descargar el comprobante.");
    }
  };

  // Filtrado de búsqueda
  const pendientesFiltrados = pendientes.filter(r => 
    r.alumno?.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) || 
    r.alumno?.apellido.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* CABECERA Y ROBOT */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            Caja y Cobros <DollarSign className="ml-3 w-8 h-8 text-emerald-500" />
          </h2>
          <p className="text-gray-500 mt-1">Gestión de cuentas corrientes y facturación.</p>
        </div>
        
        {/* BOTÓN DEL ROBOT (Simulador) */}
        <button 
          onClick={dispararRobot}
          className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold hover:bg-indigo-100 transition border border-indigo-200"
        >
          <Bot className="w-5 h-5" />
          Simular Facturación Mensual
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        
        {/* COLUMNA IZQUIERDA: LISTA DE DEUDORES */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" /> 
              Recibos Pendientes ({pendientes.length})
            </h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar alumno..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cargando ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : pendientesFiltrados.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <CheckCircle className="w-12 h-12 mb-2 text-emerald-200" />
                <p>No hay cuentas pendientes.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendientesFiltrados.map((recibo) => (
                  <div 
                    key={recibo.id} 
                    onClick={() => { setReciboSeleccionado(recibo); setReciboPagado(null); }}
                    className={`p-4 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                      reciboSeleccionado?.id === recibo.id 
                        ? 'bg-emerald-50 border-emerald-500 shadow-md' 
                        : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold">
                        {recibo.alumno?.nombre.charAt(0)}{recibo.alumno?.apellido.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{recibo.alumno?.nombre} {recibo.alumno?.apellido}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Emitido: {new Date(recibo.fechaEmision).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-gray-800">${recibo.montoTotal.toLocaleString('es-AR')}</p>
                      <p className="text-xs font-bold text-red-500">PENDIENTE</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: PANEL DE COBRO (CHECKOUT) */}
        <div className="bg-gray-800 text-white rounded-2xl shadow-xl flex flex-col relative overflow-hidden">
          
          {/* Fondo decorativo */}
          <div className="absolute -right-10 -top-10 text-white/5">
            <Receipt className="w-48 h-48" />
          </div>

          <div className="p-6 relative z-10 flex-1 flex flex-col">
            <h3 className="text-xl font-bold mb-6 border-b border-gray-700 pb-4">Terminal de Cobro</h3>

            {!reciboSeleccionado && !reciboPagado ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60">
                <Receipt className="w-16 h-16 mb-4" />
                <p className="text-center text-sm">Selecciona un recibo<br/>pendiente de la lista para cobrar.</p>
              </div>
            ) : reciboPagado ? (
              // ESTADO DE ÉXITO LUEGO DE COBRAR
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-white">¡Pago Registrado!</h4>
                  <p className="text-emerald-400 mt-1 text-sm">Recibo #{reciboPagado.id.toString().padStart(5, '0')}</p>
                </div>
                
                <div className="bg-gray-700/50 rounded-xl p-4 w-full text-center border border-gray-600">
                  <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Total Cobrado</p>
                  <p className="text-3xl font-black text-white">${reciboPagado.montoTotal.toLocaleString('es-AR')}</p>
                </div>

                <button 
                  onClick={() => descargarPdf(reciboPagado.id)}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Imprimir Comprobante PDF
                </button>
                <button 
                  onClick={() => setReciboPagado(null)}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  ← Volver a pendientes
                </button>
              </div>
            ) : (
              // PANEL DE CHECKOUT ACTIVO
              <div className="flex-1 flex flex-col justify-between animate-in slide-in-from-right-4 duration-200">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">Cobrando a</p>
                    <p className="text-xl font-bold text-white">{reciboSeleccionado.alumno?.nombre} {reciboSeleccionado.alumno?.apellido}</p>
                  </div>

                  <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                    <p className="text-sm text-gray-400 flex justify-between mb-2">
                      <span>Subtotal Base</span>
                      <span>${reciboSeleccionado.montoTotal.toLocaleString('es-AR')}</span>
                    </p>
                    <p className="text-xs text-gray-500 italic mb-4">* Recargos por mora o tarjeta se aplicarán al confirmar.</p>
                    <div className="border-t border-gray-600 pt-3">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Método de Pago</p>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select 
                          className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer font-medium"
                          value={metodoPago}
                          onChange={(e) => setMetodoPago(e.target.value)}
                        >
                          <option value="EFECTIVO">Efectivo</option>
                          <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                          <option value="MERCADOPAGO">MercadoPago</option>
                          <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                          <option value="TARJETA_CREDITO">Tarjeta de Crédito (+10%)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={confirmarPago}
                  disabled={procesando}
                  className={`w-full py-4 mt-6 rounded-xl font-black text-lg transition flex items-center justify-center shadow-lg ${
                    procesando 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  }`}
                >
                  {procesando ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    'CONFIRMAR COBRO'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CajaPage;