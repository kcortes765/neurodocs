"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Atencion {
  id: string;
  fecha: string;
  diagnostico: string;
  tratamiento?: string;
  clinica: {
    nombre: string;
  };
}

interface Paciente {
  id: string;
  nombreCompleto: string;
  rut: string;
  fechaNac?: string;
  prevision: string;
  isapreNombre?: string;
  antecedentes?: string;
  createdAt: string;
  atenciones: Atencion[];
}

export default function DetallePaciente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/pacientes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setPaciente(data.data);
        } else {
          setError("Paciente no encontrado");
        }
      })
      .catch(() => setError("Error cargando paciente"))
      .finally(() => setLoading(false));
  }, [id]);

  const calcularEdad = (fechaNac: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (error || !paciente) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">{error || "Paciente no encontrado"}</p>
          <Link href="/" className="text-blue-600 text-lg hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-2xl text-gray-400 hover:text-gray-600">
            &larr;
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Ficha del Paciente</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Datos del paciente */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{paciente.nombreCompleto}</h2>
              <p className="text-xl text-gray-600 mt-1">{paciente.rut}</p>
            </div>
            <Link
              href={`/atencion/${paciente.id}`}
              className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700"
            >
              + Nueva Atencion
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Prevision</p>
              <p className="text-lg text-gray-900">
                {paciente.prevision}
                {paciente.isapreNombre && ` - ${paciente.isapreNombre}`}
              </p>
            </div>
            {paciente.fechaNac && (
              <div>
                <p className="text-sm font-medium text-gray-500">Edad</p>
                <p className="text-lg text-gray-900">
                  {calcularEdad(paciente.fechaNac)} anos
                </p>
              </div>
            )}
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Antecedentes / Patologias</p>
              <p className="text-lg text-gray-900">
                {paciente.antecedentes || "Sin antecedentes registrados"}
              </p>
            </div>
          </div>
        </div>

        {/* Historial de atenciones */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-700">
              Historial de Atenciones ({paciente.atenciones?.length || 0})
            </h3>
          </div>

          {paciente.atenciones && paciente.atenciones.length > 0 ? (
            <div className="divide-y">
              {paciente.atenciones.map((atencion) => (
                <div key={atencion.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-medium text-gray-800">
                        {atencion.diagnostico}
                      </p>
                      {atencion.tratamiento && (
                        <p className="text-gray-600 mt-1">{atencion.tratamiento}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">
                        {new Date(atencion.fecha).toLocaleDateString("es-CL")}
                      </p>
                      <p className="text-sm text-gray-400">{atencion.clinica?.nombre}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 text-lg mb-4">No hay atenciones registradas</p>
              <Link
                href={`/atencion/${paciente.id}`}
                className="inline-block px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700"
              >
                Registrar primera atencion
              </Link>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex-1 px-6 py-4 text-lg font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50"
          >
            Volver al inicio
          </button>
          <Link
            href={`/atencion/${paciente.id}`}
            className="flex-1 px-6 py-4 text-lg font-semibold text-center text-white bg-blue-600 rounded-xl hover:bg-blue-700"
          >
            Nueva Atencion
          </Link>
        </div>
      </main>
    </div>
  );
}
