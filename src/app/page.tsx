"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Paciente {
  id: string;
  nombreCompleto: string;
  rut: string;
  createdAt: string;
}

interface Clinica {
  id: string;
  nombre: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
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

    fetch("/api/pacientes?limit=5")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setPacientes(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/pacientes?q=${encodeURIComponent(searchQuery)}`);
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

  const handleSelectPaciente = (pacienteId: string) => {
    if (!clinicaActiva) {
      alert("Selecciona una clinica primero");
      return;
    }
    localStorage.setItem("clinicaActiva", clinicaActiva);
    router.push(`/atencion/${pacienteId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">NeuroDoc</h1>
          <div className="flex items-center gap-4">
            <select
              value={clinicaActiva}
              onChange={(e) => {
                setClinicaActiva(e.target.value);
                localStorage.setItem("clinicaActiva", e.target.value);
              }}
              className="px-4 py-2 text-lg border rounded-lg bg-white"
            >
              <option value="">Seleccionar clinica...</option>
              {clinicas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Clinica Warning */}
        {!clinicaActiva && clinicas.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-lg">
              Selecciona la clinica donde estas atendiendo hoy
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
              {searchQuery ? "Resultados de busqueda" : "Ultimos pacientes"}
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
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Link
            href="/pacientes"
            className="px-6 py-4 text-lg font-medium text-center text-gray-700 bg-white border rounded-xl hover:bg-gray-50"
          >
            Ver todos los pacientes
          </Link>
          <button
            onClick={async () => {
              if (confirm("Generar 20 pacientes de prueba con atenciones?")) {
                setLoading(true);
                try {
                  await fetch("/api/seed", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pacientes: 20, atencionesPorPaciente: 2 }),
                  });
                  window.location.reload();
                } catch (error) {
                  console.error(error);
                  alert("Error generando datos");
                } finally {
                  setLoading(false);
                }
              }
            }}
            disabled={loading}
            className="px-6 py-4 text-lg font-medium text-center text-gray-700 bg-white border rounded-xl hover:bg-gray-50 disabled:opacity-50"
          >
            Generar datos de prueba
          </button>
        </div>
      </main>
    </div>
  );
}
