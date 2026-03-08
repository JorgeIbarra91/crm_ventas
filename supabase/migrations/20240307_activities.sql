-- Create activities table
CREATE TYPE activity_type AS ENUM ('call', 'email', 'meeting', 'task');

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_rut TEXT NOT NULL REFERENCES clients(rut) ON DELETE CASCADE,
    rep_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type activity_type NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT,
    outcome TEXT,
    next_step TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_activities_client_rut ON activities(client_rut);
CREATE INDEX idx_activities_rep_id ON activities(rep_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_due_date ON activities(due_date);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policies for activities table
CREATE POLICY "Users can view their own activities and clients' activities"
ON activities FOR SELECT
USING (
  auth.uid() = rep_id OR EXISTS (SELECT 1 FROM clients WHERE clients.rut = client_rut AND clients.assigned_to_rep_id = auth.uid())
);

CREATE POLICY "Users can insert their own activities"
ON activities FOR INSERT
WITH CHECK (auth.uid() = rep_id);

CREATE POLICY "Users can update their own activities"
ON activities FOR UPDATE
USING (auth.uid() = rep_id);

CREATE POLICY "Users can delete their own activities"
ON activities FOR DELETE
USING (auth.uid() = rep_id);