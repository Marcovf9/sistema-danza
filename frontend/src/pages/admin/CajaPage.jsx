import { useState, useEffect } from 'react';
import { DollarSign, Search, Receipt, Download, Bot, CheckCircle, AlertCircle, CreditCard, Clock, TrendingUp, TrendingDown, PlusCircle, Calendar as CalendarIcon, MessageCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CajaPage = () => {
  const [tabActiva, setTabActiva] = useState('INGRESOS');

  const [pendientes, setPendientes] = useState([]);
  const [cargandoPendientes, setCargandoPendientes] = useState(true);
  const [reciboSeleccionado, setReciboSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [procesando, setProcesando] = useState(false);
  const [reciboPagado, setReciboPagado] = useState(null);
  const [filtroTexto, setFiltroTexto] = useState('');

  const [egresos, setEgresos] = useState([]);
  const [cargandoEgresos, setCargandoEgresos] = useState(true);
  const [guardandoEgreso, setGuardandoEgreso] = useState(false);
  const [formEgreso, setFormEgreso] = useState({ concepto: '', monto: '', observaciones: '' });

  const diaActual = new Date().getDate();
  const esEpocaDeMora = diaActual > 10;

  useEffect(() => {
    cargarPendientes();
    cargarEgresos();
  }, []);

  const cargarPendientes = async () => {
    setCargandoPendientes(true);
    try {
      const response = await api.get('/caja/pendientes');
      setPendientes(response.data);
    } catch (error) {
      toast.error("Error al cargar los recibos pendientes.");
    } finally {
      setCargandoPendientes(false);
    }
  };

  const cargarEgresos = async () => {
    setCargandoEgresos(true);
    try {
      const response = await api.get('/caja/egresos');
      setEgresos(response.data);
    } catch (error) {
      toast.error("Error al cargar el historial de gastos.");
    } finally {
      setCargandoEgresos(false);
    }
  };

  const dispararRobot = () => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-indigo-500" />
          <p className="font-bold text-gray-800 text-lg">¿Simular Facturación?</p>
        </div>
        <p className="text-sm text-gray-600">Generará deudas para todos los alumnos activos. ¿Continuar?</p>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">Cancelar</button>
          <button onClick={async () => {
              toast.dismiss(t.id);
              setCargandoPendientes(true);
              try {
                await api.post('/caja/disparar-robot-facturacion');
                await cargarPendientes(); 
                toast.success("¡Robot ejecutado! Revisa la lista.");
              } catch (error) {
                toast.error("Hubo un error al ejecutar el robot.");
                setCargandoPendientes(false);
              }
            }} className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-sm transition">
            Sí, simular mes
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center', style: { minWidth: '350px' } });
  };

  const confirmarPago = async () => {
    if (!reciboSeleccionado) return;
    setProcesando(true);
    try {
      const response = await api.post(`/caja/cobrar-recibo?reciboId=${reciboSeleccionado.id}&metodoPago=${metodoPago}`);
      setReciboPagado(response.data);
      setReciboSeleccionado(null);
      cargarPendientes();
      toast.success("¡Pago registrado exitosamente!");
    } catch (error) {
      toast.error(error.response?.data || "Error al procesar el pago.");
    } finally {
      setProcesando(false);
    }
  };

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
      toast.error("No se pudo descargar el comprobante.");
    }
  };

  const handleGuardarEgreso = async (e) => {
    e.preventDefault();
    if (!formEgreso.concepto || !formEgreso.monto) {
      return toast.error("Concepto y monto son obligatorios");
    }
    
    setGuardandoEgreso(true);
    try {
      await api.post('/caja/egresos', {
        concepto: formEgreso.concepto,
        monto: parseFloat(formEgreso.monto),
        observaciones: formEgreso.observaciones
      });
      toast.success("¡Gasto registrado con éxito!");
      setFormEgreso({ concepto: '', monto: '', observaciones: '' });
      cargarEgresos();
    } catch (error) {
      toast.error("Error al registrar el gasto.");
    } finally {
      setGuardandoEgreso(false);
    }
  };

  const enviarWhatsApp = (e, recibo) => {
    e.stopPropagation();
    const telefono = recibo.alumno?.telefono;
    
    if (!telefono) {
      toast.error("El alumno no tiene un teléfono registrado.");
      return;
    }

    let numStr = telefono.replace(/\D/g, '');
    if (!numStr.startsWith('54')) {
      numStr = '549' + numStr; 
    }

    const mensaje = `Hola ${recibo.alumno.nombre}, te escribimos de Epifania Dance 💃. Te recordamos que tienes pendiente el pago del recibo #${recibo.id} por $${recibo.montoTotal.toLocaleString('es-AR')}. ¡Avísanos cualquier duda o cuando realices el pago! Saludos.`;
    
    const url = `https://wa.me/${numStr}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const pendientesFiltrados = pendientes.filter(r => 
    r.alumno?.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) || 
    r.alumno?.apellido.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* CABECERA */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            Caja y Tesorería <DollarSign className="ml-3 w-8 h-8 text-emerald-500" />
          </h2>
          <p className="text-gray-500 mt-1">Gestión de ingresos por cuotas y registro de gastos de la academia.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setTabActiva('INGRESOS')} 
            className={`flex-1 md:px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${tabActiva === 'INGRESOS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <TrendingUp className="w-4 h-4 mr-2" /> Ingresos
          </button>
          <button 
            onClick={() => setTabActiva('EGRESOS')} 
            className={`flex-1 md:px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${tabActiva === 'EGRESOS' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <TrendingDown className="w-4 h-4 mr-2" /> Gastos
          </button>
        </div>
      </div>

      {tabActiva === 'INGRESOS' && (
        <>
          <div className="flex justify-between items-center">
            {/* ALERTA DE MOROSIDAD AUTOMÁTICA */}
            {esEpocaDeMora && pendientes.length > 0 ? (
              <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-sm animate-in fade-in">
                <AlertCircle className="w-5 h-5" /> 
                Estamos a día {diaActual}. Hay {pendientes.length} cuotas vencidas.
              </div>
            ) : (
              <div></div>
            )}

            <button onClick={dispararRobot} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold hover:bg-indigo-100 transition border border-indigo-200">
              <Bot className="w-5 h-5" /> Simular Facturación Mensual
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
            {/* LISTA DE DEUDORES */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" /> Recibos Pendientes ({pendientes.length})
                </h3>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" placeholder="Buscar alumno..." value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {cargandoPendientes ? (
                  <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
                ) : pendientesFiltrados.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <CheckCircle className="w-12 h-12 mb-2 text-emerald-200" /><p>No hay cuentas pendientes.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendientesFiltrados.map((recibo) => (
                      <div key={recibo.id} onClick={() => { setReciboSeleccionado(recibo); setReciboPagado(null); }} className={`p-4 rounded-xl border cursor-pointer transition flex justify-between items-center group ${reciboSeleccionado?.id === recibo.id ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm'}`}>
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
                        <div className="flex items-center gap-4">
                          {/* BOTÓN MÁGICO DE WHATSAPP */}
                          {esEpocaDeMora && (
                            <button 
                              onClick={(e) => enviarWhatsApp(e, recibo)}
                              className="p-2 text-green-600 bg-green-50 hover:bg-green-500 hover:text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                              title="Enviar recordatorio por WhatsApp"
                            >
                              <MessageCircle className="w-5 h-5" />
                            </button>
                          )}

                          <div className="text-right">
                            <p className="font-black text-lg text-gray-800">${recibo.montoTotal.toLocaleString('es-AR')}</p>
                            <p className="text-xs font-bold text-red-500">PENDIENTE</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* TERMINAL DE COBRO */}
            <div className="bg-gray-800 text-white rounded-2xl shadow-xl flex flex-col relative overflow-hidden">
              <div className="absolute -right-10 -top-10 text-white/5"><Receipt className="w-48 h-48" /></div>
              <div className="p-6 relative z-10 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-6 border-b border-gray-700 pb-4">Terminal de Cobro</h3>

                {!reciboSeleccionado && !reciboPagado ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60">
                    <Receipt className="w-16 h-16 mb-4" />
                    <p className="text-center text-sm">Selecciona un recibo<br/>pendiente para cobrar.</p>
                  </div>
                ) : reciboPagado ? (
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
                    <button onClick={() => descargarPdf(reciboPagado.id)} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" /> Imprimir PDF
                    </button>
                    <button onClick={() => setReciboPagado(null)} className="text-sm text-gray-400 hover:text-white transition">← Volver</button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between animate-in slide-in-from-right-4 duration-200">
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm text-gray-400 uppercase tracking-wider">Cobrando a</p>
                        <p className="text-xl font-bold text-white">{reciboSeleccionado.alumno?.nombre} {reciboSeleccionado.alumno?.apellido}</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                        <p className="text-sm text-gray-400 flex justify-between mb-2"><span>Subtotal Base</span><span>${reciboSeleccionado.montoTotal.toLocaleString('es-AR')}</span></p>
                        <div className="border-t border-gray-600 pt-3">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Método de Pago</p>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer">
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
                    <button onClick={confirmarPago} disabled={procesando} className={`w-full py-4 mt-6 rounded-xl font-black text-lg transition flex items-center justify-center shadow-lg ${procesando ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}>
                      {procesando ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : 'CONFIRMAR COBRO'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {tabActiva === 'EGRESOS' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">

           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-fit">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-4">
              <PlusCircle className="w-5 h-5 mr-2 text-indigo-600" /> Registrar Salida
            </h3>
            
            <form onSubmit={handleGuardarEgreso} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Concepto / Motivo *</label>
                <input 
                  type="text" required placeholder="Ej: Luz, Alquiler, Artículos limpieza..."
                  value={formEgreso.concepto} onChange={e => setFormEgreso({...formEgreso, concepto: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Monto ($) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="number" required placeholder="0.00" min="0" step="0.01"
                    value={formEgreso.monto} onChange={e => setFormEgreso({...formEgreso, monto: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Observaciones <span className="font-normal text-gray-400">(Opcional)</span></label>
                <textarea 
                  rows="3" placeholder="Nro de factura, detalles del pago..."
                  value={formEgreso.observaciones} onChange={e => setFormEgreso({...formEgreso, observaciones: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <button 
                type="submit" disabled={guardandoEgreso}
                className="w-full flex justify-center items-center py-3.5 mt-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                {guardandoEgreso ? 'Guardando...' : 'Guardar Gasto'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-500" /> Historial de Egresos
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cargandoEgresos ? (
                <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div></div>
              ) : egresos.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Receipt className="w-12 h-12 mb-2 text-gray-300" />
                  <p>No se han registrado gastos aún.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {egresos.map((egreso) => (
                    <div key={egreso.id} className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                          <TrendingDown className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{egreso.concepto}</p>
                          <div className="text-xs text-gray-500 flex items-center gap-3 mt-0.5">
                            <span className="flex items-center"><CalendarIcon className="w-3 h-3 mr-1" /> {new Date(egreso.fecha).toLocaleDateString()}</span>
                            <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(egreso.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          {egreso.observaciones && <p className="text-xs text-gray-400 mt-1 italic">"{egreso.observaciones}"</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg text-red-600">-${egreso.monto.toLocaleString('es-AR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CajaPage;