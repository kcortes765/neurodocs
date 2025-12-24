# Implementación del Sistema de Mapeo de Coordenadas PDF

## Resumen

Se ha implementado exitosamente un sistema completo de mapeo de coordenadas para inyectar datos en plantillas PDF usando `pdf-lib`. El sistema permite generar documentos médicos personalizados a partir de plantillas existentes.

## Archivos Creados

### 1. Core del Sistema

#### `src/lib/pdf-generator.ts` (actualizado)
Motor principal de generación de PDFs con las siguientes mejoras:
- **Soporte multi-página**: Ahora soporta inyección de texto y checkboxes en múltiples páginas
- **Word wrap mejorado**: Manejo inteligente de texto largo con maxWidth
- **Validación robusta**: Verificación de páginas existentes antes de inyectar
- **Tipos actualizados**: `FieldMapping` y `CheckboxMapping` con soporte para `page`

#### `src/lib/pdf-field-maps.ts` (nuevo)
Definición de mapeos de coordenadas para plantillas:
- **SOLICITUD_PABELLON_BUPA**: Mapeo completo para solicitud de pabellón
  - 15+ campos de texto (datos del paciente, cirugía, equipo médico)
  - 5 grupos de checkboxes (lateralidad, alergias, biopsia, rayos X, convenio)
- **CONSENTIMIENTO_GENERAL_BUPA**: Mapeo para consentimiento de 3 páginas
  - Campos en página 1: datos del paciente, diagnóstico, procedimiento
  - Campos en página 3: autorización, médico responsable
- **UnifiedPatientData**: Interfaz unificada para datos del paciente
- **Funciones de conversión**: `toSolicitudPabellonData()`, `toConsentimientoGeneralData()`
- **Índice de plantillas**: Sistema para buscar y listar plantillas disponibles

### 2. Ejemplos y Utilidades

#### `src/lib/pdf-examples.ts` (nuevo)
Ejemplos prácticos de uso:
- `generarSolicitudPabellon()`: Ejemplo completo con datos reales
- `generarConsentimientoGeneral()`: Ejemplo de consentimiento
- `generarDocumentoDinamico()`: Uso con selección dinámica de plantilla
- `handleGeneratePdf()`: Integración con API
- `generarPdfPrueba()`: PDF de prueba para validar coordenadas

#### `src/lib/pdf-utils.ts` (nuevo)
Utilidades avanzadas:
- **Validación de coordenadas**: `validateCoordinates()`, `validateTemplateMapping()`
- **Conversión de coordenadas**: `fromTop()`, `toTop()`
- **Cálculo de texto**: `getTextWidth()`, `calculateTextLines()`
- **Herramientas de debugging**:
  - `generateCoordinateGrid()`: Genera PDF con cuadrícula de coordenadas
  - `generateMappingPreview()`: Vista previa de todos los campos mapeados
- **Formateo chileno**: `formatRut()`, `validateRut()`, `formatDateCL()`, `formatPhoneCL()`

#### `src/types/pdf.ts` (nuevo)
Tipos TypeScript centralizados:
- `TemplateType`, `PdfOutputFormat`
- `GeneratePdfRequest`, `GeneratePdfResponse`
- `TemplateInfo`
- `SolicitudPabellonData`, `ConsentimientoGeneralData`
- Re-exportación de tipos del sistema

### 3. Scripts y Testing

#### `scripts/test-pdf-mapping.mjs` (nuevo)
Script de verificación del sistema:
- Verifica existencia de plantillas
- Verifica archivos del sistema
- Valida dependencias
- Muestra instrucciones de uso

#### `scripts/generate-test-pdfs.ts` (nuevo)
Script para generar PDFs de prueba:
- Genera solicitud de pabellón con datos de ejemplo
- Genera consentimiento general con datos de ejemplo
- Genera PDF de validación con datos de prueba
- Crea directorio `test-output/` automáticamente

#### `package.json` (actualizado)
Nuevos scripts:
```bash
npm run pdf:test      # Ejecuta test-pdf-mapping.mjs
npm run pdf:generate  # Genera PDFs de prueba
```

### 4. Integración con API

#### `src/app/api/pdf/generate/route.ts.example` (nuevo)
Ejemplo completo de endpoint de API Next.js:
- Soporte para múltiples tipos de plantillas
- Formato PDF o base64
- Manejo de errores robusto
- Endpoint GET para listar plantillas disponibles

### 5. Documentación

#### `src/lib/PDF_MAPPING_README.md` (nuevo)
Documentación completa del sistema:
- Estructura de archivos
- Plantillas mapeadas y sus campos
- Ejemplos de uso
- Sistema de coordenadas explicado
- Guía para agregar nuevas plantillas
- Ajuste de coordenadas
- Configuración de fuentes
- Word wrap y múltiples páginas
- Checkboxes (simple, múltiples opciones, booleano)
- Integración con API (App Router y Pages Router)
- Testing y solución de problemas

#### `IMPLEMENTACION_PDF.md` (este archivo)
Resumen ejecutivo de la implementación

## Plantillas Mapeadas

### 1. Solicitud de Pabellón - Clínica Bupa Antofagasta
**Archivo**: `solicitud_de_pabellon__2_.pdf`

**Campos mapeados**:
- **Datos del paciente**: nombre, RUT, fecha nacimiento, teléfono
- **Datos de cirugía**: fecha solicitada, horario, diagnóstico, cirugía propuesta, código, duración estimada
- **Datos clínicos**: puntaje ETE
- **Equipo médico**: cirujano, ayudante, anestesista, arsenalera
- **Previsión**: nombre de previsión
- **Checkboxes**:
  - Lateralidad: Derecha | Izquierda | Bilateral | No aplica
  - Alergias látex: SI | NO
  - Biopsia: NO | SI | Diferida | Rápida
  - Rayos X: SI | NO
  - Convenio: PAD | GES | CAE | SIP | LIBRE ELECCIÓN

### 2. Consentimiento General - Clínica Bupa Antofagasta
**Archivo**: `cba_consentimiento_general.pdf` (3 páginas)

**Campos mapeados**:
- **Página 1**:
  - Nombre, apellidos, RUT, edad, fecha nacimiento
  - Diagnóstico
  - Procedimiento
- **Página 3**:
  - Nombre y apellidos autorización
  - RUT autorización
  - Médico responsable (nombre y RUT)
  - Fecha consentimiento

## Sistema de Coordenadas

Los PDFs usan coordenadas con **origen en esquina inferior izquierda**:
- Tamaño A4: 595x842 puntos
- X: 0 (izquierda) → 595 (derecha)
- Y: 0 (abajo) → 842 (arriba)

**Fórmula de conversión**:
```typescript
Y_pdf = 842 - distancia_desde_arriba
```

## Uso Rápido

### Generar Solicitud de Pabellón

```typescript
import {
  generateDocumentFromMapping,
  savePdfToFile,
} from '@/lib/pdf-generator';
import {
  SOLICITUD_PABELLON_BUPA,
  toSolicitudPabellonData,
  UnifiedPatientData,
} from '@/lib/pdf-field-maps';

const patientData: UnifiedPatientData = {
  nombreCompleto: 'Juan Pérez González',
  rut: '12.345.678-9',
  fechaNacimiento: '15/03/1985',
  diagnostico: 'Hernia inguinal derecha',
  cirugiaPropuesta: 'Hernioplastia laparoscópica',
  cirujano: 'Dr. Roberto Silva',
  prevision: 'FONASA',
  lateralidad: 'derecha',
  // ... más campos
};

const { text, checkboxes } = toSolicitudPabellonData(patientData);

const pdfBytes = await generateDocumentFromMapping(
  'solicitud_de_pabellon__2_.pdf',
  SOLICITUD_PABELLON_BUPA,
  text,
  checkboxes
);

// Guardar o retornar
await savePdfToFile(pdfBytes, 'solicitud.pdf');
```

### Generar PDFs de Prueba

```bash
# Verificar sistema
npm run pdf:test

# Generar PDFs de prueba
npm run pdf:generate

# Revisa: test-output/solicitud-test.pdf
#         test-output/consentimiento-test.pdf
#         test-output/solicitud-validacion.pdf
```

### Validar Coordenadas

```typescript
import { validateTemplateMapping } from '@/lib/pdf-utils';
import { SOLICITUD_PABELLON_BUPA } from '@/lib/pdf-field-maps';

const validation = validateTemplateMapping(SOLICITUD_PABELLON_BUPA);
console.log('Válido:', validation.valid);
console.log('Errores:', validation.errors);
console.log('Advertencias:', validation.warnings);
```

### Generar Cuadrícula de Coordenadas

```typescript
import { generateCoordinateGrid, savePdfToFile } from '@/lib/pdf-utils';

const grid = await generateCoordinateGrid();
await savePdfToFile(grid, 'grid.pdf');
// Abre grid.pdf para identificar coordenadas exactas
```

## Próximos Pasos

### 1. Validar Coordenadas (Recomendado)
```bash
npm run pdf:generate
```
- Revisa los PDFs generados en `test-output/`
- Verifica que los campos estén correctamente posicionados
- Si necesitas ajustar, edita `src/lib/pdf-field-maps.ts`

### 2. Ajustar Coordenadas (Si es necesario)
1. Genera cuadrícula de coordenadas con `generateCoordinateGrid()`
2. Superpón visualmente con la plantilla PDF original
3. Identifica coordenadas exactas
4. Actualiza `pdf-field-maps.ts`
5. Regenera PDFs de prueba y valida

### 3. Integrar con API
1. Renombra `route.ts.example` a `route.ts`
2. Muévelo a `src/app/api/pdf/generate/`
3. Personaliza según necesidades (autenticación, validación, etc.)
4. Prueba endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/pdf/generate \
     -H "Content-Type: application/json" \
     -d '{"templateType":"pabellon","patientData":{...}}'
   ```

### 4. Agregar Nuevas Plantillas
1. Crea mapeo en `pdf-field-maps.ts`:
   ```typescript
   export const MI_PLANTILLA: TemplateMapping = { ... }
   ```
2. Agrega al índice `TEMPLATE_MAPPINGS`
3. Crea función de conversión `toMiPlantillaData()`
4. Agrega ejemplo en `pdf-examples.ts`
5. Valida y prueba

## Características Destacadas

### 1. Soporte Multi-Página
Los campos pueden especificar en qué página deben aparecer:
```typescript
{
  field: 'firma',
  x: 180,
  y: 200,
  page: 2, // Tercera página (0-indexed)
}
```

### 2. Word Wrap Inteligente
Para textos largos, el sistema automáticamente divide en líneas:
```typescript
{
  field: 'diagnostico',
  x: 120,
  y: 660,
  maxWidth: 400, // Se divide automáticamente
}
```

### 3. Checkboxes Flexibles
Tres tipos de checkboxes:
- Simple (x, y): `{ aceptado: { x: 120, y: 560 } }`
- Booleano: `{ aceptado: true }`
- Múltiples opciones: `{ lateralidad: 'derecha' }`

### 4. Datos Unificados
Interfaz `UnifiedPatientData` permite usar los mismos datos para diferentes plantillas:
```typescript
const data: UnifiedPatientData = { ... };

// Usar para solicitud
const solicitud = toSolicitudPabellonData(data);

// Usar para consentimiento
const consentimiento = toConsentimientoGeneralData(data);
```

### 5. Validación Integrada
Sistema de validación de coordenadas:
- Detecta coordenadas fuera de rango
- Advierte sobre campos muy cerca de bordes
- Valida plantillas completas

### 6. Herramientas de Debugging
- Cuadrícula de coordenadas
- Vista previa de mapeos
- PDFs de prueba con datos de validación

## Dependencias

- **pdf-lib**: ^1.17.1 (ya instalado)
- No requiere dependencias adicionales

## Estructura de Directorios

```
neurodata/
├── src/
│   ├── lib/
│   │   ├── pdf-generator.ts       # Motor principal (actualizado)
│   │   ├── pdf-field-maps.ts      # Mapeos de coordenadas (nuevo)
│   │   ├── pdf-examples.ts        # Ejemplos de uso (nuevo)
│   │   ├── pdf-utils.ts           # Utilidades (nuevo)
│   │   └── PDF_MAPPING_README.md  # Documentación (nuevo)
│   ├── types/
│   │   └── pdf.ts                 # Tipos TypeScript (nuevo)
│   └── app/
│       └── api/
│           └── pdf/
│               └── generate/
│                   └── route.ts.example  # Ejemplo de API (nuevo)
├── scripts/
│   ├── test-pdf-mapping.mjs       # Script de prueba (nuevo)
│   └── generate-test-pdfs.ts      # Generador de PDFs (nuevo)
├── public/
│   └── plantillas/
│       ├── solicitud_de_pabellon__2_.pdf
│       └── cba_consentimiento_general.pdf
├── test-output/                   # PDFs generados (auto-creado)
│   ├── solicitud-test.pdf
│   ├── consentimiento-test.pdf
│   └── solicitud-validacion.pdf
├── package.json                   # Scripts actualizados
└── IMPLEMENTACION_PDF.md          # Este archivo
```

## Troubleshooting

### Error: Template no encontrado
**Solución**: Verifica que los archivos PDF existen en `public/plantillas/` o en la ruta configurada en `TEMPLATES_DIR`.

### Coordenadas incorrectas
**Solución**:
1. Genera cuadrícula: `generateCoordinateGrid()`
2. Compara visualmente con plantilla original
3. Ajusta coordenadas en `pdf-field-maps.ts`
4. Recuerda: Y=0 está abajo, Y=842 está arriba

### Texto cortado
**Solución**: Agrega o aumenta `maxWidth` en el campo para activar word wrap.

### Checkboxes no aparecen
**Solución**: Verifica que el valor coincide exactamente con las opciones definidas (normalización case-insensitive automática).

## Contacto y Soporte

Para soporte o preguntas sobre el sistema de PDFs:
1. Revisa `src/lib/PDF_MAPPING_README.md` para documentación detallada
2. Consulta ejemplos en `src/lib/pdf-examples.ts`
3. Usa herramientas de debugging en `src/lib/pdf-utils.ts`

---

**Versión**: 1.0.0
**Fecha**: 2025-12-23
**Estado**: Implementación completa y funcional
