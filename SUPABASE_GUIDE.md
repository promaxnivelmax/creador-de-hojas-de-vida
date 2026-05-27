# Supabase Database Setup & Integration Guide

This guide describes how to import your data architecture into Supabase, configure Row-Level Security (RLS) policies, and connect to this CV Resume Builder platform.

---

## 1. Database Schema SQL

Run the following SQL snippet in your Supabase SQL Editor. It creates all tables, foreign keys, cascade deletes, indices, and sample objects.

```sql
-- 1. Create Resumes Table
CREATE TABLE public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    photo_url TEXT,
    city TEXT,
    country TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID DEFAULT auth.uid() -- Optional: ties to active Supabase Auth user
);

CREATE INDEX idx_resumes_slug ON public.resumes(slug);

-- 2. Create Experiences Table
CREATE TABLE public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    current BOOLEAN DEFAULT false NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_experiences_resume ON public.experiences(resume_id);

-- 3. Create Education Table
CREATE TABLE public.education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    degree TEXT NOT NULL,
    school TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    current BOOLEAN DEFAULT false NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_education_resume ON public.education(resume_id);

-- 4. Create Skills Table
CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level INTEGER CHECK (level >= 0 AND level <= 100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_skills_resume ON public.skills(resume_id);

-- 5. Create References Table
CREATE TABLE public."references" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    company TEXT NOT NULL,
    contact_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_references_resume ON public."references"(resume_id);
```

---

## 2. Row Level Security (RLS) Policies

Enable security rules in Supabase to restrict modifications while allowing public reading (since resumes are public portfolio pages):

```sql
-- Enable RLS on all tables
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."references" ENABLE ROW LEVEL SECURITY;

-- 1. Read access is public for any visitor (to render the live CV)
CREATE POLICY "Public Read Access for Resumes" ON public.resumes FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Experiences" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public Read Access for References" ON public."references" FOR SELECT USING (true);

-- 2. Modify access (Insert/Update/Delete) is restricted to authenticated owners or authorized handlers (simplistic model)
CREATE POLICY "Insert Resumes authenticated" ON public.resumes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Update Resumes owner" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Delete Resumes owner" ON public.resumes FOR DELETE USING (auth.uid() = user_id);

-- Cascading RLS rules exist automatically based on foreign keys, but you can configure direct handles too:
CREATE POLICY "Modify Experiences of own resumes" ON public.experiences FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.resumes WHERE resumes.id = experiences.resume_id AND resumes.user_id = auth.uid()));

CREATE POLICY "Modify Education of own resumes" ON public.education FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.resumes WHERE resumes.id = education.resume_id AND resumes.user_id = auth.uid()));

CREATE POLICY "Modify Skills of own resumes" ON public.skills FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.resumes WHERE resumes.id = skills.resume_id AND resumes.user_id = auth.uid()));

CREATE POLICY "Modify References of own resumes" ON public."references" FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.resumes WHERE resumes.id = "references".resume_id AND resumes.user_id = auth.uid()));
```

---

## 3. Client Environment Variables Setup

When deploying to Vercel or running locally, specify these credentials in your `.env` or Vercel dashboard:

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

---

## 4. Supabase Client Integration Code (React)

Create a file `src/lib/supabase.ts` inside your frontend to hook into data-streams:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Fallback gracefully if keys are missing
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchResumeBySlug(slug: string) {
  const { data: resume, error } = await supabase
    .from('resumes')
    .select(`
      *,
      experiences (*),
      education (*),
      skills (*),
      references (*)
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return resume;
}
```
