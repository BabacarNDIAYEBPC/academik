import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSEO } from "@/hooks/use-seo";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import logoUrl from "@assets/logo_academik_minimal.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type Step = "login" | "register" | "verify" | "forgot" | "reset";

export default function Auth() {
  const { t } = useTranslation();
  useSEO("auth");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("login");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsVerification) {
          await resendCode("verify");
          setStep("verify");
        } else {
          toast({ variant: "destructive", title: t("error"), description: data.message });
        }
        return;
      }
      queryClient.setQueryData(["/api/auth/user"], data.user);
      setLocation("/");
    } catch {
      toast({ variant: "destructive", title: t("err_network"), description: t("err_network_login") });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !firstName) return;
    if (password.length < 8) {
      toast({ variant: "destructive", title: t("err_short_pass"), description: t("err_short_pass_desc") });
      return;
    }
    if (password !== confirmPass) {
      toast({ variant: "destructive", title: t("err_pass_diff"), description: t("err_pass_diff_desc") });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: t("error"), description: data.message });
        return;
      }
      setStep("verify");
    } catch {
      toast({ variant: "destructive", title: t("err_network"), description: t("err_network_register") });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast({ variant: "destructive", title: t("err_invalid_code"), description: t("err_invalid_code_desc") });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: t("err_invalid_code"), description: data.message });
        return;
      }
      queryClient.setQueryData(["/api/auth/user"], data.user);
      setLocation("/");
    } catch {
      toast({ variant: "destructive", title: t("err_network") });
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStep("reset");
    } catch {
      toast({ variant: "destructive", title: t("err_network") });
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!code || !password) return;
    if (password.length < 8) {
      toast({ variant: "destructive", title: t("err_short_pass"), description: t("err_short_pass_desc") });
      return;
    }
    if (password !== confirmPass) {
      toast({ variant: "destructive", title: t("err_pass_diff") });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: t("error"), description: data.message });
        return;
      }
      toast({ title: t("password_changed"), description: t("password_changed_desc") });
      setPassword("");
      setConfirmPass("");
      setCode("");
      setStep("login");
    } catch {
      toast({ variant: "destructive", title: t("err_network") });
    } finally {
      setLoading(false);
    }
  }

  async function resendCode(type: "verify" | "reset" = "verify") {
    await fetch("/api/auth/resend-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type }),
    });
  }

  async function handleResend() {
    setLoading(true);
    try {
      await resendCode(step === "reset" ? "reset" : "verify");
      toast({ title: t("code_resent"), description: `${t("code_resent_desc")} ${email}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-slate-700 hover:text-blue-700 transition-colors w-fit">
          <img src={logoUrl} alt="Academik" className="w-7 h-7 object-contain" />
          <span className="font-bold text-lg">{t("app_name")}</span>
        </a>
        <LanguageSwitcher compact />
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">

            {/* LOGIN */}
            {step === "login" && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-slate-900">{t("login_title")}</h1>
                  <p className="text-slate-500 mt-1 text-sm">{t("login_subtitle")}</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">{t("email")}</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="login-email"
                        data-testid="input-email"
                        type="email"
                        placeholder={t("email_placeholder")}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">{t("password")}</Label>
                      <button
                        type="button"
                        onClick={() => setStep("forgot")}
                        className="text-xs text-blue-600 hover:underline"
                        data-testid="link-forgot-password"
                      >
                        {t("forgot_password")}
                      </button>
                    </div>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="login-password"
                        data-testid="input-password"
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="pl-9 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    data-testid="button-login"
                    className="w-full bg-blue-700 hover:bg-blue-800"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {t("login_btn")}
                  </Button>
                </form>
                <p className="text-center text-sm text-slate-500 mt-6">
                  {t("no_account")}{" "}
                  <button
                    onClick={() => setStep("register")}
                    className="text-blue-600 font-medium hover:underline"
                    data-testid="link-register"
                  >
                    {t("create_account_link")}
                  </button>
                </p>
              </>
            )}

            {/* REGISTER */}
            {step === "register" && (
              <>
                <div className="mb-6">
                  <button onClick={() => setStep("login")} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm mb-4">
                    <ArrowLeft className="h-4 w-4" /> {t("back")}
                  </button>
                  <h1 className="text-2xl font-bold text-slate-900">{t("register_title")}</h1>
                  <p className="text-slate-500 mt-1 text-sm">{t("register_subtitle")}</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="reg-firstname">{t("firstname")} <span className="text-red-500">*</span></Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-firstname"
                          data-testid="input-firstname"
                          placeholder="Jean"
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="reg-lastname">{t("lastname")}</Label>
                      <Input
                        id="reg-lastname"
                        data-testid="input-lastname"
                        placeholder="Dupont"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reg-email">{t("email")} <span className="text-red-500">*</span></Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="reg-email"
                        data-testid="input-email-register"
                        type="email"
                        placeholder={t("email_placeholder")}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reg-password">{t("password")} <span className="text-red-500">*</span></Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="reg-password"
                        data-testid="input-password-register"
                        type={showPass ? "text" : "password"}
                        placeholder={t("min_8_chars")}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="pl-9 pr-10"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reg-confirm">{t("confirm_password")} <span className="text-red-500">*</span></Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="reg-confirm"
                        data-testid="input-confirm-password"
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPass}
                        onChange={e => setConfirmPass(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    data-testid="button-register"
                    className="w-full bg-blue-700 hover:bg-blue-800"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {t("register_btn")}
                  </Button>
                </form>
                <p className="text-center text-sm text-slate-500 mt-6">
                  {t("already_account")}{" "}
                  <button
                    onClick={() => setStep("login")}
                    className="text-blue-600 font-medium hover:underline"
                    data-testid="link-login"
                  >
                    {t("login_link")}
                  </button>
                </p>
              </>
            )}

            {/* VERIFY */}
            {step === "verify" && (
              <>
                <div className="mb-6 text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-7 w-7 text-blue-700" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">{t("verify_title")}</h1>
                  <p className="text-slate-500 mt-2 text-sm">
                    {t("verify_subtitle")}<br />
                    <strong className="text-slate-700">{email}</strong>
                  </p>
                </div>
                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <Label htmlFor="verify-code">{t("verification_code")}</Label>
                    <Input
                      id="verify-code"
                      data-testid="input-verification-code"
                      placeholder="123456"
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="mt-1 text-center text-2xl tracking-[0.5em] font-mono"
                      maxLength={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    data-testid="button-verify"
                    className="w-full bg-blue-700 hover:bg-blue-800"
                    disabled={loading || code.length !== 6}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {t("verify_btn")}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:underline"
                    data-testid="button-resend-code"
                  >
                    {t("resend_code")}
                  </button>
                  <span className="text-slate-300 mx-2">|</span>
                  <button onClick={() => setStep("login")} className="text-sm text-slate-500 hover:underline">
                    {t("back")}
                  </button>
                </div>
              </>
            )}

            {/* FORGOT PASSWORD */}
            {step === "forgot" && (
              <>
                <div className="mb-6">
                  <button onClick={() => setStep("login")} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm mb-4">
                    <ArrowLeft className="h-4 w-4" /> {t("back_to_login")}
                  </button>
                  <h1 className="text-2xl font-bold text-slate-900">{t("forgot_title")}</h1>
                  <p className="text-slate-500 mt-1 text-sm">{t("forgot_subtitle")}</p>
                </div>
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <Label htmlFor="forgot-email">{t("email")}</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="forgot-email"
                        data-testid="input-forgot-email"
                        type="email"
                        placeholder={t("email_placeholder")}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    data-testid="button-send-reset"
                    className="w-full bg-blue-700 hover:bg-blue-800"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {t("send_code")}
                  </Button>
                </form>
              </>
            )}

            {/* RESET PASSWORD */}
            {step === "reset" && (
              <>
                <div className="mb-6">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 text-center">{t("reset_title")}</h1>
                  <p className="text-slate-500 mt-2 text-sm text-center">
                    {t("reset_subtitle")} <strong className="text-slate-700">{email}</strong>
                  </p>
                </div>
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-code">{t("code_received")}</Label>
                    <Input
                      id="reset-code"
                      data-testid="input-reset-code"
                      placeholder="123456"
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="mt-1 text-center text-2xl tracking-[0.5em] font-mono"
                      maxLength={6}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reset-password">{t("new_password")}</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="reset-password"
                        data-testid="input-new-password"
                        type={showPass ? "text" : "password"}
                        placeholder={t("min_8_chars")}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="pl-9 pr-10"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reset-confirm">{t("confirm_label")}</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="reset-confirm"
                        data-testid="input-confirm-new-password"
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPass}
                        onChange={e => setConfirmPass(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    data-testid="button-reset-password"
                    className="w-full bg-blue-700 hover:bg-blue-800"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {t("reset_btn")}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {t("resend_code")}
                  </button>
                </div>
              </>
            )}

          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            {t("terms_agree")}{" "}
            <a href="#" className="hover:underline">{t("terms_link")}</a>
            {" "}{t("and_privacy")}{" "}
            <a href="#" className="hover:underline">{t("privacy_link")}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
