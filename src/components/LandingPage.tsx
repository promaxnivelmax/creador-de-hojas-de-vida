import React from "react";
import { Sparkles, FileText, ArrowRight, CheckCircle2, Shield, Sparkle, Layout } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onStart, onLogin }: LandingPageProps) {
  return (
    <div className="bg-animated-mesh min-h-screen font-sans flex flex-col justify-between relative overflow-hidden" id="landing-container">
      {/* Decorative Floating Mesh Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-amber-200/20 blur-3xl animate-float-slow"></div>
        <div className="absolute top-[30%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-orange-200/15 blur-3xl animate-float-reverse"></div>
      </div>

      {/* Mini navbar */}
      <header className="no-print bg-white/70 backdrop-blur-md border-b border-stone-200 h-16 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center font-bold text-stone-900 text-base shadow-sm">
            T
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-stone-900">
              Trámites y Servicios
            </span>
            <p className="text-[9px] text-amber-600 font-mono -mt-1 uppercase tracking-wider">Hojas de Vida</p>
          </div>
        </div>

        <button
          onClick={onLogin}
          className="bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs py-2 px-4 rounded-xl transition cursor-pointer"
        >
          Iniciar Sesión / Registrarse
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-16 flex flex-col items-center justify-center text-center space-y-12 z-10">
        <div className="space-y-4 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400/10 border border-amber-300/30 text-amber-800 text-[10px] font-mono uppercase font-bold rounded-full animate-pulse-slow">
            <Sparkle size={10} className="fill-amber-500 text-amber-600" /> Tecnología de Generación Inteligente
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-stone-900 tracking-tight leading-none">
            Diseña tu Hoja de Vida con <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Estructura Impecable</span>
          </h1>
          <p className="text-stone-600 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Experimenta el estándar moderno de creación curricular interactiva: adaptabilidad instantánea, renderizado limpio en tiempo real y descarga instantánea.
          </p>
        </div>

        {/* Call to actions with premium UI elements */}
        <div className="flex justify-center items-center w-full max-w-md">
          <button
            onClick={onStart}
            className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 px-10 rounded-2xl text-xs uppercase tracking-wider transition duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-stone-900/10 group scale-100 active:scale-95 border border-stone-800"
          >
            Comenzar Mi Hoja de Vida <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-amber-400" />
          </button>
        </div>

        {/* Animated Dynamic Presentation Element depicting premium UX/UI */}
        <div className="w-full max-w-4xl bg-white/70 backdrop-blur-md p-3 md:p-4 rounded-3xl border border-stone-200 shadow-2xl relative group mt-4 overflow-hidden animate-float-slow">
          <div className="bg-stone-900 rounded-2xl p-4 md:p-6 text-left text-white grid grid-cols-1 md:grid-cols-12 gap-6 relative overflow-hidden">
            <div className="absolute top-[-30%] right-[-10%] w-60 h-60 rounded-full bg-amber-400/5 blur-2xl"></div>
            
            <div className="md:col-span-7 space-y-4 flex flex-col justify-center">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] text-stone-400 font-mono tracking-widest uppercase">Editor Interactivo Listo</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black font-display tracking-tight leading-tight">
                Elaboración por pasos guiada con visualización inmediata
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Rellena el asistente conversacional con un diseño optimizado y visualiza los resultados finales al instante con nuestra previsualización interactiva de alta fidelidad.
              </p>
              
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-[11px] text-stone-300">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-amber-400" /> Estructura Limpia
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-amber-400" /> Multi-estudios Dinámico
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-amber-400" /> Formatos Formales
                </span>
              </div>
            </div>

            <div className="md:col-span-5 bg-stone-800/80 rounded-xl p-4 border border-stone-700/50 space-y-3 relative flex flex-col justify-between">
              {/* Mock CV UI element */}
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-stone-750 pb-2">
                  <div className="space-y-1">
                    <div className="h-3 w-20 bg-amber-400 rounded-md"></div>
                    <div className="h-2 w-28 bg-stone-600 rounded-md"></div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-stone-700 border border-stone-600 flex items-center justify-center">
                    <FileText size={12} className="text-amber-400" />
                  </div>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="h-1.5 w-full bg-stone-700 rounded-xs"></div>
                  <div className="h-1.5 w-5/6 bg-stone-700 rounded-xs"></div>
                  <div className="h-1.5 w-4/6 bg-stone-700 rounded-xs"></div>
                </div>
              </div>
              
              <button 
                onClick={onStart}
                className="w-full bg-white hover:bg-stone-100 text-stone-900 font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Comenzar Formulario <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Clean Footer */}
      <footer className="bg-stone-50 border-t border-stone-200 py-6 text-center text-xs text-stone-500 z-10">
        <p>© 2026 Trámites y Servicios - Generador de Hojas de Vida Profesionales.</p>
      </footer>
    </div>
  );
}
