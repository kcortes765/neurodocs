"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface EventoQuirurgico {
  id: string;
  fechaCirugia: string;
  diagnostico: string;
  lateralidad: string | null;
  alergiaLatex: boolean;
  requiereBiopsia: boolean;
  requiereRayos: boolean;
  paciente: {
    id: string;
    nombreCompleto: string;
    rut: string;
    prevision: string;
  };
  clinica: {
    id: string;
    nombre: string;
  };
  procedimiento: {
    descripcion: string;
    codigoFonasa: string;
  } | null;
}

export default function ListaEventosQuirurgicos() {
  const [eventos, setEventos] = useState<EventoQuirurgico[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState<"todos" | "proximos" | "pasados">("proximos");

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/eventos-quirurgicos");
      const data = await res.json();
      if (data.data) {
        setEventos(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const eventosFiltrados = eventos.filter((evento) => {
    const fechaEvento = new Date(evento.fechaCirugia);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (filtroFecha === "proximos") {
      return fechaEvento >= hoy;
    } else if (filtroFecha === "pasados") {
      return fechaEvento < hoy;
    }
    return true;
  });

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-2xl text-gray-400 hover:text-gray-600">
            &larr;
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Eventos Quirurgicos</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFiltroFecha("proximos")}
            className={`px-4 py-2 text-lg font-medium rounded-lg transition-colors ${
              filtroFecha === "proximos"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            Proximos
          </button>
          <button
            onClick={() => setFiltroFecha("pasados")}
            className={`px-4 py-2 text-lg font-medium rounded-lg transition-colors ${
              filtroFecha === "pasados"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            Pasados
          </button>
          <button
            onClick={() => setFiltroFecha("todos")}
            className={`px-4 py-2 text-lg font-medium rounded-lg transition-colors ${
              filtroFecha === "todos"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            Todos
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border">
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500 text-lg">
              Cargando...
            </div>
          ) : eventosFiltrados.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 text-lg">
              No hay eventos quirurgicos {filtroFecha === "proximos" ? "programados" : ""}
            </div>
          ) : (
            <div className="divide-y">
              {eventosFiltrados.map((evento) => (
                <Link
                  key={evento.id}
                  href={`/eventos-quirurgicos/${evento.id}`}
                  className="block px-6 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Fecha prominente */}
                      <p className="text-lg font-semibold text-blue-600 mb-1">
                        {formatFecha(evento.fechaCirugia)}
                      </p>

                      {/* Paciente */}
                      <p className="text-xl font-medium text-gray-800">
                        {evento.paciente.nombreCompleto}
                      </p>
                      <p className="text-gray-500">{evento.paciente.rut}</p>

                      {/* Procedimiento */}
                      {evento.procedimiento && (
                        <p className="text-gray-600 mt-1">
                          {evento.procedimiento.descripcion}
                          {evento.lateralidad && (
                            <span className="text-gray-400 ml-2">
                              ({evento.lateralidad})
                            </span>
                          )}
                        </p>
                      )}

                      {/* Clinica */}
                      <p className="text-sm text-gray-400 mt-1">
                        {evento.clinica.nombre}
                      </p>

                      {/* Indicadores */}
                      <div className="flex gap-2 mt-2">
                        {evento.alergiaLatex && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                            Alergia Latex
                          </span>
                        )}
                        {evento.requiereBiopsia && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                            Biopsia
                          </span>
                        )}
                        {evento.requiereRayos && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                            Rayos X
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-2xl text-gray-300 ml-4">&rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-gray-500">
          Mostrando {eventosFiltrados.length} de {eventos.length} eventos
        </p>
      </main>
    </div>
  );
}
