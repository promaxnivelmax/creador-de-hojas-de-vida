import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resume } from "./src/types";

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
