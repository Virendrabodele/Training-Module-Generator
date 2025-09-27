
export interface QAItem {
  step: number;
  question: string;
  answer: string;
}

export enum Status {
  IDLE = 'idle',
  TRANSCRIBING = 'transcribing',
  GENERATING_QA = 'generating_qa',
  COMPLETE = 'complete',
  ERROR = 'error',
}
