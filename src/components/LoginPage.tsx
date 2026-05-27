import React, { useState } from "react";
import { Lock, Mail, ChevronRight, MapPin, Sparkles, AlertCircle } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: () => void;
  onGoBack: () => void;
}

export default function LoginPage({ onLoginSuccess, onGoBack }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate instantaneous authentication connection that succeeds automatically
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-stone-105 font-sans flex items-center justify-center relative overflow-hidden px-4 py-8" id="login-container">
      
      {/* 
        PRECISE SYSTEM ARTWORK: TRANSLUCENT GRAY CROQUIS MAP OF BARRANCABERMEJA, COLOMBIA 
        This is an advanced custom vector displaying the Magdalena River winding, major avenues, bridges, 
        and swamps representing the port city of Barrancabermeja.
      */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-15 flex items-center justify-center">
        <svg viewBox="0 0 1000 1000" className="w-[120%] h-[120%] text-stone-605 stroke-current fill-none stroke-[1.5]" xmlns="http://www.w3.org/2000/svg">
          {/* Coordinates Grid */}
          <path d="M 0,200 L 1000,200 M 0,400 L 1000,400 M 0,600 L 1000,600 M 0,800 L 1000,800" strokeDasharray="5,5" />
          <path d="M 200,0 L 200,1000 M 400,0 L 400,1000 M 600,0 L 600,1000 M 800,0 L 800,1000" strokeDasharray="5,5" />
          
          {/* Río Magdalena - Large winding river path running on the West (Left) */}
          <path 
            className="fill-stone-200/50"
            d="M 120,0 C 130,150 70,300 85,450 C 95,550 160,650 110,780 C 80,880 15,940 30,1000 L 0,1000 L 0,0 Z" 
            stroke="currentColor" 
            strokeWidth="3.5" 
          />
          <path d="M 140,0 C 150,150 90,300 105,450 C 115,550 180,650 130,780 C 100,880 35,940 50,1000" stroke="currentColor" strokeWidth="1.5" />

          {/* Ciénaga Miramar - Famous swamp body located at the middle-right */}
          <path 
            className="fill-stone-100/30"
            d="M 520,400 C 580,380 650,420 620,480 C 600,520 540,540 490,520 C 440,500 460,420 520,400 Z" 
            stroke="currentColor" 
            strokeWidth="2" 
          />
          <text x="520" y="470" className="font-sans text-[10px] uppercase tracking-wider fill-stone-500 font-bold border-none">Ciénaga Miramar</text>

          {/* Ciénaga de la Cira */}
          <path 
            className="fill-stone-100/20"
            d="M 750,220 C 780,180 880,240 850,290 C 810,320 730,260 750,220 Z" 
            stroke="currentColor" 
            strokeWidth="2" 
          />
          <text x="760" y="260" className="font-sans text-[9px] uppercase tracking-wider fill-stone-400 font-medium">Ciénaga San Silvestre</text>

          {/* Puente Guillermo Gaviria - Connecting over the Magdalena River */}
          <line x1="85" y1="450" x2="250" y2="450" stroke="currentColor" strokeWidth="4" />
          <line x1="85" y1="447" x2="250" y2="447" stroke="white" strokeWidth="1" />
          <text x="160" y="435" className="font-mono text-[9px] uppercase tracking-widest fill-stone-500">Pte. Guillermo Gaviria</text>

          {/* Avenida del Ferrocarril & Avenida 52 */}
          <path d="M 110,480 L 900,480" stroke="currentColor" strokeWidth="2" />
          <path d="M 320,0 C 320,300 480,480 480,1000" stroke="currentColor" strokeWidth="2" />
          <path d="M 620,0 C 620,400 750,600 950,1000" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />

          {/* Urban Grid Lines of Comunas inside Barrancabermeja */}
          <path d="M 280,380 L 450,380 M 280,320 L 455,320 M 280,260 L 420,260 M 350,220 L 350,450" stroke="currentColor" strokeWidth="1" />
          <path d="M 500,600 L 900,600 M 500,660 L 900,660 M 540,540 L 540,800 M 640,540 L 640,800" stroke="currentColor" strokeWidth="1" />

          {/* Reference pins and landmarks */}
          <circle cx="320" cy="480" r="6" className="fill-stone-600" />
          <text x="335" y="485" className="font-sans text-[11px] uppercase tracking-wide fill-stone-700 font-bold">Paseo de la Cultura</text>

          <circle cx="480" cy="460" r="5" className="fill-stone-500" />
          <text x="495" y="465" className="font-sans text-[10px] uppercase tracking-wide fill-stone-600">Sede Principal</text>

          <circle cx="108" cy="780" r="5" className="fill-stone-500" />
          <text x="125" y="785" className="font-sans text-[9px] fill-stone-500">Muelle Barrancabermeja</text>

          {/* Coordinates label */}
          <text x="800" y="80" className="font-mono text-xs font-bold fill-stone-500">7° 03' N, 73° 51' W</text>
          <text x="800" y="105" className="font-sans text-[10px] uppercase tracking-widest font-semibold fill-stone-400">BARRANCABERMEJA, CO</text>

          {/* Map Title Compass */}
          <g transform="translate(850, 850)">
            <circle cx="0" cy="0" r="35" stroke="currentColor" strokeWidth="1.5" />
            <line x1="0" y1="-45" x2="0" y2="45" stroke="currentColor" strokeWidth="1.5" />
            <line x1="-45" y1="0" x2="45" y2="0" stroke="currentColor" strokeWidth="1.5" />
            <polygon points="0,-40 -5,-5 0,0" className="fill-stone-600" />
            <polygon points="0,40 -5,5 0,0" className="fill-stone-200" />
            <text x="-4" y="-48" className="font-mono text-[10px] font-bold fill-stone-700">N</text>
          </g>
        </svg>
      </div>

      {/* Main split row replicating Facebook's elegant alignment layout */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center z-10">
        
        {/* Left column: Brand Presentation */}
        <div className="md:col-span-6 space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-12 h-12 bg-amber-400 text-stone-900 rounded-2xl flex items-center justify-center font-black text-2xl shadow-md border-b-2 border-amber-500">
              T
            </div>
            <div>
              <h2 className="text-3xl font-display font-black tracking-tight text-stone-900 leading-none">
                Trámites y Servicios
              </h2>
              <p className="text-xs text-amber-600 font-mono font-bold uppercase mt-1 tracking-widest">Barrancabermeja</p>
            </div>
          </div>
          
          <h3 className="text-xl md:text-2xl font-bold font-sans text-stone-800 leading-snug">
            Crea tu Hoja de Vida gratis al estilo profesional.
          </h3>
          <p className="text-stone-500 text-xs md:text-sm leading-relaxed max-w-md mx-auto md:mx-0">
            Diseños automáticos optimizados, descargas inmediatas para impresión, fotos capturadas en vivo y base de datos local segura. Todo diseñado para darte el mejor perfil sin cobros de membrecía.
          </p>

          <button
            onClick={onGoBack}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 font-bold transition hover:underline py-2"
          >
            ← Volver a la página de inicio
          </button>
        </div>

        {/* Right column: Facebook style Box Card */}
        <div className="md:col-span-6 flex flex-col items-center">
          <div className="bg-white w-full rounded-2xl border border-stone-200 shadow-xl p-6 md:p-8 space-y-5">
            <div className="text-center md:text-left border-b border-stone-100 pb-3">
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-amber-600">Conexión Segura</span>
              <h4 className="font-black text-lg text-stone-900">Iniciar Sesión</h4>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-stone-500 block font-semibold">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-stone-400" size={14} />
                  <input
                    type="email"
                    required
                    placeholder="Ingresa tu correo o usuario"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm outline-none focus:bg-white focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition text-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-stone-500 block font-semibold">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-stone-400" size={14} />
                  <input
                    type="password"
                    required
                    placeholder="Ingresa tu clave de ingreso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm outline-none focus:bg-white focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs md:text-sm tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-stone-200 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Ingresar Seguro <ChevronRight size={15} /></>
                )}
              </button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={onLoginSuccess}
                className="text-stone-400 hover:text-amber-600 transition text-[10px] md:text-xs hover:underline decoration-dashed"
              >
                ¿Olvidaste tu contraseña? Da clic aquí para entrar directamente
              </button>
            </div>

            <div className="border-t border-stone-100 pt-5">
              <button
                type="button"
                onClick={onLoginSuccess}
                className="w-fit mx-auto block bg-[#42b72a] hover:bg-[#36a420] text-white font-bold py-3 px-6 rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                Crear una cuenta nueva (Acceso Gratuito)
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[10px] md:text-xs text-stone-500">
              <strong className="text-stone-700">Acceso Libre:</strong> Usa cualquier correo o contraseña de prueba para ingresar instantáneamente al panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
