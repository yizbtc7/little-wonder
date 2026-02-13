export type SchemaDetected =
  | "trajectory"
  | "rotation"
  | "enclosure"
  | "enveloping"
  | "transporting"
  | "connecting"
  | "transforming"
  | "positioning"
  | "orientation"
  | "unknown";

export type Domain =
  | "motor"
  | "cognitive"
  | "social-emotional"
  | "language"
  | "sensory";

export type InterestPhase =
  | "triggered"
  | "maintained"
  | "emerging"
  | "developed"
  | null;

export interface InsightJson {
  celebration: string;
  illumination: string;
  reassurance: string | null;
  activity: {
    title: string;
    description: string;
    quick_version: string;
    serve_and_return_tip: string;
  };
  observation_prompt: string;
  sibling_connection: string | null;
  pattern_progression:
    | null
    | {
        schema: SchemaDetected;
        count: number;
        activities: string[];
      };
  metadata: {
    schemas_detected: SchemaDetected[];
    cognitive_stage: string;
    psychosocial_task: string;
    developmental_domains: Domain[];
    sensitive_period_active: boolean;
    interest_phase: InterestPhase;
    executive_functions_engaged: Array<
      "inhibitory_control" | "working_memory" | "cognitive_flexibility"
    >;
    curiosity_state_detected: boolean;
    needs_reassurance: boolean;
    suggest_professional_consult: boolean;
    confidence: number; // 0.0 - 1.0
  };
}

export const FIELD_LIMITS = {
  celebrationMaxChars: 180,
  illuminationMaxChars: 900,
  reassuranceMaxChars: 220,
  activityTitleMaxChars: 90,
  activityDescriptionMaxChars: 500,
  quickVersionMaxChars: 220,
  serveAndReturnTipMaxChars: 220,
  observationPromptMaxChars: 180,
};
