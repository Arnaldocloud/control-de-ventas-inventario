-- Create perfiles table
CREATE TABLE IF NOT EXISTS perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organizacion_id UUID NOT NULL,
    nombre_completo TEXT,
    telefono TEXT,
    avatar_url TEXT,
    rol TEXT NOT NULL DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario', 'vendedor')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_perfiles_organizacion_id ON perfiles(organizacion_id);

-- Add RLS policies
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see their own profile
CREATE POLICY "Users can view their own profile" 
ON perfiles FOR SELECT 
USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON perfiles FOR UPDATE
USING (auth.uid() = id);

-- Create policy to allow admins to manage all profiles
CREATE POLICY "Admins can manage all profiles"
ON perfiles
USING (EXISTS (
  SELECT 1 FROM perfiles p 
  WHERE p.id = auth.uid() AND p.rol = 'admin'
));
