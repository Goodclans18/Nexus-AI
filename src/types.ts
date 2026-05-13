export enum StepStatus {
  IDLE = 'idle',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface ProjectStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  details: string;
  codeSnippet?: string;
}
