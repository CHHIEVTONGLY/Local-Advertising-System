import Image from "next/image";
import { LoginForm } from "../components/login-form/LoginForm";

export default async function Login() {
  return (
    <div className="flex h-screen">
      {/* Login Form */}
      <LoginForm />

      {/* Background Image */}
      <div className="basis-3/4 relative">
        <Image
          src="https://c0.wallpaperflare.com/preview/532/944/890/vintage-grunge-aesthetics-australia.jpg"
          alt="Login Image"
          fill
          className="object-cover brightness-75"
        />
        {/* Optional overlay for smoother blending */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
    </div>
  );
}
