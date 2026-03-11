"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const ComposableMap = dynamic(
  () => import("react-simple-maps").then((mod) => mod.ComposableMap),
  { ssr: false }
);
const Geographies = dynamic(
  () => import("react-simple-maps").then((mod) => mod.Geographies),
  { ssr: false }
);
const Geography = dynamic(
  () => import("react-simple-maps").then((mod) => mod.Geography),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-simple-maps").then((mod) => mod.Marker),
  { ssr: false }
);

/** TopoJSON dos estados brasileiros (fonte: gist ruliana) */
const GEO_URL =
  "https://gist.githubusercontent.com/ruliana/1ccaaab05ea113b0dff3b22be3b4d637/raw/br-states.json";

export interface RegiaoMapa {
  nome: string;
  coordenadas: [number, number]; // [longitude, latitude]
  votos: number;
}

const dadosRegioes: RegiaoMapa[] = [
  { nome: "Vale do Sinos", coordenadas: [-51.1, -29.7], votos: 45000 },
  { nome: "Serra Gaúcha", coordenadas: [-51.2, -29.1], votos: 32000 },
  { nome: "Metropolitana", coordenadas: [-51.2, -30.0], votos: 85000 },
  { nome: "Campanha", coordenadas: [-54.0, -31.3], votos: 18500 },
  { nome: "Norte", coordenadas: [-52.4, -28.3], votos: 28000 },
];

function formatarVotos(n: number): string {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

export default function MapaRS() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="px-5 py-4 sm:px-6">
        <h3 className="text-base font-semibold text-gray-800">
          Distribuição de Força por Macrorregião
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Votos de 2022 por região do Rio Grande do Sul (dados simulados)
        </p>
      </div>
      <div className="relative w-full overflow-hidden px-4 pb-4 sm:px-6 sm:pb-6">
        <div
          className="relative aspect-[4/3] w-full min-h-[280px] sm:min-h-[360px]"
          style={{ maxWidth: "100%" }}
        >
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              center: [-51, -30],
              scale: 2200,
            }}
            className="w-full h-full"
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies
              geography={GEO_URL}
              parseGeographies={(geos) => {
                if (!Array.isArray(geos)) return [];
                return geos.filter((g) => (g as { id?: string }).id === "RS");
              }}
            >
              {({ geographies }) => {
                const geos = geographies as { rsmKey: string; svgPath: string }[];
                return geos.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#e2e8f0"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                ));
              }}
            </Geographies>
            {dadosRegioes.map((regiao) => (
              <Marker
                key={regiao.nome}
                coordinates={regiao.coordenadas}
                onMouseEnter={() => setHovered(regiao.nome)}
                onMouseLeave={() => setHovered(null)}
              >
                <g
                  className="transition-transform duration-200 ease-out"
                  style={{
                    transform: hovered === regiao.nome ? "scale(1.15)" : "scale(1)",
                    transformOrigin: "50% 100%",
                  }}
                >
                  <defs>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow
                        dx="0"
                        dy="2"
                        stdDeviation="2"
                        floodColor="#312e81"
                        floodOpacity="0.35"
                      />
                    </filter>
                  </defs>
                  {/* Etiqueta (label) acima do ponto */}
                  <g transform="translate(0, -48)">
                    <rect
                      x="-52"
                      y="-24"
                      width="104"
                      height="48"
                      rx="6"
                      fill="white"
                      stroke="#c7d2fe"
                      strokeWidth="1"
                      filter="url(#shadow)"
                      className="transition-opacity"
                      opacity={hovered === regiao.nome ? 1 : 0.95}
                    />
                    <text
                      textAnchor="middle"
                      y="-8"
                      className="fill-slate-800 text-xs font-medium"
                    >
                      {regiao.nome}
                    </text>
                    <text
                      textAnchor="middle"
                      y="6"
                      className="fill-indigo-600 text-sm font-bold"
                    >
                      {formatarVotos(regiao.votos)} votos
                    </text>
                  </g>
                  {/* Ponto (círculo) */}
                  <circle
                    r={8}
                    fill="#4f46e5"
                    stroke="white"
                    strokeWidth={2}
                    filter="url(#shadow)"
                  />
                </g>
              </Marker>
            ))}
          </ComposableMap>
        </div>
        {/* Legenda */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="font-medium text-gray-600">Legenda:</span>
          <span>Ponto indica o centro aproximado da macrorregião</span>
          <span>•</span>
          <span>Votos referem-se a 2022 (mock)</span>
        </div>
      </div>
    </div>
  );
}
