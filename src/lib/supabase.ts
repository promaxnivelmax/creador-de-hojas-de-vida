import { createClient } from "@supabase/supabase-js";
import { Resume, Experience, Education, Skill, Reference } from "../types";

// User provided credentials
const SUPABASE_PROJECT_URL = "https://vibvktumtqnktrkiblxc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_4FDk2Ywrix8d_wR9I1jODg_GLp2K5SW";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || SUPABASE_PROJECT_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Define a standard UUID validation regex
const UUID_REGEXP = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string | null | undefined): boolean {
  if (!id) return false;
  return UUID_REGEXP.test(id);
}

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Helper to map and sanitize payload data for PostgreSQL tables (matching the SQL Schema)
function sanitizeResume(res: Partial<Resume>, userId: string, finalId: string) {
  return {
    id: finalId,
    slug: res.slug || (res.name || "perfil").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: res.name || `${res.nombres || ""} ${res.apellidos || ""}`.trim() || "Sin Nombre",
    position: res.position || "",
    photo_url: res.photo_url || null,
    city: res.ciudad || res.city || null,
    country: res.country || "Colombia",
    email: res.correo || res.email || null,
    phone: res.celular || res.phone || null,
    website: res.website || null,
    summary: res.summary || null,
    user_id: userId,
  };
}

// Perform CRUD operations for a complete Resume with its child tables
export async function getResumes(userId: string): Promise<Resume[]> {
  const { data, error } = await supabase
    .from("resumes")
    .select(`
      *,
      experiences (*),
      education (*),
      skills (*),
      references (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching resumes from Supabase:", error);
    throw error;
  }

  return (data || []).map((row: any) => {
    // Map backend relational columns back to Frontend CV Types
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      nombres: row.nombres || row.name.split(" ")[0] || "",
      apellidos: row.apellidos || row.name.split(" ").slice(1).join(" ") || "",
      identificacion: row.identificacion || "",
      lugar_expedicion: row.lugar_expedicion || "",
      fecha_nacimiento: row.fecha_nacimiento || "",
      lugar_nacimiento: row.lugar_nacimiento || "",
      estado_civil: row.estado_civil || "",
      celular: row.phone || row.celular || "",
      correo: row.email || row.correo || "",
      direccion: row.direccion || "",
      barrio: row.barrio || "",
      ciudad: row.city || row.ciudad || "",
      position: row.position,
      photo_url: row.photo_url || "",
      city: row.city || "",
      country: row.country || "",
      email: row.email || "",
      phone: row.phone || "",
      website: row.website || "",
      summary: row.summary || "",
      created_at: row.created_at,
      experiences: (row.experiences || []).map((exp: any) => ({
        id: exp.id,
        role: exp.role,
        company: exp.company,
        start_date: exp.start_date,
        end_date: exp.end_date || "",
        current: exp.current || false,
        description: exp.description || "",
        ciudad: exp.ciudad || ""
      })),
      education: (row.education || []).map((edu: any) => ({
        id: edu.id,
        degree: edu.degree,
        school: edu.school,
        start_date: edu.start_date,
        end_date: edu.end_date || "",
        current: edu.current || false,
        description: edu.description || "",
        ciudad: edu.ciudad || ""
      })),
      skills: (row.skills || []).map((sk: any) => ({
        id: sk.id,
        name: sk.name,
        level: sk.level || 0
      })),
      references: (row.references || []).map((ref: any) => ({
        id: ref.id,
        name: ref.name,
        role: ref.role || ref.relationship || "",
        phone: ref.contact_info || ref.phone || "",
        ciudad: ref.ciudad || ""
      }))
    };
  });
}

export async function saveResumeToSupabase(resume: Partial<Resume>, userId: string): Promise<Resume> {
  const isUpdating = !!resume.id && isValidUUID(resume.id);
  const finalId = isUpdating ? resume.id! : generateUUID();
  const payload = sanitizeResume(resume, userId, finalId);

  // Extend table records to insert missing column mappings safely if column does not exist
  // We specify these extra columns in resumes table mapping
  const extendedPayload = {
    ...payload,
    // Add additional individual attributes that are present on frontend
    nombres: resume.nombres || "",
    apellidos: resume.apellidos || "",
    identificacion: resume.identificacion || "",
    lugar_expedicion: resume.lugar_expedicion || "",
    fecha_nacimiento: resume.fecha_nacimiento || "",
    lugar_nacimiento: resume.lugar_nacimiento || "",
    estado_civil: resume.estado_civil || "",
    direccion: resume.direccion || "",
    barrio: resume.barrio || "",
    ciudad: resume.ciudad || resume.city || "",
  };

  let resumeId: string;

  if (isUpdating) {
    const { data, error } = await supabase
      .from("resumes")
      .update(extendedPayload)
      .eq("id", finalId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    resumeId = data.id;
  } else {
    const { data, error } = await supabase
      .from("resumes")
      .insert(extendedPayload)
      .select()
      .single();

    if (error) throw error;
    resumeId = data.id;
  }

  // Handle Child tables (experiences, education, skills, references)
  // To avoid complex partial diffs, delete existing subitems and insert fresh records
  if (isUpdating) {
    await Promise.all([
      supabase.from("experiences").delete().eq("resume_id", resumeId),
      supabase.from("education").delete().eq("resume_id", resumeId),
      supabase.from("skills").delete().eq("resume_id", resumeId),
      supabase.from("references").delete().eq("resume_id", resumeId),
    ]);
  }

  // 1. Insert Experiences
  if (resume.experiences && resume.experiences.length > 0) {
    const expPayload = resume.experiences.map((exp) => ({
      resume_id: resumeId,
      role: exp.role,
      company: exp.company,
      start_date: exp.start_date || "",
      end_date: exp.end_date || null,
      current: exp.current || false,
      description: exp.description || "",
      ciudad: exp.ciudad || ""
    }));
    const { error } = await supabase.from("experiences").insert(expPayload);
    if (error) console.error("Error saving experiences:", error);
  }

  // 2. Insert Education
  if (resume.education && resume.education.length > 0) {
    const eduPayload = resume.education.map((edu) => ({
      resume_id: resumeId,
      degree: edu.degree,
      school: edu.school,
      start_date: edu.start_date || "",
      end_date: edu.end_date || null,
      current: edu.current || false,
      description: edu.description || "",
      ciudad: edu.ciudad || ""
    }));
    const { error } = await supabase.from("education").insert(eduPayload);
    if (error) console.error("Error saving education:", error);
  }

  // 3. Insert Skills
  if (resume.skills && resume.skills.length > 0) {
    const skPayload = resume.skills.map((sk) => ({
      resume_id: resumeId,
      name: sk.name,
      level: sk.level || 0
    }));
    const { error } = await supabase.from("skills").insert(skPayload);
    if (error) console.error("Error saving skills:", error);
  }

  // 4. Insert References
  if (resume.references && resume.references.length > 0) {
    const refPayload = resume.references.map((ref) => ({
      resume_id: resumeId,
      name: ref.name,
      relationship: ref.role || "Colega",
      role: ref.role || "",
      company: ref.role || "Ninguna",
      contact_info: ref.phone || "",
      phone: ref.phone || "",
      ciudad: ref.ciudad || ""
    }));
    const { error } = await supabase.from("references").insert(refPayload);
    if (error) console.error("Error saving references:", error);
  }

  // Fetch fully populated updated record
  const [completeRecord] = await getResumes(userId);
  return completeRecord;
}

export async function deleteResumeFromSupabase(id: string, userId: string) {
  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
