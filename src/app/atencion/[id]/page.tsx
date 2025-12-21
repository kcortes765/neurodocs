"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Paciente {
  id: string;
  nombreCompleto: string;
  rut: string;
  prevision: string;
  isapreNombre?: string;
  antecedentes?: string;
  atenciones: Array<{
    id: string;
    fecha: string;
    diagnostico: string;
  }>;
}

interface Clinica {
  id: string;
  nombre: string;
}

const DOCUMENTOS = [
  { id: "RECETA", label: "Receta medica" },
  { id: "CERTIFICADO", label: "Certificado de atencion" },
  { id: "LICENCIA", label: "Licencia medica" },
  { id: "INTERCONSULTA", label: "Interconsulta" },
  { id: "ORDEN", label: "Orden de examenes" },
];

export default function NuevaAtencion({ params }: { params: Promise<{ id: string }> }) {
  const { id: pacienteId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [clinica, setClinica] = useState<Clinica | null>(null);

  const [formData, setFormData] = useState({
    diagnostico: "",
    tratamiento: "",
    indicaciones: "",
  });

  const [documentosSeleccionados, setDocumentosSeleccionados] = useState<string[]>(["RECETA"]);

  useEffect(() => {
    const clinicaId = localStorage.getItem("clinicaActiva");

    // Cargar paciente
    fetch(`/api/pacientes/${pacienteId}`)
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

    // Cargar clinica
    if (clinicaId) {
      fetch("/api/clinicas")
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            const c = data.data.find((cl: Clinica) => cl.id === clinicaId);
            if (c) setClinica(c);
          }
        })
        .catch(console.error);
    }
  }, [pacienteId]);

  const toggleDocumento = (docId: string) => {
    setDocumentosSeleccionados((prev) =>
      prev.includes(docId)
        ? prev.filter((d) => d !== docId)
        : [...prev, docId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.diagnostico.trim()) {
      setError("El diagnostico es requerido");
      return;
    }
    if (!clinica) {
      setError("Selecciona una clinica desde el dashboard");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // 1. Crear atencion
      const atencionRes = await fetch("/api/atenciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId,
          clinicaId: clinica.id,
          ...formData,
        }),
      });

      const atencionData = await atencionRes.json();
      if (!atencionRes.ok) {
        setError(atencionData.error || "Error creando atencion");
        return;
      }

      // 2. Generar documentos
      if (documentosSeleccionados.length > 0) {
        const docRes = await fetch("/api/documentos/generar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            atencionId: atencionData.data.id,
            tipos: documentosSeleccionados,
          }),
        });

        const docData = await docRes.json();
        if (docRes.ok && docData.pdf) {
          // Descargar PDF
          const link = document.createElement("a");
          link.href = `data:application/pdf;base64,${docData.pdf}`;
          link.download = `documentos_${paciente?.nombreCompleto.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
          link.click();
        }
      }

      alert("Atencion guardada exitosamente");
      router.push("/");
    } catch (err) {
      setError("Error de conexion");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">{error || "Paciente no encontrado"}</p>
          <Link href="/" className="text-blue-600 text-lg">
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
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Nueva Atencion</h1>
            {clinica && (
              <p className="text-gray-500">{clinica.nombre}</p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Patient Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{paciente.nombreCompleto}</h2>
              <p className="text-lg text-gray-600">{paciente.rut}</p>
              <p className="text-gray-600">
                {paciente.prevision}
                {paciente.isapreNombre && ` - ${paciente.isapreNombre}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Atenciones previas</p>
              <p className="text-2xl font-bold text-blue-600">{paciente.atenciones?.length || 0}</p>
            </div>
          </div>
          {paciente.antecedentes && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-sm font-medium text-gray-500">Antecedentes:</p>
              <p className="text-gray-700">{paciente.antecedentes}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-8">
          {/* Diagnostico */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Diagnostico *
            </label>
            <textarea
              required
              rows={3}
              value={formData.diagnostico}
              onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
              className="w-full px-4 py-3 text-lg border-2 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Hernia discal L4-L5 con compresion radicular..."
            />
          </div>

          {/* Tratamiento */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Tratamiento
            </label>
            <textarea
              rows={3}
              value={formData.tratamiento}
              onChange={(e) => setFormData({ ...formData, tratamiento: e.target.value })}
              className="w-full px-4 py-3 text-lg border-2 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Pregabalina 75mg c/12hrs, Paracetamol 1g c/8hrs..."
            />
          </div>

          {/* Indicaciones */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Indicaciones
            </label>
            <textarea
              rows={3}
              value={formData.indicaciones}
              onChange={(e) => setFormData({ ...formData, indicaciones: e.target.value })}
              className="w-full px-4 py-3 text-lg border-2 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Reposo relativo, evitar cargar peso, control en 2 semanas..."
            />
          </div>

          {/* Documentos */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Documentos a generar
            </label>
            <div className="grid grid-cols-2 gap-3">
              {DOCUMENTOS.map((doc) => (
                <label
                  key={doc.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    documentosSeleccionados.includes(doc.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={documentosSeleccionados.includes(doc.id)}
                    onChange={() => toggleDocumento(doc.id)}
                    className="w-5 h-5"
                  />
                  <span className="text-lg">{doc.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-5 text-xl font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "GENERANDO..." : "GENERAR DOCUMENTOS"}
          </button>
        </form>

        {/* Historial */}
        {paciente.atenciones && paciente.atenciones.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-700">Historial de atenciones</h3>
            </div>
            <div className="divide-y">
              {paciente.atenciones.slice(0, 5).map((atencion) => (
                <div key={atencion.id} className="px-6 py-4">
                  <p className="text-sm text-gray-500">
                    {new Date(atencion.fecha).toLocaleDateString("es-CL")}
                  </p>
                  <p className="text-gray-700">{atencion.diagnostico}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
