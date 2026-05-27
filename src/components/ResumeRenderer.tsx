import React, { useState } from "react";
import { Resume } from "../types";
import { exportToWord, getInitialsAvatar } from "../utils";
import { 
  Mail, Phone, Globe, MapPin, Briefcase, 
  GraduationCap, Download, Printer, ArrowLeft, 
  Milestone, Award, Palette, ExternalLink, Sparkles, User, FileText
} from "lucide-react";

interface ResumeRendererProps {
  resume: Resume;
  onBackToDashboard?: () => void;
  onEdit?: () => void;
}

export default function ResumeRenderer({ resume, onBackToDashboard, onEdit }: ResumeRendererProps) {
  // Color palette presets including designated ones for women and classic professional looks
  const THEME_ACCENTS = [
    { name: "Oro Cálido Premium", color: "#ffc132", text: "text-amber-600", bg: "bg-amber-400", border: "border-amber-400", badgeText: "text-stone-900 font-bold" },
    { name: "Rosa Orquídea / Pastel Elegante", color: "#ec4899", text: "text-pink-600", bg: "bg-pink-500", border: "border-pink-500", badgeText: "text-white" },
    { name: "Lavanda Suave / Violeta", color: "#8b5cf6", text: "text-violet-600", bg: "bg-violet-500", border: "border-violet-500", badgeText: "text-white" },
    { name: "Sándalo Coral / Energía", color: "#f97316", text: "text-orange-600", bg: "bg-orange-500", border: "border-orange-500", badgeText: "text-white" },
    { name: "Teal Clásico W3", color: "#009688", text: "text-[#009688]", bg: "bg-[#009688]", border: "border-[#009688]", badgeText: "text-white" },
    { name: "Azul Cobalto Corp", color: "#2563eb", text: "text-blue-600", bg: "bg-blue-600", border: "border-blue-600", badgeText: "text-white" },
    { name: "Gris Carbón Clásico", color: "#475569", text: "text-slate-700", bg: "bg-slate-600", border: "border-slate-600", badgeText: "text-white" }
  ];

  const [activeThemeIdx, setActiveThemeIdx] = useState(0);
  const [activeTemplate, setActiveTemplate] = useState<"column" | "centered">("column");
  
  const activeColor = THEME_ACCENTS[activeThemeIdx];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDocx = () => {
    exportToWord(resume);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-1 py-1" id="resume-renderer-outer">
      {/* Sub-Header Toolbar - Hidden in standard print stream */}
      <div className="no-print bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between" id="renderer-toolbar">
        <div className="flex flex-wrap items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              id="toolbar-back-btn"
              className="p-2 hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft size={13} /> Panel de Control
            </button>
          )}

          {onEdit && (
            <button
              onClick={onEdit}
              id="toolbar-edit-btn"
              className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            >
              Modificar Información 📝
            </button>
          )}

          {/* Template design selector */}
          <div className="flex border border-stone-200 rounded-lg overflow-hidden text-xs bg-stone-100 shrink-0">
            <button
              onClick={() => setActiveTemplate("column")}
              className={`px-3 py-2 font-bold cursor-pointer transition ${
                activeTemplate === "column" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-205 bg-white"
              }`}
            >
              Diseño Columnas Clásico
            </button>
            <button
              onClick={() => setActiveTemplate("centered")}
              className={`px-3 py-2 font-bold cursor-pointer transition ${
                activeTemplate === "centered" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-205 bg-white"
              }`}
            >
              Diseño Centrado Moderno
            </button>
          </div>
        </div>

        {/* Dynamic Color Palette & Exports selectors */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-1.5 pr-2">
            <Palette size={13} className="text-stone-400 shrink-0" />
            <span className="text-[11px] font-semibold text-stone-605 mr-1 hidden sm:inline-block">Paleta de Tonos:</span>
            <div className="flex items-center gap-1">
              {THEME_ACCENTS.map((preset, idx) => (
                <button
                  key={idx}
                  title={preset.name}
                  onClick={() => setActiveThemeIdx(idx)}
                  className={`w-5 h-5 rounded-full border border-stone-300 transition-all cursor-pointer ${
                    idx === activeThemeIdx ? "ring-2 ring-offset-2 ring-stone-900 scale-110" : "opacity-80 hover:scale-110"
                  }`}
                  style={{ backgroundColor: preset.color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDocx}
              id="btn-export-word"
              className="p-2 py-1.5 bg-amber-50 shadow-xs border border-amber-200 hover:bg-amber-100 text-amber-900 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download size={13} /> Exportar Word (.doc)
            </button>

            <button
              onClick={handlePrint}
              id="btn-export-pdf"
              className="p-2 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer size={13} className="text-amber-400" /> Imprimir / Guardar PDF (A4)
            </button>
          </div>
        </div>
      </div>

      {/* STYLE-SHEET CONTAINER FOR BOTH TEMPLATE OUTCOMES */}
      <div 
        className="bg-white print-card-shadow shadow-xl rounded-2xl overflow-hidden border border-stone-200" 
        id="cv-printable-sheet"
      >
        {activeTemplate === "column" ? (
          /* TEMPLATE 1: SLIT COLUMN LAYOUT (W3 CSS-inspired classic) */
          <div className="flex flex-col md:flex-row print-row min-h-0 md:min-h-[1100px]" id="column-template-frame">
            
            {/* Left Column Section */}
            <div className="w-full md:w-[35%] bg-stone-50/70 border-r border-stone-200/60 p-5 md:p-8 flex flex-col gap-6 md:gap-8 print-col-3" id="cv-sidebar-left">
              {/* Profile Image card inside sidebar */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <img 
                    src={resume.photo_url || getInitialsAvatar(resume.name)} 
                    alt={resume.name} 
                    referrerPolicy="no-referrer"
                    className="w-36 h-36 rounded-2xl object-cover shadow-sm border-3 border-white ring-4 ring-stone-100" 
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 bg-amber-400 text-stone-950 rounded-full p-1.5 shadow-xs text-[10px] hidden no-print md:flex items-center gap-0.5 font-bold">
                    <Sparkles size={10} /> Oficial
                  </span>
                </div>
                
                <div className="mt-1 text-center">
                  <h2 className="text-xl font-display font-bold text-stone-900 tracking-tight leading-snug">
                    {resume.name}
                  </h2>
                  <p className="text-xs font-mono font-bold text-stone-500 uppercase mt-1">
                    {resume.position || "Hoja de Vida"}
                  </p>
                </div>
              </div>

              {/* Personal details info section */}
              <div className="space-y-4 print-avoid-break">
                <h3 className={`text-[10px] uppercase font-mono font-black tracking-widest pb-1 border-b border-stone-300 ${activeColor.text}`}>
                  DATOS PERSONALES
                </h3>
                <div className="space-y-3 text-xs text-stone-605">
                  <div>
                    <p className="text-[9px] font-mono text-stone-400 uppercase font-black">Nombres y Apellidos</p>
                    <p className="font-bold text-stone-900 text-xs">
                      {resume.nombres || resume.name} {resume.apellidos || ""}
                    </p>
                  </div>
                  
                  {resume.identificacion && (
                    <div>
                      <p className="text-[9px] font-mono text-stone-400 uppercase font-black">Identificación</p>
                      <p className="font-bold text-stone-900 text-xs text-stone-850">
                        C.C. {resume.identificacion} {resume.lugar_expedicion && `expedida en ${resume.lugar_expedicion}`}
                      </p>
                    </div>
                  )}

                  {resume.fecha_nacimiento && (
                    <div>
                      <p className="text-[9px] font-mono text-stone-400 uppercase font-black">Fecha de Nacimiento</p>
                      <p className="font-bold text-stone-900 text-xs">{resume.fecha_nacimiento}</p>
                    </div>
                  )}

                  {resume.estado_civil && (
                    <div>
                      <p className="text-[9px] font-mono text-stone-400 uppercase font-black">Estado Civil</p>
                      <p className="font-bold text-stone-900 text-xs">{resume.estado_civil}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-[9px] font-mono text-stone-400 uppercase font-black">Contacto Telefónico</p>
                    <p className="font-bold text-stone-900 text-xs flex items-center gap-1">
                      <Phone size={11} className="text-stone-400" /> {resume.celular || resume.phone || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] font-mono text-stone-400 uppercase font-black">Correo Electrónico</p>
                    <p className="font-bold text-stone-900 text-xs flex items-center gap-1 break-all select-all">
                      <Mail size={11} className="text-stone-400" /> {resume.correo || resume.email || "N/A"}
                    </p>
                  </div>

                  {(resume.direccion || resume.barrio || resume.ciudad) && (
                    <div>
                      <p className="text-[9px] font-mono text-stone-400 uppercase font-black">Ubicación Residencial</p>
                      <p className="font-bold text-stone-900 text-xs flex items-start gap-1 leading-normal">
                        <MapPin size={11} className="text-stone-400 mt-0.5 shrink-0" />
                        <span>
                          {resume.direccion || "N/A"}
                          {resume.barrio && `, Barrio ${resume.barrio}`}
                          {resume.ciudad && ` (${resume.ciudad})`}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills rating charts */}
              {resume.skills && resume.skills.length > 0 && (
                <div className="space-y-4 print-avoid-break">
                  <h3 className={`text-[10px] uppercase font-mono font-black tracking-widest pb-1 border-b border-stone-300 ${activeColor.text}`}>
                    HABILIDADES Y DESTREZAS
                  </h3>
                  <div className="space-y-2.5">
                    {resume.skills.map((skill) => (
                      <div key={skill.id} className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-semibold text-stone-750">
                          <span>{skill.name}</span>
                          <span className="font-mono text-[9px] text-stone-400 font-normal">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-stone-200 h-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${activeColor.bg}`}
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References Cards */}
              {resume.references && resume.references.length > 0 && (
                <div className="space-y-4 print-avoid-break mt-auto pt-4">
                  <h3 className={`text-[10px] uppercase font-mono font-black tracking-widest pb-1 border-b border-stone-300 ${activeColor.text}`}>
                    REFERENCIAS PERSONALES
                  </h3>
                  <div className="space-y-3">
                    {resume.references.map((ref) => (
                      <div key={ref.id} className="bg-white p-3 rounded-lg border border-stone-200 text-xs space-y-0.5">
                        <p className="font-bold text-stone-905">{ref.name}</p>
                        {ref.role && <p className="text-[9px] text-stone-500 font-semibold uppercase">{ref.role}</p>}
                        <p className="text-[10px] font-mono text-stone-800 flex items-center gap-1 font-bold">
                          <Phone size={10} className="text-stone-400" /> {ref.phone || "N/A"}
                        </p>
                        {ref.ciudad && (
                          <p className="text-[9px] text-stone-400 flex items-center gap-0.5">
                            <MapPin size={9} /> {ref.ciudad}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column Section */}
            <div className="flex-1 p-5 md:p-10 flex flex-col gap-6 md:gap-7 print-col-9" id="cv-main-body-right">
              
              {/* Profile narrative */}
              <div className="space-y-2.5 print-avoid-break">
                <div className="flex items-center gap-2 border-b border-stone-150 pb-1.5">
                  <span className={`p-1 bg-stone-900 rounded-md ${activeColor.text}`}>
                    <FileText size={13} className="text-white" />
                  </span>
                  <h2 className="text-xs font-display font-black uppercase tracking-wider text-stone-800">
                    PERFIL PROFESIONAL
                  </h2>
                </div>
                <p className="text-xs text-stone-705 leading-relaxed text-justify whitespace-pre-line bg-stone-50/50 p-4 border border-stone-100 rounded-xl">
                  {resume.summary || "Profesional responsable, capacitado e idóneo para desempeñar sus labores con honestidad."}
                </p>
              </div>

              {/* Work Experience timelines */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-150 pb-1.5 no-print">
                  <span className={`p-1 bg-stone-900 rounded-md ${activeColor.text}`}>
                    <Briefcase size={13} className="text-white" />
                  </span>
                  <h2 className="text-xs font-display font-black uppercase tracking-wider text-stone-800">
                    EXPERIENCIA LABORAL
                  </h2>
                </div>

                <div className="hidden print:flex items-center gap-2 border-b border-stone-150 pb-1.5">
                  <h2 className="text-xs font-display font-black uppercase tracking-wider text-stone-800">
                    EXPERIENCIA LABORAL
                  </h2>
                </div>

                {resume.experiences && resume.experiences.length > 0 ? (
                  <div className="relative border-l border-stone-200 pl-4 ml-1.5 space-y-5">
                    {resume.experiences.map((exp) => (
                      <div key={exp.id || exp.company} className="relative group print-avoid-break">
                        {/* Bullet inside timeline */}
                        <span className="absolute -left-[20.5px] top-1 w-3 h-3 bg-white border border-stone-300 rounded-full flex items-center justify-center">
                          <span className={`w-1.5 h-1.5 rounded-full ${activeColor.bg}`} />
                        </span>

                        <div className="space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-stone-900">
                              {exp.role} <span className="text-stone-400 font-normal">|</span> <span className="text-stone-600 font-semibold">{exp.company}</span>
                            </h4>
                            <span className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full ${activeColor.bg} ${activeColor.badgeText} shrink-0 self-start sm:self-center`}>
                              {exp.start_date || "Inicio"} - {exp.current ? "Actual" : (exp.end_date || "Fin")}
                            </span>
                          </div>
                          
                          {exp.ciudad && (
                            <p className="text-[9px] text-stone-400 font-medium flex items-center gap-0.5">
                              <MapPin size={9} /> {exp.ciudad}
                            </p>
                          )}

                          {exp.description && (
                            <p className="text-[11px] text-stone-605 whitespace-pre-line leading-relaxed pt-1 select-all">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic font-mono pl-2">No registra experiencias laborales previas.</p>
                )}
              </div>

              {/* Education and courses */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-150 pb-1.5 no-print">
                  <span className={`p-1 bg-stone-900 rounded-md ${activeColor.text}`}>
                    <GraduationCap size={13} className="text-white" />
                  </span>
                  <h2 className="text-xs font-display font-black uppercase tracking-wider text-stone-800">
                    ESTUDIOS REALIZADOS
                  </h2>
                </div>

                <div className="hidden print:flex items-center gap-2 border-b border-stone-150 pb-1.5">
                  <h2 className="text-xs font-display font-black uppercase tracking-wider text-stone-800">
                    ESTUDIOS REALIZADOS
                  </h2>
                </div>

                {resume.education && resume.education.length > 0 ? (
                  <div className="relative border-l border-stone-200 pl-4 ml-1.5 space-y-5">
                    {resume.education.map((edu) => (
                      <div key={edu.id || edu.school} className="relative group print-avoid-break">
                        <span className="absolute -left-[20.5px] top-1 w-3 h-3 bg-white border border-stone-300 rounded-full flex items-center justify-center">
                          <span className={`w-1.5 h-1.5 rounded-full ${activeColor.bg}`} />
                        </span>

                        <div className="space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-stone-900">
                              {edu.degree}
                            </h4>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 shrink-0 self-start sm:self-center`}>
                              {edu.start_date || "Fecha"}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 font-semibold">{edu.school}</p>
                          
                          {edu.ciudad && (
                            <p className="text-[9px] text-stone-400 font-medium flex items-center gap-0.5">
                              <MapPin size={9} /> {edu.ciudad}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic font-mono pl-2">No registra estudios académicos adicionales.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* TEMPLATE 2: CENTRAL HORIZONTAL LAYOUT (Perfect compact single column flow) */
          <div className="p-6 md:p-10 space-y-8" id="centered-template-frame">
            
            {/* Header: Centered Avatar block */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 border-b border-stone-200 pb-6">
              <div className="relative">
                <img 
                  src={resume.photo_url || getInitialsAvatar(resume.name)} 
                  alt={resume.name} 
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 rounded-full object-cover border-4 border-stone-100 shadow-sm" 
                />
              </div>

              <div className="space-y-1 max-w-xl mx-auto">
                <span className="text-[9px] font-mono font-black tracking-widest text-stone-400 uppercase">HOJA DE VIDA INDIVIDUAL</span>
                <h1 className="text-3xl font-display font-black text-stone-900 tracking-tight leading-none uppercase">
                  {resume.name}
                </h1>
                <p className={`text-xs font-mono font-bold uppercase tracking-wider ${activeColor.text}`}>
                  {resume.position || "Hoja de Vida"}
                </p>
              </div>

              {/* Centered Horizontal detail tokens */}
              <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs text-stone-605 max-w-2xl font-semibold bg-stone-50 p-3 rounded-xl border border-stone-200/50">
                {resume.identificacion && (
                  <span><strong>C.C:</strong> {resume.identificacion} {resume.lugar_expedicion && ` expedida en: ${resume.lugar_expedicion}`}</span>
                )}
                {resume.celular && (
                  <span className="flex items-center gap-1"><Phone size={11} className="text-stone-400" /> {resume.celular}</span>
                )}
                {resume.correo && (
                  <span className="flex items-center gap-1 select-all"><Mail size={11} className="text-stone-400" /> {resume.correo}</span>
                )}
                {resume.ciudad && (
                  <span className="flex items-center gap-1"><MapPin size={11} className="text-stone-400" /> {resume.ciudad}</span>
                )}
              </div>
            </div>

            {/* Profile narrative */}
            <div className="space-y-2 print-avoid-break">
              <h3 className={`text-[11px] font-mono uppercase font-black tracking-widest border-l-3 pl-2.5 ${activeColor.border} text-stone-850`}>
                Perfil Profesional
              </h3>
              <p className="text-xs text-stone-701 text-justify leading-relaxed whitespace-pre-line bg-stone-50/20 p-4 border border-stone-100 rounded-xl">
                {resume.summary || "Profesional proactivo con alta responsabilidad y puntualidad para cumplir asignaciones laborales de cualquier nivel."}
              </p>
            </div>

            {/* Timelines row: grid on desktop, single in printing */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Experiencia Laboral en Centrado */}
              <div className="space-y-4">
                <h3 className={`text-[11px] font-mono uppercase font-black tracking-widest border-l-3 pl-2.5 ${activeColor.border} text-stone-850`}>
                  Experiencia Laboral
                </h3>
                {resume.experiences && resume.experiences.length > 0 ? (
                  <div className="space-y-4">
                    {resume.experiences.map((exp) => (
                      <div key={exp.id || exp.company} className="border-b border-stone-100 pb-3 last:border-0 print-avoid-break">
                        <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                          <span>{exp.role} <span className="text-stone-400 font-normal">@</span> {exp.company}</span>
                          <span className={`text-[9px] font-mono bg-stone-100 text-stone-705 px-2 py-0.5 rounded-md`}>
                            {exp.start_date} - {exp.current ? "Actual" : exp.end_date}
                          </span>
                        </div>
                        {exp.ciudad && (
                          <span className="text-[9px] text-stone-400 font-mono flex items-center gap-0.5 mt-0.5">
                            <MapPin size={9} /> {exp.ciudad}
                          </span>
                        )}
                        {exp.description && (
                          <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed text-justify">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">No registra experiencias previas.</p>
                )}
              </div>

              {/* Estudios Realizados en Centrado */}
              <div className="space-y-4">
                <h3 className={`text-[11px] font-mono uppercase font-black tracking-widest border-l-3 pl-2.5 ${activeColor.border} text-stone-850`}>
                  Estudios Realizados
                </h3>
                {resume.education && resume.education.length > 0 ? (
                  <div className="space-y-4">
                    {resume.education.map((edu) => (
                      <div key={edu.id || edu.school} className="border-b border-stone-100 pb-3 last:border-0 print-avoid-break">
                        <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                          <span>{edu.degree}</span>
                          <span className="text-[9px] font-mono bg-stone-100 text-stone-605 px-2 py-0.5 rounded-md">
                            {edu.start_date}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">{edu.school}</p>
                        {edu.ciudad && (
                          <span className="text-[9px] text-stone-400 font-mono flex items-center gap-0.5 mt-0.5">
                            <MapPin size={9} /> {edu.ciudad}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">No registra estudios adicionales.</p>
                )}
              </div>
            </div>

            {/* Bottom elements: Skills and references side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-stone-100">
              {/* Skills rating */}
              {resume.skills && resume.skills.length > 0 && (
                <div className="space-y-4 print-avoid-break">
                  <h3 className={`text-[11px] font-mono uppercase font-black tracking-widest border-l-3 pl-2.5 ${activeColor.border} text-stone-850`}>
                    Habilidades y Destrezas
                  </h3>
                  <div className="grid grid-cols-2 gap-3.5">
                    {resume.skills.map((skill) => (
                      <div key={skill.id} className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-semibold text-stone-700">
                          <span className="truncate">{skill.name}</span>
                          <span className="text-[9px] text-stone-400 font-mono font-normal">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${activeColor.bg}`}
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References Row */}
              {resume.references && resume.references.length > 0 && (
                <div className="space-y-4 print-avoid-break">
                  <h3 className={`text-[11px] font-mono uppercase font-black tracking-widest border-l-3 pl-2.5 ${activeColor.border} text-stone-850`}>
                    Referencias Personales
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {resume.references.map((ref) => (
                      <div key={ref.id} className="bg-stone-50/50 p-3 rounded-lg border border-stone-200 text-xs">
                        <p className="font-bold text-stone-900">{ref.name}</p>
                        {ref.role && <p className="text-[9px] text-stone-400 font-semibold uppercase">{ref.role}</p>}
                        <span className="text-[10px] font-mono text-stone-800 font-bold block mt-1 flex items-center gap-1 bg-white p-1 rounded border border-stone-150">
                          <Phone size={10} className="text-stone-400" /> {ref.phone}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
