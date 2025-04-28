/*
  # Create workout schedules table

  1. New Tables
    - `workout_schedules`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date, not null)
      - `exercises` (jsonb, not null)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `workout_schedules` table
    - Add policies for authenticated users to manage their schedules
*/

CREATE TABLE IF NOT EXISTS workout_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  date date NOT NULL,
  exercises jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create a unique constraint on user_id and date
ALTER TABLE workout_schedules
  ADD CONSTRAINT workout_schedules_user_date_key UNIQUE (user_id, date);

-- Enable Row Level Security
ALTER TABLE workout_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create own schedules"
  ON workout_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own schedules"
  ON workout_schedules
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules"
  ON workout_schedules
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules"
  ON workout_schedules
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_workout_schedules_updated_at
  BEFORE UPDATE ON workout_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();