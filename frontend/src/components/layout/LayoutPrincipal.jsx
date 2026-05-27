import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wallet, GraduationCap, ClipboardCheck,
  Calendar, LogOut, BookOpen, Lock, ShieldCheck, ShoppingBag,
  CreditCard, Check, X, ShieldAlert, CalendarDays, Menu,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const LOGO_URL = 'https://res.cloudinary.com/dhmij90ur/image/upload/v1779843641/logoepifania_c8mqu5.jpg';

const LayoutPrincipal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rolActual = localStorage.getItem('rol');
  const emailUsuario = localStorage.getItem('email');

  const [sidebarAbierta, setSidebarAbierta] = useState(false);
  const [forzarCambio, setForzarCambio] = useState(localStorage.getItem('requiereCambio') === 'true');
  const [nuevaClave, setNuevaClave] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [cambiando, setCambiando] = useState(false);

  const validaciones = {
    longitud:       nuevaClave.length >= 8,
    mayuscula:      /[A-Z]/.test(nuevaClave),
    letrasYNumeros: /[a-zA-Z]/.test(nuevaClave) && /\d/.test(nuevaClave),
    coinciden:      nuevaClave === confirmarClave && nuevaClave.length > 0,
  };
  const esValido = Object.values(validaciones).every(Boolean);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const handleCambiarClave = async (e) => {
    e.preventDefault();
    if (!esValido) return toast.error('La contraseña no cumple con los requisitos.');
    setCambiando(true);
    try {
      await api.post('/auth/cambiar-password', { email: emailUsuario, nuevaPassword: nuevaClave });
      localStorage.setItem('requiereCambio', 'false');
      setForzarCambio(false);
      toast.success('¡Contraseña actualizada con éxito!');
    } catch {
      toast.error('Error al actualizar la contraseña');
    } finally {
      setCambiando(false);
    }
  };

  const menuItems = [
    { path: '/dashboard',       label: 'Panel General',  icon: LayoutDashboard, roles: ['DIRECTOR'] },
    { path: '/alumnos',         label: 'Alumnos',        icon: Users,           roles: ['DIRECTOR'] },
    { path: '/caja',            label: 'Caja y Cobros',  icon: Wallet,          roles: ['DIRECTOR'] },
    { path: '/profesores',      label: 'Profesores',     icon: GraduationCap,   roles: ['DIRECTOR'] },
    { path: '/clases',          label: 'Clases',         icon: Calendar,        roles: ['DIRECTOR'] },
    { path: '/auditoria',       label: 'Auditoría',      icon: ShieldCheck,     roles: ['DIRECTOR'] },

    { path: '/profesor/agenda', label: 'Mi Agenda',      icon: BookOpen,        roles: ['PROFESOR'] },
    { path: '/calendario',      label: 'Grilla Horaria', icon: Calendar,        roles: ['DIRECTOR', 'PROFESOR'] },
    { path: '/asistencia',      label: 'Asistencia',     icon: ClipboardCheck,  roles: ['DIRECTOR', 'PROFESOR'] },

    { path: '/alumno/cuenta',   label: 'Mi Cuenta',      icon: CreditCard,      roles: ['ALUMNO'] },
    { path: '/alumno/clases',   label: 'Mis Clases',     icon: CalendarDays,    roles: ['ALUMNO'] },
    { path: '/alumno/grilla',   label: 'Grilla Horaria', icon: Calendar,        roles: ['ALUMNO'] },
    { path: '/alumno/tienda',   label: 'Tienda',         icon: ShoppingBag,     roles: ['ALUMNO'] },
  ];

  const itemsPermitidos = menuItems.filter(item => item.roles.includes(rolActual));

  const rolLabel = {
    DIRECTOR: 'Panel de Dirección',
    ALUMNO:   'Portal del Alumno',
    PROFESOR: 'Portal Docente',
  }[rolActual] || '';

  const cerrarSidebar = () => setSidebarAbierta(false);

  return (
    <>
      {/* ── Modal obligatorio de cambio de contraseña ─────────────────────── */}
      {forzarCambio && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-center text-gray-800 mb-2">Cambio de Contraseña</h2>
            <p className="text-center text-gray-500 text-sm mb-6">Por tu seguridad, debés establecer una nueva contraseña privada para continuar.</p>
            <form onSubmit={handleCambiarClave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="password" value={nuevaClave} onChange={e => setNuevaClave(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                    placeholder="Escribe tu nueva contraseña" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="password" value={confirmarClave} onChange={e => setConfirmarClave(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                    placeholder="Repite la contraseña" />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase mb-3">Requisitos:</p>
                {[
                  [validaciones.longitud,       'Mínimo 8 caracteres'],
                  [validaciones.mayuscula,      'Al menos una MAYÚSCULA'],
                  [validaciones.letrasYNumeros, 'Combinar letras y números'],
                  [validaciones.coinciden,      'Las contraseñas coinciden'],
                ].map(([ok, label]) => (
                  <div key={label} className="flex items-center gap-2 text-sm font-medium">
                    {ok ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-gray-300" />}
                    <span className={ok ? 'text-emerald-700' : 'text-gray-500'}>{label}</span>
                  </div>
                ))}
              </div>
              <button type="submit" disabled={!esValido || cambiando}
                className="w-full py-3.5 mt-4 bg-gradient-to-br from-pink-600 to-violet-600 disabled:opacity-40 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">
                {cambiando ? 'Actualizando...' : 'Guardar y Continuar'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex h-screen bg-[#FAF7FC] font-sans text-gray-800 overflow-hidden">

        {/* ── Overlay mobile ────────────────────────────────────────────────── */}
        {sidebarAbierta && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={cerrarSidebar}
          />
        )}

        {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-brand-dark flex flex-col flex-shrink-0
          shadow-2xl transition-transform duration-300 ease-in-out
          ${sidebarAbierta ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>

          {/* Logo */}
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img
                src={LOGO_URL}
                alt="Epifanía Dance"
                className="w-11 h-11 rounded-2xl object-cover shadow-lg shadow-pink-900/40 flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg font-black text-white tracking-tight leading-tight">Epifanía</h1>
                <p className="text-[10px] font-bold text-pink-400 uppercase tracking-[0.2em]">Dance</p>
              </div>
            </div>
            <p className="text-xs text-white/30 mt-3 font-medium">{rolLabel}</p>
          </div>

          {/* Navegación */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {itemsPermitidos.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={cerrarSidebar}
                  className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-br from-pink-600 to-violet-600 text-white shadow-lg shadow-pink-900/30'
                      : 'text-white/55 hover:bg-white/[0.07] hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-white/35'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-white/10">
            {emailUsuario && (
              <p className="text-xs text-white/25 truncate px-3 mb-2 font-medium">{emailUsuario}</p>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-3 py-2.5 text-white/40 hover:bg-white/[0.07] hover:text-white/80 rounded-xl transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* ── CONTENIDO PRINCIPAL ──────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Topbar mobile */}
          <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
            <button
              onClick={() => setSidebarAbierta(true)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>
            <img src={LOGO_URL} alt="Epifanía Dance" className="w-8 h-8 rounded-xl object-cover" />
            <span className="font-black text-gray-800 text-base">Epifanía <span className="text-pink-500">Dance</span></span>
          </header>

          {/* Área scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>

      </div>
    </>
  );
};

export default LayoutPrincipal;
