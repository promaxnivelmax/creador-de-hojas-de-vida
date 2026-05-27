import React from "react";
import { Sparkles, FileText, Camera, Printer, Layout, Shield, ArrowRight, Palette } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onStart, onLogin }: LandingPageProps) {
  return (
    <div className="bg-stone-50 min-h-screen font-sans flex flex-col justify-between" id="landing-container">
      {/* Mini navbar */}
      <header className="no-print bg-white border-b border-stone-200 h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center font-bold text-stone-900 text-base shadow-xs">
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
          Iniciar Sesión
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center text-center space-y-8">
        <div className="space-y-4 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-mono uppercase font-bold rounded-full">
            <Sparkles size={11} /> 100% Gratuito y Sin Suscripciones
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-stone-900 tracking-tight leading-tight">
            El Generador de Hojas de Vida Colombiano que <span className="text-amber-500">Imprime Perfecto</span>
          </h1>
          <p className="text-stone-605 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            ¿Cansado de que las plantillas recorten tus datos o dejen espacios vacíos? 
            Nuestra plataforma organiza de forma inteligente tu información para encajarla perfectamente en PDF de tamaño estándar (Carta u A4).
          </p>
        </div>

        {/* Call to actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onStart}
            className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold py-3.5 px-8 rounded-xl text-sm shadow-md shadow-amber-400/10 transition flex items-center justify-center gap-2 cursor-pointer group"
          >
            Crear Mi Hoja de Vida Gratis <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onLogin}
            className="w-full sm:w-auto bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 font-bold py-3.5 px-8 rounded-xl text-sm transition cursor-pointer"
          >
            Ingresar al Panel
          </button>
        </div>

        {/* Features Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-10">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-left space-y-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
              <Printer size={20} />
            </div>
            <h3 className="font-bold text-stone-900 text-base">Impresión en PDF Perfecta</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Diseñado con reglas avanzadas de salto de página. La información no sale mochada ni se esparce de forma incoherente en hojas secundarias.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-left space-y-3">
            <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center">
              <Palette size={20} />
            </div>
            <h3 className="font-bold text-stone-900 text-base">Diseños y Tonos Femeninos</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Descubre dos diseños de estructura formal (Columnas Clásicas y Centrado Moderno) y paletas de colores premium, incluyendo opciones elegantes pensadas para mujeres.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-left space-y-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <Camera size={20} />
            </div>
            <h3 className="font-bold text-stone-900 text-base">Foto con Cámara Web</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Si no tienes una foto digital a la mano, puedes encender la cámara de tu computador, tomarte una foto formal en segundos y verla en tu hoja de vida.
            </p>
          </div>
        </div>

        {/* Free Banner */}
        <div className="bg-stone-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between text-left gap-6 w-full border border-stone-800">
          <div className="space-y-1 max-w-xl">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md">Servicios Abiertos</span>
            <h4 className="font-bold text-lg md:text-xl">Sin Cobros Ocultos ni Tarjetas de Crédito</h4>
            <p className="text-xs text-stone-400 leading-normal">
              Aquí no hay membresías premium. Creas las hojas de vida que necesites, las editas cuantas veces quieras y las descargas gratis para buscar trabajo formal.
            </p>
          </div>
          <button
            onClick={onStart}
            className="bg-amber-400 hover:bg-amber-500 text-stone-900 px-6 py-3 rounded-xl font-bold text-xs shrink-0 transition cursor-pointer"
          >
            Iniciar Ahora Mismo
          </button>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-stone-100 border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        <p>© 2026 Trámites y Servicios - Generador de Hojas de Vida Profesionales. Barrancabermeja, Colombia.</p>
      </footer>
    </div>
  );
}
