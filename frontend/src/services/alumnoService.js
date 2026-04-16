const API_URL = 'http://localhost:8080/api/alumnos';

export const obtenerAlumnos = async () => {
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) {
            throw new Error('Error al obtener los alumnos');
        }
        return await respuesta.json();
    } catch (error) {
        console.error("Error en alumnoService:", error);
        return [];
    }
};

export const guardarAlumno = async (nuevoAlumno) => {
    try {
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevoAlumno),
        });
        
        if (!respuesta.ok) {
            throw new Error('Error al guardar el alumno');
        }
        return await respuesta.json();
    } catch (error) {
        console.error("Error en alumnoService (guardar):", error);
        throw error;
    }
};