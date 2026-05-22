import axios from 'axios';

// En producción (Docker): nginx hace proxy de /api → backend, no se necesita URL absoluta.
// En desarrollo:  usa VITE_API_URL del .env.local, o el proxy de Vite configurado en vite.config.js.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? '/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

export default api;
