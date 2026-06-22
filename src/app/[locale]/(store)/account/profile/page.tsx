"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useI18n } from "@/components/layout/locale-provider";
import { usePaths } from "@/hooks/use-paths";

export default function ProfilePage() {
  const { t } = useI18n();
  const paths = usePaths();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((u) => {
        setName(u.name ?? "");
        setEmail(u.email ?? "");
      });
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    if (res.ok) setMessage(t("account.profileUpdated"));
    else setError(t("account.profileError"));
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (res.ok) {
      setMessage(t("account.passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
    } else {
      const data = await res.json();
      setError(data.error ?? t("account.profileError"));
    }
  };

  return (
    <div className="space-y-10 max-w-md">
      <form onSubmit={saveProfile} className="space-y-4">
        <h2 className="text-[11px] uppercase tracking-widest text-muted">{t("account.personalData")}</h2>
        <Input label={t("common.name")} value={name} onChange={(e) => setName(e.target.value)} />
        <Input label={t("common.email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit">{t("common.save")}</Button>
      </form>

      <form onSubmit={changePassword} className="space-y-4">
        <h2 className="text-[11px] uppercase tracking-widest text-muted">{t("account.changePassword")}</h2>
        <Input label={t("account.currentPassword")} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <Input label={t("account.newPassword")} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <Button type="submit" variant="outline">{t("account.updatePassword")}</Button>
      </form>

      {message && <p className="text-xs text-green-700">{message}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button variant="outline" onClick={() => signOut({ callbackUrl: paths.home })}>
        {t("common.signOut")}
      </Button>
    </div>
  );
}
