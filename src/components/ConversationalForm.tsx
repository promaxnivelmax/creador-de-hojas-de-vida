import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Resume, Experience, Skill, Reference, Education } from "../types";
import { fileToBase64, getInitialsAvatar } from "../utils";
import { 
  User, Briefcase, GraduationCap, Award, 
  MapPin, HelpCircle, ArrowLeft, ArrowRight, 
  Plus, Trash2, Mail, Phone, Globe, Upload, CheckCircle2, FileText, Sparkles
} from "lucide-react";

interface ConversationalFormProps {
  initialResume?: Resume | null;
  onSave: (resume: Resume) => void;
  onCancel: () => void;
}

export default function ConversationalForm({ initialResume, onSave, onCancel }: ConversationalFormProps) {
  const STEPS = [
    { title: "Identificación Personal", subtitle: "Nombres, apellidos y documento de identidad", icon: User },
    { title: "Nacimiento y Estado", subtitle: "Fecha, lugar de nacimiento y estado civil", icon: Sparkles },
    { title: "Información de Contacto", subtitle: "Teléfono, correo y dirección de vivienda", icon: MapPin },
    { title: "Estudios (Secundaria)", subtitle: "Detalles del título académico de secundaria u otros", icon: GraduationCap },
    { title: "Perfil y Resumen", subtitle: "Breve descripción de tu perfil profesional y cargo", icon: FileText },
    { title: "Experiencia Laboral", subtitle: "Empresas, cargos y fechas de trabajo", icon: Briefcase },
    { title: "Referencias", subtitle: "Personas de contacto que certifican tus capacidades", icon: Award }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  // Auto clean up camera hardware if user proceeds or leaves the form step
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setIsCameraActive(true);
    setCameraError("");
    try {
      // Request active media stream from browser camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 350, height: 350, facingMode: "user" } 
      });
      
      // Delay slightly using timeout to ensure video element is fully rendered in DOM
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (err: any) {
      console.error("No se pudo iniciar la cámara web: ", err);
      setCameraError("Permiso de cámara denegado o hardware no disponible.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 350;
      canvas.height = 350;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 350, 350);
        const base64Str = canvas.toDataURL("image/jpeg", 0.9);
        updateField("photo_url", base64Str);
        stopCamera();
      }
    } catch (e) {
      console.error("Error capturando foto de la cámara:", e);
    }
  };

  // Initialize form state with exact Latin Colombia CV fields
  const [resumeData, setResumeData] = useState<Partial<Resume>>(() => {
    if (initialResume) return { ...initialResume };
    return {
      nombres: "",
      apellidos: "",
      identificacion: "",
      lugar_expedicion: "",
      fecha_nacimiento: "",
      lugar_nacimiento: "",
      estado_civil: "Soltero(a)",
      celular: "",
      correo: "",
      direccion: "",
      barrio: "",
      ciudad: "",
      
      name: "",
      position: "",
      photo_url: "",
      summary: "",
      experiences: [],
      education: [],
      skills: [],
      references: []
    };
  });

  // State for dynamic additions
  const [tempExp, setTempExp] = useState<Partial<Experience>>({
    company: "", role: "", start_date: "", end_date: "", current: false, description: "", ciudad: ""
  });
  
  const [tempRef, setTempRef] = useState<Partial<Reference>>({
    name: "", role: "", phone: "", ciudad: ""
  });

  // State for single education (Secundaria) mapped to the form structure
  const [secundaria, setSecundaria] = useState(() => {
    if (initialResume && initialResume.education && initialResume.education.length > 0) {
      return {
        school: initialResume.education[0].school || "",
        degree: initialResume.education[0].degree || "",
        start_date: initialResume.education[0].start_date || "",
        ciudad: initialResume.education[0].ciudad || ""
      };
    }
    return { school: "", degree: "", start_date: "", ciudad: "" };
  });

  const progressPercentage = Math.round(((currentStep + 1) / STEPS.length) * 100);

  // Quick helper to fill test data with Colombian template info
  const handleLoadTemplateData = () => {
    setResumeData({
      nombres: "María Alejandra",
      apellidos: "Gómez Restrepo",
      identificacion: "1098765432",
      lugar_expedicion: "Medellín",
      fecha_nacimiento: "1994-04-12",
      lugar_nacimiento: "Medellín (Antioquia)",
      estado_civil: "Soltera",
      celular: "3154448888",
      correo: "maria.gomez@correo.com",
      direccion: "Carrera 80 # 45A - 12",
      barrio: "Laureles",
      ciudad: "Medellín",
      name: "María Alejandra Gómez Restrepo",
      position: "Auxiliar Administrativa y Contable",
      photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250&auto=format&fit=crop",
      summary: "Persona organizada, proactiva y con capacidad de trabajo en equipo. Sólida experiencia en recepción, control de archivos, conciliación de facturas y atención cordial al público en entornos administrativos.",
      experiences: [
        {
          id: "exp-1",
          company: "Almacenes Colombia S.A.",
          role: "Auxiliar Contable",
          start_date: "2021-02",
          end_date: "2023-11",
          current: false,
          description: "Manejo de flujo de facturación, radicación de cuentas de cobro y conciliaciones bancarias periódicas.",
          ciudad: "Medellín"
        },
        {
          id: "exp-2",
          company: "Inversiones del Norte Ltda.",
          role: "Asistente de Oficina",
          start_date: "2019-01",
          end_date: "2020-12",
          current: false,
          description: "Gestión de archivo, recepción de correspondencia, agendamiento de reuniones y atención al cliente presencial o telefónica.",
          ciudad: "Bello"
        }
      ],
      references: [
        {
          id: "ref-1",
          name: "Patricia Restrepo Piedrahita",
          role: "Contadora General",
          phone: "3209876543",
          ciudad: "Medellín"
        },
        {
          id: "ref-2",
          name: "Alvaro de Jesús Gómez",
          role: "Administrador de Sucursal",
          phone: "3113339999",
          ciudad: "Sabaneta"
        }
      ],
      skills: [
        { id: "s-1", name: "Manejo de Office (Word, Excel)", level: 85 },
        { id: "s-2", name: "Servicio al Cliente", level: 90 },
        { id: "s-3", name: "Gestión Documental", level: 80 }
      ]
    });
    setSecundaria({
      school: "Colegio San José de las Vegas",
      degree: "Bachiller Académica",
      start_date: "2011",
      ciudad: "Medellín"
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final submit validation
      const realNombres = resumeData.nombres?.trim() || "";
      const realApellidos = resumeData.apellidos?.trim() || "";
      if (!realNombres) {
        alert("Por favor especifica los nombres del solicitante en el Paso 1.");
        setCurrentStep(0);
        return;
      }

      // Map single secundaria block to the standard education array of type Resume
      const finalEducation: Education[] = [];
      if (secundaria.school || secundaria.degree) {
        finalEducation.push({
          id: "edu-secundaria",
          school: secundaria.school,
          degree: secundaria.degree,
          start_date: secundaria.start_date,
          end_date: secundaria.start_date,
          current: false,
          description: "Estudios de secundaria",
          ciudad: secundaria.ciudad
        });
      }

      const generatedName = `${realNombres} ${realApellidos}`.trim();

      onSave({
        ...resumeData,
        id: resumeData.id || Math.random().toString(36).substring(2, 9),
        slug: resumeData.slug || generatedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "perfil",
        name: generatedName,
        position: resumeData.position || "Profesora / Profesional",
        city: resumeData.ciudad || "",
        email: resumeData.correo || "",
        phone: resumeData.celular || "",
        created_at: resumeData.created_at || new Date().toISOString(),
        education: finalEducation,
        experiences: resumeData.experiences || [],
        references: resumeData.references || []
      } as Resume);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateField = (field: keyof Resume, value: any) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64Str = await fileToBase64(file);
      updateField("photo_url", base64Str);
    } catch (err) {
      console.error("No se pudo cargar el archivo: ", err);
    }
  };

  const addExperience = () => {
    if (!tempExp.company || !tempExp.role) {
      alert("La Empresa y el Cargo son campos obligatorios.");
      return;
    }
    const newExp: Experience = {
      id: Math.random().toString(),
      company: tempExp.company || "",
      role: tempExp.role || "",
      start_date: tempExp.start_date || "",
      end_date: tempExp.current ? "Actual" : (tempExp.end_date || ""),
      current: tempExp.current || false,
      description: tempExp.description || "",
      ciudad: tempExp.ciudad || ""
    };
    updateField("experiences", [...(resumeData.experiences || []), newExp]);
    setTempExp({ company: "", role: "", start_date: "", end_date: "", current: false, description: "", ciudad: "" });
  };

  const removeExperience = (id: string) => {
    updateField("experiences", (resumeData.experiences || []).filter(e => e.id !== id));
  };

  const addReference = () => {
    if (!tempRef.name || !tempRef.phone) {
      alert("El Nombre y Celular son campos requeridos.");
      return;
    }
    const newRef: Reference = {
      id: Math.random().toString(),
      name: tempRef.name || "",
      role: tempRef.role || "",
      phone: tempRef.phone || "",
      ciudad: tempRef.ciudad || ""
    };
    updateField("references", [...(resumeData.references || []), newRef]);
    setTempRef({ name: "", role: "", phone: "", ciudad: "" });
  };

  const removeReference = (id: string) => {
    updateField("references", (resumeData.references || []).filter(r => r.id !== id));
  };

  const CurrentIcon = STEPS[currentStep].icon;

  const animationVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      transition: { duration: 0.15, ease: "easeIn" }
    })
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-md overflow-hidden max-w-4xl mx-auto flex flex-col md:flex-row min-h-0 md:min-h-[580px]" id="conversational-form-container">
      {/* Onboarding Sidebar */}
      <div className="w-full md:w-80 bg-stone-900 text-white p-5 md:p-8 flex flex-col justify-between shrink-0" id="form-onboarding-sidebar">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <span className="p-2 bg-brand rounded-lg text-stone-900">
              <CheckCircle2 size={18} />
            </span>
            <span className="font-display font-bold text-sm tracking-tight text-white uppercase">Formulario de registro</span>
          </div>

          <p className="text-[10px] uppercase text-brand font-semibold tracking-wider mb-2">Progreso del Trámite</p>
          <div className="flex items-baseline gap-1 mb-4">
            <h2 className="text-3xl font-display font-bold tracking-tight text-white">{progressPercentage}%</h2>
            <span className="text-xs text-stone-400">completado</span>
          </div>

          {/* Progress Dots list */}
          <div className="space-y-3.5 mt-8 hidden md:block">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = idx < currentStep;
              const isActive = idx === currentStep;
              return (
                <div 
                  key={idx} 
                  className={`flex items-center gap-3 transition-colors duration-200 cursor-pointer ${
                    isActive ? "text-brand font-medium" : isCompleted ? "text-stone-300" : "text-stone-500"
                  }`}
                  onClick={() => setCurrentStep(idx)}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border transition-all ${
                    isActive 
                      ? "bg-brand/20 text-brand border-brand font-semibold scale-110" 
                      : isCompleted 
                        ? "bg-brand text-stone-900 border-brand" 
                        : "border-stone-800 text-stone-500"
                  }`}>
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <span className="text-xs tracking-tight line-clamp-1">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating templates filler panel to ease testing */}
        <div className="mt-8 pt-6 border-t border-stone-800" id="quick-templates-section">
          <p className="text-[11px] text-brand font-mono mb-2">💡 Auto-completar plantilla:</p>
          <button
            type="button"
            onClick={handleLoadTemplateData}
            className="w-full text-[10px] bg-stone-800 hover:bg-stone-700 border border-stone-700 transition px-3 py-2.5 rounded-xl text-center font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
            title="Cargar Información de Ejemplo"
          >
            <Sparkles size={11} className="text-brand" /> Cargar Datos de Ejemplo
          </button>
          <p className="text-[9px] text-stone-500 mt-2 leading-relaxed">
            Rellena automáticamente todos los campos del formulario con información clásica para realizar pruebas rápidas.
          </p>
        </div>
      </div>

      {/* Main Panel Content Area */}
      <div className="flex-1 p-5 md:p-8 flex flex-col justify-between bg-stone-50/20" id="form-main-wizard-workspace">
        {/* Step Intro Header */}
        <div className="border-b border-stone-200/80 pb-5 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-brand/10 text-stone-800 rounded-xl">
              <CurrentIcon size={20} className="text-stone-900" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest font-semibold">
                Paso {currentStep + 1} de {STEPS.length}
              </span>
              <h3 className="text-xl font-display font-semibold text-stone-900 leading-tight">
                {STEPS[currentStep].title}
              </h3>
            </div>
          </div>
          <p className="text-xs text-stone-500">{STEPS[currentStep].subtitle}</p>
        </div>

        {/* Interactive Steps Form Fields Container */}
        <div className="flex-1 flex flex-col justify-center min-h-[300px]">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={currentStep}
              custom={1}
              variants={animationVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4 py-1"
            >
              {/* Paso 1: Identificación Personal */}
              {currentStep === 0 && (
                <div className="space-y-4" id="step-personal-identification">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Nombres del Solicitante *</label>
                      <input
                        id="input-nombres"
                        type="text"
                        placeholder="Ej. María Alejandra"
                        value={resumeData.nombres || ""}
                        onChange={(e) => updateField("nombres", e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                        required
                      />
                    </div>
                    <div className="relative">
                      <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Apellidos del Solicitante *</label>
                      <input
                        id="input-apellidos"
                        type="text"
                        placeholder="Ej. Gómez Restrepo"
                        value={resumeData.apellidos || ""}
                        onChange={(e) => updateField("apellidos", e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Cédula de Ciudadanía (C.C.) *</label>
                      <input
                        id="input-identificacion"
                        type="text"
                        placeholder="Ej. 1098765432"
                        value={resumeData.identificacion || ""}
                        onChange={(e) => updateField("identificacion", e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                        required
                      />
                    </div>
                    <div className="relative">
                      <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Lugar de Expedición (C.C.) *</label>
                      <input
                        id="input-lugar-expedicion"
                        type="text"
                        placeholder="Ej. Medellín"
                        value={resumeData.lugar_expedicion || ""}
                        onChange={(e) => updateField("lugar_expedicion", e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 2: Nacimiento e Información Civil */}
              {currentStep === 1 && (
                <div className="space-y-4" id="step-birth-details">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Fecha de Nacimiento</label>
                      <input
                        id="input-fecha-nacimiento"
                        type="date"
                        value={resumeData.fecha_nacimiento || ""}
                        onChange={(e) => updateField("fecha_nacimiento", e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Lugar de Nacimiento</label>
                      <input
                        id="input-lugar-nacimiento"
                        type="text"
                        placeholder="Ej. Medellín (Antioquia)"
                        value={resumeData.lugar_nacimiento || ""}
                        onChange={(e) => updateField("lugar_nacimiento", e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Estado Civil</label>
                    <select
                      id="input-estado-civil"
                      value={resumeData.estado_civil || "Soltero(a)"}
                      onChange={(e) => updateField("estado_civil", e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                    >
                      <option value="Soltero(a)">Soltero(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="Unión Libre">Unión Libre</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viudo(a)">Viudo(a)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Paso 3: Contacto y Ubicación */}
              {currentStep === 2 && (
                <div className="space-y-4" id="step-contact-details">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Celular de Contacto *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 text-stone-400" size={15} />
                        <input
                          id="input-celular"
                          type="tel"
                          placeholder="Ej. 3154448888"
                          value={resumeData.celular || ""}
                          onChange={(e) => updateField("celular", e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Correo Electrónico *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={15} />
                        <input
                          id="input-correo"
                          type="email"
                          placeholder="maria.gomez@correo.com"
                          value={resumeData.correo || ""}
                          onChange={(e) => updateField("correo", e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Dirección</label>
                      <input
                        id="input-direccion"
                        type="text"
                        placeholder="Carrera 80 # 45A - 12"
                        value={resumeData.direccion || ""}
                        onChange={(e) => updateField("direccion", e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Barrio</label>
                      <input
                        id="input-barrio"
                        type="text"
                        placeholder="Laureles"
                        value={resumeData.barrio || ""}
                        onChange={(e) => updateField("barrio", e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Ciudad Residencia</label>
                      <input
                        id="input-ciudad"
                        type="text"
                        placeholder="Medellín"
                        value={resumeData.ciudad || ""}
                        onChange={(e) => updateField("ciudad", e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                      />
                    </div>
                  </div>

                  {/* Avatar upload & Web Camera integration */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1.5 font-semibold">Foto de Perfil (Opcional)</label>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <img 
                          src={resumeData.photo_url || getInitialsAvatar(resumeData.nombres || "H V")} 
                          alt="Vista previa" 
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-xl object-cover border border-stone-200 bg-white" 
                        />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-stone-850">Cargar foto de perfil</p>
                          <p className="text-[10px] text-stone-500 font-mono">Formato formal sugerido</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end flex-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload size={12} className="text-stone-500" /> Cargar Archivo
                        </button>

                        <button
                          type="button"
                          onClick={isCameraActive ? stopCamera : startCamera}
                          className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          📸 Tomar con Cámara Web
                        </button>
                      </div>

                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                      />
                    </div>

                    {/* Camera Capture Live Overlay View */}
                    {isCameraActive && (
                      <div className="bg-stone-900 text-white p-4 rounded-2xl border border-stone-800 space-y-4 shadow-inner max-w-sm mx-auto text-center" id="webcam-live-container">
                        <div className="text-center">
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-mono bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                            ● CÁMARA ACTIVA
                          </span>
                        </div>
                        
                        <div className="relative w-full aspect-square max-w-[280px] mx-auto bg-stone-950 rounded-xl overflow-hidden border border-stone-800">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted
                            className="w-full h-full object-cover scale-x-[-1]" 
                          />
                        </div>

                        {cameraError && (
                          <p className="text-[10px] text-red-400 font-semibold">{cameraError}</p>
                        )}

                        <div className="flex gap-2 justify-center">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="px-4 py-2 bg-amber-400 text-stone-900 hover:bg-amber-500 font-black text-xs rounded-xl transition cursor-pointer"
                          >
                            Capturar Foto 📸
                          </button>
                          
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-4 py-2 bg-stone-800 text-stone-300 hover:bg-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            Apagar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paso 4: Estudios Secundaria */}
              {currentStep === 3 && (
                <div className="space-y-4" id="step-education-details">
                  <div className="bg-stone-50/50 p-4 rounded-xl border border-stone-200 space-y-4">
                    <p className="text-xs font-bold text-stone-800 border-b border-stone-200 pb-2">Estudios de Básica / Secundaria:</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Institución Educativa (Colegio) *</label>
                        <input
                          type="text"
                          placeholder="Ej. Colegio San José de las Vegas"
                          value={secundaria.school}
                          onChange={(e) => setSecundaria(p => ({ ...p, school: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Título Obtenido *</label>
                        <input
                          type="text"
                          placeholder="Ej. Bachiller Académica u Homólogo"
                          value={secundaria.degree}
                          onChange={(e) => setSecundaria(p => ({ ...p, degree: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Año de Graduación *</label>
                        <input
                          type="text"
                          placeholder="Ej. 2011"
                          value={secundaria.start_date}
                          onChange={(e) => setSecundaria(p => ({ ...p, start_date: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Ciudad Instituto *</label>
                        <input
                          type="text"
                          placeholder="Ej. Medellín"
                          value={secundaria.ciudad}
                          onChange={(e) => setSecundaria(p => ({ ...p, ciudad: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                        />
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-stone-500 leading-normal italic">
                      💡 La sección de Estudios Realizados muestra el nivel de secundaria básico según el formato solicitado.
                    </p>
                  </div>
                </div>
              )}

              {/* Paso 5: Perfil Profesional */}
              {currentStep === 4 && (
                <div className="space-y-4" id="step-profile-details">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Cargo de Especialidad / Profesión *</label>
                    <input
                      id="input-position"
                      type="text"
                      placeholder="Ej. Auxiliar Administrativa / Operario / Ingeniero"
                      value={resumeData.position || ""}
                      onChange={(e) => updateField("position", e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-mono uppercase text-stone-500 font-semibold">Perfil Profesional / Resumen Ejecutivo</label>
                      <span className="text-[10px] text-stone-400 font-mono">{resumeData.summary?.length || 0} caracteres</span>
                    </div>
                    <textarea
                      id="input-summary"
                      placeholder="Breve narración de tus principales fortalezas, habilidades humanas, experiencia y ética de trabajo..."
                      value={resumeData.summary || ""}
                      onChange={(e) => updateField("summary", e.target.value)}
                      rows={5}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs leading-relaxed focus:bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition text-stone-900"
                    />
                  </div>
                </div>
              )}

              {/* Paso 6: Experiencias Laborales */}
              {currentStep === 5 && (
                <div className="space-y-4" id="step-experiences-details">
                  {/* List of current experiences added */}
                  {resumeData.experiences && resumeData.experiences.length > 0 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {resumeData.experiences.map((exp) => (
                        <div key={exp.id} className="flex justify-between items-center bg-stone-50 border border-stone-200 p-2 text-xs rounded-xl">
                          <div>
                            <p className="font-bold text-stone-900">{exp.company} - {exp.role}</p>
                            <p className="text-[10px] text-stone-500">{exp.start_date} hasta {exp.end_date || "Actual"} | {exp.ciudad}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExperience(exp.id)}
                            className="p-1 px-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Addition box */}
                  <div className="bg-stone-50/50 p-3.5 rounded-xl border border-stone-200 border-dashed space-y-3">
                    <p className="text-xs font-bold text-stone-800">Agregar Experiencia Laboral:</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-mono uppercase text-stone-400 block mb-0.5">Empresa</label>
                        <input
                          type="text"
                          placeholder="Ej. Almacenes Colombia S.A."
                          value={tempExp.company || ""}
                          onChange={(e) => setTempExp(p => ({ ...p, company: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-brand"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono uppercase text-stone-400 block mb-0.5">Cargo Desempeñado</label>
                        <input
                          type="text"
                          placeholder="Ej. Auxiliar Administrativo"
                          value={tempExp.role || ""}
                          onChange={(e) => setTempExp(p => ({ ...p, role: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-brand"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[9px] font-mono uppercase text-stone-400 block mb-0.5">Fecha de Inicio</label>
                        <input
                          type="text"
                          placeholder="Ej. Ene 2021"
                          value={tempExp.start_date || ""}
                          onChange={(e) => setTempExp(p => ({ ...p, start_date: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-[11px] outline-none focus:border-brand"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono uppercase text-stone-400 block mb-0.5">Fecha Salida</label>
                        <input
                          type="text"
                          placeholder="Ej. Dic 2023"
                          value={tempExp.end_date || ""}
                          disabled={tempExp.current}
                          onChange={(e) => setTempExp(p => ({ ...p, end_date: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-[11px] outline-none focus:border-brand disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono uppercase text-stone-400 block mb-0.5">Ciudad de labor</label>
                        <input
                          type="text"
                          placeholder="Ej. Medellín"
                          value={tempExp.ciudad || ""}
                          onChange={(e) => setTempExp(p => ({ ...p, ciudad: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-brand"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 items-center">
                      <label className="flex items-center gap-1.5 text-[11px] text-stone-600 pl-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={tempExp.current || false}
                          onChange={(e) => setTempExp(p => ({ ...p, current: e.target.checked, end_date: e.target.checked ? "Actual" : "" }))}
                          className="rounded text-brand focus:ring-brand"
                        />
                        <span>¿Labora actualmente aquí?</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={addExperience}
                      className="w-full bg-stone-900 text-white font-bold py-2 px-3 rounded-lg text-xs hover:bg-stone-800 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} className="text-brand" /> Agregar Experiencia
                    </button>
                  </div>
                </div>
              )}

              {/* Paso 7: Referencias */}
              {currentStep === 6 && (
                <div className="space-y-4" id="step-references-details">
                  {/* Current reference lists added */}
                  {resumeData.references && resumeData.references.length > 0 && (
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {resumeData.references.map((ref) => (
                        <div key={ref.id} className="flex justify-between items-center bg-stone-50 border border-stone-200 p-2.5 rounded-xl text-xs">
                          <div>
                            <p className="font-bold text-stone-900">{ref.name}</p>
                            <p className="text-[10px] text-stone-500">{ref.role} | Celular: {ref.phone} | Ciudad: {ref.ciudad}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeReference(ref.id)}
                            className="p-1 px-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add reference template block */}
                  <div className="bg-stone-50/50 p-3.5 rounded-xl border border-stone-200 border-dashed space-y-3">
                    <p className="text-xs font-bold text-stone-800">Agregar Referencia Familiar o Comercial:</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-mono uppercase text-stone-400 block mb-0.5">Nombre Completo</label>
                        <input
                          type="text"
                          placeholder="Ej. Patricia Restrepo"
                          value={tempRef.name || ""}
                          onChange={(e) => setTempRef(p => ({ ...p, name: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-brand"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono uppercase text-stone-400 block mb-0.5">Cargo / Profesión</label>
                        <input
                          type="text"
                          placeholder="Ej. Contadora General u Ocupación"
                          value={tempRef.role || ""}
                          onChange={(e) => setTempRef(p => ({ ...p, role: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-brand"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-mono uppercase text-stone-400 block mb-0.5">Celular de Referencia</label>
                        <input
                          type="tel"
                          placeholder="Ej. 3209876543"
                          value={tempRef.phone || ""}
                          onChange={(e) => setTempRef(p => ({ ...p, phone: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-brand"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono uppercase text-stone-400 block mb-0.5">Ciudad</label>
                        <input
                          type="text"
                          placeholder="Ej. Medellín"
                          value={tempRef.ciudad || ""}
                          onChange={(e) => setTempRef(p => ({ ...p, ciudad: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-brand"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addReference}
                      className="w-full bg-stone-900 text-white font-bold py-2 px-3 rounded-lg text-xs hover:bg-stone-800 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} className="text-brand" /> Agregar Referencia
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Form control action buttons bar */}
        <div className="flex justify-between items-center pt-6 border-t border-stone-200/80 mt-6 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 hover:bg-stone-100 rounded-xl text-stone-600 font-bold text-xs transition"
          >
            Cancelar
          </button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 border border-stone-300 hover:bg-stone-50 rounded-xl text-stone-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} /> Atrás
              </button>
            )}

            <button
              type="button"
              id="wizard-next-step-button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-stone-900 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-brand/10"
            >
              {currentStep === STEPS.length - 1 ? (
                <>Guardar Registro 💾</>
              ) : (
                <>Siguiente <ArrowRight size={13} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
