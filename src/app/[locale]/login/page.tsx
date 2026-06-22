"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import SiteLogo from "@/components/ui/site-logo";
import LocaleSwitcher from "@/components/layout/locale-switcher";
import { useI18n } from "@/components/layout/locale-provider";
import { usePaths } from "@/hooks/use-paths";
import { LOGIN_IMAGE } from "@/lib/mock-images";
import MediaImage from "@/components/ui/media-image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const paths = usePaths();
  const isAdmin = searchParams.get("admin") === "1";
  const callbackUrl =
    searchParams.get("callbackUrl") || (isAdmin ? "/admin" : paths.account);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError(t("login.invalidCredentials"));
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError(t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t("login.registerFailed"));
        return;
      }
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError(t("login.accountCreatedLoginFailed"));
        return;
      }
      router.push(paths.account);
      router.refresh();
    } catch {
      setError(t("login.registerError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh]">
      <div className="hidden lg:flex fixed top-0 left-0 right-0 z-50 items-center justify-between m-4 sm:m-6 safe-top safe-x pointer-events-none">
        <Link
          href={paths.home}
          className="pointer-events-auto flex items-center justify-center min-h-11 min-w-11 rounded-full border border-border bg-white/90 backdrop-blur-md text-foreground shadow-sm hover:bg-surface transition-colors"
          aria-label={t("login.backToShop")}
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <LocaleSwitcher className="shrink-0 pointer-events-auto" />
      </div>

      <div className="min-h-[100dvh] grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:block bg-foreground overflow-hidden">
        <MediaImage
          src={LOGIN_IMAGE}
          alt="RewindDrop"
          fill
          fit="cover"
          imageFit="max"
          priority
          imageWidth={1400}
          className="opacity-70 object-[center_40%]"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-foreground/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-12 xl:p-16">
          <SiteLogo size="hero" className="text-white mb-6" />
          <p className="text-white/60 text-sm max-w-sm leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>
      </div>

      <div className="flex flex-col min-h-[100dvh] lg:justify-center bg-white">
        <div className="lg:hidden container-wide shrink-0">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link
              href={paths.home}
              className="shrink-0 transition-opacity hover:opacity-90"
            >
              <SiteLogo size="nav" />
            </Link>
            <LocaleSwitcher className="shrink-0" />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 pb-12 sm:px-10 lg:px-16 lg:py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-display text-2xl sm:text-3xl font-semibold tracking-tight">
              {isAdmin
                ? t("login.admin")
                : mode === "login"
                  ? t("login.signIn")
                  : t("login.register")}
            </h1>
            <p className="text-sm text-muted mt-2">
              {isAdmin ? t("login.adminHint") : t("login.customerHint")}
            </p>
          </div>

          {!isAdmin && (
            <div className="flex gap-2 p-1 mb-8 bg-surface rounded-full">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 min-h-11 rounded-full text-xs uppercase tracking-widest transition-colors ${
                  mode === "login"
                    ? "bg-foreground text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {t("login.signIn")}
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 min-h-11 rounded-full text-xs uppercase tracking-widest transition-colors ${
                  mode === "register"
                    ? "bg-foreground text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {t("login.register")}
              </button>
            </div>
          )}

          <form
            onSubmit={
              mode === "register" && !isAdmin ? handleRegister : handleLogin
            }
            className="space-y-4"
          >
            {mode === "register" && !isAdmin && (
              <Input
                label={t("login.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <Input
              label={t("login.email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label={t("login.password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <Button
              type="submit"
              fullWidth
              shape="pill"
              size="lg"
              loading={loading}
            >
              {mode === "register" && !isAdmin
                ? t("login.createAccount")
                : t("login.signIn")}
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </form>

          <p className="text-[10px] text-muted text-center leading-relaxed mt-8">
            {t("common.demo")}
          </p>

          <div className="text-center text-xs text-muted mt-6 space-y-3">
            <Link
              href={paths.home}
              className="block hover:text-foreground transition-colors"
            >
              {t("login.backToShop")}
            </Link>
            {!isAdmin && (
              <Link
                href={`${paths.login}?admin=1&callbackUrl=/admin`}
                className="block hover:text-foreground transition-colors"
              >
                {t("login.adminAccess")}
              </Link>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
    </div>
  );
}

function LoginLoading() {
  const { t } = useI18n();
  return (
    <div className="min-h-[100dvh] flex items-center justify-center text-muted text-sm">
      {t("login.loading")}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
