"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Tooltip } from "react-tooltip";

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
const ZoomableGroup = dynamic(
  () => import("react-simple-maps").then((mod) => mod.ZoomableGroup),
  { ssr: false }
);

/** GeoJSON dos municípios do RS (fonte: tbrugz/geodata-br) - fallback quando IBGE não retorna malha municipal */
const GEO_RS_MUNICIPIOS =
  "https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-43-mun.json";

const NEUTRO = "#e5e7eb";
const AZUL_CRESCIMENTO = "#2563eb";
const VERMELHO_QUEDA = "#dc2626";
const AZUL_HEAT_LIGHT = "#bfdbfe";
const AZUL_HEAT_DARK = "#1e3a8a";

const MIN_VOTES_OPCOES = [
  { label: "Todos", value: 0 },
  { label: "+100 votos", value: 100 },
  { label: "+500 votos", value: 500 },
  { label: "+1000 votos", value: 1000 },
] as const;

type ViewMode = "comparativo" | "volume2022";
type PerformanceFilter = "todos" | "cresceu" | "caiu" | "novos";

export interface VotosMunicipio {
  votos2018: number;
  votos2022: number;
}

export type DadosUnificados = Record<string, VotosMunicipio>;

/** Triturador de nomenclatura: normaliza para cruzar IBGE com JSON de votos (Sant'Ana, Passo-Fundo, etc.) */
function normalizeCityName(name: string): string {
  if (!name || typeof name !== "string") return "";

  // 1. Limpeza agressiva
  let cleanName = name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/['`´]/g, "")
    .replace(/- RS/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 2. Override Marreta (casos críticos IBGE vs TSE)
  if (cleanName.includes("LIVRAMENTO")) {
    return "SANTANA DO LIVRAMENTO";
  }
  if (cleanName === "SAO VALERIO DO SUL") {
    return "SAO VALERIO DO SUL";
  }

  return cleanName;
}

function formatCityName(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function interpolateColor(hexFrom: string, hexTo: string, t: number): string {
  const a = hexToRgb(hexFrom);
  const b = hexToRgb(hexTo);
  const r = a.r + (b.r - a.r) * t;
  const g = a.g + (b.g - a.g) * t;
  const B = a.b + (b.b - a.b) * t;
  return rgbToHex(r, g, B);
}

function getColor(
  dados: DadosUnificados | null,
  nomeNormalizado: string,
  viewMode: ViewMode,
  performanceFilter: PerformanceFilter,
  minVotes: number,
  maxVotos2022: number
): string {
  if (!dados) return NEUTRO;
  const info = dados[nomeNormalizado];
  if (!info) return NEUTRO;

  const votos2022 = info.votos2022;
  const votos2018 = info.votos2018;
  const cresceu = votos2022 > votos2018;
  const caiu = votos2022 <= votos2018; // inclui manteve e reduziu
  const novos = votos2018 === 0 && votos2022 > 0;

  // Corte de cauda: abaixo do mínimo -> cinza
  if (votos2022 < minVotes) return NEUTRO;

  // Filtro de performance: fora do critério -> cinza
  if (performanceFilter === "cresceu" && !cresceu) return NEUTRO;
  if (performanceFilter === "caiu" && !caiu) return NEUTRO;
  if (performanceFilter === "novos" && !novos) return NEUTRO;

  if (viewMode === "volume2022") {
    if (votos2022 === 0) return NEUTRO;
    if (maxVotos2022 === 0) return AZUL_HEAT_LIGHT;
    const ratio = votos2022 / maxVotos2022;
    return interpolateColor(AZUL_HEAT_LIGHT, AZUL_HEAT_DARK, ratio);
  }

  // comparativo
  if (cresceu) return AZUL_CRESCIMENTO;
  return VERMELHO_QUEDA;
}

interface ElectoralMapProps {
  dadosUnificados: DadosUnificados;
}

export default function ElectoralMap({ dadosUnificados }: ElectoralMapProps) {
  const [geoJson, setGeoJson] = useState<GeoJSON.FeatureCollection | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [tooltipId] = useState(
    () => `electoral-map-tooltip-${Math.random().toString(36).slice(2)}`
  );

  const [viewMode, setViewMode] = useState<ViewMode>("comparativo");
  const [performanceFilter, setPerformanceFilter] =
    useState<PerformanceFilter>("todos");
  const [minVotes, setMinVotes] = useState(0);

  const MAP_CENTER: [number, number] = [-53.8, -30.4];

  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>(MAP_CENTER);

  const handleZoomIn = () => setZoom((z) => Math.min(8, z * 1.4));
  const handleZoomOut = () => setZoom((z) => Math.max(1, z / 1.4));
  const handleMoveEnd = ({
    coordinates,
    zoom: z,
  }: {
    coordinates: [number, number];
    zoom: number;
  }) => {
    setCenter(coordinates);
    setZoom(z);
  };

  const maxVotos2022 = useMemo(() => {
    return Math.max(
      ...Object.values(dadosUnificados).map((d) => d.votos2022),
      1
    );
  }, [dadosUnificados]);

  useEffect(() => {
    // IBGE malha municipal do RS (estado 43); fallback para tbrugz/geodata-br
    const ibgeUrl =
      "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR/estados/43/municipios?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio";
    fetch(ibgeUrl)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data?.features && data.features.length > 10) {
          setGeoJson(data);
        } else {
          throw new Error("IBGE retornou malha incompleta");
        }
      })
      .catch(() => fetch(GEO_RS_MUNICIPIOS).then((r) => r.json()))
      .then((data) => {
        if (data?.features) setGeoJson(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !geoJson) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex aspect-[4/3] items-center justify-center text-slate-500">
          Carregando mapa...
        </div>
      </div>
    );
  }

  const getNameFromProps = (props: Record<string, unknown>): string => {
    const name =
      (props.name as string) ??
      (props.NM_MUNICIPIO as string) ??
      (props.nome as string) ??
      (props.description as string) ??
      "";
    return String(name);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="px-5 py-3 sm:px-6">
        <h3 className="text-base font-semibold text-gray-800">
          Distribuição de Votos por Município
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {viewMode === "comparativo"
            ? "Comparativo 2018 vs 2022 • Azul = crescimento • Vermelho = queda"
            : "Volume de votos 2022 • Azul mais forte = mais votos"}
        </p>
      </div>

      {/* Painel de Controle - Filtros */}
      <div className="border-t border-gray-100 bg-slate-50/80 px-4 py-2.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* 1. Modo de Visualização */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Modo
            </span>
            <div className="flex rounded-lg bg-white p-0.5 shadow-sm ring-1 ring-gray-200/80">
              <button
                type="button"
                onClick={() => setViewMode("comparativo")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === "comparativo"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Comparativo
              </button>
              <button
                type="button"
                onClick={() => setViewMode("volume2022")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === "volume2022"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Volume 2022
              </button>
            </div>
          </div>

          {/* 2. Filtro de Performance */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Performance
            </span>
            <select
              value={performanceFilter}
              onChange={(e) =>
                setPerformanceFilter(e.target.value as PerformanceFilter)
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm ring-1 ring-gray-200/80 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="todos">Todos</option>
              <option value="cresceu">Cresceu</option>
              <option value="caiu">Caiu</option>
              <option value="novos">Novos (0→+2022)</option>
            </select>
          </div>

          {/* 3. Corte de Cauda */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Mín. votos
            </span>
            <select
              value={minVotes}
              onChange={(e) => setMinVotes(Number(e.target.value))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm ring-1 ring-gray-200/80 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {MIN_VOTES_OPCOES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="relative w-full px-4 pb-4 sm:px-6 sm:pb-6 pt-1">
        <div className="relative w-full min-h-[600px] h-[600px] flex items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-slate-50">
          <ComposableMap
            width={800}
            height={600}
            projection="geoMercator"
            projectionConfig={{
              scale: 4200,
              center: MAP_CENTER,
            }}
            style={{ width: "100%", height: "100%", maxHeight: "600px" }}
            preserveAspectRatio="xMidYMid meet"
          >
            <ZoomableGroup
              center={center}
              zoom={zoom}
              minZoom={1}
              maxZoom={8}
              onMoveEnd={handleMoveEnd}
            >
            <Geographies geography={geoJson}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const props = geo.properties || {};
                  const nomeOriginal = getNameFromProps(props);
                  const nomeNormalizado = normalizeCityName(nomeOriginal);
                  const info = dadosUnificados[nomeNormalizado];
                  const fill = getColor(
                    dadosUnificados,
                    nomeNormalizado,
                    viewMode,
                    performanceFilter,
                    minVotes,
                    maxVotos2022
                  );

                  let content = "";
                  if (info) {
                    const variacao = info.votos2022 - info.votos2018;
                    const sinal = variacao >= 0 ? "+" : "";
                    content = `${formatCityName(nomeOriginal)}\nVotos 2018: ${info.votos2018.toLocaleString("pt-BR")}\nVotos 2022: ${info.votos2022.toLocaleString("pt-BR")}\nVariação: ${sinal}${variacao.toLocaleString("pt-BR")} votos`;
                  } else {
                    content = `${formatCityName(nomeOriginal)}\nSem dados de votos`;
                  }

                  return (
                    <g
                      key={geo.rsmKey ?? geo.id ?? nomeNormalizado}
                      data-tooltip-id={tooltipId}
                      data-tooltip-content={content}
                    >
                      <Geography
                        geography={geo}
                        fill={fill}
                        stroke="#ffffff"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", cursor: "pointer" },
                          pressed: { outline: "none" },
                        }}
                      />
                    </g>
                  );
                })
              }
            </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* Controles de Zoom */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1 shadow-lg rounded-lg overflow-hidden border border-gray-200 bg-white">
            <button
              type="button"
              onClick={handleZoomIn}
              className="flex items-center justify-center w-10 h-10 text-lg font-semibold text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              aria-label="Aumentar zoom"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="flex items-center justify-center w-10 h-10 text-lg font-semibold text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              aria-label="Diminuir zoom"
            >
              −
            </button>
          </div>

          {/* Dica de navegação */}
          <p className="absolute bottom-4 left-4 text-xs text-slate-500 bg-white/90 backdrop-blur-sm px-2 py-1 rounded border border-gray-200">
            Dica: Use o scroll ou arraste para navegar no mapa
          </p>
        </div>
        <Tooltip
          id={tooltipId}
          place="top"
          className="!bg-slate-800 !text-white !text-xs !py-2 !px-3 !rounded-lg !max-w-[220px] !whitespace-pre-line"
        />
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="font-medium text-gray-600">Legenda:</span>
          {viewMode === "comparativo" ? (
            <>
              <span className="flex items-center gap-1">
                <span
                  className="inline-block h-3 w-4 rounded"
                  style={{ backgroundColor: AZUL_CRESCIMENTO }}
                />
                Crescimento (2022 &gt; 2018)
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="inline-block h-3 w-4 rounded"
                  style={{ backgroundColor: VERMELHO_QUEDA }}
                />
                Queda (2022 ≤ 2018)
              </span>
            </>
          ) : (
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-4 rounded"
                style={{ backgroundColor: AZUL_HEAT_LIGHT }}
              />
              <span className="text-gray-400">—</span>
              <span
                className="inline-block h-3 w-4 rounded"
                style={{ backgroundColor: AZUL_HEAT_DARK }}
              />
              <span>Poucos votos → Muitos votos</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-4 rounded bg-gray-300" />
            Neutro / Sem dados
          </span>
        </div>
      </div>
    </div>
  );
}
