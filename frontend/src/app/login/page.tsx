"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("operator@noworry.ai");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">NoWorry AI</h1>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
            Autonomous Revenue Recovery
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-blue-600 font-semibold hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? "Signing in..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Role Accounts */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block text-center">
            System Role Accounts (ADMIN, OPERATOR, ANALYST)
          </span>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              onClick={() => { setEmail("admin@noworry.ai"); setPassword("password123"); }}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-center transition"
            >
              ADMIN
            </button>
            <button
              onClick={() => { setEmail("operator@noworry.ai"); setPassword("password123"); }}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-center transition"
            >
              OPERATOR
            </button>
            <button
              onClick={() => { setEmail("analyst@noworry.ai"); setPassword("password123"); }}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-center transition"
            >
              ANALYST
            </button>
          </div>
        </div>

        {/* Signup redirect */}
        <div className="text-center text-xs text-slate-500 font-medium">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
