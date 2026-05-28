import React, { useState } from "react";
import { Lock, Mail, ChevronRight, MapPin, Sparkles, AlertCircle, Eye, EyeOff, UserPlus } from "lucide-react";
import { supabase } from "../lib/supabase";

interface LoginPageProps {
  onLoginSuccess: () => void;
  onGoBack: () => void;
}

export default function LoginPage({ onLoginSuccess, onGoBack }: LoginPageProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(false);
    setErrorMsg("");
    setInfoMsg("");

    if (!email || !password) {
      setErrorMsg("Por favor, completa todos los campos.");
      return;
    }

    if (isRegistering) {
      if (password.length < 6) {
        setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Las contraseñas no coinciden. Por favor, verifícalas.");
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });

        if (error) {
          throw error;
        }

        if (data.user && data.session) {
          // Signed up and logged in automatically
          setInfoMsg("¡Cuenta creada con éxito!");
          setTimeout(() => {
            onLoginSuccess();
          }, 1000);
        } else if (data.user) {
          // Confirmation email configured/required
          setInfoMsg("¡Registro exitoso! Por favor revisa tu correo electrónico para confirmar la cuenta.");
          setIsRegistering(false);
          setPassword("");
          setConfirmPassword("");
        }
      } catch (err: any) {
        console.error("Error al registrarse: ", err);
        setErrorMsg(err.message || "No se pudo crear la cuenta de usuario. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          onLoginSuccess();
        } else {
          setErrorMsg("Surgió un error obteniendo la sesión activa.");
        }
      } catch (err: any) {
        console.error("Error al iniciar sesión: ", err);
        setErrorMsg(
          err.message === "Invalid login credentials" || err.message?.toLowerCase().includes("credentials")
            ? "Contraseña o correo electrónico incorrectos. Compruébalos y vuelve a intentar."
            : err.message || "Ocurrió un error inesperado al iniciar sesión."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-animated-mesh font-sans flex items-center justify-center relative overflow-hidden px-4 py-8" id="login-container">
      
      {/* 
        PRECISE SYSTEM ARTWORK: LUXURY DYNAMIC ABSTRACT BACKGROUND
        Utilizes animated, heavy-blurry gradient ords that flow smoothly giving high-end corporate elegance.
      */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Soft Amber floating orb */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-200/25 blur-3xl animate-float-slow"></div>
        {/* Soft Orange floating orb */}
        <div className="absolute bottom-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-amber-300/20 blur-3xl animate-float-reverse"></div>
        {/* Soft warm gold core pulse */}
        <div className="absolute top-[40%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-orange-200/10 blur-3xl animate-pulse-slow"></div>
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
              <p className="text-xs text-amber-600 font-mono font-bold uppercase mt-1 tracking-widest">Hojas de Vida</p>
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
        <div className="md:col-span-6 flex flex-col items-center w-full">
          <div className="bg-white w-full rounded-2xl border border-stone-200 shadow-xl p-6 md:p-8 space-y-5">
            <div className="text-center md:text-left border-b border-stone-100 pb-3">
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-amber-600">Conectado al Sistema Seguro</span>
              <h4 className="font-black text-xl text-stone-900 mt-1">
                {isRegistering ? "Registro de Cuenta" : "Iniciar Sesión"}
              </h4>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-2 text-xs">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-2 text-xs">
                <Sparkles className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                <span>{infoMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-stone-500 block font-semibold">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-stone-400" size={14} />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:bg-white focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition text-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-stone-500 block font-semibold">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-stone-400" size={14} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={isRegistering ? "Mínimo 6 caracteres" : "Ingresa tu clave de ingreso"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-10 py-3 text-xs outline-none focus:bg-white focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 transition"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {isRegistering && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-stone-500 block font-semibold">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 text-stone-400" size={14} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Repite tu contraseña exactamente"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:bg-white focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition text-stone-900"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-stone-200 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                     {isRegistering ? "Registrarme y Empezar" : "Ingresar Seguro"} <ChevronRight size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMsg("");
                  setInfoMsg("");
                }}
                className="text-amber-700 hover:text-amber-800 font-bold transition text-xs hover:underline decoration-dashed"
              >
                {isRegistering 
                  ? "¿Ya tienes una cuenta registrada? Inicia Sesión aquí" 
                  : "¿No tienes una cuenta aún? Regístrate aquí gratis"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
