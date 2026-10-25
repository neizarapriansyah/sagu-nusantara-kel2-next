"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { SaguAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const passRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  // kalau sudah login, langsung ke dashboard
  useEffect(() => {
    document.title = "Masuk Admin — Sagu Nusantara";
    if (SaguAuth.session()) router.replace("/admin/dashboard");
  }, [router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (SaguAuth.login(username.trim(), password)) {
      router.replace("/admin/dashboard");
      return;
    }
    setError("Username atau password salah. Periksa lagi, lalu coba masuk.");
    setPassword("");
    passRef.current?.focus();
  }

  return (
    <main className="login">
      <div className="login__card">
        <div className="batik-strip" role="presentation" />

        <div className="login__body">
          <Link href="/" className="brand" aria-label="Kembali ke website Sagu Nusantara">
            <span className="media brand__logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/images/logo-sagu.png" alt="" />
            </span>
            <span className="brand__name">Sagu Nusantara</span>
          </Link>

          <h1 className="login__title">Masuk dashboard</h1>
          <p className="login__sub">Kelola seluruh konten website Sagu Nusantara.</p>

          <form onSubmit={onSubmit}>
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
                  ref={passRef}
                  type={show ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="field__toggle"
                  aria-pressed={show}
                  onClick={() => setShow((s) => !s)}
                >
                  {show ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="btn btn--primary btn--block">
              Masuk
            </button>
          </form>

          <Link href="/" className="login__back">
            ← Kembali ke website
          </Link>
        </div>
      </div>
    </main>
  );
}
