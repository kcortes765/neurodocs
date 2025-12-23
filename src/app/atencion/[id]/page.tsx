"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AttentionForm, AttentionFormData } from "@/components/forms";

interface Paciente {
  id: string;
  nombreCompleto: string;
  rut: string;
  prevision: string;
  fechaNac?: string | null;
  antecedentes?: string | null;
}

interface Clinica {
  id: string;
  nombre: string;
}

const formatDate = (value?: string | null) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-CL");
};

export default function AtencionPage({ params }: { params: { id: string } }) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [clinicaActiva, setClinicaActiva] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [pacienteRes, clinicasRes] = await Promise.all([
          fetch(`/api/pacientes/${params.id}`),
          fetch("/api/clinicas"),
        ]);

        const pacienteJson = await pacienteRes.json();
        const clinicasJson = await clinicasRes.json();

        if (!pacienteRes.ok) {
          throw new Error(pacienteJson.error || "Error cargando paciente");
        }
        if (!clinicasRes.ok) {
          throw new Error(clinicasJson.error || "Error cargando clinicas");
        }

        if (!active) return;

        setPaciente(pacienteJson.data);
        setClinicas(clinicasJson.data || []);

        const saved = localStorage.getItem("clinicaActiva");
        if (
          saved &&
          (clinicasJson.data || []).some((c: Clinica) => c.id === saved)
        ) {
          setClinicaActiva(saved);
        } else if ((clinicasJson.data || []).length > 0) {
          setClinicaActiva(clinicasJson.data[0].id);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error cargando datos");
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

  const handleSubmit = async (data: AttentionFormData) => {
    if (!clinicaActiva) {
      setError("Selecciona una clinica");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    setPdfBase64(null);

    try {
      const res = await fetch("/api/atenciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId: params.id,
          clinicaId: clinicaActiva,
          diagnostico: data.diagnostico,
          tratamiento: data.tratamiento,
          indicaciones: data.indicaciones,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error guardando atencion");
      }

      const atencionId = json?.data?.id as string | undefined;
      const tipos: string[] = [];

      if (data.generateReceta) tipos.push("RECETA");
      if (data.generateCertificado) tipos.push("CERTIFICADO");
      if (data.generateOrdenExamen) tipos.push("ORDEN_EXAMEN");

      let docsWarning = "";

      if (tipos.length > 0 && atencionId) {
        const docsRes = await fetch("/api/documentos/generar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ atencionId, tipos }),
        });

        const docsJson = await docsRes.json();

        if (!docsRes.ok) {
          docsWarning = docsJson.error || "No se pudo generar el PDF";
        } else if (docsJson.pdf) {
          setPdfBase64(docsJson.pdf);
        }
      }

      setMessage(
        docsWarning ? `Atencion guardada, pero ${docsWarning}` : "Atencion guardada"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando atencion");
    } finally {
      setSaving(false);
    }
  };

  const pdfUrl = pdfBase64 ? `data:application/pdf;base64,${pdfBase64}` : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-2xl text-gray-400 hover:text-gray-600">
            &larr;
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Nueva Atencion</h1>
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

        {!loading && message && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-lg">
            {message}
          </div>
        )}

        {!loading && paciente && (
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
            {paciente.antecedentes && (
              <div className="mt-4">
                <p className="text-gray-500">Antecedentes</p>
                <p className="text-gray-900">{paciente.antecedentes}</p>
              </div>
            )}
          </div>
        )}

        {!loading && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Clinica</h2>
            <select
              value={clinicaActiva}
              onChange={(e) => {
                setClinicaActiva(e.target.value);
                localStorage.setItem("clinicaActiva", e.target.value);
              }}
              className="w-full px-4 py-3 text-lg border-2 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="">Seleccionar clinica...</option>
              {clinicas.map((clinica) => (
                <option key={clinica.id} value={clinica.id}>
                  {clinica.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {!loading && paciente && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Atencion</h2>
            <AttentionForm onSubmit={handleSubmit} loading={saving} />
            {pdfBase64 && (
              <div className="mt-6">
                <a
                  href={pdfUrl}
                  download={`documento-${paciente.rut}.pdf`}
                  className="inline-block px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Descargar PDF
                </a>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
