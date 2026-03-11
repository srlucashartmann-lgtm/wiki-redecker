import type { Metadata } from "next";
import CentroComando from "./CentroComando";
import React from "react";

export const metadata: Metadata = {
  title: "Centro de Comando | Wiki Redecker",
  description: "War Room Política · Visão consolidada do mandato",
};

export default function HomePage() {
  return <CentroComando />;
}
