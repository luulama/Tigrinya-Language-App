export type Skill = "Visual" | "Listening" | "Speaking" | "Reading" | "Writing";
export type WorkflowState =
  | "Draft"
  | "Submitted"
  | "UnderReview"
  | "Approved"
  | "NeedsRevision"
  | "Published"
  | "Archived";
export const contentKinds = [
  "Alphabet",
  "Letter",
  "LetterFamily",
  "Sound",
  "Word",
  "Phrase",
  "Sentence",
  "Dialogue",
  "Story",
  "ReadingPassage",
  "Lesson",
  "Unit",
  "Module",
  "Course",
  "AudioAsset",
  "ImageAsset",
  "VideoAsset",
  "Assessment",
  "Question",
  "Quiz",
  "Grammar",
  "Culture",
] as const;
export type ContentKind = (typeof contentKinds)[number];
export interface ContentItem {
  id: string;
  languageTag: string;
  kind: ContentKind;
  title: string;
  revision: number;
  state: WorkflowState;
  concurrencyStamp: string;
  payload: Record<string, unknown>;
}
export interface ContentPage {
  items: ContentItem[];
  offset: number;
  limit: number;
  hasMore: boolean;
}
export interface Question {
  id: string;
  revision: number;
  targetId: string;
  prompt: string;
  options: string[];
  skill: Skill;
  audioAssetId?: string | null;
}
export interface ReviewResult {
  correct: boolean;
  helped: boolean;
  model?: string;
  explanation?: string;
  nextReview?: string;
  replayed: boolean;
}
export interface Profile {
  id?: string;
  subject?: string;
  presentation: "child" | "teen" | "adult";
  languageTag: string;
  goal: string;
  isChild: boolean;
  analyticsConsent: boolean;
}
export interface AuthConfig {
  enabled: boolean;
  authority?: string;
  clientId?: string;
  scope?: string;
}
export interface CoachRequest {
  languageTag: string;
  objective: string;
  approvedContentIds: string[];
  input: string;
}
export interface CoachResponse {
  text: string;
  sourceContentIds: string[];
  abstained: boolean;
  reason?: string;
}
export interface AiTutor {
  explain(request: CoachRequest, signal?: AbortSignal): Promise<CoachResponse>;
}
export interface AiConversationPartner {
  respond(request: CoachRequest, signal?: AbortSignal): Promise<CoachResponse>;
}
export interface AiPronunciationCoach {
  assess(
    request: CoachRequest,
    audio: Blob,
    signal?: AbortSignal,
  ): Promise<CoachResponse>;
}
export interface AiWritingCoach {
  review(request: CoachRequest, signal?: AbortSignal): Promise<CoachResponse>;
}
export interface AiRecommendationService {
  recommend(request: CoachRequest, signal?: AbortSignal): Promise<string[]>;
}
export interface AiLessonAssistant {
  draft(request: CoachRequest, signal?: AbortSignal): Promise<CoachResponse>;
}
export interface AiReviewerAssistant {
  flag(request: CoachRequest, signal?: AbortSignal): Promise<CoachResponse>;
}
