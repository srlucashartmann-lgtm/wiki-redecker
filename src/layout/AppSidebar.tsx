"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { ChevronDownIcon, GridIcon, HorizontaLDots, PieChartIcon } from "../icons/index";

const IconTarget = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const IconLandmark = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const IconSparkles = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  badge?: string;
  subItems?: { name: string; path: string }[];
};

type NavSection = {
  groupLabel?: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    items: [
      { icon: <GridIcon />, name: "Início", path: "/" },
      {
        icon: <IconSparkles />,
        name: "Estrategista IA",
        path: "/chat",
        badge: "Beta",
      },
    ],
  },
  {
    groupLabel: "ESTRATÉGIA",
    items: [
      {
        icon: <IconTarget />,
        name: "Inteligência Eleitoral",
        subItems: [
          { name: "Raio-X Eleitoral", path: "/dashboard" },
          { name: "Evolução de Votos", path: "/votos" },
          { name: "Mapa de Emendas", path: "/emendas" },
        ],
      },
    ],
  },
  {
    items: [
      {
        icon: <PieChartIcon />,
        name: "Pesquisas",
        path: "/pesquisas",
      },
    ],
  },
  {
    groupLabel: "O MANDATO",
    items: [
      {
        icon: <IconLandmark />,
        name: "Atuação Federal",
        subItems: [
          { name: "Perfil & Coerência", path: "/perfil" },
          { name: "Articulação Política", path: "/articulacao" },
          { name: "Painel de Votações", path: "/votacoes" },
          { name: "Proposições", path: "/proposicoes" },
          { name: "Discursos & Notas", path: "/discursos" },
        ],
      },
    ],
  },
];

const allNavItems = navSections.flatMap((s) => s.items);

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const [openSubmenu, setOpenSubmenu] = useState<{ index: number } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let submenuMatched = false;
    allNavItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ index });
            submenuMatched = true;
          }
        });
      }
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) =>
      prev?.index === index ? null : { index }
    );
  };

  let globalIndex = 0;

  const renderSection = (section: NavSection, sectionIndex: number) => {
    const items = section.items.map((nav) => {
      const idx = globalIndex++;
      const hasSubItems = !!nav.subItems;

      return (
        <li key={nav.name}>
          {hasSubItems ? (
            <>
              <button
                type="button"
                onClick={() => handleSubmenuToggle(idx)}
                className={`menu-item group cursor-pointer ${
                  openSubmenu?.index === idx ? "menu-item-active" : "menu-item-inactive"
                } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
              >
                <span
                  className={
                    openSubmenu?.index === idx
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className="menu-item-text">{nav.name}</span>
                    <ChevronDownIcon
                      className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenu?.index === idx ? "rotate-180 text-brand-500" : ""
                      }`}
                    />
                  </>
                )}
              </button>
              {(isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`main-${idx}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height: openSubmenu?.index === idx ? `${subMenuHeight[`main-${idx}`] ?? 0}px` : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {nav.subItems!.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className="menu-item-text">{nav.name}</span>
                    {nav.badge && (
                      <span className="ml-auto rounded bg-brand-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        {nav.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            )
          )}
        </li>
      );
    });

    return (
      <div key={`nav-section-${sectionIndex}`} className="flex flex-col gap-4">
        {section.groupLabel && (isExpanded || isHovered || isMobileOpen) && (
          <h3
            className={`text-xs font-semibold uppercase tracking-wider text-gray-400 ${
              !isExpanded && !isHovered ? "lg:hidden" : ""
            }`}
          >
            {section.groupLabel}
          </h3>
        )}
        <ul className="flex flex-col gap-4">{items}</ul>
      </div>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:mt-0 mt-16 px-5 ${
        isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-center py-8">
        <Link href="/" className="flex items-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <span className="text-xl font-bold tracking-tight">
              <span className="text-gray-700 dark:text-gray-300">Wiki </span>
              <span className="text-brand-500">Redecker</span>
            </span>
          ) : (
            <span className="text-lg font-bold text-brand-500">WR</span>
          )}
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto no-scrollbar duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            {(!isExpanded && !isHovered && !isMobileOpen) && (
              <h2 className="mb-4 flex justify-center text-xs uppercase leading-[20px] text-gray-400">
                <HorizontaLDots />
              </h2>
            )}
            {navSections.map((section, sectionIndex) => renderSection(section, sectionIndex))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
