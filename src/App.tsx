import React, { useState, useEffect } from "react";
import { Resume } from "./types";
import Dashboard from "./components/Dashboard";
import ConversationalForm from "./components/ConversationalForm";
import ResumeRenderer from "./components/ResumeRenderer";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import { supabase, getResumes, saveResumeToSupabase, deleteResumeFromSupabase } from "./lib/supabase";
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
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<"landing" | "login" | "dashboard" | "wizard" | "renderer">("landing");
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [publicPortfolioSlug, setPublicPortfolioSlug] = useState<string | null>(null);
  const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Sync Supabase Auth active session on startup
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setIsAuthenticated(!!session?.user);
      setLoading(false);
    }).catch(err => {
      console.error("Error checking auth session", err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check URL queries on load and hash updates for dynamic public routing mimics
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cvSlug = params.get("cv");
    if (cvSlug) {
      setPublicPortfolioSlug(cvSlug);
    } else {
      if (isAuthenticated) {
        setCurrentView("dashboard");
      } else {
        setCurrentView("landing");
      }
    }
  }, [isAuthenticated]);

  // Fetch resumes from Supabase or load empty
  const fetchResumesFromSupabase = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // 1. If public portfolio CV query slug is present, load the requested profile instantly (public read permission)
      const params = new URLSearchParams(window.location.search);
      const cvSlug = params.get("cv");
      if (cvSlug) {
        const { data, error } = await supabase
          .from("resumes")
          .select(`
            *,
            experiences (*),
            education (*),
            skills (*),
            references (*)
          `)
          .eq("slug", cvSlug);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          const row = data[0];
          // Map backend relational format back into proper Resume structural object
          const publicCv: Resume = {
            id: row.id,
            slug: row.slug,
            name: row.name,
            nombres: row.nombres || row.name.split(" ")[0] || "",
            apellidos: row.apellidos || row.name.split(" ").slice(1).join(" ") || "",
            identificacion: row.identificacion || "",
            lugar_expedicion: row.lugar_expedicion || "",
            fecha_nacimiento: row.fecha_nacimiento || "",
            lugar_nacimiento: row.lugar_nacimiento || "",
            estado_civil: row.estado_civil || "",
            celular: row.phone || row.celular || "",
            correo: row.email || row.correo || "",
            direccion: row.direccion || "",
            barrio: row.barrio || "",
            ciudad: row.city || row.ciudad || "",
            position: row.position || "",
            photo_url: row.photo_url || "",
            city: row.city || "",
            country: row.country || "",
            email: row.email || "",
            phone: row.phone || "",
            website: row.website || "",
            summary: row.summary || "",
            created_at: row.created_at,
            experiences: (row.experiences || []).map((exp: any) => ({
              id: exp.id,
              role: exp.role,
              company: exp.company,
              start_date: exp.start_date,
              end_date: exp.end_date || "",
              current: exp.current || false,
              description: exp.description || "",
              ciudad: exp.ciudad || ""
            })),
            education: (row.education || []).map((edu: any) => ({
              id: edu.id,
              degree: edu.degree,
              school: edu.school,
              start_date: edu.start_date,
              end_date: edu.end_date || "",
              current: edu.current || false,
              description: edu.description || "",
              ciudad: edu.ciudad || ""
            })),
            skills: (row.skills || []).map((sk: any) => ({
              id: sk.id,
              name: sk.name,
              level: sk.level || 0
            })),
            references: (row.references || []).map((ref: any) => ({
              id: ref.id,
              name: ref.name,
              role: ref.role || ref.relationship || "",
              phone: ref.contact_info || ref.phone || "",
              ciudad: ref.ciudad || ""
            }))
          };
          setSelectedResume(publicCv);
          setCurrentView("renderer");
          return;
        } else {
          setErrorMsg(`La hoja de vida con el enlace '${cvSlug}' no existe en la base de datos de Supabase.`);
        }
      }

      // 2. Load resumes of authenticated user
      if (user) {
        const list = await getResumes(user.id);
        setResumes(list);
        setIsOffline(false);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_${user.id}`, JSON.stringify(list));

        if (list.length > 0 && !selectedPreviewId) {
          setSelectedPreviewId(list[0].id);
        }
      } else {
        setResumes([]);
      }
    } catch (err: any) {
      console.warn("Express / Supabase offline fallback loading", err);
      setIsOffline(true);
      if (user) {
        const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${user.id}`);
        if (stored) {
          try {
            const list = JSON.parse(stored);
            setResumes(list);
            if (list.length > 0 && !selectedPreviewId) {
              setSelectedPreviewId(list[0].id);
            }
          } catch (e) {
            setResumes([]);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Re-fetch only if user session is known or public slug is present
    if (user || publicPortfolioSlug) {
      fetchResumesFromSupabase();
    } else {
      setResumes([]);
      setLoading(false);
    }
  }, [user, publicPortfolioSlug]);

  // Create or Update resume
  const handleSaveResume = async (resume: Resume) => {
    if (!user) {
      alert("Debes iniciar sesión con tu cuenta para guardar cambios.");
      return;
    }

    try {
      setLoading(true);
      const saved = await saveResumeToSupabase(resume, user.id);
      
      // Update local set and sync view
      await fetchResumesFromSupabase();
      setSelectedResume(saved);
      setCurrentView("renderer");
      setEditingResume(null);
    } catch (err: any) {
      console.error("Error saving resume:", err);
      alert("Error al guardar el documento: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Delete resume
  const handleDeleteResume = async (id: string) => {
    const confirmation = window.confirm("¿Está seguro de que desea eliminar permanentemente esta hoja de vida?");
    if (!confirmation) return;

    if (!user) {
      alert("No estás autenticado.");
      return;
    }

    try {
      setLoading(true);
      await deleteResumeFromSupabase(id, user.id);
      
      const remaining = resumes.filter(r => r.id !== id);
      setResumes(remaining);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${user.id}`, JSON.stringify(remaining));

      if (selectedPreviewId === id) {
        setSelectedPreviewId(remaining[0]?.id || null);
      }
    } catch (err: any) {
      console.error("Error deleting resume:", err);
      alert("Error al eliminar el documento: " + (err.message || err));
    } finally {
      setLoading(false);
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
    if (window.location.search.includes("cv=")) {
      window.history.pushState({}, "", window.location.pathname);
    }
    setSelectedResume(null);
    setEditingResume(null);
    setCurrentView("dashboard");
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Signout error:", error);
    }
    setUser(null);
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
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {user?.email && (
                <span className="text-[11px] font-sans text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 font-semibold max-w-[160px] truncate sm:max-w-none">
                  👤 {user.email}
                </span>
              )}
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
            <div className="flex flex-col items-center justify-center py-24 gap-4 h-full text-center">
              <div className="relative w-20 h-20 flex items-center justify-center mb-1">
                {/* Outer shape rebuilding border */}
                <div className="absolute inset-0 border-2 rounded-2xl animate-shape-rebuild"></div>
                {/* Glowing brand icon base */}
                <div className="absolute inset-2 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg animate-letter-draw">
                  <span className="text-stone-900 font-black text-2xl font-display">T</span>
                </div>
              </div>
              <div className="space-y-1 bg-white/20 backdrop-blur-xs p-3 rounded-2xl">
                <h3 className="font-bold text-sm tracking-tight text-stone-900">
                  Trámites y Servicios
                </h3>
                <p className="text-[10px] text-stone-500 font-mono uppercase tracking-wider animate-pulse font-semibold">
                  Cargando información segura...
                </p>
                {/* Micro expand contract bar */}
                <div className="w-16 h-1 bg-stone-200 rounded-full mx-auto overflow-hidden mt-2">
                  <div className="h-full bg-amber-500 rounded-full animate-bar-expand-contract"></div>
                </div>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-sm mx-auto space-y-6">
              <div className="relative w-20 h-20 flex items-center justify-center">
                {/* Attention outer border */}
                <div className="absolute inset-0 border-2 border-stone-200 rounded-2xl animate-pulse"></div>
                {/* Pale orange center badge */}
                <div className="absolute inset-2 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 font-black text-2xl font-display shadow-xs border border-amber-200">
                  !
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-medium text-base text-stone-900">Hoja de Vida No Encontrada</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{errorMsg}</p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <button
                  type="button"
                  onClick={() => { setErrorMsg(""); fetchResumesFromSupabase(); }}
                  className="w-full bg-stone-900 hover:bg-stone-850 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-xs"
                >
                  Intentar Reconectar 🔄
                </button>
                <button
                  type="button"
                  onClick={() => { setErrorMsg(""); window.location.href = window.location.origin; }}
                  className="w-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  Volver al Inicio 🏠
                </button>
              </div>
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

