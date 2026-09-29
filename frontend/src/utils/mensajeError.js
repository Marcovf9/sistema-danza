// Devuelve siempre un texto mostrable a partir de un error de axios.
// El backend responde a veces con texto plano y a veces con JSON
// ({ error, status, ... }); renderizar el objeto tal cual rompe React.
export function mensajeError(err, porDefecto) {
  const data = err?.response?.data;
  if (typeof data === 'string' && data.trim() !== '' && !data.trim().startsWith('<')) return data;
  if (data && typeof data === 'object') {
    if (typeof data.error === 'string') return data.error;
    if (typeof data.mensaje === 'string') return data.mensaje;
    if (typeof data.message === 'string') return data.message;
  }
  return porDefecto;
}
