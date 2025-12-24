# Sistema de Mapeo de Coordenadas PDF

Sistema completo para inyectar datos en plantillas PDF usando coordenadas X,Y.

## Estructura de Archivos

```
src/lib/
├── pdf-generator.ts      # Motor principal de generación de PDFs
├── pdf-field-maps.ts     # Mapeos de coordenadas para cada plantilla
├── pdf-examples.ts       # Ejemplos de uso
└── PDF_MAPPING_README.md # Esta documentación
```

## Plantillas Mapeadas

### 1. Solicitud de Pabellón - Clínica Bupa Antofagasta
**Archivo**: `solicitud_de_pabellon__2_.pdf`

**Campos de texto**:
- Datos del paciente: nombre, RUT, fecha nacimiento, teléfono
- Datos de cirugía: fecha, horario, diagnóstico, cirugía propuesta, código, duración
- Equipo médico: cirujano, ayudante, anestesista, arsenalera
- Previsión y datos clínicos

**Checkboxes**:
- Lateralidad: Derecha | Izquierda | Bilateral | No aplica
- Alergias látex: SI | NO
- Biopsia: NO | SI | Diferida | Rápida
- Rayos X: SI | NO
- Convenio: PAD | GES | CAE | SIP | LIBRE ELECCIÓN

### 2. Consentimiento General - Clínica Bupa Antofagasta
**Archivo**: `cba_consentimiento_general.pdf` (3 páginas)

**Campos de texto** (Página 1):
- Nombre paciente, apellidos, RUT, edad, fecha nacimiento
- Diagnóstico
- Procedimiento

**Campos de texto** (Página 3):
- Nombre y apellidos autorización
- RUT autorización
- Médico responsable (nombre y RUT)
- Fecha consentimiento

## Uso Básico

### Importar Módulos

```typescript
import {
  generateDocumentFromMapping,
  savePdfToFile,
} from './lib/pdf-generator';
import {
  SOLICITUD_PABELLON_BUPA,
  CONSENTIMIENTO_GENERAL_BUPA,
  UnifiedPatientData,
  toSolicitudPabellonData,
  toConsentimientoGeneralData,
} from './lib/pdf-field-maps';
```

### Ejemplo 1: Generar Solicitud de Pabellón

```typescript
const patientData: UnifiedPatientData = {
  nombreCompleto: 'Juan Pérez González',
  rut: '12.345.678-9',
  fechaNacimiento: '15/03/1985',
  telefono: '+56 9 8765 4321',
  diagnostico: 'Hernia inguinal derecha',
  cirugiaPropuesta: 'Hernioplastia laparoscópica',
  fechaSolicitada: '25/12/2025',
  cirujano: 'Dr. Roberto Silva',
  prevision: 'FONASA',
  lateralidad: 'derecha',
  alergiasLatex: 'no',
  biopsia: 'no',
  rayosX: 'no',
};

// Convertir datos
const { text, checkboxes } = toSolicitudPabellonData(patientData);

// Generar PDF
const pdfBytes = await generateDocumentFromMapping(
  'solicitud_de_pabellon__2_.pdf',
  SOLICITUD_PABELLON_BUPA,
  text,
  checkboxes
);

// Guardar (opcional)
await savePdfToFile(pdfBytes, 'solicitud.pdf');
```

### Ejemplo 2: Generar Consentimiento General

```typescript
const patientData: UnifiedPatientData = {
  nombre: 'Juan',
  apellidos: 'Pérez González',
  rut: '12.345.678-9',
  edad: 39,
  fechaNacimiento: '15/03/1985',
  diagnostico: 'Hernia inguinal derecha',
  procedimiento: 'Hernioplastia laparoscópica',
  medicoResponsable: 'Dr. Roberto Silva',
  medicoResponsableRut: '9.876.543-2',
  fecha: '25/12/2025',
};

const { text, checkboxes } = toConsentimientoGeneralData(patientData);

const pdfBytes = await generateDocumentFromMapping(
  'cba_consentimiento_general.pdf',
  CONSENTIMIENTO_GENERAL_BUPA,
  text,
  checkboxes
);
```

## Sistema de Coordenadas

Los PDFs usan un sistema de coordenadas con **origen en la esquina inferior izquierda**:

```
(0, 842) ────────────── (595, 842)   ← Arriba
   │                         │
   │      Página A4          │
   │    595 x 842 pts        │
   │                         │
(0, 0) ──────────────── (595, 0)     ← Abajo
```

- **X**: 0 (izquierda) → 595 (derecha)
- **Y**: 0 (abajo) → 842 (arriba)

### Conversión desde "distancia desde arriba"

```typescript
Y_pdf = 842 - distancia_desde_arriba
```

Ejemplo:
- 80px desde arriba → Y = 842 - 80 = 762
- 200px desde arriba → Y = 842 - 200 = 642

## Agregar Nueva Plantilla

### Paso 1: Crear el mapeo en `pdf-field-maps.ts`

```typescript
export const MI_NUEVA_PLANTILLA: TemplateMapping = {
  text: [
    {
      field: 'nombrePaciente',
      x: 120,
      y: 760,
      fontSize: 10,
      maxWidth: 250,
      page: 0, // Primera página (0-indexed)
    },
    // ... más campos
  ],
  checkboxes: {
    opcion: {
      si: { x: 120, y: 560 },
      no: { x: 180, y: 560 },
    },
  },
};
```

### Paso 2: Agregar al índice

```typescript
export const TEMPLATE_MAPPINGS: Record<string, TemplateMapping> = {
  // ... plantillas existentes
  'mi_plantilla.pdf': MI_NUEVA_PLANTILLA,
};
```

### Paso 3: Crear función de conversión

```typescript
export function toMiPlantillaData(data: UnifiedPatientData): {
  text: Record<string, string>;
  checkboxes: Record<string, string | boolean>;
} {
  return {
    text: {
      nombrePaciente: data.nombreCompleto || '',
      // ... mapear campos
    },
    checkboxes: {
      // ... mapear checkboxes
    },
  };
}
```

## Ajustar Coordenadas

Para encontrar las coordenadas correctas:

1. **Inspeccionar PDF visualmente**:
   - Medir distancias aproximadas desde bordes
   - Márgenes típicos: 50-80 pts

2. **Usar función de prueba**:
   ```typescript
   import { generarPdfPrueba } from './lib/pdf-examples';

   const pdfBytes = await generarPdfPrueba();
   await savePdfToFile(pdfBytes, 'test.pdf');
   ```

3. **Ajustar iterativamente**:
   - Generar PDF de prueba
   - Revisar visualmente
   - Ajustar coordenadas
   - Repetir hasta obtener posición correcta

4. **Tips de ajuste**:
   - X izquierda típica: 100-150
   - X derecha típica: 350-450
   - Y arriba (760+): ~80px desde arriba
   - Y medio (400-500): centro del documento
   - fontSize estándar: 10-12

## Configuración de Fuentes

### Fuentes disponibles (pdf-lib StandardFonts)

```typescript
- Helvetica (regular)
- HelveticaBold
- HelveticaOblique
- HelveticaBoldOblique
- TimesRoman
- TimesRomanBold
- TimesRomanItalic
- TimesRomanBoldItalic
- Courier
- CourierBold
- CourierOblique
- CourierBoldOblique
```

Para cambiar la fuente, modificar en `pdf-generator.ts`:

```typescript
const font = await pdf.embedFont(StandardFonts.HelveticaBold);
```

## Word Wrap / Texto Largo

Para textos largos, usar `maxWidth`:

```typescript
{
  field: 'diagnostico',
  x: 120,
  y: 660,
  fontSize: 9,
  maxWidth: 400, // El texto se dividirá en múltiples líneas
}
```

El sistema automáticamente:
- Divide el texto en palabras
- Calcula el ancho de cada línea
- Crea nuevas líneas cuando excede maxWidth
- Ajusta el espaciado (fontSize + 2pts)

## Múltiples Páginas

Para PDFs con múltiples páginas, especificar el número de página (0-indexed):

```typescript
{
  field: 'campoEnPagina3',
  x: 180,
  y: 400,
  fontSize: 11,
  page: 2, // Tercera página (0, 1, 2)
}
```

## Checkboxes

### Checkbox Simple (SI/NO)

```typescript
checkboxes: {
  alergiasLatex: {
    si: { x: 120, y: 560 },
    no: { x: 180, y: 560 },
  },
}

// Uso:
checkboxData = { alergiasLatex: 'si' }
```

### Checkbox con Múltiples Opciones

```typescript
checkboxes: {
  lateralidad: {
    derecha: { x: 120, y: 580 },
    izquierda: { x: 200, y: 580 },
    bilateral: { x: 280, y: 580 },
    'no aplica': { x: 360, y: 580 },
  },
}

// Uso:
checkboxData = { lateralidad: 'bilateral' }
```

### Checkbox Booleano

```typescript
checkboxes: {
  consentimientoFirmado: { x: 120, y: 300 },
}

// Uso:
checkboxData = { consentimientoFirmado: true }
```

## Integración con API

### Endpoint Next.js (App Router)

```typescript
// app/api/pdf/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateDocumentFromMapping } from '@/lib/pdf-generator';
import { SOLICITUD_PABELLON_BUPA, toSolicitudPabellonData } from '@/lib/pdf-field-maps';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, checkboxes } = toSolicitudPabellonData(body.patientData);

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
  } catch (error) {
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 });
  }
}
```

### Endpoint Next.js (Pages Router)

```typescript
// pages/api/pdf/generate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateDocumentFromMapping } from '@/lib/pdf-generator';
import { SOLICITUD_PABELLON_BUPA, toSolicitudPabellonData } from '@/lib/pdf-field-maps';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, checkboxes } = toSolicitudPabellonData(req.body.patientData);

    const pdfBytes = await generateDocumentFromMapping(
      'solicitud_de_pabellon__2_.pdf',
      SOLICITUD_PABELLON_BUPA,
      text,
      checkboxes
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="solicitud.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ error: 'Error generando PDF' });
  }
}
```

## Testing

### Script de Prueba

```typescript
// scripts/test-pdf.ts
import { generarYGuardarSolicitud, generarYGuardarConsentimiento } from '@/lib/pdf-examples';
import path from 'path';

async function main() {
  const outputDir = path.join(process.cwd(), 'test-output');

  await generarYGuardarSolicitud(path.join(outputDir, 'solicitud-test.pdf'));
  await generarYGuardarConsentimiento(path.join(outputDir, 'consentimiento-test.pdf'));

  console.log('PDFs de prueba generados en:', outputDir);
}

main().catch(console.error);
```

## Solución de Problemas

### Error: Template no encontrado

**Causa**: El archivo PDF no está en las rutas esperadas.

**Solución**:
1. Verificar que el archivo existe en `public/plantillas/`
2. Verificar el nombre exacto del archivo (case-sensitive)
3. Verificar variable de entorno `TEMPLATES_DIR` si se usa

### Coordenadas incorrectas / Texto fuera de lugar

**Solución**:
1. Recordar que Y=0 está abajo, Y=842 está arriba
2. Usar fórmula: `Y = 842 - distancia_desde_arriba`
3. Ajustar iterativamente con PDFs de prueba

### Texto cortado / No se ve completo

**Solución**:
1. Agregar o aumentar `maxWidth` para word wrap
2. Reducir `fontSize` si es muy grande
3. Verificar que hay suficiente espacio vertical

### Checkboxes no aparecen

**Solución**:
1. Verificar que el valor coincide exactamente con las opciones
2. Normalización de claves (case-insensitive): 'SI' = 'si' = 'Si'
3. Verificar coordenadas X,Y del checkbox

## Recursos

- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [PDF Coordinate System](https://pdf-lib.js.org/docs/api/classes/pdfdocument)
- Tamaño A4: 595 x 842 puntos (8.27 x 11.69 pulgadas)

## Contacto / Soporte

Para agregar nuevas plantillas o ajustar coordenadas, modificar:
- `src/lib/pdf-field-maps.ts` - Definir coordenadas
- `src/lib/pdf-examples.ts` - Agregar ejemplos de uso
