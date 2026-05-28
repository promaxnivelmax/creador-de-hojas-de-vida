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
    { title: "Estudios Realizados", subtitle: "Registra tus logros académicos (secundaria, técnicos, universitarios, etc.)", icon: GraduationCap },
    { title: "Perfil y Resumen", subtitle: "Breve descripción de tu perfil profesional y cargo", icon: FileText },
    { title: "Experiencia Laboral", subtitle: "Empresas, cargos y fechas de trabajo", icon: Briefcase },
    { title: "Habilidades y Destrezas", subtitle: "Registra tus fortalezas o conocimientos técnicos", icon: Award },
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
    
    // Check if there is an autosaved draft in localStorage
    try {
      const saved = localStorage.getItem("tramites_servicios_cv_draft");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error reading CV draft from localStorage", e);
    }

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

  // State for dynamic additions of education records
  const [tempEdu, setTempEdu] = useState<Partial<Education>>({
    school: "", degree: "", start_date: "", ciudad: ""
  });

  const [tempSkillName, setTempSkillName] = useState("");
  const [tempSkillLevel, setTempSkillLevel] = useState(85);

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };

  // Clear toast timeout safely
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Formatting and capitalization helpers
  const formatTitleCase = (text: string): string => {
    if (!text) return "";
    const clean = text.trim();
    if (!clean) return "";
    return clean
      .split(/\s+/)
      .map(word => {
        if (!word) return "";
        // Keep acronyms like SENA, CC, UNE etc unchanged if typed fully capitalized and shorter than 5 chars
        if (word === word.toUpperCase() && word.length <= 4) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  };

  const formatSentenceCase = (text: string): string => {
    if (!text) return "";
    const clean = text.trim();
    if (!clean) return "";
    // If the input was shouting (all caps), normalize it
    if (clean === clean.toUpperCase()) {
      return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    }
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  // Sorting helpers
  const sortExperiencesByDate = (list: Experience[]): Experience[] => {
    return [...list].sort((a, b) => {
      if (a.current && !b.current) return -1;
      if (!a.current && b.current) return 1;
      
      const dateA = a.start_date || "";
      const dateB = b.start_date || "";
      
      const yearA = parseInt(dateA.match(/\d{4}/)?.[0] || "0", 10);
      const yearB = parseInt(dateB.match(/\d{4}/)?.[0] || "0", 10);
      
      if (yearA !== yearB) {
        return yearB - yearA; // Newest first
      }
      return dateB.localeCompare(dateA);
    });
  };

  const sortEducationByDate = (list: Education[]): Education[] => {
    return [...list].sort((a, b) => {
      const dateA = a.start_date || "";
      const dateB = b.start_date || "";
      
      const yearA = parseInt(dateA.match(/\d{4}/)?.[0] || "0", 10);
      const yearB = parseInt(dateB.match(/\d{4}/)?.[0] || "0", 10);
      
      if (yearA !== yearB) {
        return yearB - yearA; // Newest first
      }
      return dateB.localeCompare(dateA);
    });
  };

  // Autosave draft dynamically to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("tramites_servicios_cv_draft", JSON.stringify(resumeData));
    } catch (e) {
      console.error("Error saving CV draft", e);
    }
  }, [resumeData]);

  const progressPercentage = Math.round(((currentStep + 1) / STEPS.length) * 105); // Just updated below to be dynamic based on STEPS length
  const realProgressPercentage = Math.round(((currentStep + 1) / STEPS.length) * 100);

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
      ],
      education: [
        {
          id: "edu-1",
          school: "Colegio San José de las Vegas",
          degree: "Bachiller Académica",
          start_date: "2011",
          end_date: "2011",
          current: false,
          description: "Estudios de secundaria",
          ciudad: "Medellín"
        }
      ]
    });
  };

  const handleNext = () => {
    // Standardize capitalization of all current/entered fields on Next click
    const updated = { ...resumeData };
    
    if (updated.nombres) updated.nombres = formatTitleCase(updated.nombres);
    if (updated.apellidos) updated.apellidos = formatTitleCase(updated.apellidos);
    if (updated.lugar_nacimiento) updated.lugar_nacimiento = formatTitleCase(updated.lugar_nacimiento);
    if (updated.lugar_expedicion) updated.lugar_expedicion = formatTitleCase(updated.lugar_expedicion);
    if (updated.direccion) updated.direccion = formatTitleCase(updated.direccion);
    if (updated.barrio) updated.barrio = formatTitleCase(updated.barrio);
    if (updated.ciudad) updated.ciudad = formatTitleCase(updated.ciudad);
    if (updated.position) updated.position = formatTitleCase(updated.position);
    if (updated.summary) updated.summary = formatSentenceCase(updated.summary);
    
    setResumeData(updated);

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final submit validation
      const realNombres = updated.nombres?.trim() || "";
      const realApellidos = updated.apellidos?.trim() || "";
      if (!realNombres) {
        showToast("error", "Por favor especifica los nombres del solicitante en el Paso 1.");
        setCurrentStep(0);
        return;
      }

      // Safeguard: auto-commit text from active inputs if they forgot to click "Agregar"
      const finalEducation = [...(updated.education || [])];
      if (tempEdu.school && tempEdu.degree) {
        const alreadyExists = finalEducation.some(
          edu => edu.school?.toLowerCase() === tempEdu.school?.toLowerCase() && edu.degree?.toLowerCase() === tempEdu.degree?.toLowerCase()
        );
        if (!alreadyExists) {
          finalEducation.push({
            id: "edu-" + Math.random().toString(36).substring(2, 9),
            school: formatTitleCase(tempEdu.school || ""),
            degree: formatTitleCase(tempEdu.degree || ""),
            start_date: tempEdu.start_date || "",
            end_date: tempEdu.start_date || "",
            current: false,
            description: "Estudios",
            ciudad: formatTitleCase(tempEdu.ciudad || "")
          });
        }
      }

      const generatedName = `${realNombres} ${realApellidos}`.trim();

      // Clear the draft from localStorage on successful finish
      try {
        localStorage.removeItem("tramites_servicios_cv_draft");
      } catch (e) {
        console.error("Could not remove saved draft", e);
      }

      onSave({
        ...updated,
        id: updated.id || "res-" + Math.random().toString(36).substring(2, 9),
        slug: updated.slug || generatedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "perfil",
        name: generatedName,
        position: formatTitleCase(updated.position || "Profesora / Profesional"),
        city: formatTitleCase(updated.ciudad || ""),
        email: updated.correo || "",
        phone: updated.celular || "",
        created_at: updated.created_at || new Date().toISOString(),
        education: sortEducationByDate(finalEducation),
        experiences: sortExperiencesByDate(updated.experiences || []),
        references: updated.references || []
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
    if ((resumeData.experiences || []).length >= 5) {
      showToast("error", "Puedes registrar un máximo de 5 experiencias laborales en tu hoja de vida.");
      return;
    }
    if (!tempExp.company || !tempExp.role) {
      showToast("error", "Falta información obligatoria: Nombre de Empresa y Cargo son necesarios.");
      return;
    }
    const newExp: Experience = {
      id: "exp-" + Math.random().toString(36).substring(2, 9),
      company: formatTitleCase(tempExp.company || ""),
      role: formatTitleCase(tempExp.role || ""),
      start_date: tempExp.start_date || "",
      end_date: tempExp.current ? "Actual" : (tempExp.end_date || ""),
      current: tempExp.current || false,
      description: formatSentenceCase(tempExp.description || ""),
      ciudad: formatTitleCase(tempExp.ciudad || "")
    };
    
    const sorted = sortExperiencesByDate([...(resumeData.experiences || []), newExp]);
    updateField("experiences", sorted);
    setTempExp({ company: "", role: "", start_date: "", end_date: "", current: false, description: "", ciudad: "" });
    showToast("success", "¡Experiencia laboral agregada correctamente en orden cronológico!");
  };

  const removeExperience = (id: string) => {
    updateField("experiences", (resumeData.experiences || []).filter(e => e.id !== id));
    showToast("success", "Experiencia eliminada.");
  };

  const addReference = () => {
    if (!tempRef.name || !tempRef.phone) {
      showToast("error", "Falta información: Nombre y Celular son requeridos.");
      return;
    }
    const newRef: Reference = {
      id: "ref-" + Math.random().toString(36).substring(2, 9),
      name: formatTitleCase(tempRef.name || ""),
      role: formatTitleCase(tempRef.role || ""),
      phone: tempRef.phone || "",
      ciudad: formatTitleCase(tempRef.ciudad || "")
    };
    updateField("references", [...(resumeData.references || []), newRef]);
    setTempRef({ name: "", role: "", phone: "", ciudad: "" });
    showToast("success", "¡Referencia personal agregada correctamente!");
  };

  const removeReference = (id: string) => {
    updateField("references", (resumeData.references || []).filter(r => r.id !== id));
    showToast("success", "Referencia eliminada.");
  };

  const addEducation = () => {
    if ((resumeData.education || []).length >= 5) {
      showToast("error", "Puedes registrar un máximo de 5 logros académicos.");
      return;
    }
    if (!tempEdu.school || !tempEdu.degree) {
      showToast("error", "Falta información obligatoria: Institución Educativa y Título Obtenido.");
      return;
    }
    const newEdu: Education = {
      id: "edu-" + Math.random().toString(36).substring(2, 9),
      school: formatTitleCase(tempEdu.school || ""),
      degree: formatTitleCase(tempEdu.degree || ""),
      start_date: tempEdu.start_date || "",
      end_date: tempEdu.start_date || "",
      current: false,
      description: "Estudios",
      ciudad: formatTitleCase(tempEdu.ciudad || "")
    };
    
    const sorted = sortEducationByDate([...(resumeData.education || []), newEdu]);
    updateField("education", sorted);
    setTempEdu({ school: "", degree: "", start_date: "", ciudad: "" });
    showToast("success", "¡Logro académico agregado en orden cronológico!");
  };

  const removeEducation = (id: string) => {
    updateField("education", (resumeData.education || []).filter(e => e.id !== id));
    showToast("success", "Estudio académico eliminado.");
  };

  const addSkill = () => {
    if (!tempSkillName.trim()) {
      showToast("error", "Falta escribir el nombre de la habilidad.");
      return;
    }
    if ((resumeData.skills || []).length >= 8) {
      showToast("error", "Puedes agregar un máximo de 8 habilidades o destrezas.");
      return;
    }
    const newSkill: Skill = {
      id: "sk-" + Math.random().toString(36).substring(2, 9),
      name: formatSentenceCase(tempSkillName),
      level: tempSkillLevel
    };
    updateField("skills", [...(resumeData.skills || []), newSkill]);
    setTempSkillName("");
    setTempSkillLevel(85);
    showToast("success", "¡Habilidad agregada correctamente!");
  };

  const removeSkill = (id: string) => {
    updateField("skills", (resumeData.skills || []).filter(s => s.id !== id));
    showToast("success", "Habilidad eliminada.");
  };

  const PROFILE_PRESETS = [
    {
      title: "Administración, Organización y Apoyo (Perfil General)",
      text: "Persona organizada, proactiva y con alta vocación de servicio. Sólida experiencia desempeñando tareas clave de soporte, control documental, recepción, control de inventarios físicos y excelente asistencia general. Me caracterizo por mi puntualidad intachable, amabilidad absoluta, meticulosidad y rápida capacidad de adaptación para apoyar las operaciones y equipos de trabajo."
    },
    {
      title: "Operativo, Servicios y Trabajo Práctico (Perfil General)",
      text: "Colaborador de confianza, responsable, honesto y con gran actitud hacia el trabajo práctico y operativo. Amplia experiencia garantizando la correcta ejecución de asignaciones físicas, logística básica, orden y cumplimiento estricto de tareas prioritarias. Me distingo por mi puntualidad, gran disposición y excelente rendimiento bajo condiciones dinámicas."
    },
    {
      title: "Servicios al Cliente, Recepción y Comunicación (Perfil General)",
      text: "Profesional proactivo con facilidad de expresión y una excelente actitud de atención al público. Experiencia interactuando de forma cordial con clientes internos y externos, resolviendo requerimientos básicos con rapidez, agendamiento de citas u organización logística de eventos. Persona puntual, amigable, orientada al logro y de aprendizaje ágil."
    },
    {
      title: "Ejecutivo Versátil con Enfoque en Calidad (Perfil General)",
      text: "Profesional polivalente caracterizado por un alto nivel de iniciativa, responsabilidad y ética laboral. Capacidad demostrada para asumir diferentes funciones de soporte, agilizar flujos operativos diarios y aprender ágilmente nuevas herramientas o directrices. Concentrado en el trabajo seguro, la puntualidad y el aporte de valor en cualquier equipo."
    }
  ];

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
      {/* Premium Notification Toast Overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs max-w-md w-11/12 sm:w-full font-semibold"
            style={{
              backgroundColor: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
              borderColor: toast.type === "success" ? "#bbf7d0" : "#fecaca",
              color: toast.type === "success" ? "#15803d" : "#b91c1c",
            }}
          >
            {toast.type === "success" ? (
              <span className="p-1 bg-green-200/50 rounded-full text-green-700 font-bold px-2">✓</span>
            ) : (
              <span className="p-1 bg-red-200/50 rounded-full text-red-700 font-bold px-2">✕</span>
            )}
            <span className="flex-1">{toast.message}</span>
            <button 
              type="button" 
              onClick={() => setToast(null)} 
              className="text-stone-400 hover:text-stone-600 transition font-black text-sm px-1.5"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
            <h2 className="text-3xl font-display font-bold tracking-tight text-white">{realProgressPercentage}%</h2>
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

        {/* Borrar Progreso / Empezar de cero */}
        <div className="mt-8 pt-5 border-t border-stone-800">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("¿Deseas borrar todo tu progreso y empezar tu hoja de vida de cero?")) {
                try {
                  localStorage.removeItem("tramites_servicios_cv_draft");
                } catch (e) {}
                
                setResumeData({
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
                });
                setCurrentStep(0);
                showToast("success", "El formulario ha sido borrado. Puedes iniciar de nuevo.");
              }
            }}
            className="w-full bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800/80 hover:border-stone-700 py-2.5 px-3 rounded-xl text-[10.5px] font-bold tracking-tight transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            🧹 Empezar de cero (Borrar Borrador)
          </button>
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

              {/* Paso 4: Estudios e Historial Académico */}
              {currentStep === 3 && (
                <div className="space-y-4" id="step-education-details">
                  {/* List of currently added education items */}
                  {resumeData.education && resumeData.education.length > 0 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} className="flex justify-between items-center bg-stone-50 border border-stone-200 p-2 text-xs rounded-xl">
                          <div>
                            <p className="font-bold text-stone-900">{edu.school} - {edu.degree}</p>
                            <p className="text-[10px] text-stone-500">Graduación: {edu.start_date} | Ciudad: {edu.ciudad}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEducation(edu.id)}
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
                    <p className="text-xs font-bold text-stone-800 text-brand">Registrar un título académico:</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Institución Educativa (Colegio/Universidad/Sena) *</label>
                        <input
                          type="text"
                          placeholder="Ej. Colegio San José o Sena / Unipaz"
                          value={tempEdu.school || ""}
                          onChange={(e) => setTempEdu(p => ({ ...p, school: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Título Obtenido *</label>
                        <input
                          type="text"
                          placeholder="Ej. Bachiller Académico, Técnico, Profesional"
                          value={tempEdu.degree || ""}
                          onChange={(e) => setTempEdu(p => ({ ...p, degree: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Año de Graduación *</label>
                        <input
                          type="text"
                          placeholder="Ej. 2011"
                          value={tempEdu.start_date || ""}
                          onChange={(e) => setTempEdu(p => ({ ...p, start_date: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-stone-500 block mb-1 font-semibold">Ciudad Instituto *</label>
                        <input
                          type="text"
                          placeholder="Ej. Medellín, Bogotá"
                          value={tempEdu.ciudad || ""}
                          onChange={(e) => setTempEdu(p => ({ ...p, ciudad: e.target.value }))}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-stone-900"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addEducation}
                      className="w-full bg-stone-900 text-white font-bold py-2 px-3 rounded-lg text-xs hover:bg-stone-800 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} className="text-brand" /> Agregar Estudio a la Lista
                    </button>

                    <p className="text-[10px] text-stone-500 leading-normal italic text-center mt-1">
                      💡 Puedes registrar hasta 4 o más estudios pulsando "Agregar Estudio". Los acumulados se guardarán automáticamente en tu hoja de vida.
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

                    {/* Presets Block */}
                    <div className="mt-4 p-4 bg-amber-50/50 rounded-xl border border-amber-200/40">
                      <p className="text-xs font-bold text-stone-850 flex items-center gap-1.5 mb-2.5">
                        <Sparkles size={13} className="text-amber-600" /> ¿No sabes qué escribir? Elige un ejemplo predeterminado para tu perfil:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {PROFILE_PRESETS.map((preset) => (
                          <button
                            key={preset.title}
                            type="button"
                            onClick={() => {
                              if (!resumeData.summary || window.confirm("¿Deseas reemplazar tu texto actual con esta plantilla de ejemplo?")) {
                                updateField("summary", preset.text);
                              }
                            }}
                            className="bg-white hover:bg-stone-50 border border-stone-200 p-2.5 text-left rounded-xl transition text-xs flex flex-col justify-between group cursor-pointer hover:border-amber-400"
                          >
                            <span className="font-bold text-stone-900 text-[11px] group-hover:text-amber-800 transition block mb-1">
                              {preset.title}
                            </span>
                            <span className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed">
                              {preset.text}
                            </span>
                            <span className="text-[9px] text-amber-700 font-bold mt-1.5 block hover:underline">
                              Hacer clic para usar 📝
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
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

              {/* Paso 7: Habilidades y Destrezas */}
              {currentStep === 6 && (
                <div className="space-y-5" id="step-skills-details">
                  {/* Current list of skills */}
                  {resumeData.skills && resumeData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 p-1 max-h-44 overflow-y-auto">
                      {resumeData.skills.map((sk) => (
                        <div 
                          key={sk.id} 
                          className="inline-flex items-center gap-2 bg-stone-900 text-white pl-3.5 pr-2 py-1.5 rounded-full text-xs font-semibold shadow-xs"
                        >
                          <span>{sk.name}</span>
                          <span className="text-[10px] bg-amber-400 text-stone-950 px-1.5 py-0.5 rounded-full font-bold">
                            {sk.level}%
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSkill(sk.id)}
                            className="p-0.5 hover:bg-stone-800 text-stone-300 hover:text-rose-400 rounded-full transition cursor-pointer"
                            title="Quitar habilidad"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-stone-50 border border-stone-200 p-6 rounded-2xl text-center space-y-1.5">
                      <p className="text-xs text-stone-500 font-bold">No has registrado habilidades aún.</p>
                      <p className="text-[10px] text-stone-400">Agrega tus habilidades principales a continuación para resaltarlas en tu hoja de vida.</p>
                    </div>
                  )}

                  {/* Addition Box */}
                  <div className="bg-stone-50/50 p-4 rounded-xl border border-stone-205 border-dashed space-y-4">
                    <p className="text-xs font-bold text-stone-850">Agregar Habilidad o Destreza técnica:</p>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                      <div className="sm:col-span-7 space-y-1">
                        <label className="text-[10px] font-mono uppercase text-stone-500 block font-semibold">Nombre de Habilidad *</label>
                        <input
                          type="text"
                          placeholder="Ej. Servicio al Cliente, Trabajo en Equipo, Excel, Aseo"
                          value={tempSkillName}
                          onChange={(e) => setTempSkillName(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-stone-900"
                        />
                      </div>

                      <div className="sm:col-span-4 space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-mono uppercase text-stone-500 block font-semibold">Nivel de Dominio</label>
                          <span className="text-[11px] font-bold text-amber-700">{tempSkillLevel}%</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          step="5"
                          value={tempSkillLevel}
                          onChange={(e) => setTempSkillLevel(Number(e.target.value))}
                          className="w-full accent-amber-500 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addSkill}
                      className="w-full bg-stone-900 text-white font-bold py-2.5 px-3 rounded-lg text-xs hover:bg-stone-800 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} className="text-brand" /> Agregar Habilidad a mi Currículum
                    </button>

                    {/* Predefined suggestion pills to ease writing */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-mono uppercase text-stone-400 font-bold">💡 Habilidades sugeridas (Toca para agregar):</p>
                      <div className="flex flex-wrap gap-1.5">
                        {["Trabajo en equipo", "Atención al Cliente", "Puntualidad", "Honestidad", "Manejo de computadores", "Resolución de problemas", "Proactividad"].map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setTempSkillName(s);
                              setTempSkillLevel(90);
                            }}
                            className="bg-white hover:bg-amber-100 border border-stone-200 text-stone-700 hover:text-stone-900 px-2 py-1 rounded-lg text-[10px] font-medium transition cursor-pointer"
                          >
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 8: Referencias */}
              {currentStep === 7 && (
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
