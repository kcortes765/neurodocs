# API Routes Documentation

Esta documentación describe todas las rutas API disponibles en la aplicación NeoData.

## Formato de respuesta

Todas las rutas siguen un formato consistente:

- **Exito**: `{ data: ... }`
- **Error**: `{ error: "mensaje de error" }` con status HTTP apropiado

## Base URL

En desarrollo: `http://localhost:3000/api`

---

## Pacientes

### GET /api/pacientes

Lista todos los pacientes con búsqueda opcional.

**Query Parameters:**
- `q` (opcional): Búsqueda por nombre, apellido o RUT

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "...",
      "rut": "12345678-9",
      "nombre": "Juan",
      "apellido": "Pérez",
      "fechaNacimiento": "1990-01-01T00:00:00.000Z",
      "telefono": "+56 9 1234 5678",
      "email": "juan.perez@example.com",
      "direccion": "Av. Ejemplo 123",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "_count": {
        "atenciones": 3
      }
    }
  ]
}
```

### POST /api/pacientes

Crea un nuevo paciente.

**Body:**
```json
{
  "rut": "12345678-9",
  "nombre": "Juan",
  "apellido": "Pérez",
  "fechaNacimiento": "1990-01-01",
  "telefono": "+56 9 1234 5678",
  "email": "juan.perez@example.com",
  "direccion": "Av. Ejemplo 123"
}
```

**Validaciones:**
- RUT, nombre y apellido son requeridos
- El RUT debe ser válido (validación con dígito verificador)
- El RUT no debe existir previamente

**Respuesta exitosa (201):**
```json
{
  "data": {
    "id": "...",
    "rut": "12345678-9",
    "nombre": "Juan",
    "apellido": "Pérez",
    ...
  }
}
```

**Errores:**
- `400`: Datos inválidos o RUT inválido
- `409`: RUT ya existe

### GET /api/pacientes/[id]

Obtiene un paciente por ID con sus atenciones.

**Respuesta exitosa (200):**
```json
{
  "data": {
    "id": "...",
    "rut": "12345678-9",
    "nombre": "Juan",
    "apellido": "Pérez",
    "atenciones": [
      {
        "id": "...",
        "fecha": "2025-01-15T00:00:00.000Z",
        "clinica": {
          "id": "...",
          "nombre": "Clínica Central"
        }
      }
    ]
  }
}
```

**Errores:**
- `404`: Paciente no encontrado

### PUT /api/pacientes/[id]

Actualiza un paciente.

**Body:** (todos los campos son opcionales)
```json
{
  "rut": "12345678-9",
  "nombre": "Juan",
  "apellido": "Pérez",
  "fechaNacimiento": "1990-01-01",
  "telefono": "+56 9 1234 5678",
  "email": "juan.perez@example.com",
  "direccion": "Av. Ejemplo 123"
}
```

**Errores:**
- `400`: RUT inválido
- `404`: Paciente no encontrado
- `409`: RUT ya existe (si se está cambiando)

### DELETE /api/pacientes/[id]

Elimina un paciente.

**Restricciones:**
- No se puede eliminar un paciente con atenciones registradas

**Respuesta exitosa (200):**
```json
{
  "data": {
    "message": "Paciente eliminado exitosamente"
  }
}
```

**Errores:**
- `404`: Paciente no encontrado
- `409`: Paciente tiene atenciones registradas

---

## Clínicas

### GET /api/clinicas

Lista todas las clínicas.

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "...",
      "nombre": "Clínica Central",
      "direccion": "Av. Principal 456",
      "telefono": "+56 2 2222 3333",
      "email": "contacto@clinica.cl",
      "_count": {
        "atenciones": 15
      }
    }
  ]
}
```

### POST /api/clinicas

Crea una nueva clínica.

**Body:**
```json
{
  "nombre": "Clínica Central",
  "direccion": "Av. Principal 456",
  "telefono": "+56 2 2222 3333",
  "email": "contacto@clinica.cl"
}
```

**Validaciones:**
- El nombre es requerido
- No debe existir otra clínica con el mismo nombre

**Respuesta exitosa (201):**
```json
{
  "data": {
    "id": "...",
    "nombre": "Clínica Central",
    ...
  }
}
```

**Errores:**
- `400`: Nombre no proporcionado
- `409`: Ya existe una clínica con ese nombre

---

## Atenciones

### GET /api/atenciones

Lista atenciones con filtros opcionales.

**Query Parameters:**
- `pacienteId` (opcional): Filtra por paciente
- `clinicaId` (opcional): Filtra por clínica

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "...",
      "fecha": "2025-01-15T00:00:00.000Z",
      "motivoConsulta": "Dolor de cabeza",
      "diagnostico": "Migraña",
      "tratamiento": "Analgésicos",
      "observaciones": "Control en 2 semanas",
      "paciente": {...},
      "clinica": {...}
    }
  ]
}
```

### POST /api/atenciones

Crea una nueva atención.

**Body:**
```json
{
  "pacienteId": "...",
  "clinicaId": "...",
  "fecha": "2025-01-15",
  "motivoConsulta": "Dolor de cabeza",
  "diagnostico": "Migraña",
  "tratamiento": "Analgésicos",
  "observaciones": "Control en 2 semanas"
}
```

**Validaciones:**
- pacienteId y clinicaId son requeridos
- El paciente debe existir
- La clínica debe existir

**Respuesta exitosa (201):**
```json
{
  "data": {
    "id": "...",
    "fecha": "2025-01-15T00:00:00.000Z",
    "paciente": {...},
    "clinica": {...},
    ...
  }
}
```

**Errores:**
- `400`: Datos requeridos no proporcionados
- `404`: Paciente o clínica no encontrada

### GET /api/atenciones/[id]

Obtiene una atención por ID con paciente y clínica.

**Respuesta exitosa (200):**
```json
{
  "data": {
    "id": "...",
    "fecha": "2025-01-15T00:00:00.000Z",
    "motivoConsulta": "Dolor de cabeza",
    "paciente": {...},
    "clinica": {...}
  }
}
```

**Errores:**
- `404`: Atención no encontrada

### PUT /api/atenciones/[id]

Actualiza una atención.

**Body:** (todos los campos son opcionales)
```json
{
  "fecha": "2025-01-15",
  "motivoConsulta": "Dolor de cabeza",
  "diagnostico": "Migraña",
  "tratamiento": "Analgésicos",
  "observaciones": "Control en 2 semanas"
}
```

**Errores:**
- `404`: Atención no encontrada

### DELETE /api/atenciones/[id]

Elimina una atención.

**Respuesta exitosa (200):**
```json
{
  "data": {
    "message": "Atención eliminada exitosamente"
  }
}
```

**Errores:**
- `404`: Atención no encontrada

---

## Documentos

### GET /api/documentos/generar

Lista las plantillas disponibles para generar documentos.

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "...",
      "nombre": "Informe Médico",
      "activo": true
    }
  ]
}
```

### POST /api/documentos/generar

Genera documentos PDF a partir de plantillas.

**Body:**
```json
{
  "atencionId": "...",
  "plantillasIds": ["plantilla-1", "plantilla-2"]
}
```

**Validaciones:**
- atencionId es requerido
- plantillasIds debe ser un array no vacío
- La atención debe existir
- Todas las plantillas deben existir

**Respuesta exitosa (200):**
```json
{
  "data": {
    "atencionId": "...",
    "paciente": {
      "nombre": "Juan",
      "apellido": "Pérez",
      "rut": "12345678-9"
    },
    "documentos": [
      {
        "plantillaId": "...",
        "plantillaNombre": "Informe Médico",
        "url": "/api/documentos/preview/...",
        "generadoEn": "2025-01-15T10:30:00.000Z"
      }
    ],
    "message": "Documentos generados exitosamente (mock)"
  }
}
```

**Nota:** Esta implementación es un mock. La generación real de PDFs se implementará posteriormente.

**Errores:**
- `400`: Datos inválidos
- `404`: Atención o plantillas no encontradas

---

## Seed (Desarrollo)

### POST /api/seed

Genera datos sintéticos para pruebas.

**Body:**
```json
{
  "pacientes": 10,
  "atencionesPorPaciente": 3
}
```

**Validaciones:**
- pacientes debe estar entre 1 y 1000
- atencionesPorPaciente debe estar entre 1 y 20

**Respuesta exitosa (201):**
```json
{
  "data": {
    "message": "Datos sintéticos generados exitosamente",
    "pacientesCreados": 10,
    "atencionesCreadas": 30,
    "clinica": {
      "id": "...",
      "nombre": "Clínica Neurológica Central"
    },
    "pacientes": [...]
  }
}
```

**Errores:**
- `400`: Números fuera de rango

### DELETE /api/seed

Limpia todos los datos de la base de datos.

**Advertencia:** Esta operación elimina TODOS los datos. Usar solo en desarrollo.

**Respuesta exitosa (200):**
```json
{
  "data": {
    "message": "Todos los datos han sido eliminados"
  }
}
```

---

## Códigos de estado HTTP

- `200`: OK - Operación exitosa
- `201`: Created - Recurso creado exitosamente
- `400`: Bad Request - Datos inválidos o faltantes
- `404`: Not Found - Recurso no encontrado
- `409`: Conflict - Conflicto (ej: RUT duplicado)
- `500`: Internal Server Error - Error del servidor

---

## Notas de implementación

1. Todas las rutas utilizan el cliente Prisma importado desde `@/lib/db`
2. La validación de RUT chileno está implementada en las rutas de pacientes
3. Las fechas se manejan en formato ISO 8601
4. Las búsquedas son case-insensitive donde aplica
5. La generación de PDFs en `/api/documentos/generar` es actualmente un mock
