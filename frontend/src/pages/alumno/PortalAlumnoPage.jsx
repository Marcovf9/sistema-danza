import { useState, useEffect } from 'react';
import { Calendar, CreditCard, ShoppingBag, Plus, Minus, Send, AlertCircle, CheckCircle, Package, PlusCircle, Check, X, User, Baby, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PortalAlumnoPage = ({ vista }) => {
  const [perfiles, setPerfiles] = useState([]);
  const [perfilActivoId, setPerfilActivoId] = useState(localStorage.getItem('entidadId'));

  const [recibos, setRecibos] = useState([]);
  const [misClases, setMisClases] = useState([]);
  const [todasLasClases, setTodasLasClases] = useState([]);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [claseAInscribir, setClaseAInscribir] = useState(null);
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);

  useEffect(() => {
    const fetchFamilia = async () => {
      try {
        const res = await api.get('/alumnos');
        const todos = res.data;
        const yo = todos.find(a => a.id.toString() === localStorage.getItem('entidadId'));
        if (yo) {
          const misHijos = todos.filter(a => a.tutor && a.tutor.id === yo.id);
          setPerfiles([yo, ...misHijos]);
        }
      } catch (e) {
        toast.error("Error al cargar la familia.");
      }
    };
    fetchFamilia();
  }, []);

  useEffect(() => {
    if (perfilActivoId) {
      cargarDatos(perfilActivoId);
    }
  }, [perfilActivoId]);

  const cargarDatos = async (idAlumno) => {
    setCargando(true);
    try {
      const [recibosRes, inscripcionesRes, productosRes, clasesRes] = await Promise.all([
        api.get(`/caja/recibos/alumno/${idAlumno}`).catch(() => ({ data: [] })),
        api.get(`/academico/inscripciones/alumno/${idAlumno}`).catch(() => ({ data: [] })),
        api.get('/productos').catch(() => ({ data: [] })),
        api.get('/academico/clases').catch(() => ({ data: [] }))
      ]);

      setRecibos(recibosRes.data.filter(r => r.estado === 'PENDIENTE'));
      setMisClases(inscripcionesRes.data);
      setProductos(productosRes.data);
      setTodasLasClases(clasesRes.data);
    } catch (error) {
      toast.error("Error al cargar la información del perfil.");
    } finally {
      setCargando(false);
    }
  };

  const clasesDisponibles = todasLasClases.map(c => {
    const inscripcionesClase = misClases.filter(ins => ins.clase.id === c.id);
    if (inscripcionesClase.length === 0) return c;

    let diasYaInscritos = [];
    inscripcionesClase.forEach(ins => {
        const dias = (ins.diasSeleccionados || c.diasSemana).split(',').map(d => d.trim());
        diasYaInscritos = [...diasYaInscritos, ...dias];
    });

    const diasTotales = c.diasSemana.split(',').map(d => d.trim());
    const diasFaltantes = diasTotales.filter(d => !diasYaInscritos.includes(d));

    if (diasFaltantes.length > 0) return { ...c, diasDisponiblesParaInscripcion: diasFaltantes };
    return null;
  }).filter(Boolean);

  const abrirModalInscripcion = (clase) => {
    setClaseAInscribir(clase);
    const diasAMostrar = clase.diasDisponiblesParaInscripcion || clase.diasSemana.split(',').map(d => d.trim());
    setDiasSeleccionados(diasAMostrar); 
  };

  const toggleDia = (dia) => {
    setDiasSeleccionados(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);
  };

  const confirmarInscripcion = async () => {
    try {
      await api.post('/academico/inscripciones', null, {
        params: { alumnoId: perfilActivoId, claseId: claseAInscribir.id, diasSeleccionados: diasSeleccionados.join(',') }
      });
      toast.success("¡Inscripción exitosa!");
      setClaseAInscribir(null);
      cargarDatos(perfilActivoId);
    } catch (error) {
      toast.error("Error al procesar la inscripción.");
    }
  };

  const handleDarDeBaja = (inscripcionId, nombreDisciplina) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-bold text-gray-800 text-lg">¿Cancelar inscripción a {nombreDisciplina}?</p>
        <p className="text-sm text-gray-600">Dejarás de cursar esta clase. Podrás volver a anotarte más adelante si hay cupo.</p>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">Volver</button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.patch(`/academico/inscripciones/${inscripcionId}/baja`);
                toast.success("Te has dado de baja de la clase.");
                cargarDatos(perfilActivoId); // Recarga las clases de la pantalla actual
              } catch (error) {
                toast.error("Error al procesar la baja.");
              }
            }} 
            className="px-4 py-2 text-sm font-bold bg-red-500 text-white hover:bg-red-600 rounded-xl shadow-sm transition"
          >
            Darme de baja
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };


  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.producto.id === producto.id);
      if (existe) {
        if (existe.cantidad >= producto.stock) { toast.error("No hay más stock disponible"); return prev; }
        return prev.map(p => p.producto.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p);
      }
      return [...prev, { producto, cantidad: 1 }];
    });
    toast.success("Agregado al carrito");
  };

  const quitarDelCarrito = (productoId) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.producto.id === productoId);
      if (existe.cantidad === 1) return prev.filter(p => p.producto.id !== productoId);
      return prev.map(p => p.producto.id === productoId ? { ...p, cantidad: p.cantidad - 1 } : p);
    });
  };

  const totalDeuda = recibos.reduce((acc, r) => acc + r.montoTotal, 0);
  const totalCarrito = carrito.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  const granTotal = totalDeuda + totalCarrito;

  const enviarWhatsApp = () => {
    if (granTotal === 0) return toast.error("No hay nada para pagar.");
    
    const perfilActual = perfiles.find(p => p.id.toString() === perfilActivoId);
    const nombreRef = perfilActual ? `${perfilActual.nombre} ${perfilActual.apellido}` : '';

    let mensaje = `¡Hola Epifania! 💃%0A`;
    mensaje += `Te envío el comprobante de pago de *${nombreRef}*:%0A%0A`;

    if (recibos.length > 0) {
      mensaje += `*CUOTAS PENDIENTES:*%0A`;
      recibos.forEach(r => {
        const fecha = new Date(r.fechaEmision);
        const mes = fecha.toLocaleString('es-ES', { month: 'long' });
        mensaje += `• Recibo #${r.id} (${mes}): $${r.montoTotal}%0A`;
      });
      mensaje += `%0A`;
    }

    if (carrito.length > 0) {
      mensaje += `*PRODUCTOS (TIENDA):*%0A`;
      carrito.forEach(item => {
        mensaje += `• ${item.cantidad}x ${item.producto.nombre}: $${item.producto.precio * item.cantidad}%0A`;
      });
      mensaje += `%0A`;
    }

    mensaje += `*TOTAL TRANSFERIDO: $${granTotal}*%0A%0A`;
    mensaje += `(Adjunto la foto del comprobante 🧾)`;

    const numeroEpifania = "5493510000000"; 
    window.open(`https://wa.me/${numeroEpifania}?text=${mensaje}`, '_blank');
    setCarrito([]); 
  };

  return (
    <div className="max-w-6xl mx-auto pb-32 animate-in fade-in duration-500">
      
      {/* SELECTOR DE PERFILES (Aparece solo si tiene hijos a cargo) */}
      {perfiles.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide">
          {perfiles.map(p => (
            <button 
              key={p.id}
              onClick={() => setPerfilActivoId(p.id.toString())}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap shadow-sm border ${
                perfilActivoId === p.id.toString() 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p.esMenor ? <Baby className="w-5 h-5" /> : <User className="w-5 h-5" />}
              {p.nombre} {p.apellido}
            </button>
          ))}
        </div>
      )}

      {/* CABECERA DINÁMICA */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          {vista === 'CUENTA' && <CreditCard className="w-8 h-8" />}
          {vista === 'CLASES' && <Calendar className="w-8 h-8" />}
          {vista === 'TIENDA' && <ShoppingBag className="w-8 h-8" />}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {vista === 'CUENTA' && 'Estado de Cuenta'}
            {vista === 'CLASES' && 'Clases Inscritas'}
            {vista === 'TIENDA' && 'Catálogo Oficial'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestionando la información de {perfiles.find(p => p.id.toString() === perfilActivoId)?.nombre}.
          </p>
        </div>
      </div>

      {cargando ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      ) : (
        <>
          {vista === 'CUENTA' && (
            <div className="space-y-4">
              {recibos.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm flex flex-col items-center">
                  <CheckCircle className="w-16 h-16 text-emerald-400 mb-4" />
                  <p className="font-bold text-xl text-gray-800">¡Al día!</p>
                  <p className="text-gray-500 mt-2">No hay cuotas pendientes para este perfil.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recibos.map(recibo => {
                    const mesString = new Date(recibo.fechaEmision).toLocaleString('es-ES', { month: 'long' });
                    return (
                      <div key={recibo.id} className="bg-white p-6 rounded-2xl border-l-4 border-l-red-500 shadow-sm flex flex-col justify-between">
                        <div className="mb-4">
                          <p className="font-bold text-gray-800 text-lg capitalize">Cuota {mesString}</p>
                          <p className="text-sm text-gray-500 font-medium">Recibo #{recibo.id}</p>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-1 rounded-md">Pendiente</span>
                          <span className="text-2xl font-black text-gray-800">${recibo.montoTotal.toLocaleString('es-AR')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {vista === 'CLASES' && (
            <div className="space-y-10">
              <div>
                <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center"><Check className="w-5 h-5 mr-2 text-emerald-500"/> Clases Actuales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {misClases.length === 0 ? (
                    <div className="col-span-full bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">Sin inscripciones activas.</div>
                  ) : (
                    misClases.map(ins => (
                      <div key={ins.id} className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-2 h-full bg-emerald-400"></div>
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">
                          {ins.clase.horaInicio.slice(0, 5)}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-lg leading-tight">{ins.clase.disciplina.nombre}</p>
                          <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-wider">{ins.diasSeleccionados ? ins.diasSeleccionados : ins.clase.diasSemana}</p>
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

              <div>
                <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center"><PlusCircle className="w-5 h-5 mr-2 text-indigo-500"/> Anotar a Nuevas Clases</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clasesDisponibles.length === 0 ? (
                    <div className="col-span-full bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-500">Ya cursa todas las clases disponibles.</div>
                  ) : (
                    clasesDisponibles.map(clase => (
                      <div key={clase.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-indigo-300 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-bold text-gray-800 text-lg leading-tight">{clase.disciplina.nombre}</p>
                            <p className="text-xs font-bold text-indigo-500 mt-1 uppercase tracking-wider">
                              {(clase.diasDisponiblesParaInscripcion || clase.diasSemana.split(',')).join(', ')} • {clase.horaInicio.slice(0,5)}hs
                            </p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded-lg"><Calendar className="w-5 h-5 text-gray-400" /></div>
                        </div>
                        <button onClick={() => abrirModalInscripcion(clase)} className="w-full py-2.5 bg-gray-900 hover:bg-indigo-600 text-white font-bold rounded-xl text-sm transition-colors shadow-sm">Inscribir</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {vista === 'TIENDA' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productos.length === 0 ? (
                <div className="col-span-full bg-white p-12 rounded-3xl border border-gray-100 text-center text-gray-500">No hay productos.</div>
              ) : (
                productos.map(prod => (
                  <div key={prod.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                      {prod.imagenes && prod.imagenes.length > 0 ? <img src={prod.imagenes[0].datosImagen} className="w-full h-full object-cover" /> : <Package className="w-12 h-12 text-gray-300" />}
                    </div>
                    <p className="text-lg font-bold text-gray-800 leading-tight mb-1">{prod.nombre}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{prod.categoria}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-black text-2xl text-emerald-600">${prod.precio}</span>
                      <button onClick={() => agregarAlCarrito(prod)} disabled={prod.stock === 0} className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:bg-gray-300 active:scale-95 shadow-sm"><Plus className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* CHECKOUT FLOTANTE */}
      {granTotal > 0 && (
        <div className="fixed bottom-0 left-0 lg:left-72 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 transition-all">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="w-full lg:w-1/2">
              {carrito.length > 0 && (
                <div className="max-h-24 overflow-y-auto space-y-2 pr-2">
                  {carrito.map(item => (
                    <div key={item.producto.id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-600 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">x{item.cantidad}</span>
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{item.producto.nombre}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-800">${item.producto.precio * item.cantidad}</span>
                        <button onClick={() => quitarDelCarrito(item.producto.id)} className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded-md transition-colors"><Minus className="w-4 h-4"/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {carrito.length === 0 && totalDeuda > 0 && <p className="text-sm text-gray-500 font-medium">Estás a punto de abonar cuotas pendientes de {perfiles.find(p => p.id.toString() === perfilActivoId)?.nombre}.</p>}
            </div>

            <div className="w-full lg:w-1/2 flex flex-col sm:flex-row items-center justify-end gap-6">
              <div className="text-center sm:text-right w-full sm:w-auto">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                <p className="text-3xl font-black text-gray-800">${granTotal.toLocaleString('es-AR')}</p>
                <div className="flex justify-center sm:justify-end gap-2 mt-1">
                  {totalDeuda > 0 && <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded">Cuotas: ${totalDeuda}</span>}
                  {totalCarrito > 0 && <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded">Tienda: ${totalCarrito}</span>}
                </div>
              </div>
              <button onClick={enviarWhatsApp} className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-xl shadow-lg flex justify-center items-center gap-2 active:scale-95"><Send className="w-5 h-5" /> Informar Pago</button>
            </div>
          </div>
        </div>
      )}

      {claseAInscribir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <div><h3 className="text-xl font-bold">Inscripción</h3><p className="text-indigo-200 text-sm mt-1">{claseAInscribir.disciplina.nombre}</p></div>
              <button onClick={() => setClaseAInscribir(null)} className="p-2 hover:bg-white/20 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 font-medium text-sm">Selecciona los días para inscribir a {perfiles.find(p => p.id.toString() === perfilActivoId)?.nombre}:</p>
              <div className="flex flex-wrap gap-3">
                {(claseAInscribir.diasDisponiblesParaInscripcion || claseAInscribir.diasSemana.split(',')).map(dia => {
                  const d = dia.trim();
                  return (
                    <button key={d} onClick={() => toggleDia(d)} className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${diasSeleccionados.includes(d) ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}>{d}</button>
                  );
                })}
              </div>
              <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6">
                <button onClick={() => setClaseAInscribir(null)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancelar</button>
                <button onClick={confirmarInscripcion} disabled={diasSeleccionados.length === 0} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:bg-gray-300">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalAlumnoPage;