export enum StepStatus {
  IDLE = 'idle',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export enum KeyStatus {
  ACTIVE = 'active',
  EXHAUSTED = 'exhausted',
  COOLDOWN = 'cooldown'
}

export interface ApiKey {
  id: string;
  key: string;
  status: KeyStatus;
  usage: number;
}

export interface ProjectStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  details: string;
  codeSnippet?: string;
}

export interface CharacterIntel {
  id: string;
  name: string;
  tier: string;
  description: string;
  frameData: {
    move: string;
    startup: number;
    active: number;
    recovery: number;
    onShield: number;
  }[];
  spritesLoaded: boolean;
}

export interface GameState {
  p1Char: string;
  cpuChar: string;
  stage: string;
  detectedFrame?: number;
  activeMove?: string;
}
