import React, { useState } from 'react';
import { Button } from '../ui';

export interface AttentionFormData {
  diagnostico: string;
  tratamiento: string;
  indicaciones: string;
  generateReceta: boolean;
  generateCertificado: boolean;
  generateOrdenExamen: boolean;
}

export interface AttentionFormProps {
  onSubmit: (data: AttentionFormData) => void | Promise<void>;
  patientId: string;
  loading?: boolean;
}

export const AttentionForm: React.FC<AttentionFormProps> = ({
  onSubmit,
  patientId,
  loading = false,
}) => {
  const [formData, setFormData] = useState<AttentionFormData>({
    diagnostico: '',
    tratamiento: '',
    indicaciones: '',
    generateReceta: false,
    generateCertificado: false,
    generateOrdenExamen: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AttentionFormData, string>>>({});

  const handleTextChange = (name: keyof Pick<AttentionFormData, 'diagnostico' | 'tratamiento' | 'indicaciones'>) => (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (name: keyof Pick<AttentionFormData, 'generateReceta' | 'generateCertificado' | 'generateOrdenExamen'>) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.checked }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AttentionFormData, string>> = {};

    if (!formData.diagnostico.trim()) {
      newErrors.diagnostico = 'El diagnóstico es obligatorio';
    }

    if (!formData.tratamiento.trim()) {
      newErrors.tratamiento = 'El tratamiento es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Diagnóstico <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.diagnostico}
          onChange={handleTextChange('diagnostico')}
          className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.diagnostico ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={5}
          placeholder="Ingrese el diagnóstico del paciente..."
          required
        />
        {errors.diagnostico && (
          <p className="mt-2 text-base text-red-600 font-medium">{errors.diagnostico}</p>
        )}
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Tratamiento <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.tratamiento}
          onChange={handleTextChange('tratamiento')}
          className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.tratamiento ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={5}
          placeholder="Ingrese el tratamiento prescrito..."
          required
        />
        {errors.tratamiento && (
          <p className="mt-2 text-base text-red-600 font-medium">{errors.tratamiento}</p>
        )}
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Indicaciones
        </label>
        <textarea
          value={formData.indicaciones}
          onChange={handleTextChange('indicaciones')}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          rows={4}
          placeholder="Ingrese indicaciones adicionales para el paciente..."
        />
      </div>

      <div className="border-t-2 border-gray-200 pt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Documentos a Generar
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-4 cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={formData.generateReceta}
              onChange={handleCheckboxChange('generateReceta')}
              className="w-6 h-6 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-lg font-medium text-gray-700">
              Generar Receta Médica
            </span>
          </label>

          <label className="flex items-center gap-4 cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={formData.generateCertificado}
              onChange={handleCheckboxChange('generateCertificado')}
              className="w-6 h-6 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-lg font-medium text-gray-700">
              Generar Certificado Médico
            </span>
          </label>

          <label className="flex items-center gap-4 cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={formData.generateOrdenExamen}
              onChange={handleCheckboxChange('generateOrdenExamen')}
              className="w-6 h-6 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-lg font-medium text-gray-700">
              Generar Orden de Examen
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" variant="primary" loading={loading}>
          Guardar Atención
        </Button>
      </div>
    </form>
  );
};
