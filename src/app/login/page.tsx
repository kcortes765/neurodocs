"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl: "/",
      });

      if (!result) {
        setError("No se pudo conectar con el servidor de autenticacion");
        return;
      }

      if (result.error) {
        setError("Usuario o contrase\u00f1a incorrectos");
        return;
      }

      const target = result.url || "/";
      router.push(target);
      router.refresh();
    } catch {
      setError("Error al iniciar sesion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-4xl">🧠</span>
          </div>
          <h1 className="text-3xl font-bold text-white">NeuroDoc</h1>
          <p className="text-blue-200 mt-2">Sistema de Documentacion Medica</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Iniciar Sesion
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-4 text-xl border-2 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="Ingrese su usuario"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 text-xl border-2 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="Ingrese su contrase\u00f1a"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-lg text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-5 text-xl font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-200 mt-6 text-sm">
          NeuroDoc Surgical Core v2.0
        </p>
      </div>
    </div>
  );
}
