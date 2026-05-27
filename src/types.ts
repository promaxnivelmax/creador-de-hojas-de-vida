export interface Experience {
  id: string;
  role: string;      // "CARGO"
  company: string;   // "EMPRESA"
  start_date: string; // "FECHA DE INICIO"
  end_date: string;   // "FECHA DE FINALIZACION"
  current: boolean;
  description: string;
  ciudad: string;     // "CIUDAD"
}

export interface Education {
  id: string;
  degree: string;     // "TITULO_OBTENIDO"
  school: string;     // "NOMBRE_INSTITUTO"
  start_date: string; // "FECHA_DE_GRADUACION"
  end_date: string;
  current: boolean;
  description: string;
  ciudad: string;     // "CIUDAD"
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 0 to 100
}

export interface Reference {
  id: string;
  name: string;        // "NOMBRE"
  role: string;        // "CARGO"
  phone: string;       // "CELULAR"
  ciudad: string;      // "CIUDAD"
}

export interface Resume {
  id: string;
  slug: string;
  name: string; // Full name: nombres + apellidos
  nombres: string;
  apellidos: string;
  identificacion: string;
  lugar_expedicion: string;
  fecha_nacimiento: string;
  lugar_nacimiento: string;
  estado_civil: string;
  celular: string;
  correo: string;
  direccion: string;
  barrio: string;
  ciudad: string;
  
  position: string; // keep for metadata/compat
  photo_url: string; // Base64 or URL
  city: string; // keep for metadata/compat
  country: string; // keep for metadata/compat
  email: string; // keep for metadata/compat
  phone: string; // keep for metadata/compat
  website: string; // keep for metadata/compat
  summary: string;
  created_at: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  references: Reference[];
}
