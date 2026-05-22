import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, CreditCard, ShoppingBag, User, Baby } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CalendarioAlumno from './CalendarioAlumno';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ModalInscripcion from '../../components/alumno/ModalInscripcion';
import CheckoutFlotante from '../../components/alumno/CheckoutFlotante';
import CuentaTab from '../../components/alumno/CuentaTab';
import ClasesTab from '../../components/alumno/ClasesTab';
import TiendaTabPortal from '../../components/alumno/TiendaTabPortal';

const PortalAlumnoPage = ({ vista }) => {
  const queryClient = useQueryClient();
  const [perfilActivoId, setPerfilActivoId] = useState(localStorage.getItem('entidadId'));
  const [carrito, setCarrito] = useState([]);
  const [claseAInscribir, setClaseAInscribir] = useState(null);
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);

  // ── Carga de familia ───────────────────────────────────────────────────────
  const { data: perfiles = [] } = useQuery({
    queryKey: ['portal-familia', localStorage.getItem('entidadId')],
    queryFn: async () => {
      const res = await api.get('/alumnos');
      const todos = res.data;
      const yo = todos.find(a => a.id.toString() === localStorage.getItem('entidadId'));
      if (!yo) return [];
      const misHijos = todos.filter(a => a.tutor && a.tutor.id === yo.id);
      return [yo, ...misHijos];
    },
    onError: () => toast.error('Error al cargar la familia.'),
  });

  // ── Carga de datos del perfil activo ───────────────────────────────────────
  const { data: portalData, isLoading: cargando } = useQuery({
    queryKey: ['portal', perfilActivoId],
    queryFn: async () => {
      const [recibosRes, inscripcionesRes, productosRes, clasesRes] = await Promise.all([
        api.get(`/caja/recibos/alumno/${perfilActivoId}`).catch(() => ({ data: [] })),
        api.get(`/academico/inscripciones/alumno/${perfilActivoId}`).catch(() => ({ data: [] })),
        api.get('/productos').catch(() => ({ data: [] })),
        api.get('/academico/clases').catch(() => ({ data: [] })),
      ]);
      return {
        recibos: recibosRes.data.filter(r => r.estado === 'PENDIENTE'),
        historialPagos: recibosRes.data.filter(r => r.estado === 'PAGADO'),
        misClases: inscripcionesRes.data,
        productos: productosRes.data,
        todasLasClases: clasesRes.data,
      };
    },
    enabled: !!perfilActivoId,
    onError: () => toast.error('Error al cargar la información del perfil.'),
  });

  const { recibos = [], historialPagos = [], misClases = [], productos = [], todasLasClases = [] } = portalData || {};

  // ── Clases disponibles (aún no inscripto o días parciales) ─────────────────
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

  // ── Mutaciones ─────────────────────────────────────────────────────────────
  const inscripcionMutation = useMutation({
    mutationFn: () => api.post('/academico/inscripciones', null, {
      params: { alumnoId: perfilActivoId, claseId: claseAInscribir.id, diasSeleccionados: diasSeleccionados.join(',') },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', perfilActivoId] });
      toast.success('¡Inscripción exitosa!');
      setClaseAInscribir(null);
    },
    onError: (error) => {
      const msg = error.response?.data?.error || error.response?.data || 'Error al procesar la inscripción.';
      toast.error(msg, { duration: 6000 });
    },
  });

  const bajaMutation = useMutation({
    mutationFn: (inscripcionId) => api.patch(`/academico/inscripciones/${inscripcionId}/baja`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', perfilActivoId] });
      toast.success('Te has dado de baja de la clase.');
    },
    onError: () => toast.error('Error al procesar la baja.'),
  });

  const pedidoMutation = useMutation({
    mutationFn: (items) => api.post('/productos/pedido', items),
  });

  // ── Carrito ────────────────────────────────────────────────────────────────
  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.producto.id === producto.id);
      if (existe) {
        if (existe.cantidad >= producto.stock) { toast.error('No hay más stock disponible'); return prev; }
        return prev.map(p => p.producto.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p);
      }
      return [...prev, { producto, cantidad: 1 }];
    });
    toast.success('Agregado al carrito');
  };

  const quitarDelCarrito = (productoId) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.producto.id === productoId);
      if (existe.cantidad === 1) return prev.filter(p => p.producto.id !== productoId);
      return prev.map(p => p.producto.id === productoId ? { ...p, cantidad: p.cantidad - 1 } : p);
    });
  };

  // ── Totales ────────────────────────────────────────────────────────────────
  const totalDeuda = recibos.reduce((acc, r) => acc + r.montoTotal, 0);
  const totalCarrito = carrito.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  const granTotal = totalDeuda + totalCarrito;

  // ── Enviar pago por WhatsApp ───────────────────────────────────────────────
  const enviarWhatsApp = async () => {
    if (granTotal === 0) return toast.error('No hay nada para pagar.');

    if (carrito.length > 0) {
      try {
        const items = carrito.map(item => ({ productoId: item.producto.id, cantidad: item.cantidad }));
        await pedidoMutation.mutateAsync(items);
      } catch (error) {
        const msg = error.response?.data?.error || 'Error al confirmar el pedido. Verificá el stock disponible.';
        toast.error(msg, { duration: 6000 });
        return;
      }
    }

    const perfilActual = perfiles.find(p => p.id.toString() === perfilActivoId);
    const nombreRef = perfilActual ? `${perfilActual.nombre} ${perfilActual.apellido}` : '';

    let mensaje = `¡Hola Epifania! 💃%0A`;
    mensaje += `Te envío el comprobante de pago de *${nombreRef}*:%0A%0A`;

    if (recibos.length > 0) {
      mensaje += `*CUOTAS PENDIENTES:*%0A`;
      recibos.forEach(r => {
        const mes = new Date(r.fechaEmision).toLocaleString('es-ES', { month: 'long' });
        mensaje += `• Recibo #${r.id} (${mes}): $${r.montoTotal}%0A`;
      });
      mensaje += `%0A`;
    }

    if (carrito.length > 0) {
      mensaje += `*PRODUCTOS (TIENDA):*%0A`;
      carrito.forEach(item => {
        mensaje += `• ${item.cantidad}x ${item.producto.nombre}: $${(item.producto.precio * item.cantidad).toLocaleString('es-AR')}%0A`;
      });
      mensaje += `%0A`;
    }

    mensaje += `*TOTAL TRANSFERIDO: $${granTotal.toLocaleString('es-AR')}*%0A%0A`;
    mensaje += `(Adjunto la foto del comprobante 🧾)`;

    window.open(`https://wa.me/5493515073081?text=${mensaje}`, '_blank');
    setCarrito([]);
  };

  // ── Handlers de inscripción ────────────────────────────────────────────────
  const abrirModalInscripcion = (clase) => {
    setClaseAInscribir(clase);
    const dias = clase.diasDisponiblesParaInscripcion || clase.diasSemana.split(',').map(d => d.trim());
    setDiasSeleccionados(dias);
  };

  const toggleDia = (dia) => {
    setDiasSeleccionados(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);
  };

  const perfilActual = perfiles.find(p => p.id.toString() === perfilActivoId);

  // ── Vista grilla de clases ─────────────────────────────────────────────────
  if (vista === 'GRILLA') {
    return (
      <div className="max-w-6xl mx-auto pb-10">
        <CalendarioAlumno />
      </div>
    );
  }

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto pb-32 animate-in fade-in duration-500">

      {/* Selector de perfiles (tutor con hijos) */}
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

      {/* Cabecera */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          {vista === 'CUENTA' && <CreditCard className="w-8 h-8" />}
          {vista === 'CLASES' && <Calendar className="w-8 h-8" />}
          {vista === 'TIENDA' && <ShoppingBag className="w-8 h-8" />}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {vista === 'CUENTA' && 'Estado de Cuenta'}
            {vista === 'CLASES' && 'Gestión de Clases'}
            {vista === 'TIENDA' && 'Catálogo Oficial'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestionando la información de {perfilActual?.nombre}.
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      {cargando ? (
        <LoadingSpinner className="flex justify-center py-20" size="h-12 w-12" />
      ) : (
        <>
          {vista === 'CUENTA' && (
            <CuentaTab recibos={recibos} historialPagos={historialPagos} />
          )}

          {vista === 'CLASES' && (
            <ClasesTab
              misClases={misClases}
              clasesDisponibles={clasesDisponibles}
              onInscribir={abrirModalInscripcion}
              onBaja={(id) => bajaMutation.mutate(id)}
            />
          )}

          {vista === 'TIENDA' && (
            <TiendaTabPortal productos={productos} onAgregar={agregarAlCarrito} />
          )}
        </>
      )}

      {/* Checkout flotante */}
      <CheckoutFlotante
        carrito={carrito}
        totalDeuda={totalDeuda}
        totalCarrito={totalCarrito}
        granTotal={granTotal}
        nombreAlumno={perfilActual?.nombre}
        enviandoPedido={pedidoMutation.isPending}
        onQuitar={quitarDelCarrito}
        onEnviar={enviarWhatsApp}
      />

      {/* Modal de inscripción */}
      <ModalInscripcion
        clase={claseAInscribir}
        nombreAlumno={perfilActual?.nombre}
        diasSeleccionados={diasSeleccionados}
        onToggleDia={toggleDia}
        onConfirmar={() => inscripcionMutation.mutate()}
        onCerrar={() => setClaseAInscribir(null)}
      />
    </div>
  );
};

export default PortalAlumnoPage;
