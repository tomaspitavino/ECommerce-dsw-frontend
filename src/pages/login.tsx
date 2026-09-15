import React, { useState } from "react";
import api from "../api/axiosInstance";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    confirmPassword: "",
    nombre: "",
    apellido: "",
    direccion: "",
    telefono: "",
    dni: "",
    usuario: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    setFieldErrors({});
    setLoading(true);

    const {
      confirmPassword,
      nombre,
      apellido,
      direccion,
      telefono,
      dni,
      usuario,
    } = form;

    try {
      if (!email || !password) {
        setFieldErrors((prev) => ({
          ...prev,
          ...(!email && { email: "El email es obligatorio" }),
          ...(!password && { contrasenia: "La contraseña es obligatoria" }),
        }));
        setLoading(false);
        return;
      }

      if (isRegister) {
        if (password !== confirmPassword) {
          setFieldErrors((prev) => ({
            ...prev,
            confirmPassword: "Las contraseñas no coinciden",
          }));
          setLoading(false);
          return;
        }

        await api.post("/clientes", {
          email,
          contrasenia: password,
          nombre,
          apellido,
          direccion,
          telefono,
          dni,
          usuario,
        });

        alert("¡Registro exitoso!");
        setIsRegister(false); // cambia a login despues del registro
      } else {
        const response = await api.post("/auth/login", {
          email,
          contrasenia: password,
        });
        localStorage.setItem("clienteId", JSON.stringify(response.data.id));
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("rol", response.data.rol);

        alert("¡Inicio de sesión exitoso!");
        window.location.href = "/";
      }
      // se maneja lo que envia zod
    } catch (err: any) {
      if (err.response?.status === 400) {
        const issues = err.response.data.errors;
        if (Array.isArray(issues)) {
          const errors: Record<string, string> = {};
          issues.forEach((issue: any) => {
            const field = issue.path[0];
            if (field) errors[field] = issue.message;
          });
          setFieldErrors(errors);
        } else {
          setGlobalError("Solicitud inválida. Verificá los datos ingresados.");
        }
      } else if (err.response?.status === 401) {
        setGlobalError("Email o contraseña incorrecta");
      } else if (err.response?.status === 409) {
        setGlobalError("El email ya está registrado");
      } else {
        setGlobalError("Error al conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        flex flex-col items-center justify-center
        min-h-[calc(100vh-5.5rem)]
        px-4 pb-8 bg-gray-50
      "
    >
      <form
        onSubmit={handleSubmit}
        className="
      bg-white p-6 sm:p-8 rounded-2xl shadow-md
        w-full max-w-sm sm:max-w-md md:max-w-lg
        transition-all"
      >
        <h2 className="text-xl font-semibold text-center">
          {isRegister ? "Registrarse" : "Iniciar sesión"}
        </h2>

        {/* muestra error */}
        {globalError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {globalError}
          </div>
        )}

        <div className="space-y-4 pt-6 text-sm">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={`w-full text-gray-900 border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                fieldErrors.email ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="ejemplo@correo.com"
              required
              disabled={loading}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="contrasenia"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña
            </label>
            <input
              id="contrasenia"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, contrasenia: "" }));
              }}
              className={`w-full text-gray-900 border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                fieldErrors.contrasenia ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="Ingresa tu contraseña"
              minLength={8}
              maxLength={64}
              required
              disabled={loading}
            />
            {fieldErrors.contrasenia && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.contrasenia}
              </p>
            )}
          </div>
        </div>

        {isRegister && (
          <div className="space-y-4 pt-6 text-sm">
            {[
              {
                label: "Confirmar contraseña",
                key: "confirmPassword",
                type: "password",
                minLength: 8,
                maxLength: 64,
              },
              {
                label: "Nombre",
                key: "nombre",
                type: "text",
                minLength: 2,
              },
              {
                label: "Apellido",
                key: "apellido",
                type: "text",
                minLength: 2,
              },
              {
                label: "Dirección",
                key: "direccion",
                type: "text",
              },
              {
                label: "Teléfono",
                key: "telefono",
                type: "tel",
                minLength: 8,
              },
              {
                label: "DNI",
                key: "dni",
                type: "text",
                minLength: 8,
              },
              {
                label: "Nombre de usuario",
                key: "usuario",
                type: "text",
                minLength: 3,
              },
            ].map(({ label, key, type, minLength, maxLength }) => (
              <div key={key}>
                <label
                  htmlFor={key}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {label}
                </label>
                <input
                  key={key}
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => {
                    setForm({ ...form, [key]: e.target.value });
                    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
                  }}
                  placeholder={label}
                  required
                  minLength={minLength}
                  maxLength={maxLength}
                  disabled={loading}
                  className={`w-full text-gray-900 border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    fieldErrors[key] ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {fieldErrors[key] && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors[key]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white mt-6 transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
          }`}
        >
          {loading ? "Cargando..." : isRegister ? "Registrarse" : "Entrar"}
        </button>

        {/* enlace para cambiar modo */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <p className={"text-sm text-gray-800"}>
            {isRegister ? "¿Ya tenés una cuenta?" : "¿No tenés cuenta?"}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setGlobalError("");
            }}
            disabled={loading}
            className="text-sm text-white hover:underline font-medium ml-1"
          >
            {isRegister ? "Iniciar sesión" : "Registrate"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
