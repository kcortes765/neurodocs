"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        setError("Usuario o contraseña incorrectos");
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
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-[90%] sm:max-w-md lg:max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg overflow-hidden p-2">
            <Image
              src="/logo.png"
              alt="NeuroMedic"
              width={96}
              height={96}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">NeuroMedic</h1>
          <p className="text-blue-200 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg">Neurocirujanos</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 lg:p-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 text-center mb-5 sm:mb-6 lg:mb-8">
            Iniciar Sesion
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-base sm:text-lg font-medium text-gray-700 mb-1.5 sm:mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 sm:px-4 py-3 sm:py-4 text-lg sm:text-xl border-2 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Ingrese su usuario"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-base sm:text-lg font-medium text-gray-700 mb-1.5 sm:mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 pr-12 sm:pr-14 text-lg sm:text-xl border-2 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Ingrese su contraseña"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-base sm:text-lg text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 sm:px-6 py-4 sm:py-5 text-lg sm:text-xl font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-200 mt-4 sm:mt-6 text-xs sm:text-sm">
          NeuroMedic v2.0
        </p>
      </div>
    </div>
  );
}
