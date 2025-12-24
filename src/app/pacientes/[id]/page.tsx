"use client";

import { useEffect, useState } from "react";
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
  const [editForm, setEditForm] = useState({
    nombreCompleto: "",
    fechaNac: "",
    prevision: "",
    isapreNombre: "",
    antecedentes: "",
  });

  const handleDelete = async () => {
    if (!confirm("¿Seguro que deseas eliminar este paciente? Se eliminaran todas sus atenciones y cirugias.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/pacientes/${params.id}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error eliminando paciente");
      }

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

      if (!res.ok) {
        throw new Error(json.error || "Error guardando paciente");
      }

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

        if (!pacienteRes.ok) {
          throw new Error(json.error || "Error cargando paciente");
        }
        if (!eventosRes.ok) {
          throw new Error(eventosJson.error || "Error cargando eventos");
        }

        if (active) {
          setPaciente(json.data);
          setEventos(eventosJson.data || []);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error cargando paciente");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/pacientes" className="text-2xl text-gray-400 hover:text-gray-600">
            &larr;
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Detalle Paciente</h1>
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

        {!loading && paciente && (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Paciente</h2>
                {!editing && (
                  <button
                    onClick={startEditing}
                    className="px-4 py-2 text-lg font-medium text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    Editar
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-500 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={editForm.nombreCompleto}
                      onChange={(e) => setEditForm({ ...editForm, nombreCompleto: e.target.value })}
                      className="w-full px-4 py-3 text-lg border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">RUT (no editable)</label>
                    <input
                      type="text"
                      value={paciente.rut}
                      disabled
                      className="w-full px-4 py-3 text-lg border-2 rounded-lg bg-gray-100 text-gray-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-500 mb-1">Fecha Nacimiento</label>
                      <input
                        type="date"
                        value={editForm.fechaNac}
                        onChange={(e) => setEditForm({ ...editForm, fechaNac: e.target.value })}
                        className="w-full px-4 py-3 text-lg border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Previsión</label>
                      <select
                        value={editForm.prevision}
                        onChange={(e) => setEditForm({ ...editForm, prevision: e.target.value })}
                        className="w-full px-4 py-3 text-lg border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="FONASA">FONASA</option>
                        <option value="ISAPRE">ISAPRE</option>
                        <option value="PARTICULAR">PARTICULAR</option>
                      </select>
                    </div>
                  </div>
                  {editForm.prevision === "ISAPRE" && (
                    <div>
                      <label className="block text-gray-500 mb-1">Nombre Isapre</label>
                      <input
                        type="text"
                        value={editForm.isapreNombre}
                        onChange={(e) => setEditForm({ ...editForm, isapreNombre: e.target.value })}
                        className="w-full px-4 py-3 text-lg border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="Ej: Banmedica, Colmena, etc."
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-gray-500 mb-1">Antecedentes</label>
                    <textarea
                      value={editForm.antecedentes}
                      onChange={(e) => setEditForm({ ...editForm, antecedentes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 text-lg border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 text-lg font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      disabled={saving}
                      className="px-6 py-3 text-lg font-medium text-gray-700 border-2 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                      <p className="text-gray-500">Previsión</p>
                      <p className="text-gray-900 font-medium">{paciente.prevision}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha Nacimiento</p>
                      <p className="text-gray-900 font-medium">{formatDate(paciente.fechaNac)}</p>
                    </div>
                  </div>
                  {paciente.isapreNombre && (
                    <div className="mt-4">
                      <p className="text-gray-500">Isapre</p>
                      <p className="text-gray-900">{paciente.isapreNombre}</p>
                    </div>
                  )}
                  {paciente.antecedentes && (
                    <div className="mt-4">
                      <p className="text-gray-500">Antecedentes</p>
                      <p className="text-gray-900">{paciente.antecedentes}</p>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-6 py-3 text-lg font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleting ? "Eliminando..." : "Eliminar Paciente"}
                    </button>
                  </div>
                </>
              )}
            </div>

            <Link
              href={`/atencion/${paciente.id}`}
              className="block w-full px-6 py-4 text-lg font-semibold text-center text-white bg-green-600 rounded-xl hover:bg-green-700"
            >
              + Nueva Atención
            </Link>

            <Link
              href={`/eventos-quirurgicos/${paciente.id}`}
              className="block w-full px-6 py-4 text-lg font-semibold text-center text-white bg-blue-600 rounded-xl hover:bg-blue-700"
            >
              + Nuevo Evento Quirúrgico
            </Link>

            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-700">Atenciones</h2>
              </div>
              {paciente.atenciones.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500 text-lg">
                  Sin atenciones registradas
                </div>
              ) : (
                <div className="divide-y">
                  {paciente.atenciones.map((atencion) => (
                    <div key={atencion.id} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-medium text-gray-800">
                            {atencion.diagnostico}
                          </p>
                          <p className="text-gray-500">
                            {atencion.clinica?.nombre || "Clínica sin nombre"}
                          </p>
                          {atencion.tratamiento && (
                            <p className="text-sm text-gray-500">
                              Tratamiento: {atencion.tratamiento}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(atencion.fecha)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-700">Eventos quirúrgicos</h2>
              </div>
              {eventos.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500 text-lg">
                  Sin eventos registrados
                </div>
              ) : (
                <div className="divide-y">
                  {eventos.map((evento) => (
                    <div key={evento.id} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-medium text-gray-800">
                            {evento.diagnostico}
                          </p>
                          <p className="text-gray-500">
                            {evento.clinica?.nombre || "Clínica sin nombre"}
                          </p>
                          {evento.procedimiento && (
                            <p className="text-sm text-gray-500">
                              {evento.procedimiento.codigoFonasa} - {evento.procedimiento.descripcion}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(evento.fechaCirugia)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
