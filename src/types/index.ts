export interface Student {
  id: string;
  full_name: string;
  national_id: string;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_option: 'A' | 'B' | 'C' | 'D';
  points: number;
  options_count?: number; // عدد الخيارات: 2 أو 3 أو 4
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  student_id: string;
  quiz_id: string;
  question_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D' | null;
  is_correct: boolean | null;
  points_earned: number;
  created_at: string;
  updated_at: string;
}

export interface QuizSubmission {
  id: string;
  student_id: string;
  quiz_id: string;
  total_points: number;
  has_submitted: boolean;
  submission_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  student_id: string;
  full_name: string;
  total_points: number;
  rank: number;
}
