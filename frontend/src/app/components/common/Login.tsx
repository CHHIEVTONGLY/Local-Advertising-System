"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { useStore } from "@/lib/zustance";
import { jwtDecode } from "jwt-decode";
import { UserPayload } from "@/app/types/UserPayload";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "@/lib/validation";
import { Loader } from "lucide-react";
type View = "login" | "register" | "forgot-password";

interface LoginProps {
  view: View;
  switchView: (v: View) => void;
  onClose: () => void;
}

export default function Login({ view, switchView, onClose }: LoginProps) {
  // minimal local state for login form (you can replace with your own)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    contact: "",
  });
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: "",
  });
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<"password" | "text">(
    "password"
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [registerError, setRegisterError] = useState<string>("");
  const [errorForgotPassword, setErrorForgotPassword] = useState<string>("");

  const { login, setAvatarUrl } = useStore();

  // close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Validate without throwing
    const result = loginSchema.safeParse(loginForm);
    if (!result.success) {
      const first = result.error.issues[0];
      setMessage(first?.message || "Invalid input");
      return; // stop here, don't call API
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/login", result.data);
      if (response.status === 200) {
        setMessage(response.data.message);
        const token = response.data.token;
        Cookies.set("token", token, {
          expires: 7,
          secure: true,
          sameSite: "Strict",
        });
        login(token);
        const decodedToken: UserPayload = jwtDecode(token);
        setAvatarUrl(decodedToken.profileUrl);
        setTimeout(() => {
          onClose();
          setMessage("");
        }, 1500);
        setShowPassword("password");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setMessage(error.response?.data?.error?.error || "Login Failed!");
      } else {
        setMessage("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse(registerForm);
    if (!result.success) {
      const first = result.error.issues[0];
      setRegisterError(first?.message || "Invalid input");
      return;
    }
    try {
      setLoading(true);
      if (registerForm.password !== confirmPassword) {
        setRegisterError("Passwords do not match!");
        return;
      }
      const response = await axios.post(`/api/register`, registerForm);

      if (response.status === 200) {
        setRegisterError(response.data.message || "Registration successful!");
        setTimeout(() => {
          setRegisterForm({
            name: "",
            email: "",
            password: "",
            company: "",
            contact: "",
          });
          switchView("login");
          setRegisterError("");
          setMessage("");
        }, 1500);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const data = error.response?.data;
        let msg = "Registration failed!";
        if (Array.isArray(data?.errors)) {
          msg = data.errors
            .map((e: any) => e.msg || e.message || String(e))
            .join(", ");
        } else if (typeof data?.error === "string") {
          msg = data.error;
        } else if (typeof data?.message === "string") {
          msg = data.message;
        } else if (typeof data?.error?.error === "string") {
          msg = data.error.error;
        }
        setRegisterError(msg);
      } else {
        setRegisterError("An unexpected error occurred.");
      }
      setTimeout(() => setRegisterError(null), 1500);
    } finally {
      setLoading(false);
    }
  };

  //   HandleForgotPassword
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = forgotPasswordSchema.safeParse(forgotPasswordForm);
    if (!result.success) {
      const first = result.error.issues[0];
      setErrorForgotPassword(first?.message || "Invalid input");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `/api/forgot-password`,
        forgotPasswordForm
      );

      if (response.status === 200) {
        setErrorForgotPassword(response.data.message || "Email sent!");
        setTimeout(() => {
          switchView("login");
          setForgotPasswordForm({ email: "" });
          setErrorForgotPassword("");
          setMessage("");
        }, 1500);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const res = error.response?.data;
        if (Array.isArray(res?.errors)) {
          setErrorForgotPassword(res.errors[0]?.msg || "Failed to send email!");
        } else if (res?.error) {
          setErrorForgotPassword(res.error || "Failed to send email!");
        } else {
          setErrorForgotPassword(error.response?.data.message);
        }
        setTimeout(() => {
          setErrorForgotPassword("");
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 grid grid-cols-[auto_1fr_auto] items-center">
          <span aria-hidden className="w-5" />
          <div className="relative mb-4">
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              ✕
            </button>
            <h2 className="text-center font-[roboto] text-xl md:text-3xl text-blue-600 font-bold whitespace-nowrap">
              {view === "login" && "Login"}
              {view === "register" && "Create account"}
              {view === "forgot-password" && "Reset password"}
            </h2>
            <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
              {view === "login" &&
                "Let’s explore our Global Advertising System."}
              {view === "register" && "Create your account to start exploring."}
              {view === "forgot-password" &&
                "Enter your email to recover access."}
            </p>
          </div>
        </div>

        {view === "login" && (
          <div className="space-y-3">
            {/* Your login form UI; fields are wired for you to replace */}
            <form
              className="flex flex-col gap-4"
              onSubmit={handleLogin}
              noValidate
            >
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                autoComplete="email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
              />
              <div className="relative">
                <input
                  type={showPassword}
                  placeholder="Password"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 pr-16 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  autoComplete="current-password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                />
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer select-none text-sm text-gray-500 dark:text-gray-400"
                  onClick={() =>
                    setShowPassword(
                      showPassword === "password" ? "text" : "password"
                    )
                  }
                >
                  {showPassword === "password" ? "Show" : "Hide"}
                </span>
              </div>

              <div className="flex justify-between">
                <div>
                  {message && (
                    <span
                      className={
                        message.toLowerCase().includes("success")
                          ? "text-sm text-green-500"
                          : "text-sm text-red-500"
                      }
                    >
                      {message}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => switchView("forgot-password")}
                  className="text-sm font-medium cursor-pointer hover:underline text-blue-600 hover:text-blue-700 dark:hover:text-blue-500"
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                className="cursor-pointer rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
                aria-label="Login"
                disabled={loading}
              >
                {loading ? "Loading..." : "Login"}
              </Button>
            </form>

            <div className="mt-2 text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Don&apos;t have an account?{" "}
              </span>
              <button
                onClick={() => switchView("register")}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:hover:text-blue-500 hover:underline cursor-pointer"
              >
                Register
              </button>
            </div>
          </div>
        )}

        {view === "register" && (
          <div className="space-y-3">
            <form className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Name"
                className="px-4 w-full py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition"
                autoComplete="name"
                required
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                className="px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition"
                autoComplete="email"
                required
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
              />

              <input
                type="password"
                placeholder="Password"
                className="px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition"
                autoComplete="current-password"
                required
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition"
                autoComplete="current-password"
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {/* Company & Contact  */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Company (Optional)"
                  className="px-4 w-full py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition"
                  autoComplete="name"
                  required
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      company: e.target.value,
                    })
                  }
                />

                <input
                  type="text"
                  placeholder="Contact (Optional)"
                  className="px-4 py-3 w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition"
                  autoComplete="tel"
                  required
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      contact: e.target.value,
                    })
                  }
                />
              </div>

              <div className="h-5 ">
                {registerError && (
                  <p className="text-sm">
                    <span
                      className={
                        registerError.includes("successfully")
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {registerError}
                    </span>
                  </p>
                )}
              </div>

              <Button
                type="submit"
                aria-label="Register"
                className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold rounded-lg py-3 transition"
                disabled={loading}
                onClick={handleRegister}
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" /> Submit...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
            <div className="text-sm text-center">
              Already have an account?{" "}
              <button
                className="text-blue-700 hover:underline cursor-pointer"
                onClick={() => switchView("login")}
              >
                Sign in
              </button>
            </div>
          </div>
        )}

        {view === "forgot-password" && (
          <div className="space-y-3">
            <form
              className="flex flex-col gap-2"
              onSubmit={handleLogin}
              noValidate
            >
              <input
                type="email"
                placeholder="Email"
                className="px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition w-full"
                autoComplete="email"
                required
                onChange={(e) =>
                  setForgotPasswordForm({
                    ...forgotPasswordForm,
                    email: e.target.value,
                  })
                }
              />
              <div className="">
                {errorForgotPassword && (
                  <span
                    className={
                      errorForgotPassword.toLowerCase().includes("sent")
                        ? "text-green-500 text-sm"
                        : "text-red-500 text-sm"
                    }
                  >
                    {errorForgotPassword}
                  </span>
                )}
              </div>

              <Button
                type="submit"
                aria-label="Forgot Password"
                className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold rounded-lg py-3 transition"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" /> Submit...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
            <div className="text-sm text-center ">
              Remembered your password?{" "}
              <button
                className="text-sky-600 cursor-pointer hover:underline"
                onClick={() => switchView("login")}
              >
                Back to sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
