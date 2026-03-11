import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard ROI | Wiki Redecker",
  description: "Cruzamento de emendas e votos",
};

export default function ROIPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Dashboard ROI" />
      <h1 className="text-2xl font-bold text-slate-800">Dashboard ROI</h1>
      <p className="text-slate-600">
        Cruzamento de emendas x votos — em construção.
      </p>
    </div>
  );
}
