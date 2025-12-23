/**
 * EJEMPLO DE USO - PatientListExample
 *
 * Este archivo demuestra cómo usar los componentes UI para crear
 * una página de listado de pacientes con búsqueda.
 *
 * Puedes copiar este código y adaptarlo a tus necesidades.
 */

'use client';

import React, { useState } from 'react';
import { Card, SearchInput, Button } from '../ui';

interface Patient {
  id: string;
  nombre: string;
  rut: string;
  fechaNacimiento: string;
  prevision: string;
}

export const PatientListExample: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const patients: Patient[] = [
    {
      id: '1',
      nombre: 'Juan Pérez González',
      rut: '12345678-9',
      fechaNacimiento: '1950-05-15',
      prevision: 'FONASA',
    },
    {
      id: '2',
      nombre: 'María López Silva',
      rut: '98765432-1',
      fechaNacimiento: '1948-11-20',
      prevision: 'ISAPRE',
    },
  ];

  const filteredPatients = patients.filter(
    (patient) =>
      patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.rut.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Barra de búsqueda y botón nuevo */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <SearchInput
              label="Buscar paciente"
              onChange={setSearchTerm}
              value={searchTerm}
            />
          </div>
          <Button variant="primary" onClick={() => console.log('Nuevo paciente')}>
            + Nuevo Paciente
          </Button>
        </div>
      </Card>

      {/* Lista de pacientes */}
      <Card title={`Pacientes (${filteredPatients.length})`}>
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              No se encontraron pacientes
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nombre</p>
                    <p className="text-lg font-semibold">{patient.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">RUT</p>
                    <p className="text-lg">{patient.rut}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Previsión</p>
                    <p className="text-lg">{patient.prevision}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button
                    variant="primary"
                    onClick={() => console.log('Ver detalles', patient.id)}
                  >
                    Ver Detalles
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => console.log('Nueva atención', patient.id)}
                  >
                    Nueva Atención
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
