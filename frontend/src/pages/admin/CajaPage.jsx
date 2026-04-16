import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Wallet, Search, CreditCard, Banknote, Receipt, CheckCircle, Smartphone } from 'lucide-react';

const CajaPage = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  
  const [reciboGenerado, setReciboGenerado] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  // Cargar lista de alumnos para el buscador
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const response = await api.get('/alumnos');
        setAlumnos(response.data);
      } catch (err) {
        console.error("Error al cargar alumnos", err);
      }
    };
    fetchAlumnos();
  }, []);

  const alumnosFiltrados = alumnos.filter(a => 
    `${a.nombre} ${a.apellido} ${a.dni}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleCobrar = async () => {
    if (!alumnoSeleccionado) {
      setError('Debes seleccionar un alumno primero.');
      return;
    }
    
    setProcesando(true);
    setError('');
    setReciboGenerado(null);

    try {
      // Llamada al endpoint que creamos en CajaController
      const response = await api.post('/caja/cobrar-cuota', null, {
        params: {
          alumnoId: alumnoSeleccionado.id,
          metodoPago: metodoPago
        }
      });
      setReciboGenerado(response.data);
      setAlumnoSeleccionado(null);
      setBusqueda('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al procesar el cobro. Verifica que el alumno tenga clases inscritas.');
    } finally {
      setProcesando(false);
    }
  };

  const metodos = [
    { id: 'EFECTIVO', icon: Banknote, label: 'Efectivo' },
    { id: 'TRANSFERENCIA', icon: Wallet, label: 'Transferencia' },
    { id: 'MERCADOPAGO', icon: Smartphone, label: 'MercadoPago' },
    { id: 'TARJETA_CREDITO', icon: CreditCard, label: 'Tarjeta (10% Recargo)' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="p-3 bg-green-50 text-green-600 rounded-xl mr-4">
          <Wallet className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Caja y Cobros</h2>
          <p className="text-gray-500 mt-1">Facturación automatizada de cuotas mensuales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA: CONTROLES DE COBRO */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">1. Seleccionar Alumno</h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar por nombre, apellido o DNI..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setAlumnoSeleccionado(null);
                }}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
              />
            </div>

            {/* Resultados de búsqueda */}
            {busqueda && !alumnoSeleccionado && (
              <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-60 overflow-y-auto">
                {alumnosFiltrados.length > 0 ? alumnosFiltrados.map(a => (
                  <div 
                    key={a.id} 
                    onClick={() => {
                      setAlumnoSeleccionado(a);
                      setBusqueda(`${a.nombre} ${a.apellido}`);
                    }}
                    className="p-4 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 flex justify-between items-center transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{a.nombre} {a.apellido}</p>
                      <p className="text-sm text-gray-500">DNI: {a.dni}</p>
                    </div>
                    {a.grupoFamiliar && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                        {a.grupoFamiliar.nombreReferencia}
                      </span>
                    )}
                  </div>
                )) : (
                  <div className="p-4 text-center text-gray-500">No se encontraron alumnos.</div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">2. Método de Pago</h3>
            <div className="grid grid-cols-2 gap-4">
              {metodos.map(m => {
                const Icon = m.icon;
                const activo = metodoPago === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMetodoPago(m.id)}
                    className={`flex items-center p-4 rounded-xl border-2 transition-all ${
                      activo 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                        : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mr-3 ${activo ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className="font-semibold">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
              {error}
            </div>
          )}

          <button 
            onClick={handleCobrar}
            disabled={!alumnoSeleccionado || procesando}
            className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xl font-bold rounded-xl shadow-sm transition-colors flex justify-center items-center"
          >
            {procesando ? 'Calculando...' : 'Generar Cobro'}
          </button>
        </div>

        {/* COLUMNA DERECHA: TICKET / RECIBO */}
        <div className="lg:col-span-5">
          {reciboGenerado ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
              
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800">¡Cobro Exitoso!</h3>
                <p className="text-gray-500 mt-2">Recibo #{reciboGenerado.id.toString().padStart(5, '0')}</p>
                <p className="text-gray-500 text-sm">{new Date(reciboGenerado.fechaEmision).toLocaleString()}</p>
              </div>

              <div className="border-t border-b border-gray-200 py-6 mb-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Alumno:</span>
                  <span className="text-gray-800 font-bold">{reciboGenerado.alumno?.nombre} {reciboGenerado.alumno?.apellido}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Método:</span>
                  <span className="text-gray-800 font-bold">{reciboGenerado.metodoPago}</span>
                </div>

                <div className="pt-4 mt-4 border-t border-dashed border-gray-200 space-y-3">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Detalle de Conceptos</p>
                  
                  {reciboGenerado.detalles.map(detalle => (
                    <div key={detalle.id} className="flex justify-between items-center text-sm">
                      <span className={`${detalle.monto < 0 ? 'text-green-600' : 'text-gray-700'}`}>
                        {detalle.tipoConcepto.replace(/_/g, ' ')}
                      </span>
                      <span className={`font-medium ${detalle.monto < 0 ? 'text-green-600' : 'text-gray-800'}`}>
                        ${Math.abs(detalle.monto).toLocaleString('es-AR')} {detalle.monto < 0 && '(-)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <span className="text-gray-500 font-bold text-lg">TOTAL PAGADO</span>
                <span className="text-3xl font-black text-indigo-600">
                  ${reciboGenerado.montoTotal.toLocaleString('es-AR')}
                </span>
              </div>
              
              <button 
                onClick={() => setReciboGenerado(null)}
                className="w-full mt-6 py-3 border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl transition-colors"
              >
                Nuevo Cobro
              </button>
            </div>
          ) : (
            <div className="h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 text-gray-400">
              <Receipt className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium text-center">El recibo detallado aparecerá aquí luego de procesar el pago.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CajaPage;