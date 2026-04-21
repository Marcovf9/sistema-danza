import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Lock, Mail, LogIn } from 'lucide-react';

const LoginPage = () => {
  const [credenciales, setCredenciales] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const response = await api.post('/auth/login', credenciales);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('rol', response.data.rol);
      if (response.data.profesorId) {
        localStorage.setItem('profesorId', response.data.profesorId);
      }

      if (response.data.rol === 'DIRECTOR') {
        navigate('/dashboard');
      } else if (response.data.rol === 'PROFESOR') {
        navigate('/asistencia');
      } else {
        navigate('/dashboard');
      }
      
    } catch (err) {
      setError(err.response?.data || 'Error al conectar con el servidor. Verifica tus credenciales.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="p-8 bg-indigo-600 text-center">
          <h1 className="text-3xl font-black text-white tracking-tight">Academia Manager</h1>
          <p className="text-indigo-200 mt-2 text-sm font-medium">Acceso al Sistema Operativo</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                name="email"
                required
                value={credenciales.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="ejemplo@academia.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                name="password"
                required
                value={credenciales.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className="w-full flex justify-center items-center py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            {cargando ? 'Verificando...' : <><LogIn className="w-5 h-5 mr-2" /> Iniciar Sesión</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;