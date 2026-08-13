"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Github,
  Sun,
  Moon,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setView, pushNotification } from "@/lib/redux/appSlice";
import { setCredentials } from "@/lib/redux/authSlice";
import { resetDataState } from "@/lib/redux/dataSlice";
import {
  useLoginMutation,
  useRegisterMutation,
  authApi,
} from "@/lib/redux/api/authApiSlice";
import { workspaceApi } from "@/lib/redux/api/workspaceApiSlice";
import { adminApi } from "@/lib/redux/api/adminApiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo, Wordmark } from "@/features/navigation";
import { useTheme } from "next-themes";

interface AuthViewProps {
  initialMode?: "login" | "signup";
}

export function AuthView({ initialMode = "login" }: AuthViewProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  // API Mutations
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

  // Form State
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isLoading = isLoginLoading || isRegisterLoading;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(initialMode);
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (mode === "login") {
      const toastId = toast.loading("Authenticating user...");
      try {
        const response = await login({ email, password, rememberMe }).unwrap();

        if (response.success && response.data) {
          const { user, accessToken } = response.data;
          dispatch(workspaceApi.util.resetApiState());
          dispatch(authApi.util.resetApiState());
          dispatch(adminApi.util.resetApiState());
          dispatch(resetDataState());
          dispatch(setCredentials({ user, token: accessToken }));
          dispatch(
            pushNotification({
              title: "Welcome back!",
              description: `Authenticated as ${user.email}`,
              type: "success",
            }),
          );
          toast.success(`Welcome back, ${user.name || user.email}!`, {
            id: toastId,
          });
          dispatch(setView("dashboard"));
          router.push("/dashboard");
        } else {
          toast.error(response.message || "Failed to log in", { id: toastId });
        }
      } catch (err: any) {
        const errorMsg =
          err?.data?.message ||
          err?.error ||
          "Login failed. Please check your credentials.";
        toast.error(errorMsg, { id: toastId });
      }
    } else {
      if (password !== confirmPassword) {
        setFieldErrors({ confirmPassword: "Passwords do not match" });
        return;
      }

      if (password.length < 6) {
        setFieldErrors({
          password: "Password must be at least 6 characters long",
        });
        return;
      }

      const toastId = toast.loading("Creating your account...");
      try {
        const username =
          email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") +
          Math.floor(Math.random() * 1000);
        const response = await register({
          name: name.trim() ? name.trim() : undefined,
          email: email.trim(),
          password,
          confirmPassword,
          username,
        }).unwrap();

        if (response.success) {
          // Auto-login user after successful registration
          try {
            const loginRes = await login({
              email: email.trim(),
              password,
              rememberMe: true,
            }).unwrap();
            if (loginRes.success && loginRes.data) {
              const { user, accessToken } = loginRes.data;
              dispatch(workspaceApi.util.resetApiState());
              dispatch(authApi.util.resetApiState());
              dispatch(adminApi.util.resetApiState());
              dispatch(resetDataState());
              dispatch(setCredentials({ user, token: accessToken }));
              toast.success(
                "Account created successfully! Welcome to NoteFlow AI.",
                { id: toastId },
              );
              dispatch(setView("dashboard"));
              router.push("/dashboard");
              return;
            }
          } catch {
            // Fallback to sign-in view if auto-login fails
          }

          toast.success(
            response.message ||
              "Account created successfully! Please sign in with your credentials.",
            { id: toastId, duration: 5000 },
          );
          setMode("login");
          dispatch(setView("login"));
          router.push("/login");
        } else {
          toast.error(response.message || "Registration failed", {
            id: toastId,
          });
        }
      } catch (err: any) {
        if (err?.data?.errors && Array.isArray(err.data.errors)) {
          const errors: Record<string, string> = {};
          err.data.errors.forEach((e: any) => {
            if (e.field && e.message) {
              const fieldName = e.field.split(".").pop() || e.field;
              errors[fieldName] = e.message;
            }
          });
          setFieldErrors(errors);
          toast.error("Please fix the errors in the form", { id: toastId });
          return;
        }

        const backendMsg = err?.data?.message || err?.error || "";
        if (backendMsg.toLowerCase().includes("email")) {
          setFieldErrors({ email: backendMsg });
          toast.error("Please check your email address", { id: toastId });
          return;
        }

        const errorMsg = backendMsg || "Registration failed. Please try again.";
        toast.error(errorMsg, { id: toastId });
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-mesh p-4 md:p-8">
      {/* Ambient glowing Orbs */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute top-10 right-1/3 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Top action bar: Home & Theme */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <button
          onClick={() => dispatch(setView("landing"))}
          className="group flex items-center gap-2.5 rounded-xl border border-indigo-500/20 bg-background/50 px-3.5 py-1.5 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/40 hover:bg-background/80"
        >
          <Logo
            size={28}
            className="neon-glow-indigo transition-transform group-hover:scale-105"
          />
          <Wordmark className="text-sm" />
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl border border-border/60 bg-background/50 backdrop-blur-xl hover:border-indigo-500/40 hover:text-indigo-500"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-500" />
          )}
        </Button>
      </div>

      {/* Main Digital Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="digital-hud-glass digital-scanline relative my-16 w-full max-w-md overflow-hidden rounded-3xl border border-indigo-500/30 bg-background/70 p-6 shadow-2xl backdrop-blur-2xl sm:p-8"
      >
        {/* Header HUD System Badge */}
        <div className="mb-6 flex items-center justify-between border-b border-indigo-500/15 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] font-bold tracking-widest text-emerald-500 uppercase">
              {mode === "login" ? "SYS.AUTH_LOGIN" : "SYS.AUTH_REGISTER"}
            </span>
          </div>
          <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-indigo-600 dark:text-indigo-300">
            ENCRYPTED v3.5
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mb-6 grid grid-cols-2 rounded-2xl border border-indigo-500/20 bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              dispatch(setView("login"));
            }}
            className={`relative rounded-xl py-2 text-xs font-semibold transition-all duration-300 ${
              mode === "login"
                ? "bg-background text-foreground shadow-md shadow-indigo-500/10 border border-indigo-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              dispatch(setView("signup"));
            }}
            className={`relative rounded-xl py-2 text-xs font-semibold transition-all duration-300 ${
              mode === "signup"
                ? "bg-background text-foreground shadow-md shadow-indigo-500/10 border border-indigo-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">
            {mode === "login"
              ? "Access your intelligence hub"
              : "Start your 14-day free trial"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === "login"
              ? "Enter your credentials to manage meeting notes and AI insights."
              : "No credit card required. Instant deployment for your team."}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div
                key="signup-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500/70" />
                    <Input
                      type="text"
                      required
                      placeholder="Alex Mercer"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (fieldErrors.name)
                          setFieldErrors({ ...fieldErrors, name: "" });
                      }}
                      className={`h-10 rounded-xl border bg-background/50 pl-9 text-xs transition-all focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] ${
                        fieldErrors.name
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-indigo-500/20 focus:border-indigo-500/60"
                      }`}
                    />
                  </div>
                  {fieldErrors.name && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-1.5 text-[10px] text-red-400"
                    >
                      {fieldErrors.name}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500/70" />
              <Input
                type="email"
                required
                placeholder="alex@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email)
                    setFieldErrors({ ...fieldErrors, email: "" });
                }}
                className={`h-10 rounded-xl border bg-background/50 pl-9 text-xs transition-all focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] ${
                  fieldErrors.email
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-indigo-500/20 focus:border-indigo-500/60"
                }`}
              />
            </div>
            {fieldErrors.email && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-1.5 text-[10px] text-red-400"
              >
                {fieldErrors.email}
              </motion.p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              {mode === "login" && (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast("Password reset instructions sent to your email.", {
                      icon: "ℹ️",
                    });
                  }}
                  className="text-[11px] font-medium text-indigo-500 hover:underline"
                >
                  Forgot password?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500/70" />
              <Input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password)
                    setFieldErrors({ ...fieldErrors, password: "" });
                }}
                className={`h-10 rounded-xl border bg-background/50 pl-9 pr-10 text-xs transition-all focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] ${
                  fieldErrors.password
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-indigo-500/20 focus:border-indigo-500/60"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-1.5 text-[10px] text-red-400"
              >
                {fieldErrors.password}
              </motion.p>
            )}
          </div>

          {/* Confirm Password field for Signup */}
          {mode === "signup" && (
            <div>
              <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500/70" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword)
                      setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                  }}
                  className={`h-10 rounded-xl border bg-background/50 pl-9 pr-10 text-xs transition-all focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] ${
                    fieldErrors.confirmPassword
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-indigo-500/20 focus:border-indigo-500/60"
                  }`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-1.5 text-[10px] text-red-400"
                >
                  {fieldErrors.confirmPassword}
                </motion.p>
              )}
            </div>
          )}

          {/* Options Checkboxes */}
          {mode === "login" ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-indigo-500/30 accent-indigo-600"
              />
              <label
                htmlFor="remember"
                className="text-xs text-muted-foreground select-none cursor-pointer"
              >
                Keep me signed in on this device
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 rounded border-indigo-500/30 accent-indigo-600"
              />
              <label
                htmlFor="terms"
                className="text-xs text-muted-foreground select-none cursor-pointer"
              >
                I agree to the Terms of Service & Privacy Policy
              </label>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 gap-2 rounded-xl  from-indigo-600 via-indigo-500 to-violet-600 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:opacity-95 mt-2 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2 text-xs">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </span>
            ) : (
              <>
                <span>
                  {mode === "login" ? "Sign In to Hub" : "Create Free Account"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/60" />
          <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider">
            OR CONTINUE WITH
          </span>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              toast("Social authentication is coming soon!", { icon: "🚀" })
            }
            className="h-10 rounded-xl border border-indigo-500/20 bg-background/50 gap-2 text-xs font-semibold hover:border-indigo-500/50 hover:bg-indigo-500/10 cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              toast("Social authentication is coming soon!", { icon: "🚀" })
            }
            className="h-10 rounded-xl border border-indigo-500/20 bg-background/50 gap-2 text-xs font-semibold hover:border-indigo-500/50 hover:bg-indigo-500/10 cursor-pointer"
          >
            <Github className="h-4 w-4" />
            GitHub
          </Button>
        </div>

        {/* Footer Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 pt-4 border-t border-indigo-500/10 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>AES-256 Bit Encryption • SOC2 Certified</span>
        </div>
      </motion.div>
    </div>
  );
}
