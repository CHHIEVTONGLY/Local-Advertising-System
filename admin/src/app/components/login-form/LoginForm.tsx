"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TargetCursor from "@/components/TargetCursor";
import { toast } from "sonner";

export function LoginForm() {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous error
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        body: JSON.stringify(loginForm),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || errorData.message || "Login failed");
        toast.error(errorData.error || errorData.message || "Login failed");
        return;
      }

      toast.success("Login successful!");
      router.push("/");
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="basis-1/4 bg-[#1E1E1E] text-white flex flex-col justify-center px-8">
      <TargetCursor hideDefaultCursor={true} spinDuration={2} />
      <h1 className="text-3xl font-bold mb-6">Admin Portal</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          className="cursor-target cursor-none p-3 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) =>
            setLoginForm({ ...loginForm, email: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Password"
          className="cursor-target cursor-none p-3 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 "
          onChange={(e) =>
            setLoginForm({ ...loginForm, password: e.target.value })
          }
        />
        <Button
          type="submit"
          className="cursor-target cursor-none bg-blue-600 hover:bg-blue-700 transition-colors p-3 rounded font-bold"
        >
          Login
        </Button>
      </form>
    </div>
  );
}
