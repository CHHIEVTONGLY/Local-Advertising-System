"use client";
import ThemeToggle from "./common/ThemeToggle";
import Image from "next/image";
import { useEffect, useState } from "react";
import Login from "./common/Login";
import Cookies from "js-cookie";
import { useStore } from "../utils/zustance";
import { UserPayload } from "../types/UserPayload";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WalletDisplay from "./common/WalletDisplay";

export default function NavigationBar() {
  const [login, setLogin] = useState(false);
  const [view, setView] = useState<"login" | "register" | "forgot-password">(
    "login"
  );
  const [user, setUser] = useState<UserPayload | null>(null);
  const { avatarUrl, setAvatarUrl, logout } = useStore();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const decodedToken: UserPayload = jwtDecode(token);
      setAvatarUrl(decodedToken.profileUrl);
      setUser(decodedToken);
    }
  }, [setAvatarUrl]);

  const handleLogOut = () => {
    Cookies.remove("token");
    logout();
    setUser(null);
    setLogin(false);
  };

  return (
    <div>
      {/* Logo  */}
      <nav className="p-2 border-b-1 border-gray-200 dark:border-gray-800 w-full">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href={"/"}>
              <Image
                className="rounded-full"
                src="https://globaladvertisingstorage.s3.ap-southeast-2.amazonaws.com/profiles/SEProject.png"
                width={50}
                height={50}
                alt="Logo"
              />
            </Link>
            <h1 className="text-lg font-semibold">Global Advertising</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Wallet Display */}
            <Link
              href="/publish"
              className="rounded-md px-3 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Publish Ad
            </Link>
            {avatarUrl && <WalletDisplay />}
            <ThemeToggle />
            {avatarUrl ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Image
                    src={avatarUrl || "/default-avatar.png"}
                    alt={"User Avatar"}
                    width={50}
                    height={50}
                    className="rounded-full h-8 w-8 object-cover cursor-pointer"
                  />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  alignOffset={-4}
                  sideOffset={8}
                  className="min-w-[180px] sm:min-w-[200px] bg-white text-black dark:bg-[#1e1e1e] dark:text-white rounded-md shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <DropdownMenuGroup>
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link href="/dashboard">
                      <DropdownMenuItem className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800">
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        My Dashboard
                      </DropdownMenuItem>
                    </Link>

                    <DropdownMenuItem
                      onClick={handleLogOut}
                      className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 text-red-500"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => {
                  setView("login");
                  setLogin(true);
                }}
                className="rounded-md px-3 py-2 text-sm font-semibold bg-blue-600 cursor-pointer text-white hover:bg-blue-700"
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Theme Toggle and User profile */}
      </nav>
      {login && (
        <Login
          view={view}
          switchView={setView}
          onClose={() => {
            setLogin(false);
            setView("login");
          }}
        />
      )}
    </div>
  );
}
