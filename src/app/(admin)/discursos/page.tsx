import DiscursosClient from "./DiscursosClient";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  computeDiscursosKPIs,
  parseDiscurso,
  type Discurso,
} from "@/lib/discursos";
import { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";

export const metadata: Metadata = {
  title: "Discursos | Wiki Redecker",
  description: "Discursos parlamentares na Câmara dos Deputados",
};

const DISCURSOS_DIR = path.join(process.cwd(), "data", "federal", "discursos");

async function loadDiscursos(): Promise<{
  discursos: Discurso[];
  error: string | null;
}> {
  try {
    if (!fs.existsSync(DISCURSOS_DIR)) {
      return { discursos: [], error: "Pasta de discursos não encontrada." };
    }

    const files = fs.readdirSync(DISCURSOS_DIR).filter((f) => f.endsWith(".md"));
    if (files.length === 0) {
      return { discursos: [], error: "Nenhum arquivo de discurso encontrado." };
    }

    const discursos: Discurso[] = [];

    for (const file of files) {
      const filePath = path.join(DISCURSOS_DIR, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = parseDiscurso(content, file);
      if (parsed) discursos.push(parsed);
    }

    discursos.sort((a, b) => {
      const da = new Date(a.data_bruta).getTime();
      const db = new Date(b.data_bruta).getTime();
      return db - da;
    });

    return { discursos, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao carregar discursos.";
    return { discursos: [], error: message };
  }
}

export default async function DiscursosPage() {
  const { discursos, error } = await loadDiscursos();
  const kpis = computeDiscursosKPIs(discursos);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Discursos" />
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Discursos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Discursos parlamentares na Câmara dos Deputados
        </p>
      </div>
      <DiscursosClient
        discursos={discursos}
        kpis={kpis}
        error={error}
      />
    </div>
  );
}
