import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resume } from "./src/types";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY non-existent in environment; AI features will return simulated professional layouts.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// Helper for generating initial sample data in Spanish / Colombian Hoja de Vida style
const createSampleResumes = (): Resume[] => [
  {
    id: "carlos-mendoza",
    slug: "carlos-mendoza",
    name: "Carlos Alberto Mendoza",
    nombres: "Carlos Alberto",
    apellidos: "Mendoza Rojas",
    identificacion: "1023456789",
    lugar_expedicion: "Bogotá D.C.",
    fecha_nacimiento: "1990-08-15",
    lugar_nacimiento: "Bogotá",
    estado_civil: "Soltero",
    celular: "3115551234",
    correo: "carlos.mendoza@example.com",
    direccion: "Calle 45 # 12-34",
    barrio: "Chapinero",
    ciudad: "Bogotá",
    position: "Ingeniero de Sistemas",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop",
    city: "Bogotá",
    country: "Colombia",
    email: "carlos.mendoza@example.com",
    phone: "3115551234",
    website: "https://carlosmendoza.dev",
    summary: "Profesional en Ingeniería de Sistemas con más de 6 años de experiencia en desarrollo de software y gestión de infraestructuras de tecnologías. Comprometido con soluciones de calidad, escalables y con alto impacto para servicios digitales.",
    created_at: "2026-05-20T10:00:00.000Z",
    experiences: [
      {
        id: "exp1",
        role: "Coordinador de Desarrollo",
        company: "Sistemas & Soluciones S.A.S.",
        start_date: "2022-01",
        end_date: "",
        current: true,
        description: "Liderazgo técnico del equipo de desarrollo, implementación de arquitecturas escalables basadas en servicios web y supervisión de integraciones críticas con bases de datos.",
        ciudad: "Bogotá"
      },
      {
        id: "exp2",
        role: "Desarrollador Full Stack",
        company: "Tecnología Avanzada Ltda.",
        start_date: "2019-06",
        end_date: "2021-12",
        current: false,
        description: "Desarrollo y mantenimiento de aplicativos internos utilizando React y Node.js, optimización de consultas SQL y automatizaciones en la nube.",
        ciudad: "Medellín"
      }
    ],
    education: [
      {
        id: "edu1",
        degree: "Ingeniero de Sistemas",
        school: "Universidad de los Andes",
        start_date: "2015-12",
        end_date: "",
        current: false,
        description: "Graduado con honores académicos y tesis laureada en computación móvil.",
        ciudad: "Bogotá"
      }
    ],
    skills: [
      { id: "sk1", name: "JavaScript / TypeScript / React", level: 90 },
      { id: "sk2", name: "Bases de Datos SQL & NoSQL", level: 85 },
      { id: "sk3", name: "Servicios en la Nube", level: 80 }
    ],
    references: [
      {
        id: "ref1",
        name: "Ing. Andrés Gómez",
        role: "Director de TI",
        phone: "3201234567",
        ciudad: "Bogotá"
      },
      {
        id: "ref2",
        name: "Dra. Patricia Restrepo",
        role: "Gerente de Proyectos",
        phone: "3159876543",
        ciudad: "Medellín"
      }
    ]
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Dynamic system database state
  let resumes: Resume[] = createSampleResumes();

  // API Routes
  app.get("/api/resumes", (req, res) => {
    res.json(resumes);
  });

  app.get("/api/resumes/:slug_or_id", (req, res) => {
    const term = req.params.slug_or_id.toLowerCase();
    const resume = resumes.find(r => r.id === term || r.slug.toLowerCase() === term);
    if (!resume) {
      return res.status(404).json({ error: "No se encontró el registro" });
    }
    res.json(resume);
  });

  // AIDocument generator endpoints with full variables mapping and layout support
  app.post("/api/ai/generate-document", async (req, res) => {
    const { documentType, variables = {}, style = "Formal", action = "generate", currentText = "" } = req.body;

    const formattedVars = Object.entries(variables)
      .map(([key, val]) => `- ${key}: ${val}`)
      .join("\n");

    const systemInstruction = `Eres un experto asistente de redacción formal de correspondencia, trámites oficiales, solicitudes administrativas y documentos jurídicos para Colombia y América Latina. Tus textos son impecables, con una sintaxis correcta, tono respetuoso, sobrio y perfectamente estructurado para hojas de oficina premium.`;

    let prompt = "";
    if (action === "improve") {
      prompt = `Mejora la redacción, corrige la ortografía, perfecciona la gramática y optimiza todo el vocabulario del siguiente texto formal en español, elevándolo a un estilo y tono de nivel ${style}. Mantén intactas las variables u datos clave como nombres de personas, fechas, números de documentos (cédulas) y nombres de empresas.
Texto actual a mejorar:
"${currentText}"

Devuelve ÚNICAMENTE el texto final corregido y limpio del documento de forma directa. No añadas introducciones, explicaciones, ni marcas externas.`;
    } else {
      prompt = `Redacta desde el absoluto comienzo un documento formal del tipo "${documentType}" siguiendo un estilo de tono característico de la plantilla "${style}".
Integra y procesa de forma natural las siguientes variables suministradas por el usuario:
${formattedVars}

Si faltan variables de vital importancia para el contexto del documento, deja un placeholder explícito entre corchetes rectos como [Especificar Dato].
El escrito estructurado debe indispensablemente incluir:
1. Encabezado de ciudad y fecha actualizados en la parte superior.
2. Destinatario corporativo/personal formal (E.S.D. u Oficial de despacho).
3. Línea del "Asunto: ..." muy claro e intuitivo.
4. Saludo preliminar con respeto.
5. El desarrollo redactado de los párrafos conforme al requerimiento regulatario.
6. Cierre corporativo de agradecimiento con espacio adecuado para firma, nombre y número identificador.

Devuelve ÚNICAMENTE el texto redactado del documento final de forma directa. No agregues "Aquí tienes tu carta" u otro texto conversacional.`;
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.65,
          }
        });

        if (response && response.text) {
          return res.json({ success: true, text: response.text.trim() });
        }
      } catch (err: any) {
        console.error("Gemini server generation failed, using local model templates:", err);
      }
    }

    // High fidelity template fallback for outstanding experience offline
    const fallbackText = getTemplateFallback(documentType, variables, style);
    res.json({ success: true, text: fallbackText, note: "Generación ejecutada mediante plantilla local estructurada en español" });
  });

  function getTemplateFallback(documentType: string, variables: any, style: string): string {
    const nombre = variables.nombre || "[Nombre del Solicitante]";
    const cedula = variables.cedula || "[Cédula de Ciudadanía - CC]";
    const fecha = variables.fecha || "[Fecha de Hoy]";
    const ciudad = variables.ciudad || "[Ciudad]";
    const empresa = variables.empresa || "[Nombre de la Empresa]";
    const asunto = variables.asunto || `Trámite de ${documentType}`;
    const destinatario = variables.destinatario || "[Nombre del Destinatario / Cargo]";
    const cargo = variables.cargo || "[Cargo del Solicitante]";
    const fechaInicio = variables.fechaInicio || "[Fecha de Inicio]";
    const fechaFin = variables.fechaFin || "[Fecha de Finalización]";
    const motivo = variables.motivo || "[Motivo o Justificación Detallada]";

    const fechaEncabezado = fecha;
    const ciudadEncabezado = ciudad;

    if (documentType.toLowerCase().includes("renuncia")) {
      return `${ciudadEncabezado}, ${fechaEncabezado}

Señores:
${empresa}
Atn: Departamento de Gestión Humana / ${destinatario}
E. S. D.

Asunto: Carta de Renuncia Voluntaria e Irrevocable

Respetados Señores,

Por medio de la presente, me dirijo a ustedes de manera respetuosa con el propósito de manifestar mi decisión libre, voluntaria e irrevocable de presentar mi renuncia formal al cargo de ${cargo} en esta importante organización.

Esta decisión responde estrictamente a motivos de crecimiento intelectual y superación profesional. Quiero agradecer de manera profunda la confianza recibida, así como las inestimables oportunidades laborales y experiencias personales de cordial compañerismo compartidas durante mi vinculación.

Estaré cumpliendo mis labores correspondientes hasta el día acordado, quedando a total disposición para el respectivo proceso de paz y salvo y liquidación de prestaciones según las directrices vigentes de la ley.

Agradezco la atención concedida a esta comunicación y les deseo el mayor de los éxitos en sus operaciones corporativas.

Cordialmente,


_______________________________
${nombre}
C.C. No. ${cedula}
Teléfono: ${variables.celular || "[Contacto]"}`;
    }

    if (documentType.toLowerCase().includes("vacaciones")) {
      return `${ciudadEncabezado}, ${fechaEncabezado}

Señores:
${empresa}
Atn: Oficina de Talento Humano / Gestión de Personal
E. S. D.

Asunto: Solicitud Legal de Periodo de Vacaciones

Respetados Señores:

De manera atenta me dirijo a ustedes para solicitarles formalmente la autorización e inicio de mi periodo de descanso legal de vacaciones anuales remuneradas, al cual tengo pleno derecho por mi tiempo de servicio activo.

De acuerdo con lo planificado para el correcto flujo del área, aspiro iniciar el disfrute de mis vacaciones desde la fecha ${fechaInicio} y reincorporarme a mis labores habituales el día de regreso ${fechaFin}, cumpliendo así con las jornadas establecidas.

Dejo debidamente coordinados los pendientes más importantes del puesto para evitar contratiempos. Agradezco su valiosa y oportuna aprobación a este requerimiento de descanso familiar.

Atentamente,


_______________________________
${nombre}
Cargo: ${cargo}
C.C. No. ${cedula}
Teléfono: ${variables.celular || "[Contacto]"}`;
    }

    if (documentType.toLowerCase().includes("permiso") || documentType.toLowerCase().includes("excusa")) {
      return `${ciudadEncabezado}, ${fechaEncabezado}

Señores:
${empresa || "[Nombre de la Institución]"}
Atn: ${destinatario || "Dirección Administrativa"}
E. S. D.

Asunto: Solicitud Formal de Permiso o Justificación de Ausencia

Respetado(a) Señor(a):

Me dirijo a usted con el fin de solicitar formalmente un permiso especial de ausencia para faltar temporalmente a mis obligaciones diarias ordinarias de mi cargo (${cargo}), durante el lapso de tiempo comprendido desde el día ${fechaInicio} hasta el día ${fechaFin}.

La justificación de este requerimiento extraordinario obedece a la siguiente situación: ${motivo}. Adjunto los soportes médicos o de trámites correspondientes para su completa verificación.

Sé de antemano el compromiso que asumo para reponer las actividades necesarias de mi área y agradezco inmensamente su comprensión frente a esta eventualidad de fuerza mayor.

Atentamente,


_______________________________
${nombre}
C.C. No. ${cedula}
Teléfono: ${variables.celular || "[Contacto]"}`;
    }

    // Default general-purpose executive letter format
    return `${ciudadEncabezado}, ${fechaEncabezado}

Señores:
${destinatario}
${empresa || "[Entidad de Destino]"}
${ciudad}

Asunto: ${asunto}

Respetado(a) Señor(a):

Por medio de este oficio escrito, me permito saludarle de la manera más atenta y expresar formalmente este requerimiento con relación al trámite de ${documentType}.

El objeto de la presente comunicación es presentar formalmente la siguiente situación relevante: ${motivo || "Se solicita comedidamente el inicio y desarrollo del trámite mencionado para los fines de ley de acuerdo con nuestras facultades legítimas."} 

Agradezco encarecidamente el tiempo tomado para el análisis cuidadoso de este requerimiento administrativo y quedo en absoluta disposición de recibir cualquier comentario, corrección u orientación complementaria a los datos de contacto brindados.

Cordialmente,


_______________________________
${nombre}
C.C. No. ${cedula}
Cargo/Calidad: ${cargo || "Remitente Solicitante"}
${variables.celular ? "Tel: " + variables.celular : ""}
${variables.correo ? "Email: " + variables.correo : ""}`;
  }

  app.post("/api/resumes", (req, res) => {
    const data = req.body as Partial<Resume>;
    
    const pNombres = data.nombres || data.name || "Sin nombres";
    const pApellidos = data.apellidos || "";
    const pFullName = data.name || `${pNombres} ${pApellidos}`.trim();
    const pPosition = data.position || "Profesional";

    // Generate unique id and clean slug
    const id = data.id || Math.random().toString(36).substring(2, 11);
    const rawSlug = pFullName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    let slug = rawSlug || "perfil";
    let slugCount = 1;
    while (resumes.some(r => r.id !== id && r.slug === slug)) {
      slug = `${rawSlug}-${slugCount++}`;
    }

    const newResume: Resume = {
      id,
      slug,
      name: pFullName,
      nombres: pNombres,
      apellidos: pApellidos,
      identificacion: data.identificacion || "",
      lugar_expedicion: data.lugar_expedicion || "",
      fecha_nacimiento: data.fecha_nacimiento || "",
      lugar_nacimiento: data.lugar_nacimiento || "",
      estado_civil: data.estado_civil || "",
      celular: data.celular || "",
      correo: data.correo || "",
      direccion: data.direccion || "",
      barrio: data.barrio || "",
      ciudad: data.ciudad || "",
      
      position: pPosition,
      photo_url: data.photo_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=250&auto=format&fit=crop",
      city: data.ciudad || "",
      country: "Colombia",
      email: data.correo || "",
      phone: data.celular || "",
      website: data.website || "",
      summary: data.summary || "",
      created_at: data.created_at || new Date().toISOString(),
      experiences: data.experiences || [],
      education: data.education || [],
      skills: data.skills || [],
      references: data.references || []
    };

    // If matches existing ID, update it, otherwise insert new
    const existingIndex = resumes.findIndex(r => r.id === id);
    if (existingIndex !== -1) {
      resumes[existingIndex] = newResume;
    } else {
      resumes.push(newResume);
    }

    res.status(201).json(newResume);
  });

  app.delete("/api/resumes/:id", (req, test_res) => {
    const id = req.params.id;
    const initialLength = resumes.length;
    resumes = resumes.filter(r => r.id !== id);
    if (resumes.length === initialLength) {
      return test_res.status(404).json({ error: "Hoja de Vida no encontrada" });
    }
    test_res.json({ success: true, message: `Registro ${id} correctamente eliminado` });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res_build) => {
      res_build.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
