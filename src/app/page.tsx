"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

interface Paciente {
  id: string;
  nombreCompleto: string;
  rut: string;
  prevision?: string;
  createdAt: string;
}

interface Clinica {
  id: string;
  nombre: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [clinicaActiva, setClinicaActiva] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/clinicas")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setClinicas(data.data);
          const saved = localStorage.getItem("clinicaActiva");
          if (saved && data.data.find((c: Clinica) => c.id === saved)) {
            setClinicaActiva(saved);
          } else if (data.data.length > 0) {
            setClinicaActiva(data.data[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  const fetchPacientes = async ({
    query,
    clinicaId,
    limit,
  }: {
    query?: string;
    clinicaId?: string;
    limit?: number;
  }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (clinicaId) params.set("clinicaId", clinicaId);
      if (limit) params.set("limit", String(limit));
      const url = params.toString() ? `/api/pacientes?${params}` : "/api/pacientes";
      const res = await fetch(url);
      const data = await res.json();
      if (data.data) {
        setPacientes(data.data);
      }
    } catch (error) {
      console.error("Error buscando:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = submittedQuery.trim();
    if (query) {
      fetchPacientes({ query });
      return;
    }

    fetchPacientes({ limit: 5 });
  }, [submittedQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery.trim());
  };

  const handleSelectPaciente = (pacienteId: string) => {
    if (!clinicaActiva) {
      alert("Selecciona una clinica primero");
      return;
    }
    localStorage.setItem("clinicaActiva", clinicaActiva);
    router.push(`/atencion/${pacienteId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">NeuroDoc</h1>
                <p className="text-blue-200 text-sm">Sistema de Documentación Médica</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={clinicaActiva}
                onChange={(e) => {
                  setClinicaActiva(e.target.value);
                  localStorage.setItem("clinicaActiva", e.target.value);
                }}
                className="px-4 py-3 text-lg border-2 border-blue-500 rounded-xl bg-white font-medium min-w-[250px]"
              >
                <option value="">Seleccionar clínica...</option>
                {clinicas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {session && (
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="px-4 py-3 text-lg font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors"
                >
                  Salir
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex gap-2">
            <Link
              href="/"
              className="px-4 py-2 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500"
            >
              Inicio
            </Link>
            <Link
              href="/pacientes"
              className="px-4 py-2 text-lg font-medium text-blue-200 hover:text-white hover:bg-blue-600 rounded-lg"
            >
              Pacientes
            </Link>
            <Link
              href="/eventos-quirurgicos"
              className="px-4 py-2 text-lg font-medium text-blue-200 hover:text-white hover:bg-blue-600 rounded-lg"
            >
              Cirugias
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Clinica Warning */}
        {!clinicaActiva && clinicas.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-lg">
              Selecciona la clínica donde estás atendiendo hoy
            </p>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar paciente por nombre o RUT..."
              className="flex-1 px-4 py-4 text-xl border-2 rounded-xl focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 text-xl font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "..." : "Buscar"}
            </button>
          </div>
        </form>

        {/* New Patient Button */}
        <Link
          href="/pacientes/nuevo"
          className="block w-full mb-8 px-6 py-5 text-xl font-semibold text-center text-white bg-green-600 rounded-xl hover:bg-green-700"
        >
          + NUEVO PACIENTE
        </Link>

        {/* Patients List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-700">
              {submittedQuery ? "Resultados de búsqueda" : "Últimos pacientes"}
            </h2>
          </div>
          <div className="divide-y">
            {pacientes.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 text-lg">
                No hay pacientes registrados
              </div>
            ) : (
              pacientes.map((paciente) => (
                <button
                  key={paciente.id}
                  onClick={() => handleSelectPaciente(paciente.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 text-left"
                >
                  <div>
                    <p className="text-xl font-medium text-gray-800">
                      {paciente.nombreCompleto}
                    </p>
                    <p className="text-lg text-gray-500">{paciente.rut}</p>
                  </div>
                  <span className="text-2xl text-gray-400">&rarr;</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Acciones Rapidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/pacientes"
              className="px-6 py-5 text-lg font-medium text-center text-gray-700 bg-white border-2 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-colors"
            >
              📋 Ver todos los pacientes
            </Link>
            <Link
              href="/eventos-quirurgicos"
              className="px-6 py-5 text-lg font-medium text-center text-gray-700 bg-white border-2 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-colors"
            >
              🏥 Ver cirugías programadas
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
