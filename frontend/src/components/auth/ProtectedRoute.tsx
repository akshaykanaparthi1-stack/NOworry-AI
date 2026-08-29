"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/demo-merchant"];

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith("/login"));

  useEffect(() => {
    setMounted(true);
    if (!user && !isPublic) {
      router.push("/login");
    }
  }, [user, isPublic, router]);

  return <>{children}</>;
};
