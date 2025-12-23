const API_BASE = '/api'

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
  } catch {
    return { error: 'Error de conexion' }
  }
}

export const pacientes = {
  listar: async (query?: string, limit?: number) => {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (limit) params.append('limit', String(limit))
    const queryString = params.toString()
    return fetchAPI(`/pacientes${queryString ? `?${queryString}` : ''}`)
  },

  obtener: async (id: string) => {
    return fetchAPI(`/pacientes/${id}`)
  },

  crear: async (data: {
    rut: string
    nombreCompleto: string
    fechaNac?: string
    prevision?: string
    isapreNombre?: string
    antecedentes?: string
  }) => {
    return fetchAPI('/pacientes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  actualizar: async (
    id: string,
    data: {
      nombreCompleto?: string
      fechaNac?: string
      prevision?: string
      isapreNombre?: string
      antecedentes?: string
    }
  ) => {
    return fetchAPI(`/pacientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

export const clinicas = {
  listar: async () => {
    return fetchAPI('/clinicas')
  },

  crear: async (data: {
    nombre: string
    direccion: string
    logoUrl?: string
  }) => {
    return fetchAPI('/clinicas', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

export const atenciones = {
  listar: async (filtros?: { pacienteId?: string; clinicaId?: string }) => {
    const params = new URLSearchParams()
    if (filtros?.pacienteId) params.append('pacienteId', filtros.pacienteId)
    if (filtros?.clinicaId) params.append('clinicaId', filtros.clinicaId)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return fetchAPI(`/atenciones${queryString}`)
  },

  obtener: async (id: string) => {
    return fetchAPI(`/atenciones/${id}`)
  },

  crear: async (data: {
    pacienteId: string
    clinicaId: string
    diagnostico: string
    tratamiento?: string
    indicaciones?: string
  }) => {
    return fetchAPI('/atenciones', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  actualizar: async (
    id: string,
    data: {
      fecha?: string
      diagnostico?: string
      tratamiento?: string
      indicaciones?: string
    }
  ) => {
    return fetchAPI(`/atenciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  eliminar: async (id: string) => {
    return fetchAPI(`/atenciones/${id}`, {
      method: 'DELETE',
    })
  },
}

export const documentos = {
  listarPlantillas: async () => {
    return fetchAPI('/documentos/generar')
  },

  generar: async (data: { atencionId: string; tipos?: string[] }) => {
    return fetchAPI('/documentos/generar', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

export const seed = {
  generar: async (data: { pacientes: number; atencionesPorPaciente: number }) => {
    return fetchAPI('/seed', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  limpiar: async () => {
    return fetchAPI('/seed', {
      method: 'DELETE',
    })
  },
}

const apiClient = {
  pacientes,
  clinicas,
  atenciones,
  documentos,
  seed,
}

export default apiClient
