"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Paciente {
  id: string;
  nombreCompleto: string;
  rut: string;
  prevision: string;
  createdAt: string;
  _count?: {
    atenciones: number;
  };
}

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async (query?: string) => {
    setLoading(true);
    try {
      const url = query
        ? `/api/pacientes?q=${encodeURIComponent(query)}`
        : "/api/pacientes";
      const res = await fetch(url);
      const data = await res.json();
      if (data.data) {
        setPacientes(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPacientes(searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-2xl text-gray-400 hover:text-gray-600">
            &larr;
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Todos los Pacientes</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o RUT..."
              className="flex-1 px-4 py-3 text-lg border-2 rounded-xl focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* New Patient */}
        <Link
          href="/pacientes/nuevo"
          className="block w-full mb-6 px-6 py-4 text-lg font-semibold text-center text-white bg-green-600 rounded-xl hover:bg-green-700"
        >
          + Nuevo Paciente
        </Link>

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border">
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500 text-lg">
              Cargando...
            </div>
          ) : pacientes.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 text-lg">
              No hay pacientes registrados
            </div>
          ) : (
            <div className="divide-y">
              {pacientes.map((paciente) => (
                <Link
                  key={paciente.id}
                  href={`/pacientes/${paciente.id}`}
                  className="block px-6 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-medium text-gray-800">
                        {paciente.nombreCompleto}
                      </p>
                      <p className="text-gray-500">{paciente.rut}</p>
                      <p className="text-sm text-gray-400">{paciente.prevision}</p>
                    </div>
                    <div className="text-right">
                      {paciente._count && (
                        <p className="text-sm text-gray-500">
                          {paciente._count.atenciones} atenciones
                        </p>
                      )}
                      <span className="text-2xl text-gray-300">&rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-gray-500">
          Total: {pacientes.length} pacientes
        </p>
      </main>
    </div>
  );
}
