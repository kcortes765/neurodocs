# Guía Rápida - Sistema de Mapeo PDF

## Inicio Rápido en 3 Pasos

### 1. Verificar Instalación
```bash
npm run pdf:test
```

### 2. Generar PDFs de Prueba
```bash
npm run pdf:generate
```
Los PDFs se guardarán en `test-output/`

### 3. Usar en tu Código

```typescript
import { generateDocumentFromMapping } from '@/lib/pdf-generator';
import { SOLICITUD_PABELLON_BUPA, toSolicitudPabellonData } from '@/lib/pdf-field-maps';

// 1. Preparar datos
const patientData = {
  nombreCompleto: 'Juan Pérez',
  rut: '12.345.678-9',
  diagnostico: 'Hernia inguinal',
  cirugiaPropuesta: 'Hernioplastia',
  cirujano: 'Dr. Silva',
  // ... más campos
};

// 2. Convertir a formato de plantilla
const { text, checkboxes } = toSolicitudPabellonData(patientData);

// 3. Generar PDF
const pdfBytes = await generateDocumentFromMapping(
  'solicitud_de_pabellon__2_.pdf',
  SOLICITUD_PABELLON_BUPA,
  text,
  checkboxes
);

// 4. Usar el PDF (enviar, guardar, etc.)
// pdfBytes es un Uint8Array listo para usar
```

## Plantillas Disponibles

### Solicitud de Pabellón
```typescript
import { SOLICITUD_PABELLON_BUPA, toSolicitudPabellonData } from '@/lib/pdf-field-maps';
```
**Campos**: nombre, RUT, diagnóstico, cirugía, equipo médico, etc.
**Checkboxes**: lateralidad, alergias, biopsia, rayos X, convenio

### Consentimiento General
```typescript
import { CONSENTIMIENTO_GENERAL_BUPA, toConsentimientoGeneralData } from '@/lib/pdf-field-maps';
```
**Campos**: nombre, RUT, diagnóstico, procedimiento, médico responsable
**Páginas**: 3 (campos en página 1 y 3)

## Comandos Útiles

```bash
# Verificar sistema
npm run pdf:test

# Generar PDFs de prueba
npm run pdf:generate

# Ver PDFs generados
cd test-output
# Abre solicitud-test.pdf, consentimiento-test.pdf, etc.
```

## Ejemplos de Uso

### Ejemplo 1: API Endpoint
```typescript
// app/api/pdf/solicitud/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateDocumentFromMapping } from '@/lib/pdf-generator';
import { SOLICITUD_PABELLON_BUPA, toSolicitudPabellonData } from '@/lib/pdf-field-maps';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { text, checkboxes } = toSolicitudPabellonData(body);

  const pdfBytes = await generateDocumentFromMapping(
    'solicitud_de_pabellon__2_.pdf',
    SOLICITUD_PABELLON_BUPA,
    text,
    checkboxes
  );

  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="solicitud.pdf"',
    },
  });
}
```

### Ejemplo 2: Server Action
```typescript
// app/actions/generate-pdf.ts
'use server'

import { generateDocumentFromMapping } from '@/lib/pdf-generator';
import { SOLICITUD_PABELLON_BUPA, toSolicitudPabellonData } from '@/lib/pdf-field-maps';

export async function generateSolicitudPdf(data: any) {
  const { text, checkboxes } = toSolicitudPabellonData(data);

  const pdfBytes = await generateDocumentFromMapping(
    'solicitud_de_pabellon__2_.pdf',
    SOLICITUD_PABELLON_BUPA,
    text,
    checkboxes
  );

  // Retornar base64 para usar en cliente
  return Buffer.from(pdfBytes).toString('base64');
}
```

### Ejemplo 3: Componente React
```typescript
// app/components/GeneratePdfButton.tsx
'use client'

import { useState } from 'react';

export function GeneratePdfButton({ patientData }: { patientData: any }) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pdf/solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Descargar PDF
      const a = document.createElement('a');
      a.href = url;
      a.download = 'solicitud.pdf';
      a.click();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleGenerate} disabled={loading}>
      {loading ? 'Generando...' : 'Generar Solicitud PDF'}
    </button>
  );
}
```

## Ajustar Coordenadas

Si los campos no aparecen en la posición correcta:

### 1. Generar Cuadrícula
```typescript
import { generateCoordinateGrid, savePdfToFile } from '@/lib/pdf-utils';

const grid = await generateCoordinateGrid();
await savePdfToFile(grid, 'grid.pdf');
```

### 2. Identificar Coordenadas Correctas
1. Abre `grid.pdf`
2. Superpón visualmente con tu plantilla PDF
3. Lee las coordenadas X,Y donde debería aparecer cada campo

### 3. Actualizar Mapeo
```typescript
// src/lib/pdf-field-maps.ts

export const SOLICITUD_PABELLON_BUPA: TemplateMapping = {
  text: [
    {
      field: 'nombrePaciente',
      x: 120,  // ← Ajustar aquí
      y: 760,  // ← Ajustar aquí
      fontSize: 10,
    },
    // ... más campos
  ],
};
```

### 4. Validar
```bash
npm run pdf:generate
# Revisar test-output/solicitud-test.pdf
```

## Sistema de Coordenadas

```
(0, 842) ────────────── (595, 842)   ← Arriba
   │                         │
   │      Página A4          │
   │    595 x 842 pts        │
   │                         │
(0, 0) ──────────────── (595, 0)     ← Abajo
```

**Recordar**: Y aumenta hacia ARRIBA (al revés de lo intuitivo)

**Convertir desde "distancia desde arriba"**:
```typescript
Y_pdf = 842 - distancia_desde_arriba

// Ejemplo: campo a 100px desde arriba
Y_pdf = 842 - 100 = 742
```

## Campos Comunes

### Datos del Paciente
```typescript
{
  nombreCompleto: 'Juan Pérez González',
  rut: '12.345.678-9',           // Se puede formatear con formatRut()
  fechaNacimiento: '15/03/1985', // Formato DD/MM/YYYY
  telefono: '+56 9 1234 5678',   // Se puede formatear con formatPhoneCL()
  edad: 39,
}
```

### Datos Médicos
```typescript
{
  diagnostico: 'Hernia inguinal derecha',
  cirugiaPropuesta: 'Hernioplastia laparoscópica',
  procedimiento: 'Hernioplastia',
  cirujano: 'Dr. Roberto Silva',
  medicoResponsable: 'Dr. Roberto Silva',
}
```

### Checkboxes
```typescript
{
  lateralidad: 'derecha',        // 'derecha' | 'izquierda' | 'bilateral' | 'no aplica'
  alergiasLatex: 'no',           // 'si' | 'no'
  biopsia: 'no',                 // 'no' | 'si' | 'diferida' | 'rapida'
  rayosX: 'no',                  // 'si' | 'no'
  convenio: 'PAD',               // 'PAD' | 'GES' | 'CAE' | 'SIP' | 'LIBRE ELECCION'
}
```

## Utilidades Disponibles

### Formateo
```typescript
import { formatRut, formatDateCL, formatPhoneCL } from '@/lib/pdf-utils';

formatRut('123456789');              // '12.345.678-9'
formatDateCL(new Date());            // '23/12/2025'
formatPhoneCL('912345678');          // '+56 9 1234 5678'
```

### Validación
```typescript
import { validateRut, validateTemplateMapping } from '@/lib/pdf-utils';

validateRut('12.345.678-9');         // true/false

const validation = validateTemplateMapping(SOLICITUD_PABELLON_BUPA);
console.log(validation.valid);       // true/false
console.log(validation.errors);      // ['error1', 'error2', ...]
console.log(validation.warnings);    // ['warning1', ...]
```

### Debugging
```typescript
import { generateMappingPreview } from '@/lib/pdf-utils';

// Genera PDF mostrando dónde aparecerá cada campo
const preview = await generateMappingPreview(SOLICITUD_PABELLON_BUPA);
await savePdfToFile(preview, 'preview.pdf');
```

## Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| Template no encontrado | Verifica `public/plantillas/` o `C:\Seba\NeoData\plantillas` |
| Campos mal posicionados | Genera cuadrícula y ajusta coordenadas en `pdf-field-maps.ts` |
| Texto cortado | Agrega `maxWidth` al campo |
| Checkbox no aparece | Verifica que el valor coincida con las opciones |
| PDF en blanco | Verifica que los datos no estén vacíos |

## Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `src/lib/pdf-generator.ts` | Motor de generación |
| `src/lib/pdf-field-maps.ts` | **AQUÍ se ajustan coordenadas** |
| `src/lib/pdf-examples.ts` | Ejemplos de uso |
| `src/lib/pdf-utils.ts` | Utilidades y formateo |
| `src/lib/PDF_MAPPING_README.md` | Documentación completa |
| `IMPLEMENTACION_PDF.md` | Resumen técnico |

## Documentación Completa

Para información detallada, consulta:
- **`src/lib/PDF_MAPPING_README.md`** - Documentación completa
- **`IMPLEMENTACION_PDF.md`** - Resumen de implementación

## Soporte

1. Revisa ejemplos en `src/lib/pdf-examples.ts`
2. Usa herramientas de debugging en `src/lib/pdf-utils.ts`
3. Consulta documentación completa en `PDF_MAPPING_README.md`

---

**¿Preguntas?** Consulta la documentación completa o revisa los ejemplos.
