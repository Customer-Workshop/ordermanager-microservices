// ---- Core Entity Types ----

export interface Location {
  id: number;
  city: string;
  state: string;
  zip_code: string;
  is_client_location: boolean;
  is_active: boolean;
}

export interface PracticeUnit {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UnitAnchor {
  id: number;
  practice_unit_id: number;
  user_id: number;
  is_primary: boolean;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  persona: string;
  is_active: boolean;
}

export interface RoleSkill {
  id: number;
  skill_name: string;
  proficiency_level: string;
  is_mandatory: boolean;
}

export interface Role {
  id: number;
  title: string;
  category: string;
  experience_min: number;
  experience_max: number;
  description: string | null;
  practice_unit_id: number | null;
  location_id: number | null;
  required_skills: RoleSkill[];
}

export interface CandidateSkill {
  id: number;
  skill_name: string;
  proficiency_level: string;
  years_experience: number;
}

export interface Candidate {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  experience_years: number;
  current_location: string | null;
  preferred_location_id: number | null;
  resume_url: string | null;
  skills: CandidateSkill[];
}

export interface StaffingRequest {
  id: number;
  wmt_reference_id: string | null;
  role_id: number;
  location_id: number;
  status: string;
  priority: string;
  headcount: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewRound {
  id: number;
  staffing_request_candidate_id: number;
  round_number: number;
  status: string;
  scheduled_at: string | null;
  interviewer_id: number | null;
  rubric_id: number | null;
}

export interface RubricCriterion {
  id: number;
  rubric_id: number;
  name: string;
  description: string | null;
  max_score: number;
  weight: number;
  sort_order: number;
}

export interface RoleRubric {
  id: number;
  role_id: number;
  title: string;
  description: string | null;
  html_content: string | null;
  pass_band: string | null;
  auto_reject_rule: string | null;
  specialist_rule: string | null;
  version: number;
  is_active: boolean;
  criteria: RubricCriterion[];
}

export interface SLAAttachment {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size_bytes: number | null;
  description: string | null;
  created_at: string;
}

export interface SLADefinition {
  id: number;
  name: string;
  stage: string;
  target_days: number;
  warning_threshold_days: number;
  description: string | null;
  is_active: boolean;
  attachments: SLAAttachment[];
}

// ---- Dashboard Types ----

export interface RequestStatusCount {
  status: string;
  count: number;
}

export interface LocationBreakdown {
  location_name: string;
  total_requests: number;
  fulfilled: number;
  in_progress: number;
}

export interface PracticeUnitBreakdown {
  unit_code: string;
  unit_name: string;
  total_requests: number;
  total_candidates: number;
  fulfillment_rate: number;
}

export interface SLASummary {
  on_track: number;
  at_risk: number;
  breached: number;
  met: number;
}

export interface RotationSummary {
  active: number;
  due_in_30_days: number;
  due_in_90_days: number;
  due_in_180_days: number;
  overdue: number;
}

export interface DashboardData {
  total_requests: number;
  total_candidates: number;
  total_active_positions: number;
  total_onboarded: number;
  request_status_breakdown: RequestStatusCount[];
  location_breakdown: LocationBreakdown[];
  practice_unit_breakdown: PracticeUnitBreakdown[];
  sla_summary: SLASummary;
  rotation_summary: RotationSummary;
}
