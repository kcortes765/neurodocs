"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Clinica {
  id: string;
  nombre: string;
}

interface Atencion {
  id: string;
  fecha: string;
  diagnostico: string;
  tratamiento?: string | null;
  indicaciones?: string | null;
  clinica?: Clinica | null;
}

interface Paciente {
  id: string;
  nombreCompleto: string;
  rut: string;
  prevision: string;
  isapreNombre?: string | null;
  fechaNac?: string | null;
  antecedentes?: string | null;
  atenciones: Atencion[];
}

const formatDate = (value?: string | null) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-CL");
};

export default function PacienteDetalle({ params }: { params: { id: string } }) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/pacientes/${params.id}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Error cargando paciente");
        }

        if (active) {
          setPaciente(json.data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error cargando paciente");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [params.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/pacientes" className="text-2xl text-gray-400 hover:text-gray-600">
            &larr;
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Detalle Paciente</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border p-6 text-lg text-gray-500">
            Cargando...
          </div>
        )}

        {!loading && error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-lg">
            {error}
          </div>
        )}

        {!loading && paciente && (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Paciente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                <div>
                  <p className="text-gray-500">Nombre</p>
                  <p className="text-gray-900 font-medium">{paciente.nombreCompleto}</p>
                </div>
                <div>
                  <p className="text-gray-500">RUT</p>
                  <p className="text-gray-900 font-medium">{paciente.rut}</p>
                </div>
                <div>
                  <p className="text-gray-500">Prevision</p>
                  <p className="text-gray-900 font-medium">{paciente.prevision}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha Nacimiento</p>
                  <p className="text-gray-900 font-medium">{formatDate(paciente.fechaNac)}</p>
                </div>
              </div>
              {paciente.isapreNombre && (
                <div className="mt-4">
                  <p className="text-gray-500">Isapre</p>
                  <p className="text-gray-900">{paciente.isapreNombre}</p>
                </div>
              )}
              {paciente.antecedentes && (
                <div className="mt-4">
                  <p className="text-gray-500">Antecedentes</p>
                  <p className="text-gray-900">{paciente.antecedentes}</p>
                </div>
              )}
            </div>

            <Link
              href={`/atencion/${paciente.id}`}
              className="block w-full px-6 py-4 text-lg font-semibold text-center text-white bg-green-600 rounded-xl hover:bg-green-700"
            >
              + Nueva Atencion
            </Link>

            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-700">Atenciones</h2>
              </div>
              {paciente.atenciones.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500 text-lg">
                  Sin atenciones registradas
                </div>
              ) : (
                <div className="divide-y">
                  {paciente.atenciones.map((atencion) => (
                    <div key={atencion.id} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-medium text-gray-800">
                            {atencion.diagnostico}
                          </p>
                          <p className="text-gray-500">
                            {atencion.clinica?.nombre || "Clinica sin nombre"}
                          </p>
                          {atencion.tratamiento && (
                            <p className="text-sm text-gray-500">
                              Tratamiento: {atencion.tratamiento}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(atencion.fecha)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
