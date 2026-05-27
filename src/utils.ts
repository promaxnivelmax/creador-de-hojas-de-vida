import { Resume } from "./types";

/**
 * Converts a file to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Fallback avatar generator
 */
export function getInitialsAvatar(name: string): string {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return `https://placehold.co/150x150/009688/ffffff?text=${initials}`;
}

/**
 * Handles exporting a Resume object to a formatted Word document (MIME application/msword)
 * This generates standard Word-HTML format which MS Word opening perfectly preserving the layout, fonts & structures.
 */
export function exportToWord(resume: Resume) {
  const experiencesHtml = resume.experiences
    .map(
      (exp) => `
    <div style="margin-bottom: 15px; border-bottom: 1px solid #e7e5e4; padding-bottom: 10px;">
      <h4 style="margin: 0; color: #1c1917; font-size: 14px; font-weight: bold;">${exp.role} / <span style="color: #78716c;">${exp.company}</span></h4>
      <p style="margin: 3px 0; color: #854d0e; font-size: 11px; font-weight: bold;">
        ${exp.start_date || ""} - ${exp.current ? "Actual" : exp.end_date || ""} | ${exp.ciudad || ""}
      </p>
      <p style="margin: 5px 0 0 0; color: #44403c; font-size: 12px; line-height: 1.4;">${exp.description || ""}</p>
    </div>
  `
    )
    .join("");

  const educationHtml = resume.education
    .map(
      (edu) => `
    <div style="margin-bottom: 15px; border-bottom: 1px solid #e7e5e4; padding-bottom: 10px;">
      <h4 style="margin: 0; color: #1c1917; font-size: 14px; font-weight: bold;">${edu.degree}</h4>
      <p style="margin: 2px 0; color: #78716c; font-size: 12px;">${edu.school} | ${edu.ciudad || ""}</p>
      <p style="margin: 3px 0; color: #854d0e; font-size: 11px; font-weight: bold;">
        Año: ${edu.start_date}
      </p>
    </div>
  `
    )
    .join("");

  const skillsHtml = resume.skills
    .map(
      (sk) => `
    <div style="margin-bottom: 10px;">
      <p style="margin: 0 0 3px 0; color: #44403c; font-size: 11px; font-weight: bold;">${sk.name} (${sk.level}%)</p>
      <div style="background-color: #f5f5f4; height: 8px; border-radius: 4px; overflow: hidden; width: 100%;">
        <div style="background-color: #ffc132; height: 100%; border-radius: 4px; width: ${sk.level}%;"></div>
      </div>
    </div>
  `
    )
    .join("");

  const referencesHtml = resume.references
    .map(
      (ref) => `
    <div style="margin-bottom: 10px; padding: 10px; background-color: #fafaf9; border-left: 3px solid #ffc132; border-radius: 4px;">
      <p style="margin: 0; color: #1c1917; font-size: 12px; font-weight: bold;">${ref.name}</p>
      <p style="margin: 1px 0; color: #78716c; font-size: 10px;">${ref.role || "Referencia"}</p>
      <p style="margin: 2px 0 0 0; color: #1c1917; font-size: 11px;"><b>Celular:</b> ${ref.phone || "N/A"} ${ref.ciudad ? `| Ciudad: ${ref.ciudad}` : ""}</p>
    </div>
  `
    )
    .join("");

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>HOJA DE VIDA - ${resume.name}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff; color: #44403c; }
        .container { width: 100%; max-width: 800px; margin: 0 auto; box-sizing: border-box; }
        .header { background-color: #1c1917; color: #ffffff; padding: 25px; border-radius: 6px 6px 0 0; border-bottom: 5px solid #ffc132; }
        .header h1 { margin: 0; font-size: 26px; font-weight: bold; }
        .header p { margin: 5px 0 0 0; font-size: 14px; color: #ffc132; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; }
        .content-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .sidebar { width: 35%; vertical-align: top; background-color: #fafaf9; padding: 20px; border-right: 1px solid #e7e5e4; }
        .main-col { width: 65%; vertical-align: top; padding: 20px 20px 20px 25px; }
        .section-title { color: #1c1917; border-bottom: 2px solid #ffc132; padding-bottom: 5px; margin-top: 0; margin-bottom: 15px; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
        .contact-item { margin-bottom: 12px; font-size: 11px; color: #44403c; line-height: 1.4; }
        .contact-item b { color: #1c1917; font-size: 10px; text-transform: uppercase; display: block; margin-bottom: 2px; color: #78716c; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${resume.name}</h1>
          <p>${resume.position || "HOJA DE VIDA"}</p>
        </div>
        <table class="content-table">
          <tr>
            <!-- Left Sidebar -->
            <td class="sidebar">
              <div>
                <h3 class="section-title">Datos Personales</h3>
                <div class="contact-item"><b>Cédula Ciudadanía:</b> CC. ${resume.identificacion || "N/A"}${resume.lugar_expedicion ? ` de ${resume.lugar_expedicion}` : ""}</div>
                <div class="contact-item"><b>Celular:</b> ${resume.celular || resume.phone || "N/A"}</div>
                <div class="contact-item"><b>Correo:</b> ${resume.correo || resume.email || "N/A"}</div>
                <div class="contact-item"><b>Dirección:</b> ${resume.direccion || "N/A"}${resume.barrio ? `, Barrio: ${resume.barrio}` : ""}${resume.ciudad ? ` (${resume.ciudad})` : ""}</div>
                <div class="contact-item"><b>Fecha Nacimiento:</b> ${resume.fecha_nacimiento || "N/A"}</div>
                <div class="contact-item"><b>Lugar Nacimiento:</b> ${resume.lugar_nacimiento || "N/A"}</div>
                <div class="contact-item"><b>Estado Civil:</b> ${resume.estado_civil || "N/A"}</div>
              </div>
              
              <div style="margin-top: 35px;">
                <h3 class="section-title">Habilidades</h3>
                ${skillsHtml || "<p style='font-size:11px; color:#a8a29e;'>Sin habilidades especificadas</p>"}
              </div>
            </td>
            
            <!-- Main Content Area -->
            <td class="main-col">
              <div>
                <h3 class="section-title">Perfil Profesional</h3>
                <p style="font-size: 12px; line-height: 1.5; color: #334155; margin-top: 0; text-align: justify;">${resume.summary || "Profesional responsable y capacitado con alto sentido de pertenencia."}</p>
              </div>
              
              <div style="margin-top: 30px;">
                <h3 class="section-title">Experiencia Laboral</h3>
                ${experiencesHtml || "<p style='font-size:12px; color:#a8a29e;'>No registra experiencia laboral previa.</p>"}
              </div>
              
              <div style="margin-top: 30px;">
                <h3 class="section-title">Estudios Realizados</h3>
                ${educationHtml || "<p style='font-size:12px; color:#a8a29e;'>No registra estudios académicos adicionales.</p>"}
              </div>

              ${resume.references && resume.references.length > 0 ? `
              <div style="margin-top: 30px;">
                <h3 class="section-title">Referencias</h3>
                ${referencesHtml}
              </div>
              ` : ""}
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([wordContent], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  // File download named with the slug
  link.download = `${resume.slug || "resume"}-cv.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
