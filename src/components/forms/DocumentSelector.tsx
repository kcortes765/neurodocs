import React from 'react'

export interface DocumentSelectorProps {
  generarPam: boolean
  generarPabellon: boolean
  generarConsentimiento: boolean
  onTogglePam: (value: boolean) => void
  onTogglePabellon: (value: boolean) => void
  onToggleConsentimiento: (value: boolean) => void
  disabled?: boolean
}

interface DocumentOption {
  id: 'PAM' | 'PABELLON' | 'CONSENTIMIENTO'
  label: string
  description: string
  checked: boolean
  onToggle: (value: boolean) => void
}

export const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  generarPam,
  generarPabellon,
  generarConsentimiento,
  onTogglePam,
  onTogglePabellon,
  onToggleConsentimiento,
  disabled = false,
}) => {
  const documentOptions: DocumentOption[] = [
    {
      id: 'PAM',
      label: 'PAM (Pre-anestesico)',
      description: 'Formulario de evaluacion pre-anestesica',
      checked: generarPam,
      onToggle: onTogglePam,
    },
    {
      id: 'PABELLON',
      label: 'Solicitud de Pabellon',
      description: 'Solicitud formal de reserva de pabellon quirurgico',
      checked: generarPabellon,
      onToggle: onTogglePabellon,
    },
    {
      id: 'CONSENTIMIENTO',
      label: 'Consentimiento Informado',
      description: 'Documento de autorizacion del paciente',
      checked: generarConsentimiento,
      onToggle: onToggleConsentimiento,
    },
  ]

  const selectedCount = documentOptions.filter((doc) => doc.checked).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Documentos a generar</h3>
          <p className="text-base text-gray-500 mt-1">
            Selecciona los documentos que deseas crear
          </p>
        </div>
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-full">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-base font-semibold text-blue-700">
              {selectedCount} documento{selectedCount !== 1 ? 's' : ''} seleccionado
              {selectedCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {documentOptions.map((doc) => (
          <button
            key={doc.id}
            type="button"
            onClick={() => doc.onToggle(!doc.checked)}
            disabled={disabled}
            className={`
              relative p-5 rounded-xl border-3 transition-all duration-200
              flex items-start gap-4 text-left
              ${
                doc.checked
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Checkbox */}
            <div className="flex-shrink-0 mt-1">
              <div
                className={`
                  w-6 h-6 rounded border-2 flex items-center justify-center transition-all
                  ${
                    doc.checked
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-300'
                  }
                `}
              >
                {doc.checked && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-lg font-semibold ${
                  doc.checked ? 'text-blue-900' : 'text-gray-800'
                }`}
              >
                {doc.label}
              </p>
              <p className="text-base text-gray-600 mt-1">{doc.description}</p>
            </div>

            {/* Document icon */}
            <div className="flex-shrink-0">
              <svg
                className={`w-8 h-8 ${doc.checked ? 'text-blue-600' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {selectedCount === 0 && (
        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg flex items-start gap-3">
          <svg
            className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-base text-yellow-800">
            No has seleccionado ningun documento. Marca al menos uno para generar PDFs.
          </p>
        </div>
      )}
    </div>
  )
}
