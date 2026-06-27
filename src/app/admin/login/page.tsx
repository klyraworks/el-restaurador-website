"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      username: form.get("username"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }

    router.push("/admin");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F4F4F5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      padding: "20px",
    }}>
      <div style={{
        background: "#fff",
        border: "1px solid #E4E4E7",
        borderRadius: "18px",
        padding: "36px",
        width: "100%",
        maxWidth: "380px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "28px" }}>
          <div style={{
            width: "32px", height: "32px",
            background: "#10121A",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: "15px", fontWeight: 900 }}>R</span>
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#10121A" }}>El Restaurador</p>
            <p style={{ fontSize: "11px", color: "#A1A1AA" }}>Acceso al panel</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#71717A" }}>
              Usuario
            </label>
            <input
              name="username"
              type="text"
              required
              autoComplete="username"
              placeholder="username o telegram_id"
              style={{
                padding: "10px 12px",
                border: "1px solid #E4E4E7",
                borderRadius: "9px",
                fontSize: "14px",
                fontFamily: "inherit",
                outline: "none",
                background: "#FAFAFA",
                color: "#10121A",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#71717A" }}>
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              style={{
                padding: "10px 12px",
                border: "1px solid #E4E4E7",
                borderRadius: "9px",
                fontSize: "14px",
                fontFamily: "inherit",
                outline: "none",
                background: "#FAFAFA",
                color: "#10121A",
              }}
            />
          </div>

          {error && (
            <p style={{
              fontSize: "12px",
              color: "#dc2626",
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "7px",
              padding: "8px 12px",
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "4px",
              padding: "11px",
              background: "#10121A",
              color: "#fff",
              border: "none",
              borderRadius: "9px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}