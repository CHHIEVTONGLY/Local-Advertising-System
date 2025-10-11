"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        body: JSON.stringify(loginForm),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Login failed");
      }

      router.push("/");
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="basis-1/4 bg-[#1E1E1E] text-white flex flex-col justify-center px-8">
      <h1 className="text-3xl font-bold mb-6">Admin Portal</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          className="p-3 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) =>
            setLoginForm({ ...loginForm, email: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Password"
          className="p-3 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 "
          onChange={(e) =>
            setLoginForm({ ...loginForm, password: e.target.value })
          }
        />
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 transition-colors p-3 rounded font-bold cursor-pointer"
        >
          Login
        </Button>
      </form>
    </div>
  );
}
