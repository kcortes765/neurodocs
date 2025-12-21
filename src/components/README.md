# NeuroDoc UI Components

Componentes de interfaz optimizados para usuarios de edad avanzada con botones grandes, texto legible y espaciado generoso.

## Estructura de Carpetas

```
components/
├── ui/              # Componentes UI base
├── forms/           # Formularios completos
├── layout/          # Componentes de layout
└── index.ts         # Exportaciones centralizadas
```

## Componentes UI Base

### Button
Botón con tres variantes y estado de carga.

```tsx
import { Button } from '@/components/ui';

// Uso básico
<Button variant="primary" onClick={handleClick}>
  Guardar
</Button>

// Con loading
<Button variant="primary" loading={isLoading}>
  Procesando...
</Button>

// Variantes
<Button variant="primary">Primario</Button>
<Button variant="secondary">Secundario</Button>
<Button variant="danger">Peligro</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger'
- `loading`: boolean
- Todas las props de HTMLButtonElement

**Características:**
- Tamaño: px-6 py-3 text-lg (56px altura mínima)
- Spinner animado en estado loading
- Deshabilitado automáticamente durante loading

---

### Input
Input con label integrado, validación y variante para RUT.

```tsx
import { Input } from '@/components/ui';

// Input normal
<Input
  label="Nombre"
  value={nombre}
  onChange={(value) => setNombre(value)}
  error={errors.nombre}
  placeholder="Ingrese nombre"
/>

// Input para RUT (formato automático)
<Input
  label="RUT"
  variant="rut"
  value={rut}
  onChange={(value) => setRut(value)}
  error={errors.rut}
/>
```

**Props:**
- `label`: string (requerido)
- `error`: string (opcional)
- `variant`: 'text' | 'rut'
- `onChange`: (value: string) => void
- Todas las props de HTMLInputElement (excepto onChange nativo)

**Características:**
- Tamaño: text-lg, p-3
- Formato automático de RUT (12.345.678-9)
- Visualización de errores
- Border rojo cuando hay error

---

### Select
Dropdown con opciones grandes y claras.

```tsx
import { Select } from '@/components/ui';

const previsionOptions = [
  { value: 'FONASA', label: 'FONASA' },
  { value: 'ISAPRE', label: 'ISAPRE' },
];

<Select
  label="Previsión"
  options={previsionOptions}
  value={prevision}
  onChange={(value) => setPrevision(value)}
  error={errors.prevision}
/>
```

**Props:**
- `label`: string (requerido)
- `options`: SelectOption[] (requerido)
- `error`: string (opcional)
- `onChange`: (value: string) => void
- Todas las props de HTMLSelectElement

**Características:**
- Tamaño: text-lg, p-3
- Icono de dropdown personalizado
- Opción por defecto: "Seleccione una opción"

---

### Card
Contenedor con sombra y padding generoso.

```tsx
import { Card } from '@/components/ui';

<Card title="Datos del Paciente">
  {/* Contenido */}
</Card>

// Sin título
<Card>
  {/* Contenido */}
</Card>
```

**Props:**
- `title`: string (opcional)
- `className`: string (opcional)
- `children`: ReactNode

**Características:**
- Padding: p-8
- Sombra: shadow-lg
- Border radius: rounded-xl

---

### SearchInput
Input de búsqueda con icono de lupa.

```tsx
import { SearchInput } from '@/components/ui';

<SearchInput
  label="Buscar paciente"
  onChange={(value) => setSearchTerm(value)}
  placeholder="Ingrese nombre o RUT..."
/>
```

**Props:**
- `label`: string (opcional, default: "Buscar paciente")
- `onChange`: (value: string) => void
- Todas las props de HTMLInputElement

**Características:**
- Icono de lupa a la izquierda
- Tamaño: text-lg, py-3

---

## Formularios

### PatientForm
Formulario completo para crear/editar pacientes.

```tsx
import { PatientForm } from '@/components/forms';

<PatientForm
  onSubmit={handleSubmit}
  initialData={existingPatient}  // Opcional para edición
  submitLabel="Actualizar Paciente"  // Opcional
  loading={isSubmitting}
/>
```

**Props:**
- `onSubmit`: (data: PatientFormData) => void | Promise<void>
- `initialData`: Partial<PatientFormData> (opcional)
- `submitLabel`: string (opcional, default: "Guardar Paciente")
- `loading`: boolean (opcional)

**PatientFormData:**
```typescript
{
  nombre: string;
  rut: string;
  fechaNacimiento: string;
  prevision: 'FONASA' | 'ISAPRE' | 'PARTICULAR';
  isapreNombre?: string;  // Solo si prevision === 'ISAPRE'
  antecedentes?: string;
}
```

**Características:**
- Validación integrada de RUT chileno
- Campo ISAPRE condicional (aparece solo si prevision === 'ISAPRE')
- Validación de fecha de nacimiento (no puede ser futura)
- Mensajes de error en tiempo real
- Layout responsive (grid 2 columnas en desktop)

---

### AttentionForm
Formulario para registrar atención médica.

```tsx
import { AttentionForm } from '@/components/forms';

<AttentionForm
  patientId={patient.id}
  onSubmit={handleSubmit}
  loading={isSubmitting}
/>
```

**Props:**
- `patientId`: string (requerido)
- `onSubmit`: (data: AttentionFormData) => void | Promise<void>
- `loading`: boolean (opcional)

**AttentionFormData:**
```typescript
{
  diagnostico: string;
  tratamiento: string;
  indicaciones: string;
  generateReceta: boolean;
  generateCertificado: boolean;
  generateOrdenExamen: boolean;
}
```

**Características:**
- Campos de texto grande para diagnóstico, tratamiento e indicaciones
- Checkboxes grandes para seleccionar documentos a generar
- Validación de campos requeridos (diagnóstico y tratamiento)

---

## Layout

### Header
Cabecera de la aplicación con logo, selector de clínica y logout.

```tsx
import { Header } from '@/components/layout';

const clinicas = [
  { id: '1', nombre: 'Clínica Las Condes' },
  { id: '2', nombre: 'Clínica Alemana' },
];

<Header
  clinicas={clinicas}
  selectedClinicaId={currentClinicaId}
  onClinicaChange={(id) => setCurrentClinicaId(id)}
  onLogout={handleLogout}
  userName="Dr. Juan Pérez"
/>
```

**Props:**
- `clinicas`: Clinica[] (requerido)
- `selectedClinicaId`: string (opcional)
- `onClinicaChange`: (clinicaId: string) => void
- `onLogout`: () => void
- `userName`: string (opcional)

**Clinica:**
```typescript
{
  id: string;
  nombre: string;
}
```

**Características:**
- Logo "NeuroDoc" con icono
- Selector de clínica centrado
- Información de usuario y botón de logout a la derecha
- Altura fija: 80px (h-20)
- Border azul en la parte inferior

---

## Importación Centralizada

Todos los componentes se pueden importar desde el index principal:

```tsx
// Importar todo
import {
  Button,
  Input,
  Select,
  Card,
  SearchInput,
  PatientForm,
  AttentionForm,
  Header
} from '@/components';

// O importar individualmente
import { Button } from '@/components/ui';
import { PatientForm } from '@/components/forms';
import { Header } from '@/components/layout';
```

---

## Ejemplo de Uso Completo

```tsx
'use client';

import { useState } from 'react';
import { Card, PatientForm, PatientFormData } from '@/components';

export default function NewPatientPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: PatientFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Redirigir o mostrar mensaje de éxito
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card title="Nuevo Paciente">
        <PatientForm
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Card>
    </div>
  );
}
```

---

## Notas de Accesibilidad

Todos los componentes están optimizados para usuarios de edad avanzada:

- **Tamaño de texto**: Mínimo 18px (text-lg)
- **Botones**: Altura mínima de 56px para fácil interacción
- **Espaciado**: Generoso entre elementos (gap-4, gap-6)
- **Contraste**: Colores con alto contraste para mejor legibilidad
- **Focus states**: Indicadores visuales claros al navegar con teclado
- **Labels**: Siempre visibles y descriptivos
- **Errores**: Mensajes claros y en rojo para fácil identificación

---

## Validación de RUT

El componente Input con variant="rut" incluye validación completa:

- Formato automático mientras se escribe (12.345.678-9)
- Validación de dígito verificador
- El valor devuelto en onChange está limpio (sin puntos ni guión)
- Función de validación disponible en PatientForm.tsx

## Estilos Tailwind

Todos los componentes usan Tailwind CSS v4. Asegúrate de tener configurado:

```json
// package.json
{
  "devDependencies": {
    "tailwindcss": "^4"
  }
}
```
