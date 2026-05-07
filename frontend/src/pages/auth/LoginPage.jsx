import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full blur-xl -ml-8 -mb-8"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Epifania</h1>
            <p className="text-indigo-200 font-medium tracking-wide">Manager de Academia</p>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  name="email"
                  value={credenciales.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    erroresInput.email ? 'border-red-400 focus:ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder="ejemplo@academia.com"
                />
              </div>
              {erroresInput.email && (
                <p className="text-red-500 text-xs font-semibold mt-1">{erroresInput.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  name="password"
                  value={credenciales.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    erroresInput.password ? 'border-red-400 focus:ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {erroresInput.password && (
                <p className="text-red-500 text-xs font-semibold mt-1">{erroresInput.password}</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={cargando}
              className="w-full flex justify-center items-center py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 mt-8"
            >
              {cargando ? 'Verificando...' : <><LogIn className="w-5 h-5 mr-2" /> Ingresar</>}
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default LoginPage;