import React, { useMemo, useState } from 'react'
import { Button, Input, Select, Toggle } from '../ui'

export interface SurgicalEventFormData {
  fechaCirugia: string
  diagnostico: string
  codigoCie10: string
  procedimientoId: string
  lateralidad: string
  alergiaLatex: boolean
  requiereBiopsia: boolean
  requiereRayos: boolean
  cirujanoId: string
  anestesistaId: string
  arsenaleraId: string
  ayudante1Id: string
  ayudante2Id: string
  riesgosDescripcion: string
  generarPam: boolean
  generarPabellon: boolean
  generarConsentimiento: boolean
}

export interface EquipoMedicoOption {
  id: string
  nombre: string
  rol: string
}

export interface ProcedimientoOption {
  id: string
  codigoFonasa: string
  descripcion: string
}

export interface SurgicalEventFormProps {
  procedimientos: ProcedimientoOption[]
  equipoMedico: EquipoMedicoOption[]
  onSubmit: (data: SurgicalEventFormData) => void | Promise<void>
  loading?: boolean
}

const lateralidadOptions = [
  { value: 'izquierda', label: 'Izquierda' },
  { value: 'derecha', label: 'Derecha' },
  { value: 'bilateral', label: 'Bilateral' },
]

export const SurgicalEventForm: React.FC<SurgicalEventFormProps> = ({
  procedimientos,
  equipoMedico,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<SurgicalEventFormData>({
    fechaCirugia: '',
    diagnostico: '',
    codigoCie10: '',
    procedimientoId: '',
    lateralidad: '',
    alergiaLatex: false,
    requiereBiopsia: false,
    requiereRayos: false,
    cirujanoId: '',
    anestesistaId: '',
    arsenaleraId: '',
    ayudante1Id: '',
    ayudante2Id: '',
    riesgosDescripcion: '',
    generarPam: true,
    generarPabellon: true,
    generarConsentimiento: true,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof SurgicalEventFormData, string>>>({})

  const procedimientosOptions = useMemo(
    () =>
      procedimientos.map((p) => ({
        value: p.id,
        label: `${p.codigoFonasa} - ${p.descripcion}`,
      })),
    [procedimientos]
  )

  const equipoOptions = (rol: string) =>
    equipoMedico
      .filter((m) => m.rol === rol)
      .map((m) => ({ value: m.id, label: m.nombre }))

  const handleChange = (name: keyof SurgicalEventFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleToggle = (name: keyof SurgicalEventFormData) => (value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof SurgicalEventFormData, string>> = {}

    if (!formData.fechaCirugia) {
      nextErrors.fechaCirugia = 'La fecha es obligatoria'
    }
    if (!formData.diagnostico.trim()) {
      nextErrors.diagnostico = 'El diagnostico es obligatorio'
    }
    if (formData.generarConsentimiento && !formData.riesgosDescripcion.trim()) {
      nextErrors.riesgosDescripcion = 'Describe riesgos y complicaciones'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      await onSubmit(formData)
    }
  }

  const riesgosLength = formData.riesgosDescripcion.trim().length
  const riesgosWarning = formData.generarConsentimiento && riesgosLength > 0 && riesgosLength < 100

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-800">Datos de la cirugia</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Fecha de cirugia"
            type="date"
            value={formData.fechaCirugia}
            onChange={handleChange('fechaCirugia')}
            error={errors.fechaCirugia}
            required
          />
          <Input
            label="Codigo CIE-10"
            value={formData.codigoCie10}
            onChange={handleChange('codigoCie10')}
            placeholder="Ej: G44.1"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Diagnostico <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.diagnostico}
            onChange={(e) => handleChange('diagnostico')(e.target.value)}
            className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.diagnostico ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={4}
            placeholder="Diagnostico principal..."
            required
          />
          {errors.diagnostico && (
            <p className="mt-2 text-base text-red-600 font-medium">{errors.diagnostico}</p>
          )}
        </div>

        <Select
          label="Procedimiento"
          options={procedimientosOptions}
          value={formData.procedimientoId}
          onChange={handleChange('procedimientoId')}
        />

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            Lateralidad
          </label>
          <div className="flex flex-wrap gap-3">
            {lateralidadOptions.map((option) => {
              const active = formData.lateralidad === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('lateralidad')(option.value)}
                  className={`px-4 py-2 text-lg rounded-full border-2 transition-all ${
                    active
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                  aria-pressed={active}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t-2 border-gray-100 pt-6">
        <h3 className="text-xl font-bold text-gray-800">Opciones clinicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Toggle
            label="Alergia latex"
            checked={formData.alergiaLatex}
            onChange={handleToggle('alergiaLatex')}
          />
          <Toggle
            label="Requiere biopsia"
            checked={formData.requiereBiopsia}
            onChange={handleToggle('requiereBiopsia')}
          />
          <Toggle
            label="Requiere rayos X"
            checked={formData.requiereRayos}
            onChange={handleToggle('requiereRayos')}
          />
        </div>
      </div>

      <div className="space-y-6 border-t-2 border-gray-100 pt-6">
        <h3 className="text-xl font-bold text-gray-800">Equipo medico</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Cirujano"
            options={equipoOptions('cirujano')}
            value={formData.cirujanoId}
            onChange={handleChange('cirujanoId')}
          />
          <Select
            label="Anestesista"
            options={equipoOptions('anestesista')}
            value={formData.anestesistaId}
            onChange={handleChange('anestesistaId')}
          />
          <Select
            label="Arsenalera"
            options={equipoOptions('arsenalera')}
            value={formData.arsenaleraId}
            onChange={handleChange('arsenaleraId')}
          />
          <Select
            label="Ayudante 1"
            options={equipoOptions('ayudante')}
            value={formData.ayudante1Id}
            onChange={handleChange('ayudante1Id')}
          />
          <Select
            label="Ayudante 2"
            options={equipoOptions('ayudante')}
            value={formData.ayudante2Id}
            onChange={handleChange('ayudante2Id')}
          />
        </div>
      </div>

      <div className="space-y-4 border-t-2 border-gray-100 pt-6">
        <h3 className="text-xl font-bold text-gray-800">Consentimiento</h3>
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Riesgos y complicaciones
          </label>
          <textarea
            value={formData.riesgosDescripcion}
            onChange={(e) => handleChange('riesgosDescripcion')(e.target.value)}
            className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.riesgosDescripcion ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={5}
            placeholder="Describe riesgos, complicaciones y alternativas..."
          />
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className={riesgosWarning ? 'text-yellow-600' : 'text-gray-500'}>
              Recomendado: 100+ caracteres, sin abreviaturas
            </span>
            <span className={riesgosWarning ? 'text-yellow-600' : 'text-gray-500'}>
              {riesgosLength} caracteres
            </span>
          </div>
          {errors.riesgosDescripcion && (
            <p className="mt-2 text-base text-red-600 font-medium">
              {errors.riesgosDescripcion}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 border-t-2 border-gray-100 pt-6">
        <h3 className="text-xl font-bold text-gray-800">Documentos a generar</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Toggle
            label="PAM"
            checked={formData.generarPam}
            onChange={handleToggle('generarPam')}
          />
          <Toggle
            label="Solicitud pabellon"
            checked={formData.generarPabellon}
            onChange={handleToggle('generarPabellon')}
          />
          <Toggle
            label="Consentimiento"
            checked={formData.generarConsentimiento}
            onChange={handleToggle('generarConsentimiento')}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" variant="primary" loading={loading}>
          Guardar evento
        </Button>
      </div>
    </form>
  )
}
