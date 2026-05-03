import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type Step = "login" | "register" | "verify" | "forgot" | "reset";

export default function Auth() {
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
          toast({ variant: "destructive", title: "Erreur", description: data.message });
        }
        return;
      }
      queryClient.setQueryData(["/api/auth/user"], data.user);
      setLocation("/");
    } catch {
      toast({ variant: "destructive", title: "Erreur réseau", description: "Impossible de se connecter" });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !firstName) return;
    if (password.length < 8) {
      toast({ variant: "destructive", title: "Mot de passe trop court", description: "8 caractères minimum" });
      return;
    }
    if (password !== confirmPass) {
      toast({ variant: "destructive", title: "Mots de passe différents", description: "Les mots de passe ne correspondent pas" });
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
        toast({ variant: "destructive", title: "Erreur", description: data.message });
        return;
      }
      setStep("verify");
    } catch {
      toast({ variant: "destructive", title: "Erreur réseau", description: "Impossible de créer le compte" });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast({ variant: "destructive", title: "Code invalide", description: "Entrez le code à 6 chiffres" });
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
        toast({ variant: "destructive", title: "Code invalide", description: data.message });
        return;
      }
      queryClient.setQueryData(["/api/auth/user"], data.user);
      setLocation("/");
    } catch {
      toast({ variant: "destructive", title: "Erreur réseau" });
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
      toast({ variant: "destructive", title: "Erreur réseau" });
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!code || !password) return;
    if (password.length < 8) {
      toast({ variant: "destructive", title: "Mot de passe trop court", description: "8 caractères minimum" });
      return;
    }
    if (password !== confirmPass) {
      toast({ variant: "destructive", title: "Mots de passe différents" });
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
        toast({ variant: "destructive", title: "Erreur", description: data.message });
        return;
      }
      toast({ title: "Mot de passe modifié", description: "Connectez-vous avec votre nouveau mot de passe" });
      setPassword("");
      setConfirmPass("");
      setCode("");
      setStep("login");
    } catch {
      toast({ variant: "destructive", title: "Erreur réseau" });
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
      toast({ title: "Code renvoyé", description: `Un nouveau code a été envoyé à ${email}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <header className="px-6 py-4">
        <a href="/" className="flex items-center gap-2 text-slate-700 hover:text-blue-700 transition-colors w-fit">
          <BookOpen className="h-5 w-5 text-blue-700" />
          <span className="font-bold text-lg">Refbib</span>
        </a>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">

            {/* LOGIN */}
            {step === "login" && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
                  <p className="text-slate-500 mt-1 text-sm">Accédez à votre espace Refbib</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Adresse email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="login-email"
                        data-testid="input-email"
                        type="email"
                        placeholder="vous@exemple.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Mot de passe</Label>
                      <button
                        type="button"
                        onClick={() => setStep("forgot")}
                        className="text-xs text-blue-600 hover:underline"
                        data-testid="link-forgot-password"
                      >
                        Mot de passe oublié ?
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
                    Se connecter
                  </Button>
                </form>
                <p className="text-center text-sm text-slate-500 mt-6">
                  Pas encore de compte ?{" "}
                  <button
                    onClick={() => setStep("register")}
                    className="text-blue-600 font-medium hover:underline"
                    data-testid="link-register"
                  >
                    Créer un compte
                  </button>
                </p>
              </>
            )}

            {/* REGISTER */}
            {step === "register" && (
              <>
                <div className="mb-6">
                  <button onClick={() => setStep("login")} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm mb-4">
                    <ArrowLeft className="h-4 w-4" /> Retour
                  </button>
                  <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
                  <p className="text-slate-500 mt-1 text-sm">Rejoignez Refbib gratuitement</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="reg-firstname">Prénom <span className="text-red-500">*</span></Label>
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
                      <Label htmlFor="reg-lastname">Nom</Label>
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
                    <Label htmlFor="reg-email">Adresse email <span className="text-red-500">*</span></Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="reg-email"
                        data-testid="input-email-register"
                        type="email"
                        placeholder="vous@exemple.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reg-password">Mot de passe <span className="text-red-500">*</span></Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="reg-password"
                        data-testid="input-password-register"
                        type={showPass ? "text" : "password"}
                        placeholder="8 caractères minimum"
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
                    <Label htmlFor="reg-confirm">Confirmer le mot de passe <span className="text-red-500">*</span></Label>
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
                    Créer mon compte
                  </Button>
                </form>
                <p className="text-center text-sm text-slate-500 mt-6">
                  Déjà un compte ?{" "}
                  <button
                    onClick={() => setStep("login")}
                    className="text-blue-600 font-medium hover:underline"
                    data-testid="link-login"
                  >
                    Se connecter
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
                  <h1 className="text-2xl font-bold text-slate-900">Vérifiez votre email</h1>
                  <p className="text-slate-500 mt-2 text-sm">
                    Un code à 6 chiffres a été envoyé à<br />
                    <strong className="text-slate-700">{email}</strong>
                  </p>
                </div>
                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <Label htmlFor="verify-code">Code de vérification</Label>
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
                    Vérifier
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:underline"
                    data-testid="button-resend-code"
                  >
                    Renvoyer le code
                  </button>
                  <span className="text-slate-300 mx-2">|</span>
                  <button onClick={() => setStep("login")} className="text-sm text-slate-500 hover:underline">
                    Retour
                  </button>
                </div>
              </>
            )}

            {/* FORGOT PASSWORD */}
            {step === "forgot" && (
              <>
                <div className="mb-6">
                  <button onClick={() => setStep("login")} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm mb-4">
                    <ArrowLeft className="h-4 w-4" /> Retour à la connexion
                  </button>
                  <h1 className="text-2xl font-bold text-slate-900">Mot de passe oublié</h1>
                  <p className="text-slate-500 mt-1 text-sm">Entrez votre email pour recevoir un code de réinitialisation</p>
                </div>
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <Label htmlFor="forgot-email">Adresse email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="forgot-email"
                        data-testid="input-forgot-email"
                        type="email"
                        placeholder="vous@exemple.com"
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
                    Envoyer le code
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
                  <h1 className="text-2xl font-bold text-slate-900 text-center">Nouveau mot de passe</h1>
                  <p className="text-slate-500 mt-2 text-sm text-center">
                    Code envoyé à <strong className="text-slate-700">{email}</strong>
                  </p>
                </div>
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-code">Code reçu par email</Label>
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
                    <Label htmlFor="reset-password">Nouveau mot de passe</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="reset-password"
                        data-testid="input-new-password"
                        type={showPass ? "text" : "password"}
                        placeholder="8 caractères minimum"
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
                    <Label htmlFor="reset-confirm">Confirmer</Label>
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
                    Réinitialiser le mot de passe
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Renvoyer le code
                  </button>
                </div>
              </>
            )}

          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            En créant un compte, vous acceptez nos{" "}
            <a href="#" className="hover:underline">Conditions d'utilisation</a>
            {" "}et notre{" "}
            <a href="#" className="hover:underline">Politique de confidentialité</a>
          </p>
        </div>
      </div>
    </div>
  );
}
