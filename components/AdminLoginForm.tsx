"use client";

import { useState, type FormEvent } from "react";
import AdminMedia from "@/components/AdminMedia";
import { adminFetch, errorMessage } from "@/lib/adminClient";

// halaman login admin (admin-login.html versi UTS). cek akun dilakukan di server
export default function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await adminFetch("/api/admin/login", { method: "POST", body: { username: username.trim(), password } });
      window.location.replace("/admin/dashboard");
    } catch (err) {
      setError(errorMessage(err));
      setPassword("");
      setLoading(false);
      document.getElementById("password")?.focus();
    }
  }

  return (
    <div className="login-page">
      <main className="login">
        <div className="login__card">
          <div className="batik-strip" role="presentation"></div>

          <div className="login__body">
            <a href="/" className="brand" aria-label="Kembali ke website Sagu Nusantara">
              <AdminMedia className="brand__logo" src="/assets/images/logo-sagu.png" />
              <span className="brand__name">Sagu Nusantara</span>
            </a>

            <h1 className="login__title">Masuk dashboard</h1>
            <p className="login__sub">Kelola seluruh konten website Sagu Nusantara.</p>

            <form onSubmit={submit}>
              <div className="field">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="field__password">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {/* tombol lihat / sembunyikan password */}
                  <button
                    type="button"
                    className="field__toggle"
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((show) => !show)}
                  >
                    {showPassword ? "Sembunyikan" : "Lihat"}
                  </button>
                </div>
              </div>

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
                Masuk
              </button>
            </form>

            <a href="/" className="login__back">
              ← Kembali ke website
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
