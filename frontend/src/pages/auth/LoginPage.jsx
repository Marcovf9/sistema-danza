import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Lock, Mail, LogIn } from 'lucide-react';

const LoginPage = () => {
  const [credenciales, setCredenciales] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [erroresInput, setErroresInput] = useState({ email: '', password: '' });
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const validarEmail = (email) => {
    if (!email) return "El email es obligatorio.";
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) return "Formato de email incorrecto.";
    return "";
  };

  const validarPassword = (password) => {
    if (!password) return "La contraseña es obligatoria.";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    return "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let errorMsg = '';
    
    if (name === 'email') errorMsg = validarEmail(value);
    if (name === 'password') errorMsg = validarPassword(value);
    
    setErroresInput(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });

    if (erroresInput[e.target.name]) {
      setErroresInput({ ...erroresInput, [e.target.name]: '' });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const emailErr = validarEmail(credenciales.email);
    const passErr = validarPassword(credenciales.password);
    
    if (emailErr || passErr) {
      setErroresInput({ email: emailErr, password: passErr });
      return;
    }

    setCargando(true);
    setError('');

    try {
      const response = await api.post('/auth/login', credenciales);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('rol', response.data.rol);
      localStorage.setItem('email', response.data.email);
      localStorage.setItem('requiereCambio', response.data.requiereCambioPassword);
      
      if (response.data.entidadId) {
        localStorage.setItem('entidadId', response.data.entidadId);
      }

      if (response.data.rol === 'DIRECTOR') {
        navigate('/dashboard');
      } else if (response.data.rol === 'PROFESOR') {
        navigate('/profesor/agenda');
      } else if (response.data.rol === 'ALUMNO') {
        navigate('/alumno/cuenta');
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
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo — marca (solo desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-pink-600 to-violet-700 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-pink-400/20 rounded-full blur-2xl" />

        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <span className="text-5xl font-black text-white">E</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight leading-none mb-2">Epifanía</h1>
          <p className="text-pink-200 font-semibold tracking-[0.4em] uppercase text-sm mb-10">Dance</p>
          <p className="text-white/70 text-base max-w-xs leading-relaxed mx-auto">
            Sistema de gestión para la academia. Clases, pagos y más en un solo lugar.
          </p>
        </div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-sm animate-in fade-in zoom-in duration-500">

          {/* Logo mobile */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
              <span className="text-3xl font-black text-white">E</span>
            </div>
            <h1 className="text-2xl font-black text-gray-800">
              Epifanía <span className="text-pink-500">Dance</span>
            </h1>
          </div>

          <h2 className="text-3xl font-black text-gray-800 mb-1">Bienvenida 👋</h2>
          <p className="text-gray-500 text-sm mb-8">Ingresá tus credenciales para continuar.</p>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl flex items-start gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={credenciales.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="ejemplo@academia.com"
                  className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all text-sm ${
                    erroresInput.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-pink-400'
                  }`}
                />
              </div>
              {erroresInput.email && (
                <p className="text-red-500 text-xs font-semibold mt-1.5">{erroresInput.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={credenciales.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all text-sm ${
                    erroresInput.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-pink-400'
                  }`}
                />
              </div>
              {erroresInput.password && (
                <p className="text-red-500 text-xs font-semibold mt-1.5">{erroresInput.password}</p>
              )}
            </div>

            {/* Olvidé contraseña */}
            <div className="flex justify-end">
              <Link
                to="/olvide-password"
                className="text-xs text-pink-500 hover:text-pink-700 font-semibold transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full flex justify-center items-center gap-2 py-3.5 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all active:scale-[0.98] text-sm"
            >
              {cargando
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Verificando...</>
                : <><LogIn className="w-4 h-4" /> Ingresar</>
              }
            </button>
          </form>

        </div>
      </div>

    </div>
  );
};

export default LoginPage;