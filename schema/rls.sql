-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own data" ON users FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage their children" ON children FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their observations" ON observations FOR ALL USING (auth.uid() = (SELECT user_id FROM children WHERE id = child_id)) WITH CHECK (auth.uid() = (SELECT user_id FROM children WHERE id = child_id));

CREATE POLICY "Users can view their insights" ON insights FOR SELECT USING (auth.uid() = (SELECT user_id FROM children c JOIN observations o ON c.id = o.child_id WHERE o.id = observation_id));