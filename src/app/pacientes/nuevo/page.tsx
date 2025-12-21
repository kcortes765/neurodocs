"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Prevision = "FONASA" | "ISAPRE" | "PARTICULAR";

const ISAPRES = [
  "Banmedica",
  "Consalud",
  "Cruz Blanca",
  "Colmena",
  "Vida Tres",
  "Nueva Masvida",
  "Esencial",
];

export default function NuevoPaciente() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombreCompleto: "",
    rut: "",
    fechaNac: "",
    prevision: "FONASA" as Prevision,
    isapreNombre: "",
    antecedentes: "",
  });

  const formatRut = (value: string) => {
    let rut = value.replace(/[^0-9kK]/g, "").toUpperCase();
    if (rut.length > 9) rut = rut.slice(0, 9);

    if (rut.length > 1) {
      const dv = rut.slice(-1);
      let num = rut.slice(0, -1);
      num = num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      rut = `${num}-${dv}`;
    }
    return rut;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear paciente");
        return;
      }

      router.push("/");
    } catch (err) {
      setError("Error de conexion");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-2xl text-gray-400 hover:text-gray-600">
            &larr;
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Nuevo Paciente</h1>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-lg">
              {error}
            </div>
          )}

          {/* Nombre */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={formData.nombreCompleto}
              onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
              className="w-full px-4 py-3 text-xl text-gray-900 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
              placeholder="Juan Perez Gonzalez"
            />
          </div>

          {/* RUT */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              RUT *
            </label>
            <input
              type="text"
              required
              value={formData.rut}
              onChange={(e) => setFormData({ ...formData, rut: formatRut(e.target.value) })}
              className="w-full px-4 py-3 text-xl text-gray-900 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
              placeholder="12.345.678-9"
            />
          </div>

          {/* Fecha Nacimiento */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={formData.fechaNac}
              onChange={(e) => setFormData({ ...formData, fechaNac: e.target.value })}
              className="w-full px-4 py-3 text-xl text-gray-900 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
            />
          </div>

          {/* Prevision */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Prevision *
            </label>
            <select
              required
              value={formData.prevision}
              onChange={(e) => setFormData({ ...formData, prevision: e.target.value as Prevision })}
              className="w-full px-4 py-3 text-xl border-2 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="FONASA">FONASA</option>
              <option value="ISAPRE">ISAPRE</option>
              <option value="PARTICULAR">Particular</option>
            </select>
          </div>

          {/* ISAPRE nombre */}
          {formData.prevision === "ISAPRE" && (
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Nombre ISAPRE
              </label>
              <select
                value={formData.isapreNombre}
                onChange={(e) => setFormData({ ...formData, isapreNombre: e.target.value })}
                className="w-full px-4 py-3 text-xl border-2 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
              >
                <option value="">Seleccionar...</option>
                {ISAPRES.map((isapre) => (
                  <option key={isapre} value={isapre}>
                    {isapre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Antecedentes */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Antecedentes / Patologias Base
            </label>
            <textarea
              rows={4}
              value={formData.antecedentes}
              onChange={(e) => setFormData({ ...formData, antecedentes: e.target.value })}
              className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none bg-white resize-none"
              placeholder="HTA, DM2, Hernia discal L4-L5..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 text-xl font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "GUARDAR PACIENTE"}
          </button>
        </form>
      </main>
    </div>
  );
}
