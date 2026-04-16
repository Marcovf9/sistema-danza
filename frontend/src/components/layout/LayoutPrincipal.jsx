import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, GraduationCap, LogOut } from 'lucide-react';

const LayoutPrincipal = () => {
  const location = useLocation();

  // Mapeamos las rutas con sus respectivos íconos de Lucide
  const menuItems = [
    { path: '/dashboard', label: 'Panel General', icon: LayoutDashboard },
    { path: '/alumnos', label: 'Alumnos', icon: Users },
    { path: '/caja', label: 'Caja y Cobros', icon: Wallet },
    { path: '/profesores', label: 'Profesores', icon: GraduationCap },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* Menú Lateral (Sidebar) */}
      <aside className="w-72 bg-white shadow-xl flex flex-col z-10">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">
            Academia Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">Panel de Dirección</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon; // Extraemos el componente del ícono
            
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
          <button className="w-full flex items-center justify-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-lg font-medium">
            <LogOut className="w-5 h-5 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área Principal de Contenido */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default LayoutPrincipal;