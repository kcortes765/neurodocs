/**
 * Cliente API para uso en componentes del cliente
 * Proporciona funciones tipo-seguras para interactuar con la API
 */

const API_BASE = '/api'

/**
 * Función genérica para hacer peticiones a la API
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    const json = await response.json()

    if (!response.ok) {
      return { error: json.error || 'Error desconocido' }
    }

    return json
  } catch (error) {
    return { error: 'Error de conexión' }
  }
}

// ==================== PACIENTES ====================

export const pacientes = {
  /**
   * Lista todos los pacientes
   * @param query - Búsqueda opcional por nombre, apellido o RUT
   */
  listar: async (query?: string) => {
    const queryParam = query ? `?q=${encodeURIComponent(query)}` : ''
    return fetchAPI(`/pacientes${queryParam}`)
  },

  /**
   * Obtiene un paciente por ID
   */
  obtener: async (id: string) => {
    return fetchAPI(`/pacientes/${id}`)
  },

  /**
   * Crea un nuevo paciente
   */
  crear: async (data: {
    rut: string
    nombre: string
    apellido: string
    fechaNacimiento?: string
    telefono?: string
    email?: string
    direccion?: string
  }) => {
    return fetchAPI('/pacientes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Actualiza un paciente
   */
  actualizar: async (
    id: string,
    data: {
      rut?: string
      nombre?: string
      apellido?: string
      fechaNacimiento?: string
      telefono?: string
      email?: string
      direccion?: string
    }
  ) => {
    return fetchAPI(`/pacientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Elimina un paciente
   */
  eliminar: async (id: string) => {
    return fetchAPI(`/pacientes/${id}`, {
      method: 'DELETE',
    })
  },
}

// ==================== CLÍNICAS ====================

export const clinicas = {
  /**
   * Lista todas las clínicas
   */
  listar: async () => {
    return fetchAPI('/clinicas')
  },

  /**
   * Crea una nueva clínica
   */
  crear: async (data: {
    nombre: string
    direccion?: string
    telefono?: string
    email?: string
  }) => {
    return fetchAPI('/clinicas', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// ==================== ATENCIONES ====================

export const atenciones = {
  /**
   * Lista atenciones con filtros opcionales
   */
  listar: async (filtros?: { pacienteId?: string; clinicaId?: string }) => {
    const params = new URLSearchParams()
    if (filtros?.pacienteId) params.append('pacienteId', filtros.pacienteId)
    if (filtros?.clinicaId) params.append('clinicaId', filtros.clinicaId)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return fetchAPI(`/atenciones${queryString}`)
  },

  /**
   * Obtiene una atención por ID
   */
  obtener: async (id: string) => {
    return fetchAPI(`/atenciones/${id}`)
  },

  /**
   * Crea una nueva atención
   */
  crear: async (data: {
    pacienteId: string
    clinicaId: string
    fecha?: string
    motivoConsulta?: string
    diagnostico?: string
    tratamiento?: string
    observaciones?: string
  }) => {
    return fetchAPI('/atenciones', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Actualiza una atención
   */
  actualizar: async (
    id: string,
    data: {
      fecha?: string
      motivoConsulta?: string
      diagnostico?: string
      tratamiento?: string
      observaciones?: string
    }
  ) => {
    return fetchAPI(`/atenciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Elimina una atención
   */
  eliminar: async (id: string) => {
    return fetchAPI(`/atenciones/${id}`, {
      method: 'DELETE',
    })
  },
}

// ==================== DOCUMENTOS ====================

export const documentos = {
  /**
   * Lista las plantillas disponibles
   */
  listarPlantillas: async () => {
    return fetchAPI('/documentos/generar')
  },

  /**
   * Genera documentos PDF
   */
  generar: async (data: { atencionId: string; plantillasIds: string[] }) => {
    return fetchAPI('/documentos/generar', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// ==================== SEED (Desarrollo) ====================

export const seed = {
  /**
   * Genera datos sintéticos
   */
  generar: async (data: { pacientes: number; atencionesPorPaciente: number }) => {
    return fetchAPI('/seed', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Limpia todos los datos
   */
  limpiar: async () => {
    return fetchAPI('/seed', {
      method: 'DELETE',
    })
  },
}

// Exportación por defecto con todas las funciones
export default {
  pacientes,
  clinicas,
  atenciones,
  documentos,
  seed,
}
