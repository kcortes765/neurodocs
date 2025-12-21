import React from 'react';
import { Select, SelectOption, Button } from '../ui';

export interface Clinica {
  id: string;
  nombre: string;
}

export interface HeaderProps {
  clinicas: Clinica[];
  selectedClinicaId?: string;
  onClinicaChange: (clinicaId: string) => void;
  onLogout: () => void;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  clinicas,
  selectedClinicaId,
  onClinicaChange,
  onLogout,
  userName,
}) => {
  const clinicaOptions: SelectOption[] = clinicas.map((clinica) => ({
    value: clinica.id,
    label: clinica.nombre,
  }));

  return (
    <header className="bg-white shadow-md border-b-4 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">NeuroDoc</h1>
          </div>

          {/* Clinica Selector */}
          <div className="flex-1 max-w-md">
            <Select
              label=""
              options={clinicaOptions}
              value={selectedClinicaId}
              onChange={onClinicaChange}
              className="text-base"
            />
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            {userName && (
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-500">Usuario</p>
                <p className="text-base font-semibold text-gray-800">{userName}</p>
              </div>
            )}
            <Button variant="secondary" onClick={onLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
