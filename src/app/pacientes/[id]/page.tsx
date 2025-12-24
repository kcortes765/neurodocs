"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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

interface EventoQuirurgico {
  id: string;
  fechaCirugia: string;
  diagnostico: string;
  clinica?: Clinica | null;
  procedimiento?: {
    codigoFonasa: string;
    descripcion: string;
  } | null;
}

interface DocumentoGenerado {
  tipo: string;
  plantillaNombre: string;
  pdf: string;
  warning?: string;
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
  const router = useRouter();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [eventos, setEventos] = useState<EventoQuirurgico[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoGenerado[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const [editForm, setEditForm] = useState({
    nombreCompleto: "",
    fechaNac: "",
    prevision: "",
    isapreNombre: "",
    antecedentes: "",
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generatePdfForEvento = async (eventoId: string) => {
    setGeneratingPdf(eventoId);
    setDocumentos([]);
    try {
      const res = await fetch("/api/documentos/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventoQuirurgicoId: eventoId,
          tipos: ["PAM", "PABELLON", "CONSENTIMIENTO"],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error generando documentos");
      setDocumentos(json.data?.documentos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error generando PDFs");
    } finally {
      setGeneratingPdf(null);
    }
  };

  const generatePdfForAtencion = async (atencionId: string) => {
    setGeneratingPdf(atencionId);
    setDocumentos([]);
    try {
      const res = await fetch("/api/documentos/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ atencionId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error generando documentos");
      setDocumentos(json.data?.documentos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error generando PDFs");
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro que deseas eliminar este paciente?")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/pacientes/${params.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error eliminando paciente");
      router.push("/pacientes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error eliminando paciente");
      setDeleting(false);
    }
  };

  const startEditing = () => {
    if (paciente) {
      setEditForm({
        nombreCompleto: paciente.nombreCompleto,
        fechaNac: paciente.fechaNac ? paciente.fechaNac.split("T")[0] : "",
        prevision: paciente.prevision,
        isapreNombre: paciente.isapreNombre || "",
        antecedentes: paciente.antecedentes || "",
      });
      setEditing(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/pacientes/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error guardando paciente");
      setPaciente({ ...paciente!, ...json.data });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando paciente");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [pacienteRes, eventosRes] = await Promise.all([
          fetch(`/api/pacientes/${params.id}`),
          fetch(`/api/eventos-quirurgicos?pacienteId=${params.id}`),
        ]);
        const json = await pacienteRes.json();
        const eventosJson = await eventosRes.json();
        if (!pacienteRes.ok) throw new Error(json.error || "Error cargando paciente");
        if (!eventosRes.ok) throw new Error(eventosJson.error || "Error cargando eventos");
        if (active) {
          setPaciente(json.data);
          setEventos(eventosJson.data || []);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Error cargando paciente");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [params.id]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Link href="/pacientes" className="text-xl sm:text-2xl text-gray-400 hover:text-gray-600 p-1">
            &larr;
          </Link>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Detalle Paciente</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 text-base sm:text-lg text-gray-500">
            Cargando...
          </div>
        )}

        {!loading && error && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm sm:text-lg">
            {error}
          </div>
        )}

        {!loading && paciente && (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Paciente</h2>
                {!editing && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={startEditing}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-lg font-medium text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      Editar
                    </button>
                    <div className="relative" ref={menuRef}>
                      <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </button>
                      {showMenu && (
                        <div className="absolute right-0 mt-1 w-44 sm:w-48 bg-white border rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => { setShowMenu(false); handleDelete(); }}
                            disabled={deleting}
                            className="w-full px-4 py-3 text-left text-sm sm:text-base text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          >
                            {deleting ? "Eliminando..." : "Eliminar paciente"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {editing ? (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm sm:text-base text-gray-500 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={editForm.nombreCompleto}
                      onChange={(e) => setEditForm({ ...editForm, nombreCompleto: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base text-gray-500 mb-1">RUT (no editable)</label>
                    <input
                      type="text"
                      value={paciente.rut}
                      disabled
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 rounded-lg bg-gray-100 text-gray-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm sm:text-base text-gray-500 mb-1">Fecha Nacimiento</label>
                      <input
                        type="date"
                        value={editForm.fechaNac}
                        onChange={(e) => setEditForm({ ...editForm, fechaNac: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base text-gray-500 mb-1">Previsión</label>
                      <select
                        value={editForm.prevision}
                        onChange={(e) => setEditForm({ ...editForm, prevision: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="FONASA">FONASA</option>
                        <option value="ISAPRE">ISAPRE</option>
                        <option value="PARTICULAR">PARTICULAR</option>
                      </select>
                    </div>
                  </div>
                  {editForm.prevision === "ISAPRE" && (
                    <div>
                      <label className="block text-sm sm:text-base text-gray-500 mb-1">Nombre Isapre</label>
                      <input
                        type="text"
                        value={editForm.isapreNombre}
                        onChange={(e) => setEditForm({ ...editForm, isapreNombre: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="Ej: Banmedica, Colmena"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm sm:text-base text-gray-500 mb-1">Antecedentes</label>
                    <textarea
                      value={editForm.antecedentes}
                      onChange={(e) => setEditForm({ ...editForm, antecedentes: e.target.value })}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-5 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      disabled={saving}
                      className="px-5 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-medium text-gray-700 border-2 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-base sm:text-lg">
                    <div>
                      <p className="text-gray-500 text-sm sm:text-base">Nombre</p>
                      <p className="text-gray-900 font-medium">{paciente.nombreCompleto}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm sm:text-base">RUT</p>
                      <p className="text-gray-900 font-medium">{paciente.rut}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm sm:text-base">Previsión</p>
                      <p className="text-gray-900 font-medium">{paciente.prevision}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm sm:text-base">Fecha Nacimiento</p>
                      <p className="text-gray-900 font-medium">{formatDate(paciente.fechaNac)}</p>
                    </div>
                  </div>
                  {paciente.isapreNombre && (
                    <div className="mt-3 sm:mt-4">
                      <p className="text-gray-500 text-sm sm:text-base">Isapre</p>
                      <p className="text-gray-900">{paciente.isapreNombre}</p>
                    </div>
                  )}
                  {paciente.antecedentes && (
                    <div className="mt-3 sm:mt-4">
                      <p className="text-gray-500 text-sm sm:text-base">Antecedentes</p>
                      <p className="text-gray-900">{paciente.antecedentes}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <Link
              href={`/atencion/${paciente.id}`}
              className="block w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-semibold text-center text-white bg-green-600 rounded-xl hover:bg-green-700 active:bg-green-800"
            >
              + Nueva Atención
            </Link>

            <Link
              href={`/eventos-quirurgicos/${paciente.id}`}
              className="block w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-semibold text-center text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800"
            >
              + Nuevo Evento Quirúrgico
            </Link>

            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700">Atenciones</h2>
              </div>
              {paciente.atenciones.length === 0 ? (
                <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-base sm:text-lg">
                  Sin atenciones registradas
                </div>
              ) : (
                <div className="divide-y">
                  {paciente.atenciones.map((atencion) => (
                    <div key={atencion.id} className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-base sm:text-lg font-medium text-gray-800 truncate">
                            {atencion.diagnostico}
                          </p>
                          <p className="text-sm sm:text-base text-gray-500">
                            {atencion.clinica?.nombre || "Clínica sin nombre"}
                          </p>
                          {atencion.tratamiento && (
                            <p className="text-xs sm:text-sm text-gray-500">
                              Tratamiento: {atencion.tratamiento}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center sm:flex-col sm:items-end gap-2">
                          <span className="text-xs sm:text-sm text-gray-500">
                            {formatDate(atencion.fecha)}
                          </span>
                          <button
                            onClick={() => generatePdfForAtencion(atencion.id)}
                            disabled={generatingPdf === atencion.id}
                            className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                          >
                            {generatingPdf === atencion.id ? "..." : "PDF"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700">Eventos quirúrgicos</h2>
              </div>
              {eventos.length === 0 ? (
                <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-base sm:text-lg">
                  Sin eventos registrados
                </div>
              ) : (
                <div className="divide-y">
                  {eventos.map((evento) => (
                    <div key={evento.id} className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-base sm:text-lg font-medium text-gray-800 truncate">
                            {evento.diagnostico}
                          </p>
                          <p className="text-sm sm:text-base text-gray-500">
                            {evento.clinica?.nombre || "Clínica sin nombre"}
                          </p>
                          {evento.procedimiento && (
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                              {evento.procedimiento.codigoFonasa} - {evento.procedimiento.descripcion}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center sm:flex-col sm:items-end gap-2">
                          <span className="text-xs sm:text-sm text-gray-500">
                            {formatDate(evento.fechaCirugia)}
                          </span>
                          <button
                            onClick={() => generatePdfForEvento(evento.id)}
                            disabled={generatingPdf === evento.id}
                            className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50"
                          >
                            {generatingPdf === evento.id ? "..." : "PDFs"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {documentos.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Documentos</h2>
                  <button onClick={() => setDocumentos([])} className="text-gray-400 hover:text-gray-600 p-1">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {documentos.map((doc) => {
                    const url = `data:application/pdf;base64,${doc.pdf}`;
                    return (
                      <div
                        key={`${doc.tipo}-${doc.plantillaNombre}`}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border rounded-lg p-3 sm:p-4"
                      >
                        <div className="min-w-0">
                          <p className="text-base sm:text-lg font-medium text-gray-800">{doc.tipo}</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{doc.plantillaNombre}</p>
                        </div>
                        <a
                          href={url}
                          download={`${doc.tipo}-${paciente?.rut || "paciente"}.pdf`}
                          className="inline-flex items-center justify-center px-4 sm:px-5 py-2 text-sm sm:text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800"
                        >
                          Descargar
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
