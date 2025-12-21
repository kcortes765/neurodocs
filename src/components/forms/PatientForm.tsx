import React, { useState, useEffect } from 'react';
import { Input, Select, Button, SelectOption } from '../ui';

export interface PatientFormData {
  nombre: string;
  rut: string;
  fechaNacimiento: string;
  prevision: string;
  isapreNombre?: string;
  antecedentes?: string;
}

export interface PatientFormProps {
  onSubmit: (data: PatientFormData) => void | Promise<void>;
  initialData?: Partial<PatientFormData>;
  submitLabel?: string;
  loading?: boolean;
}

const previsionOptions: SelectOption[] = [
  { value: 'FONASA', label: 'FONASA' },
  { value: 'ISAPRE', label: 'ISAPRE' },
  { value: 'PARTICULAR', label: 'PARTICULAR' },
];

const validateRut = (rut: string): boolean => {
  // Remove formatting
  const cleaned = rut.replace(/[^0-9kK]/g, '');

  if (cleaned.length < 2) return false;

  const body = cleaned.slice(0, -1);
  const verifier = cleaned.slice(-1).toUpperCase();

  // Calculate verifier
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedVerifier = 11 - (sum % 11);
  const calculatedVerifier =
    expectedVerifier === 11 ? '0' : expectedVerifier === 10 ? 'K' : String(expectedVerifier);

  return calculatedVerifier === verifier;
};

export const PatientForm: React.FC<PatientFormProps> = ({
  onSubmit,
  initialData = {},
  submitLabel = 'Guardar Paciente',
  loading = false,
}) => {
  const [formData, setFormData] = useState<PatientFormData>({
    nombre: initialData.nombre || '',
    rut: initialData.rut || '',
    fechaNacimiento: initialData.fechaNacimiento || '',
    prevision: initialData.prevision || '',
    isapreNombre: initialData.isapreNombre || '',
    antecedentes: initialData.antecedentes || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof PatientFormData, boolean>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        rut: initialData.rut || '',
        fechaNacimiento: initialData.fechaNacimiento || '',
        prevision: initialData.prevision || '',
        isapreNombre: initialData.isapreNombre || '',
        antecedentes: initialData.antecedentes || '',
      });
    }
  }, [initialData]);

  const validateField = (name: keyof PatientFormData, value: string): string => {
    switch (name) {
      case 'nombre':
        return value.trim().length < 3 ? 'El nombre debe tener al menos 3 caracteres' : '';
      case 'rut':
        if (!value) return 'El RUT es obligatorio';
        return !validateRut(value) ? 'RUT inválido' : '';
      case 'fechaNacimiento':
        if (!value) return 'La fecha de nacimiento es obligatoria';
        const date = new Date(value);
        const today = new Date();
        if (date > today) return 'La fecha no puede ser futura';
        return '';
      case 'prevision':
        return !value ? 'La previsión es obligatoria' : '';
      case 'isapreNombre':
        return formData.prevision === 'ISAPRE' && !value.trim()
          ? 'El nombre de la ISAPRE es obligatorio'
          : '';
      default:
        return '';
    }
  };

  const handleChange = (name: keyof PatientFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: keyof PatientFormData) => () => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name] || '');
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Partial<Record<keyof PatientFormData, string>> = {};
    const fields: (keyof PatientFormData)[] = [
      'nombre',
      'rut',
      'fechaNacimiento',
      'prevision',
      'isapreNombre',
    ];

    fields.forEach((field) => {
      const error = validateField(field, formData[field] || '');
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({
      nombre: true,
      rut: true,
      fechaNacimiento: true,
      prevision: true,
      isapreNombre: true,
    });

    if (Object.keys(newErrors).length === 0) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nombre Completo"
          value={formData.nombre}
          onChange={handleChange('nombre')}
          onBlur={handleBlur('nombre')}
          error={touched.nombre ? errors.nombre : undefined}
          placeholder="Ej: Juan Pérez González"
          required
        />

        <Input
          label="RUT"
          variant="rut"
          value={formData.rut}
          onChange={handleChange('rut')}
          onBlur={handleBlur('rut')}
          error={touched.rut ? errors.rut : undefined}
          placeholder="Ej: 12.345.678-9"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Fecha de Nacimiento"
          type="date"
          value={formData.fechaNacimiento}
          onChange={handleChange('fechaNacimiento')}
          onBlur={handleBlur('fechaNacimiento')}
          error={touched.fechaNacimiento ? errors.fechaNacimiento : undefined}
          required
        />

        <Select
          label="Previsión"
          options={previsionOptions}
          value={formData.prevision}
          onChange={handleChange('prevision')}
          onBlur={handleBlur('prevision')}
          error={touched.prevision ? errors.prevision : undefined}
          required
        />
      </div>

      {formData.prevision === 'ISAPRE' && (
        <Input
          label="Nombre de ISAPRE"
          value={formData.isapreNombre}
          onChange={handleChange('isapreNombre')}
          onBlur={handleBlur('isapreNombre')}
          error={touched.isapreNombre ? errors.isapreNombre : undefined}
          placeholder="Ej: Banmédica, Consalud, etc."
          required
        />
      )}

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Antecedentes Médicos
        </label>
        <textarea
          value={formData.antecedentes}
          onChange={(e) => handleChange('antecedentes')(e.target.value)}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          rows={4}
          placeholder="Ingrese antecedentes médicos relevantes..."
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" variant="primary" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
