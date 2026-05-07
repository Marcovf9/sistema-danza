import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, GraduationCap, ClipboardCheck, Calendar, LogOut, BookOpen, Lock, ShieldCheck, ShoppingBag, CreditCard, Check, X, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const LayoutPrincipal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rolActual = localStorage.getItem('rol');
  const emailUsuario = localStorage.getItem('email');
  
  const [forzarCambio, setForzarCambio] = useState(localStorage.getItem('requiereCambio') === 'true');
  const [nuevaClave, setNuevaClave] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [cambiando, setCambiando] = useState(false);

  const validaciones = {
    longitud: nuevaClave.length >= 8,
    mayuscula: /[A-Z]/.test(nuevaClave),
    letrasYNumeros: /[a-zA-Z]/.test(nuevaClave) && /\d/.test(nuevaClave),
    coinciden: nuevaClave === confirmarClave && nuevaClave.length > 0
  };

  const esValido = Object.values(validaciones).every(Boolean);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleCambiarClave = async (e) => {
    e.preventDefault();
    if (!esValido) return toast.error("La contraseña no cumple con los requisitos.");
    
    setCambiando(true);
    try {
      await api.post('/auth/cambiar-password', { email: emailUsuario, nuevaPassword: nuevaClave });
      localStorage.setItem('requiereCambio', 'false');
      setForzarCambio(false);
      toast.success("¡Contraseña actualizada con éxito!");
    } catch (error) {
      toast.error("Error al actualizar la contraseña");
    } finally {
      setCambiando(false);
    }
  };

  const menuItems = [
    { path: '/dashboard', label: 'Panel General', icon: LayoutDashboard, roles: ['DIRECTOR'] },
    { path: '/alumnos', label: 'Alumnos', icon: Users, roles: ['DIRECTOR'] },
    { path: '/caja', label: 'Caja y Cobros', icon: Wallet, roles: ['DIRECTOR'] },
    { path: '/profesores', label: 'Profesores', icon: GraduationCap, roles: ['DIRECTOR'] },
    { path: '/clases', label: 'Gestión de Clases', icon: Calendar, roles: ['DIRECTOR'] },
    { path: '/auditoria', label: 'Auditoría (Logs)', icon: ShieldCheck, roles: ['DIRECTOR'] },
    
    { path: '/profesor/agenda', label: 'Mi Agenda', icon: BookOpen, roles: ['PROFESOR'] },
    { path: '/calendario', label: 'Grilla Horaria', icon: Calendar, roles: ['DIRECTOR', 'PROFESOR'] },
    { path: '/asistencia', label: 'Asistencia', icon: ClipboardCheck, roles: ['DIRECTOR', 'PROFESOR'] },

    { path: '/alumno/cuenta', label: 'Estado de Cuenta', icon: CreditCard, roles: ['ALUMNO'] },
    { path: '/alumno/clases', label: 'Mis Clases', icon: Calendar, roles: ['ALUMNO'] },
    { path: '/alumno/tienda', label: 'Catálogo / Tienda', icon: ShoppingBag, roles: ['ALUMNO'] },
  ];

  const itemsPermitidos = menuItems.filter(item => item.roles.includes(rolActual));

  return (
    <>
      {/* MODAL OBLIGATORIO DE CAMBIO DE CLAVE CON VALIDACIONES */}
      {forzarCambio && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-center text-gray-800 mb-2">Cambio de Contraseña</h2>
            <p className="text-center text-gray-500 text-sm mb-6">Por tu seguridad, debes establecer una nueva contraseña privada para continuar.</p>
            
            <form onSubmit={handleCambiarClave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="password" 
                    value={nuevaClave} 
                    onChange={(e)=>setNuevaClave(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    placeholder="Escribe tu nueva contraseña" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="password" 
                    value={confirmarClave} 
                    onChange={(e)=>setConfirmarClave(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    placeholder="Repite la contraseña" 
                  />
                </div>
              </div>

              {/* REGLAS VISUALES EN TIEMPO REAL */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-3">Requisitos obligatorios:</p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {validaciones.longitud ? <Check className="w-4 h-4 text-emerald-500"/> : <X className="w-4 h-4 text-gray-300"/>}
                  <span className={validaciones.longitud ? 'text-emerald-700' : 'text-gray-500'}>Mínimo 8 caracteres</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {validaciones.mayuscula ? <Check className="w-4 h-4 text-emerald-500"/> : <X className="w-4 h-4 text-gray-300"/>}
                  <span className={validaciones.mayuscula ? 'text-emerald-700' : 'text-gray-500'}>Al menos una letra MAYÚSCULA</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {validaciones.letrasYNumeros ? <Check className="w-4 h-4 text-emerald-500"/> : <X className="w-4 h-4 text-gray-300"/>}
                  <span className={validaciones.letrasYNumeros ? 'text-emerald-700' : 'text-gray-500'}>Combinar números y letras</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {validaciones.coinciden ? <Check className="w-4 h-4 text-emerald-500"/> : <X className="w-4 h-4 text-gray-300"/>}
                  <span className={validaciones.coinciden ? 'text-emerald-700' : 'text-gray-500'}>Las contraseñas coinciden</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!esValido || cambiando} 
                className="w-full py-3.5 mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                {cambiando ? 'Actualizando...' : 'Guardar y Continuar'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
        <aside className="w-72 bg-white shadow-xl flex flex-col z-10">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">Epifania</h1>
            <p className="text-sm text-gray-500 mt-1">
                {rolActual === 'DIRECTOR' ? 'Panel de Dirección' : rolActual === 'ALUMNO' ? 'Portal del Alumno' : 'Portal Docente'}
            </p>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {itemsPermitidos.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon; 
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3.5 rounded-xl text-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-lg font-medium">
              <LogOut className="w-5 h-5 mr-2" /> Cerrar Sesión
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default LayoutPrincipal;