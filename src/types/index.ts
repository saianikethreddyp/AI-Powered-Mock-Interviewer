// User types
export interface User {
    id: string;
    email: string;
    full_name: string;
    created_at: string;
}

// Interview types
export interface Interview {
    id: string;
    user_id: string;
    job_role: string;
    job_description: string;
    resume_text: string | null;
    question_count: number;
    experience_level?: string;
    focus_area?: string;
    transcript?: any;
    status: 'setup' | 'in_progress' | 'completed' | 'cancelled';
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
}

export interface InterviewResponse {
    id: string;
    interview_id: string;
    question_number: number;
    question: string;
    user_response: string;
    ai_feedback: string | null;
    created_at: string;
}

export interface InterviewAnalysis {
    id: string;
    interview_id: string;
    overall_score: number;
    category_scores: CategoryScores;
    strengths: string[];
    areas_for_improvement: string[];
    detailed_feedback: string;
    question_feedback: QuestionFeedback[];
    hiring_recommendation: string;
    interview_tips: string[];
    created_at: string;
}

export interface CategoryScores {
    communication: number;
    technicalKnowledge: number;
    problemSolving: number;
    cultureFit: number;
    confidence: number;
    relevantExperience: number;
}

export interface QuestionFeedback {
    questionNumber: number;
    rating: 'excellent' | 'good' | 'average' | 'needs improvement';
    feedback: string;
}

// Interview setup form
export interface InterviewSetupData {
    jobRole: string;
    jobDescription: string;
    resumeText: string;
    questionCount: number;
}

// Voice/Speech types
export interface SpeechRecognitionState {
    isListening: boolean;
    transcript: string;
    interimTranscript: string;
    error: string | null;
    isSupported: boolean;
}

export interface TextToSpeechState {
    isSpeaking: boolean;
    isPaused: boolean;
    isSupported: boolean;
}

// Interview session state
export interface InterviewSession {
    interview: Interview;
    currentQuestionIndex: number;
    questions: string[];
    responses: InterviewResponse[];
    isAISpeaking: boolean;
    isUserSpeaking: boolean;
    transcript: string;
}
