"use client";

import { gerarNuvemDePalavras, type PalavraNuvem } from "@/lib/nuvemPalavras";
import type { Discurso } from "@/lib/discursos";
import dynamic from "next/dynamic";
import React from "react";

const TagCloud = dynamic(
  () => import("react-tagcloud").then((mod) => mod.TagCloud),
  { ssr: false }
);

const CORES = ["#475569", "#4f46e5", "#2563eb", "#6366f1", "#64748b", "#3b82f6"];

function rendererCustomizado(tag: { value: string; count: number }, size: number, _color: string | undefined) {
  const idx = Math.abs(hashCode(tag.value)) % CORES.length;
  const cor = CORES[idx];
  return (
    <span
      key={tag.value}
      className="tag-cloud-tag cursor-pointer transition-opacity hover:opacity-80"
      style={{
        fontSize: `${size}px`,
        color: cor,
        margin: "0 6px",
        verticalAlign: "middle",
        display: "inline-block",
      }}
    >
      {tag.value}
    </span>
  );
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

interface NuvemPalavrasCardProps {
  discursosFiltrados: Discurso[];
  onPalavraClick: (palavra: string) => void;
}

export default function NuvemPalavrasCard({
  discursosFiltrados,
  onPalavraClick,
}: NuvemPalavrasCardProps) {
  const nuvemData = React.useMemo(
    () => gerarNuvemDePalavras(discursosFiltrados, 45),
    [discursosFiltrados]
  );

  if (nuvemData.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-center text-sm text-slate-500">
          Nuvem de palavras indisponível. Aplique filtros ou adicione discursos.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="mb-4 text-sm font-medium text-slate-500">
        Palavras mais frequentes nos discursos visíveis
      </p>
      <div className="min-h-[120px] py-4">
        <TagCloud
          tags={nuvemData}
          minSize={14}
          maxSize={32}
          shuffle={false}
          randomSeed={42}
          disableRandomColor
          renderer={rendererCustomizado}
          onClick={(tag: PalavraNuvem) => onPalavraClick(tag.value)}
          className="flex flex-wrap items-center justify-center gap-1"
          containerComponent="div"
        />
      </div>
    </div>
  );
}
