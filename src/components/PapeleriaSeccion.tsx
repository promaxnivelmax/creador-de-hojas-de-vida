import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  FileText, Search, Star, Copy, Trash2, Edit, Sparkles, ArrowLeft, 
  Download, Printer, Check, RefreshCw, Palette, Layers, HelpCircle, 
  BookOpen, Building2, Landmark, User, FileSpreadsheet, Activity
} from "lucide-react";

// List of all templates organized by Categorías requested by user
export interface DocTemplate {
  id: string;
  titulo: string;
  categoria: "laborales" | "personales" | "juridicos" | "empresariales";
  descripcion: string;
  highlight?: boolean;
  variables: string[]; // required inputs
}

const DOCUMENT_TEMPLATES: DocTemplate[] = [
  // 1. DOCUMENTOS LABORALES
  {
    id: "carta-renuncia",
    titulo: "Carta de renuncia voluntaria",
    categoria: "laborales",
    descripcion: "Manifestación formal e irrevocable de retiro voluntario del puesto de trabajo.",
    highlight: true,
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "cargo", "destinatario"]
  },
  {
    id: "solicitud-vacaciones",
    titulo: "Solicitud de vacaciones",
    categoria: "laborales",
    descripcion: "Petición institucional para disfrutar del periodo reglamentario de descanso remunerado.",
    highlight: true,
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "cargo", "fechaInicio", "fechaFin"]
  },
  {
    id: "solicitud-permisos",
    titulo: "Solicitud de permisos",
    categoria: "laborales",
    descripcion: "Requerimiento formal para ausentarse temporalmente por calamidad u otros motivos.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "cargo", "fechaInicio", "fechaFin", "motivo"]
  },
  {
    id: "solicitud-viaticos",
    titulo: "Solicitud de viáticos",
    categoria: "laborales",
    descripcion: "Formatos oficiales para el reembolso u ordenamiento de viáticos por viajes corporativos.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "cargo", "motivo", "asunto"]
  },
  {
    id: "carta-laboral",
    titulo: "Carta laboral",
    categoria: "laborales",
    descripcion: "Certificación de desempeño laboral elaborada para entidades comerciales.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "cargo", "destinatario"]
  },
  {
    id: "certificacion-laboral",
    titulo: "Certificación laboral",
    categoria: "laborales",
    descripcion: "Constancia oficial que detalla contrato, antigüedad laboral y asignación salarial.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "cargo"]
  },
  {
    id: "memorandos",
    titulo: "Memorandos",
    categoria: "laborales",
    descripcion: "Comunicaciones internas disciplinarias, organizacionales o de procedimientos.",
    variables: ["nombre", "fecha", "ciudad", "empresa", "asunto", "destinatario", "motivo"]
  },
  {
    id: "descargos",
    titulo: "Descargos",
    categoria: "laborales",
    descripcion: "Escrito formal de aclaraciones frente a citaciones laborales disciplinarias.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "cargo", "motivo"]
  },
  {
    id: "llamados-atencion",
    titulo: "Llamados de atención",
    categoria: "laborales",
    descripcion: "Amonestación formal por faltas leves o retrasos recurrentes en operaciones.",
    variables: ["nombre", "fecha", "ciudad", "empresa", "asunto", "destinatario", "motivo"]
  },
  {
    id: "recomienda-laboral",
    titulo: "Carta de recomendación laboral",
    categoria: "laborales",
    descripcion: "Atestado de aptitudes y conducta ejemplar para presentar a futuros empleadores.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "cargo", "destinatario"]
  },
  {
    id: "solicitud-empleo",
    titulo: "Solicitud de empleo",
    categoria: "laborales",
    descripcion: "Carta elegante de presentación formal adjunta para postulación a vacantes.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "cargo", "asunto"]
  },

  // 2. DOCUMENTOS PERSONALES
  {
    id: "referencia-personal",
    titulo: "Referencias personales",
    categoria: "personales",
    descripcion: "Certificación de moralidad de un ciudadano expedida por conocidos idóneos.",
    highlight: true,
    variables: ["nombre", "cedula", "fecha", "ciudad", "destinatario"]
  },
  {
    id: "referencia-familiar",
    titulo: "Referencias familiares",
    categoria: "personales",
    descripcion: "Atestado de parentesco, buena fe y conducta avalada por un familiar.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "destinatario"]
  },
  {
    id: "excusa-laboral",
    titulo: "Excusas laborales",
    categoria: "personales",
    descripcion: "Justificación de inasistencia a labores por enfermedad u otras circunstancias de fuerza de ley.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "fechaInicio", "motivo"]
  },
  {
    id: "excusa-estudiantil",
    titulo: "Excusas estudiantiles",
    categoria: "personales",
    descripcion: "Comunicado formal para docentes y directores justificando ausencias académicas.",
    variables: ["nombre", "fecha", "ciudad", "destinatario", "motivo", "fechaInicio"]
  },
  {
    id: "permiso-familiar",
    titulo: "Permisos familiares",
    categoria: "personales",
    descripcion: "Solicitud justificando ausencias destinadas a atención prioritaria a familiares.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "motivo", "fechaInicio"]
  },
  {
    id: "carta-sencilla",
    titulo: "Cartas sencillas",
    categoria: "personales",
    descripcion: "Formato redactado de correspondencia convencional para trámites del día a día.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "destinatario", "asunto", "motivo"]
  },
  {
    id: "invitacion-formal",
    titulo: "Invitaciones formales",
    categoria: "personales",
    descripcion: "Formatos premium para citar a eventos protocolarios, comerciales o familiares.",
    variables: ["nombre", "fecha", "ciudad", "asunto", "destinatario", "motivo"]
  },
  {
    id: "recomienda-personal",
    titulo: "Cartas de recomendación",
    categoria: "personales",
    descripcion: "Recomendación genérica de confianza y moralidad de uso civil diverso.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "destinatario"]
  },

  // 3. DOCUMENTOS JURÍDICOS Y ADMINISTRATIVOS
  {
    id: "derecho-peticion",
    titulo: "Derecho de petición",
    categoria: "juridicos",
    descripcion: "Solicitud de ley amparada constitucionalmente en Colombia (Artículo 23 CP).",
    highlight: true,
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "asunto", "motivo"]
  },
  {
    id: "declaracion-extrajuicio",
    titulo: "Declaración extrajuicio",
    categoria: "juridicos",
    descripcion: "Testimonio jurado e individual de hechos civiles para trámites legales o subsidios.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "motivo"]
  },
  {
    id: "poder-simple",
    titulo: "Poder simple",
    categoria: "juridicos",
    descripcion: "Autorización elemental para delegar reclamos de documentos o cobros comerciales.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "destinatario", "motivo"]
  },
  {
    id: "tutela-basica",
    titulo: "Tutelas básicas",
    categoria: "juridicos",
    descripcion: "Mecanismo preferente para la defensa inmediata de Derechos Fundamentales vulnerados.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "asunto", "motivo"]
  },
  {
    id: "recurso-reposicion",
    titulo: "Recursos de reposición",
    categoria: "juridicos",
    descripcion: "Objeción formal autónoma frente a decisiones en primera instancia civil.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "asunto", "motivo"]
  },
  {
    id: "oficio-juridico",
    titulo: "Oficios",
    categoria: "juridicos",
    descripcion: "Correspondencia oficial y protocolaria idónea para entes gubernamentales u oficinas.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "destinatario", "asunto", "motivo"]
  },
  {
    id: "comunicados",
    titulo: "Comunicados",
    categoria: "juridicos",
    descripcion: "Declaración estructurada para prensa o audiencias sobre un hecho específico.",
    variables: ["fecha", "ciudad", "empresa", "asunto", "motivo"]
  },
  {
    id: "constancias",
    titulo: "Constancias",
    categoria: "juridicos",
    descripcion: "Documento oficial que acredita la veracidad de una situación o trámite administrativo.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "asunto"]
  },
  {
    id: "actas-sencillas",
    titulo: "Actas sencillas",
    categoria: "juridicos",
    descripcion: "Registro formal de compromisos, acuerdos, órdenes y firmas de reuniones.",
    variables: ["fecha", "ciudad", "empresa", "asunto", "motivo"]
  },
  {
    id: "citaciones",
    titulo: "Citaciones",
    categoria: "juridicos",
    descripcion: "Oficio formal para convocar a comparecer a una persona a reunión obligatoria.",
    variables: ["nombre", "fecha", "ciudad", "empresa", "asunto", "destinatario", "motivo"]
  },

  // 4. DOCUMENTOS EMPRESARIALES
  {
    id: "cotizaciones",
    titulo: "Cotizaciones",
    categoria: "empresariales",
    descripcion: "Oferta económica formal detallada de bienes, suministros o tarifas de servicios.",
    highlight: true,
    variables: ["nombre", "fecha", "ciudad", "empresa", "asunto", "destinatario", "motivo"]
  },
  {
    id: "facturas-simples",
    titulo: "Facturas simples",
    categoria: "empresariales",
    descripcion: "Formato ejecutivo simple para asentar cuentas de cobro de servicios prestados.",
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "asunto", "motivo"]
  },
  {
    id: "propuestas-comerciales",
    titulo: "Propuestas comerciales",
    categoria: "empresariales",
    descripcion: "Planteamiento formal de alianzas estratégicas o servicios de consultoría.",
    variables: ["nombre", "fecha", "ciudad", "empresa", "asunto", "destinatario", "motivo"]
  },
  {
    id: "ordenes-servicio",
    titulo: "Órdenes de servicio",
    categoria: "empresariales",
    descripcion: "Documento formal autorizando la prestación de una labor o instalación.",
    variables: ["nombre", "fecha", "ciudad", "empresa", "asunto", "destinatario", "motivo"]
  },
  {
    id: "formatos-empresariales",
    titulo: "Formatos empresariales",
    categoria: "empresariales",
    descripcion: "Encabezados y formatos estandarizados para uso general de personal corporativo.",
    variables: ["nombre", "fecha", "ciudad", "empresa", "asunto"]
  },
  {
    id: "atencion-cliente",
    titulo: "Atención al cliente",
    categoria: "empresariales",
    descripcion: "Registro formal de Peticiones, Quejas, Reclamos o Sugerencias (PQRS).",
    variables: ["nombre", "cedula", "fecha", "ciudad", "empresa", "asunto", "motivo"]
  }
];

export interface SavedDoc {
  id: string;
  templateId: string;
  titulo: string;
  categoria: string;
  fechaCreacion: string;
  favorito: boolean;
  variables: Record<string, string>;
  cuerpoTexto: string;
  estiloVisual: "Formal" | "Corporativo" | "Jurídico" | "Minimalista";
  colorAcento: string;
  nombreSolicitante: string;
}

const LOCAL_STORAGE_DOCS_KEY = "tramites_documentos_userdb_v1";

export default function PapeleriaSeccion() {
  const [activeTab, setActiveTab] = useState<"todos" | "laborales" | "personales" | "juridicos" | "empresariales">("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<DocTemplate | null>(null);
  
  // Storage arrays
  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [currentEditDoc, setCurrentEditDoc] = useState<SavedDoc | null>(null);

  // Form input states
  const [varInputs, setVarInputs] = useState<Record<string, string>>({});
  const [cuerpoTexto, setCuerpoTexto] = useState("");
  const [estiloVisual, setEstiloVisual] = useState<"Formal" | "Corporativo" | "Jurídico" | "Minimalista">("Formal");
  const [colorAcento, setColorAcento] = useState("#ffc132");
  
  // AI assist spinner states
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isImprovingAI, setIsImprovingAI] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  // Load user database on mount
  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_DOCS_KEY);
    if (raw) {
      try {
        setSavedDocs(JSON.parse(raw));
      } catch (err) {
        console.error("Error reading documentos local db:", err);
      }
    }
  }, []);

  // Save documents logic
  const saveDocsToLocalStorage = (list: SavedDoc[]) => {
    setSavedDocs(list);
    localStorage.setItem(LOCAL_STORAGE_DOCS_KEY, JSON.stringify(list));
  };

  // Filter templates list
  const filteredTemplates = DOCUMENT_TEMPLATES.filter(tb => {
    const matchCat = activeTab === "todos" || tb.categoria === activeTab;
    const matchTerm = tb.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      tb.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchTerm;
  });

  // Display Name of variables helper
  const varLabels: Record<string, string> = {
    nombre: "Nombre del Solicitante / Remitente",
    cedula: "Cédula de Ciudadanía (C.C. No.)",
    fecha: "Fecha (Día, Mes, Año)",
    ciudad: "Ciudad (Ej: Bogotá D.C.)",
    empresa: "Nombre de la Empresa o Entidad",
    cargo: "Cargo del Solicitante",
    destinatario: "Nombre del Destinatario / Cargo",
    fechaInicio: "Fecha de Inicio (Vacaciones/Permiso)",
    fechaFin: "Fecha de Finalización o Regreso",
    motivo: "Motivo, Solicitud detallada o Justificación",
    asunto: "Asunto de la comunicación"
  };

  // Start creating a document from template
  const handleOpenCreator = (template: DocTemplate) => {
    setSelectedTemplate(template);
    
    // Auto populate basic values from current date or empty
    const today = new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
    const initialInputs: Record<string, string> = {};
    template.variables.forEach(v => {
      if (v === "fecha") initialInputs[v] = today;
      else if (v === "ciudad") initialInputs[v] = "Bogotá D.C.";
      else initialInputs[v] = "";
    });

    setVarInputs(initialInputs);
    setEstiloVisual("Formal");
    setColorAcento("#ffc132");
    
    // Fill mock sample standard body placeholder
    const fallbackText = `Cargando plantilla en tiempo real...\nCompleta tus datos en el formulario y haz clic en "✨ Redactar con IA" para redactar un escrito profesional de alta calidad de forma automática, o edita esta sección manualmente.`;
    setCuerpoTexto(fallbackText);
    setCurrentEditDoc(null);
    setAiNote(null);
  };

  // Load existing document for editing
  const handleEditSavedDoc = (doc: SavedDoc) => {
    const template = DOCUMENT_TEMPLATES.find(t => t.id === doc.templateId) || {
      id: doc.templateId,
      titulo: doc.titulo,
      categoria: doc.categoria as any,
      descripcion: "",
      variables: Object.keys(doc.variables)
    };
    setSelectedTemplate(template);
    setVarInputs(doc.variables);
    setCuerpoTexto(doc.cuerpoTexto);
    setEstiloVisual(doc.estiloVisual);
    setColorAcento(doc.colorAcento);
    setCurrentEditDoc(doc);
    setAiNote(null);
  };

  // Duplicate a document
  const handleDuplicateDoc = (doc: SavedDoc, e: React.MouseEvent) => {
    e.stopPropagation();
    const cloned: SavedDoc = {
      ...doc,
      id: "doc-" + Math.random().toString(36).substring(2, 9),
      titulo: `${doc.titulo} (Copia)`,
      fechaCreacion: new Date().toISOString()
    };
    const newList = [cloned, ...savedDocs];
    saveDocsToLocalStorage(newList);
  };

  // Toggle Favorite
  const handleToggleFavorite = (doc: SavedDoc, e: React.MouseEvent) => {
    e.stopPropagation();
    const newList = savedDocs.map(d => {
      if (d.id === doc.id) return { ...d, favorito: !d.favorito };
      return d;
    });
    saveDocsToLocalStorage(newList);
  };

  // Delete Document
  const handleDeleteDoc = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Estás seguro de que deseas eliminar este documento de tu historial?")) return;
    const newList = savedDocs.filter(d => d.id !== docId);
    saveDocsToLocalStorage(newList);
  };

  // Handle standard input updates on fields
  const handleInputChange = (key: string, value: string) => {
    setVarInputs(prev => {
      const updated = { ...prev, [key]: value };
      
      // Auto replace in template preview if we haven't invoked AI yet or if the body is placeholder
      return updated;
    });
  };

  // Auto-Save action
  const handleAutoSave = () => {
    if (!selectedTemplate) return;

    const finalName = varInputs.nombre || "Documento Administrativo";
    const newDoc: SavedDoc = {
      id: currentEditDoc?.id || "doc-" + Math.random().toString(36).substring(2, 9),
      templateId: selectedTemplate.id,
      titulo: selectedTemplate.titulo,
      categoria: selectedTemplate.categoria,
      fechaCreacion: currentEditDoc?.fechaCreacion || new Date().toISOString(),
      favorito: currentEditDoc?.favorito || false,
      variables: varInputs,
      cuerpoTexto: cuerpoTexto,
      estiloVisual: estiloVisual,
      colorAcento: colorAcento,
      nombreSolicitante: finalName
    };

    let newList = [...savedDocs];
    const existingIndex = newList.findIndex(d => d.id === newDoc.id);
    if (existingIndex !== -1) {
      newList[existingIndex] = newDoc;
    } else {
      newList = [newDoc, ...newList];
    }

    saveDocsToLocalStorage(newList);
    setCurrentEditDoc(newDoc);
  };

  // Real-time debounce auto save triggering on body textual typing shifts
  useEffect(() => {
    if (selectedTemplate && cuerpoTexto && cuerpoTexto.length > 30) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [cuerpoTexto, varInputs, estiloVisual, colorAcento]);

  // AI TEXT REDACT ACTION
  const handleGenerateDocumentWithAI = async () => {
    if (!selectedTemplate) return;
    try {
      setIsGeneratingAI(true);
      setAiNote(null);

      const response = await fetch("/api/ai/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: selectedTemplate.titulo,
          variables: varInputs,
          style: estiloVisual,
          action: "generate"
        })
      });

      const data = await response.json();
      if (data && data.success) {
        setCuerpoTexto(data.text);
        if (data.note) {
          setAiNote("✓ Formato local cargado correctamente.");
        } else {
          setAiNote("✨ Inteligencia Artificial redactó este texto formal.");
        }
      } else {
        alert("Ocurrió un error al contactar al asistente inteligente. Se generará un borrador estándar.");
      }
    } catch (err) {
      console.error("AI Generation error:", err);
      alert("Error de conexión. Se cargará un borrador local.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // AI TEXT IMPROVE AND GRAMMAR CHECKS
  const handleImproveGrammarWithAI = async () => {
    if (!cuerpoTexto) return;
    try {
      setIsImprovingAI(true);
      setAiNote(null);

      const response = await fetch("/api/ai/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: selectedTemplate?.titulo || "Documento",
          variables: varInputs,
          style: estiloVisual,
          action: "improve",
          currentText: cuerpoTexto
        })
      });

      const data = await response.json();
      if (data && data.success) {
        setCuerpoTexto(data.text);
        setAiNote("✨ Corrección ortográfica y enriquecimiento formal aplicados con IA.");
      } else {
        alert("No fue posible aplicar correcciones automáticas.");
      }
    } catch (err) {
      console.error("AI Improvement error:", err);
    } finally {
      setIsImprovingAI(false);
    }
  };

  // direct PDF Export
  const handleDownloadPDFLocal = async () => {
    const element = document.getElementById("document-letterhead-print");
    if (!element) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 2.2, // Premium resolution
        useCORS: true,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
      
      const cleanedDocName = selectedTemplate?.titulo || "documento";
      pdf.save(`${cleanedDocName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.pdf`);
    } catch (err) {
      console.error("Error generating paper PDF:", err);
      // fallback print stylesheet trigger
      window.print();
    }
  };

  // Pre-sets visual themes accents color
  const ACCENTS = [
    { name: "Oro Tradicional", code: "#ffc132" },
    { name: "Azul Jurídico", code: "#1e3a8a" },
    { name: "Verde Esmeralda", code: "#0f766e" },
    { name: "Burdeos Ejecutivo", code: "#9f1239" },
    { name: "Gris Estricto", code: "#374151" }
  ];

  return (
    <div className="space-y-6" id="papeleria-primary-container">
      
      {/* 1. SECCIÓN PRINCIPAL: TEMPLATES Y BUSCADOR (When no template is active) */}
      {!selectedTemplate ? (
        <div className="space-y-6">
          
          {/* Hero Papelería Banner */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-white rounded-2xl p-6.5 relative overflow-hidden shadow-sm border border-amber-400/10">
            <div className="relative z-10 max-w-2xl space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#ffc132] font-black bg-[#ffc132]/10 px-2.5 py-1 rounded-full border border-[#ffc132]/20 inline-block">
                ★ Papelería y Documentos Inteligentes
              </span>
              <h2 className="text-2xl font-display font-medium tracking-tight">
                Generador de Papelería, Solicitudes y Correspondencia
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed font-semibold">
                Crea documentos laborales, personales, jurídicos o comerciales de forma guiada. Completa las variables del formulario, optimiza la oratoria con Inteligencia Artificial, elige tu estilo de membrete y descarga en PDF listo para imprimir.
              </p>
            </div>
          </div>

          {/* Quick Access Categories Navigation Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
            <div className="flex flex-wrap gap-1 w-full md:w-auto">
              {(["todos", "laborales", "personales", "juridicos", "empresariales"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setFavoritesOnly(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition capitalize cursor-pointer ${
                    activeTab === tab && !favoritesOnly
                      ? "bg-stone-900 text-amber-400 font-bold"
                      : "text-stone-500 hover:bg-stone-100"
                  }`}
                >
                  {tab === "todos" ? "Todos los Formatos" : tab === "juridicos" ? "Jurídicos & Admin." : tab}
                </button>
              ))}
              <button
                onClick={() => { setFavoritesOnly(true); setActiveTab("todos"); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                  favoritesOnly
                    ? "bg-amber-100 border border-amber-300 text-amber-900 font-bold"
                    : "text-stone-500 hover:bg-stone-100"
                }`}
              >
                <Star size={12} className="text-amber-500 fill-amber-500" /> Favoritos
              </button>
            </div>

            {/* Dynamic Realtime Formats Search bar */}
            <div className="relative w-full md:max-w-xs shrink-0">
              <Search className="absolute left-3 top-2.5 text-stone-400" size={13} />
              <input
                type="text"
                placeholder="Buscar formatos y plantillas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-8.5 pr-4 py-1.5 text-xs outline-none focus:bg-white focus:border-stone-900 transition font-semibold"
              />
            </div>
          </div>

          {/* Dynamic Grid of Available and Certificated Formats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h3 className="text-xs font-mono font-bold tracking-widest text-[#a06809] uppercase flex items-center gap-2">
                <BookOpen size={13} /> Catálogo de Formatos Profesionales ({filteredTemplates.length})
              </h3>
              <span className="text-[10px] text-stone-400 font-bold">Selecciona una plantilla para comenzar a redactar</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => {
                const isFavorite = savedDocs.some(d => d.templateId === template.id && d.favorito);
                return (
                  <div
                    key={template.id}
                    onClick={() => handleOpenCreator(template)}
                    className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs hover:border-stone-900 cursor-pointer transition-all duration-200 group flex flex-col justify-between space-y-4 relative"
                    id={`tmpl-card-${template.id}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 bg-stone-100 text-stone-500 rounded font-bold">
                          {template.categoria === "juridicos" ? "⚖️ Jurídico" : 
                           template.categoria === "laborales" ? "💼 Laboral" : 
                           template.categoria === "personales" ? "👤 Personal" : "🏢 Empresarial"}
                        </span>
                        {template.highlight && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[8px] px-1.5 py-0.5 rounded uppercase font-mono">
                            Destacado
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-bold text-sm text-stone-950 font-display group-hover:text-amber-800 transition">
                        {template.titulo}
                      </h4>
                      <p className="text-xs text-stone-500 leading-relaxed font-medium">
                        {template.descripcion}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] font-semibold text-stone-400 group-hover:text-stone-700 transition">
                      <span className="font-mono text-[9px] text-[#ae771a] uppercase font-bold">
                        ✓ {template.variables.length} Variables guiadas
                      </span>
                      <span className="text-[11px] font-bold text-stone-800">Redactar →</span>
                    </div>
                  </div>
                );
              })}

              {filteredTemplates.length === 0 && (
                <div className="col-span-full bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-400 max-w-md mx-auto">
                  <p className="font-bold text-sm text-stone-800">No se encontraron plantillas administrativas.</p>
                  <p className="text-xs text-stone-400 mt-1">Refina los criterios de categoría o el término de búsqueda ingresado.</p>
                </div>
              )}
            </div>
          </div>

          {/* 1.2 HISTORIAL DE DOCUMENTOS GUARDADOS (Save/History) */}
          {savedDocs.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <h3 className="text-xs font-mono font-bold tracking-widest text-[#a06809] uppercase flex items-center gap-2">
                  <Activity size={13} /> Historial de documentos recientes ({savedDocs.length})
                </h3>
                <span className="text-[10px] text-stone-400 font-semibold">Tus archivos se guardan localmente de forma segura</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedDocs
                  .filter(d => !favoritesOnly || d.favorito)
                  .map(doc => {
                    const template = DOCUMENT_TEMPLATES.find(t => t.id === doc.templateId);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleEditSavedDoc(doc)}
                        className="bg-white p-5 rounded-xl border border-stone-200 shadow-3xs cursor-pointer hover:border-amber-600/80 transition relative flex flex-col justify-between group"
                        id={`saved-doc-${doc.id}`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-semibold uppercase text-stone-400">
                              Modificado: {new Date(doc.fechaCreacion).toLocaleDateString("es-CO")}
                            </span>
                            <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => handleToggleFavorite(doc, e)}
                                className="text-stone-400 hover:text-amber-500 transition cursor-pointer"
                                title="Favorito"
                              >
                                <Star size={14} className={doc.favorito ? "fill-amber-500 text-amber-500" : ""} />
                              </button>
                              <button
                                onClick={(e) => handleDuplicateDoc(doc, e)}
                                className="text-stone-400 hover:text-stone-800 transition cursor-pointer"
                                title="Duplicar Documento"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                onClick={(e) => handleDeleteDoc(doc.id, e)}
                                className="text-stone-400 hover:text-rose-600 transition cursor-pointer"
                                title="Eliminar del historial"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold text-sm text-stone-900 truncate">
                              {doc.titulo}
                            </h4>
                            <p className="text-[11px] text-stone-500 font-mono mt-0.5 font-semibold">
                              Interesado: {doc.nombreSolicitante}
                            </p>
                          </div>
                        </div>

                        {/* Theme details tag info */}
                        <div className="pt-3 border-t border-stone-100 mt-4 flex items-center justify-between text-[10px] text-stone-400">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: doc.colorAcento }} />
                            <span>{doc.estiloVisual}</span>
                          </div>
                          <span className="text-[10px] font-bold text-[#ae771a] group-hover:underline">Editar Documento →</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

        </div>
      ) : (
        
        // 2. FORMULARIO DINÁMICO + VISTA PREVIA ESCRITO EN TIEMPO REAL (CREATOR SCREEN)
        <div className="space-y-4 animate-fade-in">
          
          {/* Header Action bar inside editing mode */}
          <div className="no-print bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => { setSelectedTemplate(null); setAiNote(null); }}
              className="p-1 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft size={13} /> Salir del Asistente
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 font-mono uppercase bg-stone-100 px-2.5 py-1 rounded font-bold">
                🛠️ {selectedTemplate.titulo}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* 2.1 FORM COLUMN PANEL: Dynamic variable options & AI commands (left) */}
            <div className="lg:col-span-5 space-y-6 no-print">
              
              {/* Variable Fill Inputs segment */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-3xs space-y-4">
                <div className="border-b border-stone-100 pb-2">
                  <h3 className="text-xs font-mono font-bold tracking-widest text-[#a06809] uppercase">
                    📁 1. Variables de Contenido
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-0.5 font-semibold">Proporciona los datos del solicitante, empresa y fechas</p>
                </div>

                <div className="space-y-3.5">
                  {selectedTemplate.variables.map(key => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-black text-stone-500 tracking-wider flex items-center justify-between">
                        <span>{varLabels[key] || key}</span>
                        <span className="text-stone-300 font-normal">Requerido</span>
                      </label>
                      
                      {key === "motivo" ? (
                        <textarea
                          rows={3}
                          value={varInputs[key] || ""}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          placeholder="Justificación formal de la renuncia, solicitud o motivo personal..."
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-stone-900 transition font-semibold"
                        />
                      ) : (
                        <input
                          type="text"
                          value={varInputs[key] || ""}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          placeholder={`Escribe ${varLabels[key]?.toLowerCase() || key}...`}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs outline-none focus:bg-white focus:border-stone-900 transition font-semibold"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* AUTOMATION SECTION: IA INTELLIGENT WRITER ACTIONS */}
              <div className="bg-[#FAF9F5] p-5 rounded-xl border border-[#e5d5b8] shadow-3xs space-y-4">
                <div className="border-b border-[#e5d5b8] pb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="text-amber-600 animate-pulse" size={15} />
                    <h3 className="text-xs font-mono font-bold tracking-widest text-amber-900 uppercase">
                      🧠 2. Redacción Automatizada con IA
                    </h3>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 font-semibold">Componer o retocar textos con un solo clic con Gemini</p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={handleGenerateDocumentWithAI}
                    disabled={isGeneratingAI}
                    className="w-full bg-stone-900 hover:bg-stone-850 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingAI ? (
                      <>
                        <RefreshCw size={13} className="animate-spin text-amber-400" />
                        <span>Componiendo carta profesional...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} className="text-amber-400" />
                        <span>Redactar Documento Formal Completado</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleImproveGrammarWithAI}
                    disabled={isImprovingAI || !cuerpoTexto}
                    className="w-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {isImprovingAI ? (
                      <>
                        <RefreshCw size={13} className="animate-spin text-stone-400" />
                        <span>Perfeccionando léxico...</span>
                      </>
                    ) : (
                      <>
                        <Edit size={12} className="text-stone-500" />
                        <span>Ortografía, Gramática y Estilo formal</span>
                      </>
                    )}
                  </button>

                  {aiNote && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] text-[#ae771a] font-mono text-center font-bold"
                    >
                      {aiNote}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* PHYSICAL STYLE PRESET DESIGN OPTIONS */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-3xs space-y-4">
                <div className="border-b border-stone-100 pb-2">
                  <h3 className="text-xs font-mono font-bold tracking-widest text-[#a06809] uppercase">
                    🎨 3. Ajuste de Estilo visual
                  </h3>
                  <p className="text-[11px] text-stone-450 mt-0.5 font-semibold">Diseño formal del membrete y tipografías corporativas</p>
                </div>

                {/* Preset layouts */}
                <div className="space-y-3">
                  <label className="text-[10px] font-mono uppercase font-black text-stone-500 tracking-wider block">
                    Tipo de Plantilla
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Formal", "Corporativo", "Jurídico", "Minimalista"] as const).map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setEstiloVisual(style)}
                        className={`py-2 px-3 text-xs font-bold rounded-lg transition border cursor-pointer ${
                          estiloVisual === style
                            ? "bg-stone-900 border-stone-900 text-white"
                            : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-150"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Accent Color Tone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase font-black text-stone-500 tracking-wider block">
                    Tono Cromático de Resaltado
                  </label>
                  <div className="flex gap-2.5 flex-wrap">
                    {ACCENTS.map(acc => (
                      <button
                        key={acc.code}
                        type="button"
                        onClick={() => setColorAcento(acc.code)}
                        className={`w-5 h-5 rounded-full relative transition ring-offset-2 hover:scale-110 cursor-pointer ${
                          colorAcento === acc.code ? "ring-2 ring-stone-900 scale-105" : ""
                        }`}
                        style={{ backgroundColor: acc.code }}
                        title={acc.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* MANUAL PLAIN TEXT EDITOR IN CASE USER WANTS TO POLISH PARAGRAPHS */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-3xs space-y-3">
                <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                  <label className="text-xs font-mono font-bold tracking-widest text-[#a06809] uppercase block">
                    📝 4. Edición de Texto Manual
                  </label>
                  <span className="text-[9px] text-[#ae771a] font-mono bg-[#FAF9F5] px-1.5 rounded font-bold">Auto-guardado activo</span>
                </div>
                <textarea
                  rows={8}
                  value={cuerpoTexto}
                  onChange={(e) => setCuerpoTexto(e.target.value)}
                  placeholder="Aquí puedes escribir o reeditar libremente el contenido íntegro del documento..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition font-mono leading-relaxed"
                />
              </div>

            </div>

            {/* 2.2 PREVIEW COLUMN PANEL: Real Physical-Looking Premium A4 letterhead page (right) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Document Actions bar download, copy, favorites */}
              <div className="no-print bg-white p-4 rounded-xl border border-stone-200 shadow-3xs flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-500 font-semibold font-mono">
                    ✓ Documento estructurado
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadPDFLocal}
                    className="bg-brand hover:bg-brand-dark text-stone-900 font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition duration-150 cursor-pointer"
                  >
                    <Download size={13} /> Descargar PDF
                  </button>
                  <button
                    onClick={() => { window.print(); }}
                    className="bg-stone-100 hover:bg-stone-250 text-stone-700 border border-stone-205 font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer size={13} /> Imprimir Directo
                  </button>
                </div>
              </div>

              {/* Physical A4 Canvas Document Print sheet container */}
              <div className="bg-stone-300 p-4 md:p-8 rounded-xl border border-stone-200 flex justify-center overflow-x-auto" id="document-preview-print-container">
                
                <div
                  id="document-letterhead-print"
                  className="bg-white text-stone-900 p-12 md:p-16 shadow-2xl relative w-[210mm] min-h-[297mm] flex flex-col justify-between font-sans leading-relaxed selection:bg-amber-100 text-[12.5px] shrink-0"
                  style={{
                    boxSizing: "border-box"
                  }}
                >
                  {/* Decorative style configurations */}
                  <div>
                    {/* Top Accent banner lines depending on styles choice */}
                    {estiloVisual !== "Minimalista" && (
                      <div 
                        className="h-1.5 w-full mb-10 transition-colors duration-300"
                        style={{ backgroundColor: colorAcento }}
                      />
                    )}

                    {/* Header Layout representation */}
                    <div className="flex items-start justify-between mb-12 flex-wrap gap-4">
                      <div className="space-y-1">
                        {estiloVisual === "Corporativo" && (
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold text-white transition-colors duration-300" style={{ backgroundColor: colorAcento }}>
                              🏢
                            </div>
                            <span className="text-[10px] font-mono tracking-wider font-extrabold text-stone-400 uppercase">OFFICIAL DOCUMENT</span>
                          </div>
                        )}
                        {estiloVisual === "Jurídico" && (
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold text-white transition-colors\" style={{ backgroundColor: colorAcento }}>
                              ⚖️
                            </div>
                            <span className="text-[10px] font-mono tracking-widest font-black text-stone-500 uppercase">TRÁMITE JURÍDICO</span>
                          </div>
                        )}
                        <h2 className="text-lg font-display font-extrabold tracking-tight text-stone-900 capitalize uppercase">
                          {varInputs.empresa || "TRÁMITES Y SERVICIOS"}
                        </h2>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-mono font-bold">
                          {selectedTemplate.titulo} • {estiloVisual} Look
                        </p>
                      </div>

                      {/* Right column details */}
                      <div className="text-right text-[11px] font-semibold text-stone-450 font-mono space-y-0.5">
                        <p>Radicado {Math.floor(100000 + Math.random() * 900000)}</p>
                        <p>{varInputs.ciudad || "Bogotá D.C."}</p>
                        <p>{varInputs.fecha || "Mayo, 2026"}</p>
                      </div>
                    </div>

                    {/* Double underline separation lines */}
                    {estiloVisual === "Jurídico" && (
                      <div className="border-t-2 border-b-2 border-stone-850 py-1.5 mb-10 text-center text-[10px] font-mono uppercase font-black tracking-widest">
                        DOCUMENTO OFICIAL DE CONSTANCIA Y EXPOSICIÓN DE MOTIVOS
                      </div>
                    )}

                    {/* Core content block - renders formatted document text */}
                    <div className="whitespace-pre-line text-stone-850 text-justify font-sans leading-relaxed tracking-normal" id="rendered-document-content" style={{ minHeight: "150mm" }}>
                      {cuerpoTexto}
                    </div>

                  </div>

                  {/* Document Footer, Signatures and Credentials */}
                  <div className="mt-12 pt-8 border-t border-stone-100 flex items-end justify-between flex-wrap gap-4 text-[10px] text-stone-400 font-semibold font-mono">
                    <div>
                      <p>Trámites y Servicios - Papelería Inteligente</p>
                      <p className="text-[9px] text-[#ae771a] uppercase">Sello de verificación digital • Libre de cargo</p>
                    </div>
                    <div className="text-right">
                      <p>A4 Impresión Certificada</p>
                      <p>Colombia</p>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
