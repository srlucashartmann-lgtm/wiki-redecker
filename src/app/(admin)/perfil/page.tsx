import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProfileDashboard from "./ProfileDashboard";
import { loadProfileData } from "@/lib/perfil";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Perfil & Coerência | Wiki Redecker",
  description: "Dossiê do parlamentar · Biografia, trajetória e mandatos",
};

export default function PerfilPage() {
  const profileData = loadProfileData();

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Perfil & Coerência" />
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white/90">
          Perfil & Coerência
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
          Dossiê executivo · Biografia, trajetória política e mandatos
        </p>
      </div>
      <ProfileDashboard profileData={profileData} />
    </div>
  );
}
