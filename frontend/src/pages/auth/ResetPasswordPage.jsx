import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Lock, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  // Si no hay token en la URL, mostramos error inmediato
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Enlace inválido</h2>
          <p className="text-gray-500 text-sm mb-6">Este enlace no es válido. Solicitá uno nuevo desde la pantalla de login.</p>
          <Link to="/login" className="text-indigo-600 hover:underline font-medium text-sm">Ir al inicio de sesión</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (nuevaPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      await api.post('/auth/resetear-password', { token, nuevaPassword });
      setExito(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data || 'El enlace expiró o ya fue utilizado. Solicitá uno nuevo.';
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full blur-xl -ml-8 -mb-8" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Epifania</h1>
            <p className="text-indigo-200 font-medium tracking-wide">Manager de Academia</p>
          </div>
        </div>

        <div className="p-8">
          {!exito ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Nueva contraseña</h2>
              <p className="text-gray-500 text-sm text-center mb-6">
                Creá tu nueva contraseña. Debe tener al menos 8 caracteres.
              </p>

              {error && (
                <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-lg">
                  {error}
                  {(error.includes('expiró') || error.includes('utilizado')) && (
                    <span> <Link to="/olvide-password" className="underline font-semibold">Solicitá uno nuevo.</Link></span>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nueva contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={mostrarPass ? 'text' : 'password'}
                      value={nuevaPassword}
                      onChange={(e) => { setNuevaPassword(e.target.value); setError(''); }}
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPass(!mostrarPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {mostrarPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Confirmar contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={mostrarPass ? 'text' : 'password'}
                      value={confirmarPassword}
                      onChange={(e) => { setConfirmarPassword(e.target.value); setError(''); }}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Repetí la contraseña"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full flex justify-center items-center py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-3">¡Contraseña actualizada!</h2>
              <p className="text-gray-500 text-sm mb-2">Ya podés iniciar sesión con tu nueva contraseña.</p>
              <p className="text-xs text-gray-400">Redirigiendo en unos segundos...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
