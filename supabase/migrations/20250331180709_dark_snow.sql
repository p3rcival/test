/*
  # Exercise Templates Schema and Security

  1. New Tables
    - `exercise_templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `sets` (integer)
      - `reps` (integer)
      - `weight` (numeric, nullable)
      - `video_urls` (text array, nullable)
      - `notes` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `exercise_templates` table
    - Add policies for:
      - Users can create their own templates
      - Users can read their own templates
      - Users can update their own templates
      - Users can delete their own templates
*/

-- Create exercise_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS exercise_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  sets integer NOT NULL,
  reps integer NOT NULL,
  weight numeric,
  video_urls text[],
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE exercise_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can create own templates" ON exercise_templates;
  DROP POLICY IF EXISTS "Users can view own templates" ON exercise_templates;
  DROP POLICY IF EXISTS "Users can update own templates" ON exercise_templates;
  DROP POLICY IF EXISTS "Users can delete own templates" ON exercise_templates;
END $$;

-- Create policies
CREATE POLICY "Users can create own templates"
  ON exercise_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own templates"
  ON exercise_templates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON exercise_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON exercise_templates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);