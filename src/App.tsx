import React, { useState, useEffect } from "react";
import { Resume } from "./types";
import Dashboard from "./components/Dashboard";
import ConversationalForm from "./components/ConversationalForm";
import ResumeRenderer from "./components/ResumeRenderer";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import { 
  FolderPlus, Layers, Database, Sparkles, 
  ArrowLeft, HelpCircle, FileText, ChevronRight, Info,
  Home, PlusCircle, BarChart2, Globe, Menu, X
} from "lucide-react";

const LOCAL_STORAGE_KEY = "tramites_resumes_db";

const DEFAULT_SAMPLE_RESUMES: Resume[] = [
  {
    id: "carlos-mendoza",
    slug: "carlos-mendoza",
    name: "Carlos Alberto Mendoza",
    nombres: "Carlos Alberto",
    apellidos: "Mendoza Rojas",
    identificacion: "1023456789",
    lugar_expedicion: "Bogotá D.C.",
    fecha_nacimiento: "1990-08-15",
    lugar_nacimiento: "Bogotá",
    estado_civil: "Soltero",
    celular: "3115551234",
    correo: "carlos.mendoza@example.com",
    direccion: "Calle 45 # 12-34",
    barrio: "Chapinero",
    ciudad: "Bogotá",
    position: "Ingeniero de Sistemas",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop",
    city: "Bogotá",
    country: "Colombia",
    email: "carlos.mendoza@example.com",
    phone: "3115551234",
    website: "https://carlosmendoza.dev",
    summary: "Profesional en Ingeniería de Sistemas con más de 6 años de experiencia en desarrollo de software y gestión de infraestructuras de tecnologías. Comprometido con soluciones de calidad, escalables y con alto impacto para servicios digitales.",
    created_at: "2026-05-20T10:00:00.000Z",
    experiences: [
      {
        id: "exp1",
        role: "Coordinador de Desarrollo",
        company: "Sistemas & Soluciones S.A.S.",
        start_date: "2022-01",
        end_date: "",
        current: true,
        description: "Liderazgo técnico del equipo de desarrollo, implementación de arquitecturas escalables basadas en servicios web y supervisión de integraciones críticas con bases de datos.",
        ciudad: "Bogotá"
      },
      {
        id: "exp2",
        role: "Desarrollador Full Stack",
        company: "Tecnología Avanzada Ltda.",
        start_date: "2019-06",
        end_date: "2021-12",
        current: false,
        description: "Desarrollo y mantenimiento de aplicativos internos utilizando React y Node.js, optimización de consultas SQL y automatizaciones en la nube.",
        ciudad: "Medellín"
      }
    ],
    education: [
      {
        id: "edu1",
        degree: "Ingeniero de Sistemas",
        school: "Universidad de los Andes",
        start_date: "2015-12",
        end_date: "",
        current: false,
        description: "Graduado con honores académicos y tesis laureada en computación móvil.",
        ciudad: "Bogotá"
      }
    ],
    skills: [
      { id: "sk1", name: "JavaScript / TypeScript / React", level: 90 },
      { id: "sk2", name: "Bases de Datos SQL & NoSQL", level: 85 },
      { id: "sk3", name: "Servicios en la Nube", level: 80 }
    ],
    references: [
      {
        id: "ref1",
        name: "Ing. Andrés Gómez",
        role: "Director de TI",
        phone: "3201234567",
        ciudad: "Bogotá"
      },
      {
        id: "ref2",
        name: "Dra. Patricia Restrepo",
        role: "Gerente de Proyectos",
        phone: "3159876543",
        ciudad: "Medellín"
      }
    ]
  }
];

export default function App() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  // Initially evaluate if user is logged in
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("ciber_user_authed") === "true";
  });
  const [currentView, setCurrentView] = useState<"landing" | "login" | "dashboard" | "wizard" | "renderer">("landing");
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [publicPortfolioSlug, setPublicPortfolioSlug] = useState<string | null>(null);
  const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Check URL queries on load and hash updates to handle dynamic routing mimics
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cvSlug = params.get("cv");
    if (cvSlug) {
      setPublicPortfolioSlug(cvSlug);
    } else {
      // Direct view routing according to authentication state
      if (!isAuthenticated) {
        setCurrentView("landing");
      } else {
        setCurrentView("dashboard");
      }
    }
  }, [isAuthenticated]);

  // Fetch resumes from backend Express server or fallback locally
  const fetchResumesFromServer = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch("/api/resumes");
      if (!res.ok) throw new Error("Could not fetch resumes");
      const data = await res.json();
      setResumes(data);
      setIsOffline(false);
      
      // Silently sync local copy
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      
      // Select first resume as preview default if present and none already selected
      if (data.length > 0 && !selectedPreviewId) {
        setSelectedPreviewId(data[0].id);
      }

      // If a public portfolio query slug is present, auto-load that profile
      const params = new URLSearchParams(window.location.search);
      const cvSlug = params.get("cv");
      if (cvSlug) {
        const matchingCv = data.find(
          (r: Resume) => r.slug.toLowerCase() === cvSlug.toLowerCase() || r.id === cvSlug
        );
        if (matchingCv) {
          setSelectedResume(matchingCv);
          setCurrentView("renderer");
        } else {
          setErrorMsg(`CV profile '${cvSlug}' could not be located in database.`);
        }
      }
    } catch (err: any) {
      console.warn("Express server not found, falling back to secure Local Storage mode.", err);
      setIsOffline(true);
      
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      let dataList: Resume[] = [];
      if (stored) {
        try {
          dataList = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse stored resumes", e);
        }
      }
      
      if (!dataList || dataList.length === 0) {
        dataList = DEFAULT_SAMPLE_RESUMES;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataList));
      }

      setResumes(dataList);
      
      if (dataList.length > 0 && !selectedPreviewId) {
        setSelectedPreviewId(dataList[0].id);
      }

      const params = new URLSearchParams(window.location.search);
      const cvSlug = params.get("cv");
      if (cvSlug) {
        const matchingCv = dataList.find(
          (r: Resume) => r.slug.toLowerCase() === cvSlug.toLowerCase() || r.id === cvSlug
        );
        if (matchingCv) {
          setSelectedResume(matchingCv);
          setCurrentView("renderer");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumesFromServer();
  }, [publicPortfolioSlug]);

  // Create or Update resume
  const handleSaveResume = async (resume: Resume) => {
    const pNombres = resume.nombres || resume.name || "Sin nombres";
    const pApellidos = resume.apellidos || "";
    const pFullName = resume.name || `${pNombres} ${pApellidos}`.trim();
    const pPosition = resume.position || "Profesional";

    // Standardize IDs
    const id = resume.id || Math.random().toString(36).substring(2, 11);
    const rawSlug = pFullName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    let slug = rawSlug || "perfil";
    let slugCount = 1;
    while (resumes.some(r => r.id !== id && r.slug === slug)) {
      slug = `${rawSlug}-${slugCount++}`;
    }

    const cleanedResume: Resume = {
      ...resume,
      id,
      slug,
      name: pFullName,
      nombres: pNombres,
      apellidos: pApellidos,
      position: pPosition,
      created_at: resume.created_at || new Date().toISOString(),
    };

    // Update in local state right away
    const updated = [...resumes];
    const existingIndex = updated.findIndex(r => r.id === id);
    if (existingIndex !== -1) {
      updated[existingIndex] = cleanedResume;
    } else {
      updated.push(cleanedResume);
    }

    setResumes(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    if (!isOffline) {
      try {
        const res = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanedResume)
        });
        if (res.ok) {
          const savedData = await res.json();
          await fetchResumesFromServer();
          setSelectedResume(savedData);
          setCurrentView("renderer");
          setEditingResume(null);
          return;
        }
      } catch (err: any) {
        console.warn("Failed remote POST, saved locally:", err);
        setIsOffline(true);
      }
    }

    setSelectedResume(cleanedResume);
    setCurrentView("renderer");
    setEditingResume(null);
  };

  // Delete resume
  const handleDeleteResume = async (id: string) => {
    const confirmation = window.confirm("¿Está seguro de que desea eliminar permanentemente esta hoja de vida?");
    if (!confirmation) return;

    const remaining = resumes.filter(r => r.id !== id);
    setResumes(remaining);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remaining));

    if (selectedPreviewId === id) {
      setSelectedPreviewId(remaining[0]?.id || null);
    }

    if (!isOffline) {
      try {
        const res = await fetch(`/api/resumes/${id}`, {
          method: "DELETE"
        });
        if (!res.ok) throw new Error("Deletion failed");
      } catch (err: any) {
        console.warn("Could not delete remotely, deleted locally:", err);
        setIsOffline(true);
      }
    }
  };

  const handleEditResumeTrigger = (resume: Resume) => {
    setEditingResume(resume);
    setCurrentView("wizard");
  };

  const handleCreateNewResumeTrigger = () => {
    setEditingResume(null);
    setCurrentView("wizard");
    setIsSidebarOpen(false);
  };

  const handleViewResumeTrigger = (resume: Resume) => {
    setSelectedResume(resume);
    setCurrentView("renderer");
    setIsSidebarOpen(false);
  };

  const handleReturnToDashboard = () => {
    // Clean up query param if they wish to return to dashboard
    if (window.location.search.includes("cv=")) {
      window.history.pushState({}, "", window.location.pathname);
    }
    setSelectedResume(null);
    setEditingResume(null);
    setCurrentView("dashboard");
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("ciber_user_authed");
    setIsAuthenticated(false);
    setCurrentView("landing");
  };

  // If a public portfolio is loaded directly via slug parameters, render a bare minimalist frame (corporate aesthetic)
  const isDirectPublicPortfolioView = !!window.location.search.includes("cv=");

  // Authentication Guard Intercept
  if (!isDirectPublicPortfolioView && !isAuthenticated) {
    if (currentView === "login") {
      return (
        <LoginPage 
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            localStorage.setItem("ciber_user_authed", "true");
            setCurrentView("dashboard");
          }}
          onGoBack={() => setCurrentView("landing")}
        />
      );
    }
    return (
      <LandingPage 
        onStart={() => setCurrentView("login")} 
        onLogin={() => setCurrentView("login")} 
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-stone-50 font-sans overflow-hidden" id="applet-primary-layout">
      {/* Sleek Sidebar Navigation - Hidden during direct CV print or preview layouts */}
      {!isDirectPublicPortfolioView && currentView !== "renderer" && (
        <>
          {/* Backdrop Overlay for Mobile screens when sidebar is toggled open */}
          {isSidebarOpen && (
            <div 
              className="no-print fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-35 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          <aside className={`no-print fixed inset-y-0 left-0 w-64 bg-stone-900 flex flex-col text-white shrink-0 border-r border-stone-800 transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`} id="sleek-app-sidebar">
            {/* Logo Brand Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-bold text-stone-900 text-base shadow-sm shadow-brand/20">
                  T
                </div>
                <div>
                  <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-white to-stone-300 bg-clip-text text-transparent">
                    Trámites y Servicios
                  </span>
                  <p className="text-[9px] text-brand font-mono -mt-1 uppercase tracking-wider">Hojas de Vida</p>
                </div>
              </div>
              
              {/* Close button inside sidebar on mobile */}
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition cursor-pointer"
                aria-label="Cerrar menú"
              >
                <X size={16} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              <button
                onClick={handleReturnToDashboard}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                  currentView === "dashboard"
                    ? "bg-stone-800 text-brand border-l-4 border-brand rounded-l-none pl-2.5"
                    : "text-stone-400 hover:bg-stone-800/60 hover:text-white"
                }`}
              >
                <Home size={15} />
                <span>Panel de Control</span>
              </button>

              <button
                onClick={handleCreateNewResumeTrigger}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                  currentView === "wizard"
                    ? "bg-stone-800 text-brand border-l-4 border-brand rounded-l-none pl-2.5"
                    : "text-stone-400 hover:bg-stone-800/60 hover:text-white"
                }`}
              >
                <PlusCircle size={15} />
                <span>Crear Hoja de Vida</span>
              </button>
            </nav>

            {/* User Profile / Status info widget block - Completely Free! */}
            <div className="p-4 border-t border-stone-850 bg-stone-950/40 shrink-0 text-center">
              <div className="bg-stone-850 p-3.5 rounded-xl space-y-1.5 border border-stone-800/80">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-2.5 h-1.5 bg-amber-400 rounded-2xs"></span>
                  <span className="w-2.5 h-1.5 bg-blue-500 rounded-2xs"></span>
                  <span className="w-2.5 h-1.5 bg-rose-500 rounded-2xs"></span>
                  <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest pl-1">COLOMBIA</span>
                </div>
                <p className="text-[10px] text-amber-300 font-bold">Servicios 100% Gratuitos</p>
                <p className="text-[9px] text-stone-400 leading-normal">
                  Crea, edita e imprime tus hojas de vida de forma rápida y sin límites de almacenamiento ni membresías.
                </p>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Core Section */}
      <main className="flex-1 flex flex-col min-w-0 bg-stone-50 overflow-hidden" id="main-view-canvas">
        {/* Modern Sleek Header */}
        {!isDirectPublicPortfolioView && (
          <header className="no-print h-16 bg-white border-b border-stone-200 shrink-0 flex items-center justify-between px-4 md:px-8 shadow-xs z-10">
            <div className="flex items-center gap-2">
              {/* Hamburger Button for mobile */}
              {currentView !== "renderer" && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition shrink-0 cursor-pointer"
                  aria-label="Abrir menú"
                >
                  <Menu size={18} />
                </button>
              )}
              
              {currentView !== "dashboard" && (
                <button
                  onClick={handleReturnToDashboard}
                  className="p-1.5 px-3 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold text-stone-700 transition flex items-center gap-1.5"
                >
                  <ArrowLeft size={13} /> Volver al Panel
                </button>
              )}
              {currentView === "dashboard" && (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="text-xs font-semibold text-stone-700 font-display">Hojas de Vida Guardadas</span>
                  </div>
                  {isOffline ? (
                    <span 
                      className="text-[10px] bg-amber-50 text-amber-850 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full font-mono font-bold select-none cursor-help shadow-2xs transition" 
                      title="Los datos se guardan de forma segura en tu navegador (LocalStorage). Ideal para Vercel y GitHub Pages sin servidor."
                    >
                      💾 Almacenamiento Local Activo
                    </span>
                  ) : (
                    <span 
                      className="text-[10px] bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full font-mono font-bold select-none cursor-help shadow-2xs transition" 
                      title="Los datos están listos para ser guardados en la nube utilizando el servidor de base de datos."
                    >
                      ☁️ Nube Sincronizada
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-stone-400 hidden sm:inline-block">Año: 2026</span>
              <button
                onClick={handleLogout}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] py-1.5 px-3 rounded-lg transition border border-stone-205 cursor-pointer"
              >
                Cerrar Sesión 🚪
              </button>
            </div>
          </header>
        )}

        {/* View Port contents */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8" id="view-dispatcher">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 h-full">
              <div className="w-10 h-10 border-4 border-stone-200 border-t-amber-400 rounded-full animate-spin"></div>
              <p className="text-xs text-stone-400 font-mono">Sincronizando información segura...</p>
            </div>
          ) : errorMsg ? (
            <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl max-w-md mx-auto text-center space-y-4 my-12 shadow-sm">
              <h3 className="font-bold text-rose-800 font-display">Error de Sincronización</h3>
              <p className="text-xs text-rose-600 leading-relaxed">{errorMsg}</p>
              <button
                onClick={() => { setErrorMsg(""); fetchResumesFromServer(); }}
                className="bg-white border border-rose-200 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded-lg text-xs font-semibold transition"
              >
                Reconectar Base de Datos
              </button>
            </div>
          ) : (
            <div className="h-full">
              {currentView === "dashboard" && (
                <div className="space-y-6">
                  {/* Hero Dashboard Introductory Banner */}
                  <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-white rounded-2xl p-7 relative overflow-hidden shadow-sm mb-2 border border-amber-400/10" id="hero-banner">
                    <div className="relative z-10 max-w-2xl space-y-2">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#ffc132] font-bold bg-[#ffc132]/10 px-2.5 py-1 rounded-full border border-[#ffc132]/20 inline-block">
                        Formatos Profesionales
                      </span>
                      <h2 className="text-2xl font-display font-bold tracking-tight leading-tight">
                        Generador de Hojas de Vida Sencillas
                      </h2>
                      <p className="text-xs text-stone-300 leading-relaxed">
                        Crea y administra tus currículums de forma estructurada con Onboarding conversacional de alta velocidad. Genera enlaces dinámicos para compartir, y descarga tu hoja de vida con diseño tradicional listo para imprimir.
                      </p>
                    </div>
                    {/* Decorative radial lighting representing heat warmth */}
                    <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-brand/10 to-transparent pointer-events-none" />
                  </div>

                  {/* Dashboard with preview side widget integration */}
                  <Dashboard
                    resumes={resumes}
                    selectedPreviewId={selectedPreviewId}
                    onSelectPreviewId={setSelectedPreviewId}
                    onAddNewResume={handleCreateNewResumeTrigger}
                    onEditResume={handleEditResumeTrigger}
                    onViewResume={handleViewResumeTrigger}
                    onDeleteResume={handleDeleteResume}
                  />
                </div>
              )}

              {currentView === "wizard" && (
                <div className="space-y-4 max-w-4xl mx-auto">
                  <div className="flex items-center gap-2 mb-2 no-print text-xs">
                    <button 
                      onClick={handleReturnToDashboard}
                      className="hover:underline text-stone-500"
                    >
                      Volver al Panel
                    </button>
                    <span className="text-stone-300">/</span>
                    <span className="text-stone-700 font-medium font-mono">Formulario de Registro</span>
                  </div>
                  <ConversationalForm
                    initialResume={editingResume}
                    onSave={handleSaveResume}
                    onCancel={handleReturnToDashboard}
                  />
                </div>
              )}

              {currentView === "renderer" && selectedResume && (
                <div className="max-w-6xl mx-auto">
                  <ResumeRenderer
                    resume={selectedResume}
                    onBackToDashboard={handleReturnToDashboard}
                    onEdit={() => handleEditResumeTrigger(selectedResume)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

