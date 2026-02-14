export const PARENT_ROLES = ['Mom', 'Dad', 'Caregiver', 'Other'] as const;

export type ParentRole = (typeof PARENT_ROLES)[number];
