import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const OlvidePasswordPage = () => {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('El email es obligatorio.');
      return;
    }
    setCargando(true);
    setError('');

    try {
      await api.post('/auth/recuperar-password', { email: email.trim() });
      setEnviado(true);
    } catch (err) {
      // El backend siempre devuelve 200 por seguridad,
      // pero si hay un error de red lo mostramos igual
      setError('No pudimos conectar con el servidor. Intentá de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-pink-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full blur-xl -ml-8 -mb-8" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Epifania</h1>
            <p className="text-pink-200 font-medium tracking-wide">Manager de Academia</p>
          </div>
        </div>

        <div className="p-8">
          {!enviado ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">¿Olvidaste tu contraseña?</h2>
              <p className="text-gray-500 text-sm text-center mb-6">
                Ingresá tu email y te mandamos un enlace para crear una nueva contraseña.
              </p>

              {error && (
                <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full flex justify-center items-center py-3.5 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-3">¡Revisá tu email!</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Si el email <strong>{email}</strong> está registrado en el sistema,
                vas a recibir un enlace para restablecer tu contraseña. El enlace vence en <strong>1 hora</strong>.
              </p>
              <p className="text-xs text-gray-400">¿No llegó? Revisá la carpeta de spam.</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-pink-600 hover:text-pink-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OlvidePasswordPage;
