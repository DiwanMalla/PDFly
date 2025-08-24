import { Suggestion, Admin } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import React, { Suspense } from "react";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
// import ChangePasswordDialog from "@/components/admin/ChangePasswordDialog";

const TEMP_HASH =
  "$2b$10$wTm2nUt4ijndFzH0aPutgujzDyeX2xO7N7AeAQWURu7n996nobEiu";

async function getSuggestions(): Promise<Suggestion[]> {
  return await prisma.suggestion.findMany({ orderBy: { createdAt: "desc" } });
}

async function getAdmin(): Promise<Admin | null> {
  return await prisma.admin.findUnique({
    where: { email: "malladipin@gmail.com" },
  });
}

export default async function AdminPage() {
  const suggestions = await getSuggestions();
  const admin = await getAdmin();
  const needsPasswordChange = admin && admin.password === TEMP_HASH;

  return (
    <AdminDashboardClient
      needsPasswordChange={needsPasswordChange}
      email={admin?.email || ""}
      suggestions={suggestions}
    />
  );
}
