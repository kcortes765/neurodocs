"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  SurgicalEventForm,
  SurgicalEventFormData,
  EquipoMedicoOption,
  ProcedimientoOption,
} from "@/components/forms";

interface Paciente {
  id: string;
  nombreCompleto: string;
  rut: string;
  prevision: string;
  isapreNombre?: string | null;
  fechaNac?: string | null;
  antecedentes?: string | null;
}

interface Clinica {
  id: string;
  nombre: string;
  direccion: string;
}

interface DocumentoGenerado {
  tipo: string;
  plantillaNombre: string;
  pdf: string;
  warning?: string;
}

const formatDate = (value?: string | null) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-CL");
};

export default function EventoQuirurgicoPage({ params }: { params: { id: string } }) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [procedimientos, setProcedimientos] = useState<ProcedimientoOption[]>([]);
  const [equipoMedico, setEquipoMedico] = useState<EquipoMedicoOption[]>([]);
  const [clinicaActiva, setClinicaActiva] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [documentos, setDocumentos] = useState<DocumentoGenerado[]>([]);
  const [missingDocs, setMissingDocs] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [pacienteRes, clinicasRes, procedimientosRes, equipoRes] =
          await Promise.all([
            fetch(`/api/pacientes/${params.id}`),
            fetch("/api/clinicas"),
            fetch("/api/procedimientos"),
            fetch("/api/equipos-medicos"),
          ]);

        const pacienteJson = await pacienteRes.json();
        const clinicasJson = await clinicasRes.json();
        const procedimientosJson = await procedimientosRes.json();
        const equipoJson = await equipoRes.json();

        if (!pacienteRes.ok) {
          throw new Error(pacienteJson.error || "Error cargando paciente");
        }
        if (!clinicasRes.ok) {
          throw new Error(clinicasJson.error || "Error cargando clinicas");
        }
        if (!procedimientosRes.ok) {
          throw new Error(procedimientosJson.error || "Error cargando procedimientos");
        }
        if (!equipoRes.ok) {
          throw new Error(equipoJson.error || "Error cargando equipo medico");
        }

        if (!active) return;

        setPaciente(pacienteJson.data);
        setClinicas(clinicasJson.data || []);
        setProcedimientos(procedimientosJson.data || []);
        setEquipoMedico(equipoJson.data || []);

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

  const handleSubmit = async (data: SurgicalEventFormData) => {
    if (!clinicaActiva) {
      setError("Selecciona una clinica");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    setDocumentos([]);
    setMissingDocs([]);

    try {
      const res = await fetch("/api/eventos-quirurgicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId: params.id,
          clinicaId: clinicaActiva,
          fechaCirugia: data.fechaCirugia,
          diagnostico: data.diagnostico,
          codigoCie10: data.codigoCie10 || undefined,
          procedimientoId: data.procedimientoId || undefined,
          lateralidad: data.lateralidad || undefined,
          alergiaLatex: data.alergiaLatex,
          requiereBiopsia: data.requiereBiopsia,
          requiereRayos: data.requiereRayos,
          cirujanoId: data.cirujanoId || undefined,
          anestesistaId: data.anestesistaId || undefined,
          arsenaleraId: data.arsenaleraId || undefined,
          ayudante1Id: data.ayudante1Id || undefined,
          ayudante2Id: data.ayudante2Id || undefined,
          riesgosDescripcion: data.riesgosDescripcion || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Error guardando evento quirurgico");
      }

      const eventoId = json?.data?.id as string | undefined;
      const tipos: string[] = [];
      if (data.generarPam) tipos.push("PAM");
      if (data.generarPabellon) tipos.push("PABELLON");
      if (data.generarConsentimiento) tipos.push("CONSENTIMIENTO");

      if (eventoId && tipos.length > 0) {
        const docsRes = await fetch("/api/documentos/generar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventoQuirurgicoId: eventoId, tipos }),
        });
        const docsJson = await docsRes.json();
        if (!docsRes.ok) {
          throw new Error(docsJson.error || "Error generando documentos");
        }

        const docsData = docsJson.data || {};
        setDocumentos(docsData.documentos || []);
        setMissingDocs(docsData.missing || []);
      }

      setMessage("Evento quirurgico guardado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando evento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/pacientes/${params.id}`} className="text-2xl text-gray-400 hover:text-gray-600">
            &larr;
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Evento quirurgico</h1>
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
                <p className="text-gray-900 font-medium">
                  {paciente.isapreNombre ? `ISAPRE ${paciente.isapreNombre}` : paciente.prevision}
                </p>
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
            <SurgicalEventForm
              procedimientos={procedimientos}
              equipoMedico={equipoMedico}
              onSubmit={handleSubmit}
              loading={saving}
            />
          </div>
        )}

        {(documentos.length > 0 || missingDocs.length > 0) && (
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Documentos generados</h2>
            {missingDocs.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                Faltan plantillas para: {missingDocs.join(", ")}
              </div>
            )}
            <div className="space-y-3">
              {documentos.map((doc) => {
                const url = `data:application/pdf;base64,${doc.pdf}`;
                return (
                  <div
                    key={`${doc.tipo}-${doc.plantillaNombre}`}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border rounded-lg p-4"
                  >
                    <div>
                      <p className="text-lg font-medium text-gray-800">{doc.tipo}</p>
                      <p className="text-sm text-gray-500">{doc.plantillaNombre}</p>
                      {doc.warning && (
                        <p className="text-sm text-yellow-600">{doc.warning}</p>
                      )}
                    </div>
                    <a
                      href={url}
                      download={`documento-${doc.tipo}-${paciente?.rut || "paciente"}.pdf`}
                      className="inline-flex items-center justify-center px-5 py-2 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Descargar PDF
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
