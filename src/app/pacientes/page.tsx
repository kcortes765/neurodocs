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
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = query
        ? `/api/pacientes?q=${encodeURIComponent(query)}`
        : "/api/pacientes";
      const res = await fetch(url);
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setPacientes(data.data);
      } else {
        setPacientes([]);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error al cargar pacientes");
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPacientes(searchQuery);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Link href="/" className="text-xl sm:text-2xl text-gray-400 hover:text-gray-600 p-1">
            &larr;
          </Link>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Todos los Pacientes</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o RUT..."
              className="flex-1 px-3 sm:px-4 py-3 text-base sm:text-lg border-2 rounded-xl focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 sm:px-6 py-3 text-base sm:text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* New Patient */}
        <Link
          href="/pacientes/nuevo"
          className="block w-full mb-4 sm:mb-6 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-semibold text-center text-white bg-green-600 rounded-xl hover:bg-green-700 active:bg-green-800"
        >
          + Nuevo Paciente
        </Link>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border">
          {loading ? (
            <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-base sm:text-lg">
              Cargando...
            </div>
          ) : pacientes.length === 0 ? (
            <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-base sm:text-lg">
              No hay pacientes registrados
            </div>
          ) : (
            <div className="divide-y">
              {pacientes.map((paciente) => (
                <Link
                  key={paciente.id}
                  href={`/pacientes/${paciente.id}`}
                  className="block px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-base sm:text-xl font-medium text-gray-800 truncate">
                        {paciente.nombreCompleto}
                      </p>
                      <p className="text-sm sm:text-base text-gray-500">{paciente.rut}</p>
                      <p className="text-xs sm:text-sm text-gray-400">{paciente.prevision}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {paciente._count && (
                        <p className="text-xs sm:text-sm text-gray-500">
                          {paciente._count.atenciones} atenciones
                        </p>
                      )}
                      <span className="text-xl sm:text-2xl text-gray-300">&rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-gray-500 text-sm sm:text-base">
          Total: {pacientes.length} pacientes
        </p>
      </main>
    </div>
  );
}
