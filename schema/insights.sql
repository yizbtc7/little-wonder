CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  observation_id UUID REFERENCES observations(id) ON DELETE CASCADE,
  insight_text TEXT NOT NULL,
  json_response JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_insights_observation_id ON insights(observation_id);