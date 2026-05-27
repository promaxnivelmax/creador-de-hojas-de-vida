import React, { useState } from "react";
import { Resume } from "../types";
import { getInitialsAvatar } from "../utils";
import { 
  FilePlus, Search, Globe, Trash2, Edit2, 
  Eye, Calendar, CheckSquare, Layers, Database, 
  Briefcase, MapPin, Sparkles, CheckCircle2, User, Phone, Mail, Award, GraduationCap, Download
} from "lucide-react";

interface DashboardProps {
  resumes: Resume[];
  selectedPreviewId: string | null;
  onSelectPreviewId: (id: string) => void;
  onAddNewResume: () => void;
  onEditResume: (resume: Resume) => void;
  onViewResume: (resume: Resume) => void;
  onDeleteResume: (id: string) => void;
}

export default function Dashboard({ 
  resumes, 
  selectedPreviewId, 
  onSelectPreviewId, 
  onAddNewResume, 
  onEditResume, 
  onViewResume, 
  onDeleteResume 
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filters the resume array on active typing
  const filteredResumes = resumes.filter(
    r =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.position && r.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.ciudad && r.ciudad.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Reciente";
    return date.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
  };

  const handleCopyLink = (slug: string) => {
    const currentUrl = window.location.origin + window.location.pathname;
    const shareableUrl = `${currentUrl}?cv=${slug}`;
    navigator.clipboard.writeText(shareableUrl);
    alert(`¡Enlace copiado al portapapeles!\n${shareableUrl}`);
  };

  // Locate the currently selected preview resume
  const selectedPreviewResume = resumes.find(r => r.id === selectedPreviewId) || resumes[0];

  return (
    <div className="space-y-6" id="dashboard-workspace-inner">
      {/* Primary Layout splits: Left side Table lists, Right side Live scaled Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Table list main section */}
        <div className="xl:col-span-8 space-y-4">
          {/* Action Filters Panel bar */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between" id="dashboard-controls">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-3 text-stone-400" size={14} />
              <input
                id="search-resumes-input"
                type="text"
                placeholder="Filtrar por nombre, cargo o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8.5 pr-4 py-2 text-xs outline-none focus:bg-white focus:ring-4 focus:ring-brand/10 focus:border-brand transition"
              />
            </div>

            <button
              onClick={onAddNewResume}
              id="btn-create-new-cv"
              className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-stone-900 font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <FilePlus size={14} className="text-stone-900" /> Nueva Hoja de Vida
            </button>
          </div>

          {/* Resumes dynamic table - Desktop view */}
          <div className="hidden sm:block bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden" id="dashboard-table-container">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="resumes-table">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-mono text-stone-500 uppercase tracking-widest text-[9px]">
                    <th className="py-4 px-6 font-bold text-stone-600">Detalles Personales</th>
                    <th className="py-4 px-6 font-bold text-stone-600">Cargo / Profesión</th>
                    <th className="py-4 px-6 font-bold text-stone-600">Ciudad</th>
                    <th className="py-4 px-6 font-bold text-stone-600">Fecha Registro</th>
                    <th className="py-4 px-6 text-right font-bold pr-6 text-stone-600">Operaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                  {filteredResumes.length > 0 ? (
                    filteredResumes.map((resume) => {
                      const isSelected = selectedPreviewResume?.id === resume.id;
                      return (
                        <tr 
                          key={resume.id} 
                          onClick={() => onSelectPreviewId(resume.id)}
                          className={`hover:bg-stone-50/50 cursor-pointer transition-all duration-150 ${
                            isSelected ? "bg-brand/5 border-l-4 border-brand pl-5 font-semibold" : "pl-6"
                          }`}
                          id={`resume-row-${resume.id}`}
                        >
                          {/* Photo & Name */}
                          <td className="py-4.5 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={resume.photo_url || getInitialsAvatar(resume.name)}
                                alt={resume.name}
                                referrerPolicy="no-referrer"
                                className="w-9 h-9 rounded-full object-cover border border-stone-200 bg-stone-50 shadow-xs shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = getInitialsAvatar(resume.name);
                                }}
                              />
                              <div>
                                <h4 className="font-semibold text-stone-900 leading-snug">{resume.name}</h4>
                                <p className="text-[10px] text-stone-400 font-mono">CC: {resume.identificacion || "N/A"}</p>
                              </div>
                            </div>
                          </td>

                          {/* Position Role */}
                          <td className="py-4.5 px-6">
                            <span className="font-mono bg-stone-100 text-stone-800 px-2 py-0.5 rounded text-[10px] uppercase font-semibold">
                              {resume.position || "Profesional"}
                            </span>
                          </td>

                          {/* City */}
                          <td className="py-4.5 px-6 text-stone-600">
                            <div className="flex items-center gap-1">
                              <MapPin size={11} className="text-stone-400 shrink-0" />
                              <span>{resume.ciudad || "No especificada"}</span>
                            </div>
                          </td>

                          {/* Creation Date */}
                          <td className="py-4.5 px-6 text-stone-400 font-mono text-[11px]">
                            {formatDate(resume.created_at)}
                          </td>

                          {/* Actions trigger */}
                          <td className="py-4.5 px-6 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5" id={`actions-for-${resume.id}`}>
                              <button
                                onClick={() => handleCopyLink(resume.slug)}
                                className="p-1.5 hover:bg-stone-100 border border-stone-200 text-stone-500 rounded-lg transition"
                                title="Copiar Enlace Público"
                                id={`btn-copy-link-${resume.id}`}
                              >
                                <Globe size={13} />
                              </button>
                              <button
                                onClick={() => onEditResume(resume)}
                                className="p-1.5 hover:bg-brand/10 border border-brand/20 text-stone-800 rounded-lg transition"
                                title="Editar Hoja de Vida"
                                id={`btn-edit-${resume.id}`}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => onDeleteResume(resume.id)}
                                className="p-1.5 hover:bg-rose-50 border border-rose-100 text-rose-600 rounded-lg transition"
                                title="Eliminar Registro"
                                id={`btn-delete-${resume.id}`}
                              >
                                <Trash2 size={13} />
                              </button>

                              <button
                                onClick={() => onViewResume(resume)}
                                className="ml-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg flex items-center gap-1 transition text-[11px] cursor-pointer"
                                id={`btn-view-resume-${resume.id}`}
                              >
                                <Eye size={11} /> Ver
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-stone-400">
                        <p className="font-semibold text-sm">No se encontraron hojas de vida registradas.</p>
                        <p className="text-xs text-stone-400 mt-1">Refina el término de búsqueda o registra una nueva hoja de vida.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumes dynamic cards - Mobile responsive list */}
          <div className="sm:hidden space-y-3" id="resumes-mobile-list">
            {filteredResumes.length > 0 ? (
              filteredResumes.map((resume) => {
                const isSelected = selectedPreviewResume?.id === resume.id;
                return (
                  <div
                    key={resume.id}
                    onClick={() => onSelectPreviewId(resume.id)}
                    className={`p-4 rounded-xl border transition-all duration-150 relative cursor-pointer ${
                      isSelected 
                        ? "bg-brand/5 border-brand ring-1 ring-brand font-semibold" 
                        : "bg-white border-stone-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={resume.photo_url || getInitialsAvatar(resume.name)}
                        alt={resume.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-stone-200 bg-stone-50 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getInitialsAvatar(resume.name);
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-stone-900 leading-snug truncate">{resume.name}</h4>
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5">CC: {resume.identificacion || "N/A"}</p>
                        
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="font-mono bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold">
                            {resume.position || "Profesional"}
                          </span>
                          {resume.ciudad && (
                            <span className="text-[9px] text-stone-500 bg-stone-50 border border-stone-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <MapPin size={9} /> {resume.ciudad}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-stone-100 mt-3 pt-3 gap-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleCopyLink(resume.slug)}
                          className="p-1.5 hover:bg-stone-50 border border-stone-200 text-stone-500 rounded-lg transition"
                          title="Copiar Enlace Público"
                        >
                          <Globe size={13} />
                        </button>
                        <button
                          onClick={() => onEditResume(resume)}
                          className="p-1.5 hover:bg-brand/10 border border-brand/20 text-stone-800 rounded-lg transition"
                          title="Editar Hoja de Vida"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteResume(resume.id)}
                          className="p-1.5 hover:bg-rose-50 border border-rose-100 text-rose-600 rounded-lg transition"
                          title="Eliminar Registro"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => onViewResume(resume)}
                        className="bg-stone-900 hover:bg-stone-800 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition text-[11px]"
                      >
                        <Eye size={11} /> Ver CV
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-400">
                <p className="font-semibold text-sm">No se encontraron hojas de vida registradas.</p>
                <p className="text-xs text-stone-400 mt-1">Refina el término de búsqueda o registra una nueva hoja de vida.</p>
              </div>
            )}
          </div>
        </div>

        {/* Scaled Preview Device column */}
        <div className="xl:col-span-4" id="cv-preview-widget-column">
          {selectedPreviewResume ? (
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden flex flex-col animate-fade-in" id="live-cv-preview-card">
              {/* Browser control mock header bar */}
              <div className="bg-stone-100 border-b border-stone-200 px-4 py-2.5 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                </div>
                <div className="bg-white border border-stone-200 rounded-md px-3 py-0.5 text-[9px] font-mono text-stone-400 select-all truncate max-w-[150px] flex-1 text-center">
                  /{selectedPreviewResume.slug}
                </div>
                <div className="w-10"></div>
              </div>

              {/* Scaled document scroll body */}
              <div className="p-5 space-y-5 max-h-[500px] overflow-y-auto bg-stone-50/40">
                {/* Meta details banner */}
                <div className="flex items-center gap-4 border-b border-stone-100 pb-4">
                  <img
                    src={selectedPreviewResume.photo_url || getInitialsAvatar(selectedPreviewResume.name)}
                    alt={selectedPreviewResume.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-stone-100 shadow-xs shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-stone-800 truncate">{selectedPreviewResume.name}</h4>
                    <p className="text-[10px] text-brand-dark font-bold font-mono uppercase tracking-wider">{selectedPreviewResume.position || "Profesional"}</p>
                    <p className="text-[9px] text-stone-400 flex items-center gap-0.5 mt-0.5 font-medium">
                      <MapPin size={9} /> {selectedPreviewResume.ciudad || "No especificada"}
                    </p>
                  </div>
                </div>

                {/* Contacts summary */}
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-stone-50 p-2.5 rounded-lg border border-stone-200/50">
                  <div className="truncate text-stone-600">
                    <span className="font-bold text-stone-700">Celular:</span> {selectedPreviewResume.celular || "N/A"}
                  </div>
                  <div className="truncate text-stone-600">
                    <span className="font-bold text-stone-700">Identificación:</span> CC {selectedPreviewResume.identificacion || "N/A"}
                  </div>
                </div>

                {/* Profile Narrative Summary block */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-stone-400">Resumen Ejecutivo</span>
                  <p className="text-[11px] text-stone-600 leading-normal text-justify line-clamp-3">
                    {selectedPreviewResume.summary || "Profesional responsable e idóneo con competencias consolidadas en proyectos y servicios."}
                  </p>
                </div>

                {/* Milestones matrix preview */}
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-stone-400 block pb-0.5 border-b border-stone-100 font-bold">Experiencia Laboral</span>
                  {selectedPreviewResume.experiences && selectedPreviewResume.experiences.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPreviewResume.experiences.slice(0, 2).map((exp, idx) => (
                        <div key={exp.id || idx} className="text-[11px]">
                          <div className="flex justify-between font-bold text-stone-700">
                            <span className="truncate">{exp.role}</span>
                            <span className="text-[9px] text-stone-400 font-mono font-normal shrink-0">{exp.start_date || "N/A"} - {exp.current ? "Pres." : exp.end_date || "N/A"}</span>
                          </div>
                          <p className="text-[10px] text-stone-500">{exp.company} - {exp.ciudad || "N/A"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-stone-400 italic">Sin experiencia agregada</p>
                  )}
                </div>

                {/* Skills tags list badge */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-stone-400 block pb-0.5 border-b border-stone-100 font-bold">Habilidades y Destrezas</span>
                  {selectedPreviewResume.skills && selectedPreviewResume.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedPreviewResume.skills.slice(0, 5).map((skill, idx) => (
                        <span key={skill.id || idx} className="bg-brand/10 text-stone-800 border border-brand/20 font-bold px-1.5 py-0.5 rounded text-[9px]">
                          {skill.name} ({skill.level}%)
                        </span>
                      ))}
                      {selectedPreviewResume.skills.length > 5 && (
                        <span className="bg-stone-100 text-stone-500 font-medium px-1.5 py-0.5 rounded text-[9px]">
                          +{selectedPreviewResume.skills.length - 5} más
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-stone-400 italic font-mono">Sin habilidades configuradas</p>
                  )}
                </div>
              </div>

              {/* Live Preview interactive buttons footer */}
              <div className="p-4 bg-stone-50 border-t border-stone-200 mt-auto flex items-center justify-between gap-2.5">
                <button
                  onClick={() => onViewResume(selectedPreviewResume)}
                  className="flex-1 bg-brand hover:bg-brand-dark text-stone-900 font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Eye size={12} /> Abrir Hoja de Vida
                </button>
                <button
                  onClick={() => onEditResume(selectedPreviewResume)}
                  className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Edit2 size={12} className="text-stone-500" /> Modificar
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 rounded-xl border-2 border-dashed border-stone-200 p-8 text-center text-stone-400 space-y-1">
              <User size={24} className="mx-auto text-stone-300" />
              <p className="font-semibold text-xs mt-2 text-stone-700">Sin vista previa disponible</p>
              <p className="text-[10px] leading-relaxed text-stone-400">Selecciona o registra una nueva hoja de vida para visualizar los datos inmediatamente aquí.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
