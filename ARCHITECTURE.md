# ARCHITECTURE.md - NeuroDoc Automator

## Resumen del Sistema

Sistema de automatización de documentos médicos para neurocirujano. Genera PDFs (recetas, certificados, documentos quirúrgicos) desde datos de pacientes.

**Stack**: Next.js 14 (App Router) + Tailwind CSS + Prisma (SQLite local / LibSQL-Turso en Vercel) + pdf-lib + NextAuth.js

---

## Estructura de Directorios

```
neurodata/
├── prisma/
│   └── schema.prisma           # Modelos de datos
├── public/
│   └── plantillas/             # PDFs base por tipo (pam/, pabellon/, consentimiento/)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # Rutas API (REST)
│   │   ├── login/              # Página de autenticación
│   │   ├── pacientes/          # Gestión de pacientes
│   │   ├── eventos-quirurgicos/# Eventos quirúrgicos
│   │   └── atencion/[id]/      # Detalle de atención
│   ├── components/
│   │   ├── forms/              # Formularios (PatientForm, SurgicalEventForm)
│   │   ├── ui/                 # Componentes reutilizables (Button, Input, Card)
│   │   └── layout/             # Layout (Header)
│   ├── lib/                    # Utilidades core
│   │   ├── db.ts               # Singleton Prisma
│   │   ├── api-client.ts       # Cliente API frontend
│   │   ├── pdf-generator.ts    # Motor de generación PDF
│   │   ├── pdf-field-maps.ts   # Mapeos de coordenadas
│   │   └── rut.ts              # Validación RUT chileno
│   └── types/                  # Definiciones TypeScript
└── scripts/                    # Scripts de setup
```

---

## Modelo de Datos

### Entidades Principales

```
┌─────────────┐
│   Paciente  │  RUT, nombre, fecha nac, previsión
└──────┬──────┘
       │
       ├─────────────────┬─────────────────┐
       ↓                 ↓                 ↓
┌─────────────┐   ┌──────────────────┐
│  Atencion   │   │ EventoQuirurgico │
│ (consulta)  │   │    (cirugía)     │
└──────┬──────┘   └────────┬─────────┘
       │                   │
       │    ┌──────────────┼──────────────┬──────────────┐
       │    ↓              ↓              ↓              ↓
       │  Clinica    Procedimiento   EquipoMedico   (5 roles)
       │                                            Cirujano
       │                                            Anestesista
       │                                            Arsenalera
       │                                            Ayudante1/2
       │                   │
       └───────────────────┴──────────────→ Documento
                                                ↓
                                            Plantilla
```

### Relaciones Clave

| Entidad | Relación | Descripción |
|---------|----------|-------------|
| Paciente → Atencion | 1:N | Un paciente tiene múltiples consultas |
| Paciente → EventoQuirurgico | 1:N | Un paciente tiene múltiples cirugías |
| EventoQuirurgico → EquipoMedico | N:1 (x5) | 5 roles del equipo médico |
| EventoQuirurgico → Procedimiento | N:1 | Código FONASA del procedimiento |
| Documento → Plantilla | N:1 | PDF generado usa una plantilla |
| Documento → Atencion OR EventoQuirurgico | N:1 | Documento asociado a uno u otro |

---

## Flujo de Datos

### 1. Autenticación

```
Browser (login/page.tsx)
    ↓ credentials
NextAuth Credentials Provider
    ↓ validate
JWT Token Generation
    ↓ store
middleware.ts (protege rutas)
    ↓ verify
Acceso a rutas protegidas
```

### 2. Gestión de Pacientes

```
Usuario ingresa datos
    ↓
PatientForm Component
    ↓ POST /api/pacientes
API valida RUT (mod-11)
    ↓ verifica duplicados
Prisma crea Paciente
    ↓
Redirect a detalle
```

### 3. Generación de Documentos (Flujo Principal)

```
Usuario selecciona evento quirúrgico
    ↓
DocumentSelector.tsx
    ↓ POST /api/documentos/generar
    │ { eventoQuirurgicoId, tipos: ['PAM','PABELLON','CONSENTIMIENTO'] }
    ↓
API Route procesa:
┌─────────────────────────────────────────────────────────┐
│ 1. Fetch EventoQuirurgico con relaciones completas     │
│    - paciente, clinica, procedimiento, equipo médico   │
│                                                         │
│ 2. Formatear datos para Chile                          │
│    - RUT: 12345678K → 12.345.678-K                     │
│    - Fechas: ISO → dd/mm/yyyy                          │
│                                                         │
│ 3. Para cada tipo de documento:                        │
│    a. Crear documento genérico (createGenericDocument) │
│    b. Buscar Plantilla (por tipo + previsión/clínica)  │
│    c. Si existe plantilla con mapeo:                   │
│       - Cargar PDF base (public/plantillas/...)        │
│       - Inyectar texto en coordenadas X,Y (pdf-lib)    │
│       - Inyectar checkboxes                            │
│                                                         │
│ 4. Retornar PDFs en Base64                             │
└─────────────────────────────────────────────────────────┘
    ↓
Frontend recibe PDFs
    ↓
Usuario previsualiza/descarga
```

### 4. Sistema de Coordenadas PDF

```
PDF A4: 595 × 842 puntos
Origen: esquina inferior izquierda

         (0, 842)───────────────(595, 842)
              │                      │
              │    ↑ Y aumenta       │
              │    │                 │
              │    └──→ X aumenta    │
              │                      │
         (0, 0)────────────────(595, 0)
```

**Ejemplo de mapeo** (pdf-field-maps.ts):
```typescript
{
  nombrePaciente: { x: 150, y: 680, fontSize: 12, maxWidth: 200, page: 0 },
  rutPaciente:    { x: 400, y: 680, fontSize: 12, page: 0 },
  // checkboxes
  lateralidadDerecha: { x: 120, y: 450, page: 0 }
}
```

---

## Rutas API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/pacientes` | Listar/crear pacientes |
| GET/PUT | `/api/pacientes/[id]` | Obtener/actualizar paciente |
| GET/POST | `/api/eventos-quirurgicos` | Listar/crear eventos |
| GET | `/api/eventos-quirurgicos/[id]` | Detalle con relaciones |
| GET/POST | `/api/atenciones` | Consultas médicas |
| GET | `/api/plantillas` | Listar plantillas activas |
| **POST** | `/api/documentos/generar` | **Generar PDFs** |
| GET/POST | `/api/equipos-medicos` | Personal médico |
| GET/POST | `/api/procedimientos` | Códigos FONASA |
| POST/DELETE | `/api/seed` | Datos de prueba |

---

## Módulos Core (src/lib/)

### db.ts
Singleton de Prisma con hot-reload para desarrollo.

### pdf-generator.ts (795 líneas)
```typescript
// Funciones principales
loadPdfTemplate(path)           // Cargar plantilla
injectText(pdf, mappings, data) // Inyectar texto en coordenadas
injectCheckboxes(pdf, mappings) // Marcar checkboxes
createGenericDocument(data)     // PDF legible sin plantilla
generateDocumentFromMapping()   // Combinación texto + checkboxes
pdfToBase64(pdf)               // Serializar para envío
```

### pdf-field-maps.ts (434 líneas)
```typescript
// Mapeos por plantilla
SOLICITUD_PABELLON_BUPA      // Solicitud de pabellón
CONSENTIMIENTO_GENERAL_BUPA  // Consentimiento quirúrgico (3 páginas)

// Transformadores
toSolicitudPabellonData(unified)     // Datos → formato plantilla
toConsentimientoGeneralData(unified)
```

### rut.ts
```typescript
validateRut(rut)    // Validación mod-11
formatRut(rut)      // 12345678K → 12.345.678-K
cleanRut(rut)       // Remover puntos/guión
```

### api-client.ts
Cliente tipado para frontend:
```typescript
pacientes.listar(), .crear(), .obtener()
eventosQuirurgicos.listar(), .crear()
documentos.generar({ eventoQuirurgicoId, tipos })
```

---

## Convenciones

| Aspecto | Convención |
|---------|------------|
| Componentes | PascalCase (`PatientForm.tsx`) |
| Funciones | camelCase (`validateRut()`) |
| Archivos | kebab-case (`pdf-generator.ts`) |
| Tablas DB | PascalCase singular (`Paciente`) |
| Campos DB | camelCase (`fechaNac`) |
| Código | Inglés |
| UI/Comentarios | Español |

### Respuestas API
```typescript
// Éxito
{ data: resultado }

// Error
{ error: "mensaje" }  // status 400+
```

### Manejo de RUT
- **Almacenamiento**: Sin formato (`12345678K`)
- **Display**: Con formato (`12.345.678-K`)

---

## Seguridad

- **Autenticación**: NextAuth.js con Credentials Provider
- **Middleware**: Protege rutas excepto `/login`, `/api/auth`
- **Estado actual**: APIs temporalmente públicas para desarrollo

---

## Comandos

```bash
npm run dev          # Servidor desarrollo
npm run check        # lint + typecheck + prisma validate
npm run fix          # Auto-fix lint + format
npm run setup        # Generar cliente Prisma + push schema
npm run pdf:test     # Probar mapeo de coordenadas
```
