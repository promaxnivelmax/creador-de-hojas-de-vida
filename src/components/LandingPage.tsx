import React from "react";
import { ArrowRight, FileText, CheckCircle2, Palette, Share2, MousePointerClick, ShieldCheck, HelpCircle } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onStart, onLogin }: LandingPageProps) {
  const PASO_A_PASO = [
    {
      numero: "01",
      titulo: "Asistente Conversacional",
      descripcion: "Completa tus datos personales, académicos y laborales de forma amigable paso por paso. Tus avances se guardan automáticamente para que no pierdas nada.",
      icon: MousePointerClick,
      color: "border-amber-400"
    },
    {
      numero: "02",
      titulo: "Elige tu Tono de Color",
      descripcion: "Ajusta la paleta cromática del currículum para destacar tu marca personal con un solo clic sobre la plantilla clásica premium de alta legibilidad.",
      icon: Palette,
      color: "border-rose-300"
    },
    {
      numero: "03",
      titulo: "Descarga Directa PDF",
      descripcion: "Obtén un archivo PDF vectorial impecable y directo con nombres consistentes listo para enviar a procesos de selección, sin pasar por diálogos de impresión.",
      icon: FileText,
      color: "border-green-300"
    },
    {
      numero: "04",
      titulo: "Comparte Protegido",
      descripcion: "Copia el enlace compartido exclusivo para que reclutadores lean tu hoja de vida en línea con bloqueo anti-edición absoluto para terceros.",
      icon: Share2,
      color: "border-blue-300"
    }
  ];

  return (
    <div className="bg-[#FAF9F5] min-h-screen font-sans flex flex-col justify-between relative text-stone-850 selection:bg-amber-100" id="landing-container">
      {/* Decorative Grid Mesh Background Patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-40">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-radial-gradient from-amber-100/40 to-transparent"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,94,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,94,22,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      {/* Mini navbar */}
      <header className="no-print bg-white/80 backdrop-blur-md border-b border-stone-200/60 h-16 px-6 lg:px-12 flex items-center justify-between z-10" id="landing-navigation-bar">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-stone-900 rounded-xl flex items-center justify-center font-bold text-[#fbc24a] text-lg shadow-sm border border-stone-800">
            T
          </div>
          <div>
            <span className="font-display font-black text-sm tracking-tight text-stone-900">
              Trámites y Servicios
            </span>
            <p className="text-[9px] text-[#ae771a] font-mono font-bold -mt-1.5 uppercase tracking-widest">Currículum Único</p>
          </div>
        </div>

        <button
          onClick={onLogin}
          id="nav-action-login"
          className="bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs py-2 px-5 rounded-xl transition duration-250 cursor-pointer shadow-sm shadow-stone-900/10"
        >
          Iniciar Sesión / Registro
        </button>
      </header>

      {/* Bespoke Editorial Hero / Presentational Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-16 z-10" id="landing-main-content">
        
        {/* Main Pitch Card Container */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-300/30 text-amber-900 text-[10px] font-mono uppercase font-black rounded-lg">
            ✨ Plataforma Profesional Certificada
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-stone-900 tracking-tight leading-none">
            Crea tu Currículum con un <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#926012] to-[#ffaa22] bg-clip-text text-transparent">Diseño Profesional Exclusivo</span>
          </h1>
          <p className="text-stone-600 text-sm md:text-base leading-relaxed max-w-xl mx-auto font-medium">
            Genera una hoja de vida impecable y estructurada de forma fácil. Olvídate de los desajustes visuales y exporta directamente a PDF de alta resolución.
          </p>

          <div className="flex justify-center pt-2">
            <button
              onClick={onStart}
              id="hero-start-cta"
              className="px-8 py-4 bg-stone-900 hover:bg-stone-850 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center gap-3 cursor-pointer shadow-md group scale-100 active:scale-95 border border-stone-800"
            >
              Comenzar Ahora Mismo <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform text-amber-400" />
            </button>
          </div>
        </div>

        {/* PASO A PASO SECTION: SIMPLE & GORGEOUS SEPARATION GRID */}
        <div className="space-y-8 bg-white/60 backdrop-blur-xs p-6 md:p-10 rounded-2xl border border-stone-200/80 shadow-sm" id="step-by-step-guide">
          <div className="text-center md:text-left space-y-2 border-b border-stone-200/80 pb-6">
            <h2 className="text-xl md:text-2xl font-display font-black text-stone-900 uppercase tracking-tight flex items-center justify-center md:justify-start gap-2">
              <HelpCircle className="text-amber-500" size={18} /> ¿Cómo funciona la página?
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Sigue esta simple secuencia para configurar tu documento profesional y compartirlo con reclutadores de inmediato.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PASO_A_PASO.map((paso, idx) => {
              const Icon = paso.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-stone-400/80 transition-all duration-200 relative group"
                  id={`step-card-${idx}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[10px] text-stone-400 tracking-widest">
                        PASO {paso.numero}
                      </span>
                      <span className="p-1 px-1.5 bg-amber-400/10 text-[#a06809] font-bold rounded text-[10px] uppercase font-mono">Guía Directa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700">
                        <Icon size={14} />
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 tracking-tight">{paso.titulo}</h3>
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                      {paso.descripcion}
                    </p>
                  </div>
                  <div className={`pt-2 border-t border-stone-100 text-[10px] font-mono tracking-wider font-bold text-stone-400 group-hover:text-amber-600 transition-colors`}>
                    ✓ Listo para usar
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Trust Features Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left" id="value-proposition-block">
          <div className="bg-[#FAF9F5] border border-stone-200 p-6 rounded-xl flex items-start gap-4">
            <span className="p-2.5 bg-[#ae771a]/10 rounded-xl text-[#ae771a] shrink-0">
              <ShieldCheck size={20} />
            </span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-stone-900">Privacidad de Datos Segura</h4>
              <p className="text-[11px] text-stone-500 leading-relaxed font-semibold">
                Tus datos no son vendidos ni procesados para publicidad. El acceso en línea se bloquea con solo un interruptor.
              </p>
            </div>
          </div>

          <div className="bg-[#FAF9F5] border border-stone-200 p-6 rounded-xl flex items-start gap-4">
            <span className="p-2.5 bg-[#ae771a]/10 rounded-xl text-[#ae771a] shrink-0">
              <FileText size={20} />
            </span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-stone-900 font-display">PDF Listo para Procesadores ATS</h4>
              <p className="text-[11px] text-stone-500 leading-relaxed font-semibold">
                La estructura interna del exportador está certificada para superar filtros automáticos de recursos humanos.
              </p>
            </div>
          </div>

          <div className="bg-[#FAF9F5] border border-stone-200 p-6 rounded-xl flex items-start gap-4">
            <span className="p-2.5 bg-[#ae771a]/10 rounded-xl text-[#ae771a] shrink-0">
              <Palette size={20} />
            </span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-stone-900 font-display">Minimalismo Exclusivo</h4>
              <p className="text-[11px] text-stone-500 leading-relaxed font-semibold">
                Diseñado exclusivamente para la máxima legibilidad, elegancia sobria y elegibilidad del profesional.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Elegantly Styled Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500 z-10" id="landing-footer-credits">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-semibold text-[11px]">
          <p>© 2026 Trámites y Servicios - Generador de Hojas de Vida Profesionales Premium.</p>
          <div className="flex gap-4 text-stone-400">
            <span>Diseño Confiable</span>
            <span>•</span>
            <span>Uso Gratuito</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
