ALTER TABLE IF EXISTS activities
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS activity_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  note TEXT,
  UNIQUE(user_id, activity_id)
);

CREATE TABLE IF NOT EXISTS activity_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_activities_age_lang ON activities(age_min_months, age_max_months, language);
CREATE INDEX IF NOT EXISTS idx_activities_schema ON activities(schema_target);
CREATE INDEX IF NOT EXISTS idx_activity_completions_user ON activity_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_saves_user ON activity_saves(user_id);

-- Ensure one featured activity per age band + language when missing.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY language, age_min_months, age_max_months
      ORDER BY created_at DESC
    ) AS rn
  FROM activities
)
UPDATE activities a
SET is_featured = (ranked.rn = 1)
FROM ranked
WHERE ranked.id = a.id
  AND NOT EXISTS (
    SELECT 1
    FROM activities x
    WHERE x.language = a.language
      AND x.age_min_months = a.age_min_months
      AND x.age_max_months = a.age_max_months
      AND x.is_featured = true
  );
