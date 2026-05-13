import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Eye, 
  Brain, 
  GraduationCap, 
  Play, 
  CheckCircle2, 
  Circle,
  Terminal,
  Code2,
  Settings,
  Activity,
  Cpu,
  ChevronRight
} from 'lucide-react';
import { StepStatus, ProjectStep } from './types';
import { PYTHON_SCRIPTS } from './constants';

// Mock data based on user instructions
const INITIAL_STEPS: ProjectStep[] = [
  {
    id: '1',
    title: 'Preparando o Arsenal',
    description: 'Instalação das ferramentas essenciais: Python, OpenCV e PyTorch.',
    status: StepStatus.COMPLETED,
    details: 'Ambiente configurado com sucesso. Dependências prontas para coleta.',
    codeSnippet: PYTHON_SCRIPTS.PREP
  },
  {
    id: '2',
    title: 'Coleta de Dados',
    description: 'Capturando frames do jogo e seus inputs simultaneamente.',
    status: StepStatus.ACTIVE,
    details: 'Gravando 30 frames por segundo. Armazenando em data/buffer_v1.',
    codeSnippet: PYTHON_SCRIPTS.COLLECT
  },
  {
    id: '3',
    title: 'Cérebro da IA (CNN)',
    description: 'Construindo a Rede Neural Convolucional para visão computacional.',
    status: StepStatus.IDLE,
    details: 'Arquitetura: NexusNet v1. CNN otimizada para latência zero.',
    codeSnippet: PYTHON_SCRIPTS.BRAIN
  },
  {
    id: '4',
    title: 'Treinamento (Study)',
    description: 'A fase onde a IA aprende seu estilo de jogo através do erro.',
    status: StepStatus.IDLE,
    details: 'Aguardando massa de dados suficiente (mínimo 50k frames recomendados).',
    codeSnippet: PYTHON_SCRIPTS.TRAIN
  },
  {
    id: '5',
    title: 'Execução do Bot',
    description: 'Bot jogando em tempo real no SSF2.',
    status: StepStatus.IDLE,
    details: 'Loop de inferência latência alvo: <16ms.',
    codeSnippet: PYTHON_SCRIPTS.EXEC
  }
];

export default function App() {
  const [steps, setSteps] = React.useState(INITIAL_STEPS);
  const [activeStepId, setActiveStepId] = React.useState('2');

  const activeStep = steps.find(s => s.id === activeStepId);

  return (
    <div className="flex flex-col h-screen bg-[#0F1115] text-[#E2E8F0] font-sans selection:bg-[#3B82F6] selection:text-white overflow-hidden">
      {/* Header */}
      <header className="h-[60px] border-b border-[#2D333F] bg-[#1A1D23] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-[#3B82F6]" />
          <h1 className="text-lg font-bold tracking-tight">NEXUS AI</h1>
          <span className="badge-accent">Project B: Active</span>
        </div>
        <div className="flex gap-4 items-center terminal-text">
          <span className="text-[#10B981] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            FPS: 60.2
          </span>
          <span className="text-[#94A3B8]">CPU: 12.4%</span>
          <div className="w-[1px] h-4 bg-[#2D333F]"></div>
          <button className="text-[#94A3B8] hover:text-[#E2E8F0] transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="flex-1 grid grid-cols-[1fr_320px] grid-rows-[1fr_200px] overflow-hidden">
        
        {/* Viewport/Main Content */}
        <section className="bg-[#0F1115] p-6 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between terminal-text text-[#94A3B8] uppercase tracking-wider text-[11px]">
            <span>{activeStep?.title} &gt; VISUAL INPUT STREAM</span>
            <span>1280x720 @ 60fps</span>
          </div>
          
          <div className="flex-1 border border-[#2D333F] bg-black rounded-lg relative overflow-hidden flex items-center justify-center group shadow-2xl">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0,transparent_100%)]"></div>
             
             {/* Crosshair Overlay */}
             <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#3B82F6]"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#3B82F6]"></div>
             </div>

             {/* SSF2 Label */}
             <div className="text-[#2D333F] font-black text-6xl tracking-tighter opacity-20 rotate-[-5deg]">
                SSF2 PROJECT B
             </div>
             
             {/* Active Visual Overlays */}
             {parseInt(activeStepId!) >= 2 && (
               <AnimatePresence>
                 <motion.div 
                   key="p1"
                   animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
                   transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                   className="absolute w-24 h-40 border border-[#3B82F6] bg-[#3B82F6]/5 rounded p-2 flex flex-col justify-between"
                 >
                    <span className="text-[10px] text-[#3B82F6] font-mono font-bold">PLAYER_1 94%</span>
                    <div className="w-full h-1 bg-[#3B82F6]/20 rounded-full overflow-hidden">
                       <div className="w-4/5 h-full bg-[#3B82F6]"></div>
                    </div>
                 </motion.div>
                 <motion.div 
                   key="cpu"
                   animate={{ x: [100, 80, 100], y: [100, 110, 100] }}
                   transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                   className="absolute w-20 h-32 border border-red-500 bg-red-500/5 rounded p-2"
                 >
                    <span className="text-[10px] text-red-500 font-mono font-bold">CPU_ENEMY</span>
                 </motion.div>
               </AnimatePresence>
             )}

             {/* HUD Status */}
             <div className="absolute bottom-6 left-6 font-mono text-[11px] text-[#10B981] leading-relaxed drop-shadow-md">
                [CAPTURING FRAMES...]<br />
                [MODEL: nexus_v1_behav_clon.pth]<br />
                [INFERENCE: 4.2ms]
             </div>

             {/* Scanning Line */}
             <motion.div 
               animate={{ top: ['0%', '100%'] }} 
               transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
               className="absolute left-0 right-0 h-[1px] bg-[#3B82F6]/40 z-10 blur-[1px]"
             />
          </div>
        </section>

        {/* Sidebar */}
        <aside className="row-span-2 bg-[#1A1D23] border-l border-[#2D333F] p-5 flex flex-col gap-6 overflow-y-auto">
          <div>
            <div className="panel-label">Controls</div>
            <div className="grid gap-2">
              <button className="btn-primary flex items-center justify-center gap-2">
                <Play className="w-4 h-4 fill-current" />
                <span>START ENGINE</span>
              </button>
              <button className="btn-outline">RECORD DATASET</button>
            </div>
          </div>

          <div>
            <div className="panel-label">Workflow Progress</div>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStepId(step.id)}
                  className={`w-full text-left p-3 rounded border transition-colors flex items-center gap-3 ${
                    activeStepId === step.id 
                      ? 'bg-[#3B82F6]/10 border-[#3B82F6]' 
                      : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="shrink-0">
                    {step.status === StepStatus.COMPLETED && <CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
                    {step.status === StepStatus.ACTIVE && <Activity className="w-4 h-4 text-[#3B82F6] animate-pulse" />}
                    {step.status === StepStatus.IDLE && <Circle className="w-4 h-4 text-[#2D333F]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center text-[10px] terminal-text text-[#94A3B8] mb-0.5">
                      <span>0{idx+1}</span>
                      {activeStepId === step.id && <ChevronRight className="w-3 h-3 text-[#3B82F6]" />}
                    </div>
                    <div className="text-xs font-bold truncate">{step.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="panel-label">Model Stats</div>
            <div className="grid gap-3">
              <div className="stat-card">
                <div className="text-lg font-bold text-[#3B82F6] font-mono">94.2%</div>
                <div className="text-[10px] text-[#94A3B8] uppercase mt-1">Confidence</div>
              </div>
              <div className="stat-card">
                <div className="text-lg font-bold text-[#10B981] font-mono">0.0024</div>
                <div className="text-[10px] text-[#94A3B8] uppercase mt-1">Loss Rate</div>
              </div>
            </div>
          </div>

          <div>
             <div className="panel-label">Memory Architecture</div>
             <div className="bg-black rounded-lg p-4 flex justify-between items-center gap-2">
                {[1,2,3,4,5].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2.5 h-2.5 bg-[#3B82F6] rounded-full shadow-[0_0_8px_#3B82F6]"
                  />
                ))}
             </div>
             <p className="text-[10px] text-[#94A3B8] text-center mt-3 font-mono">CNN-LSTM Cascade (v4.2)</p>
          </div>
        </aside>

        {/* Bottom Bar: Logs and Output */}
        <section className="bg-[#1A1D23] border-t border-[#2D333F] flex overflow-hidden">
          {/* Logs */}
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            <div className="panel-label">
              <span>System Logs</span>
              <Terminal className="w-3 h-3" />
            </div>
            <div className="log-container flex-1">
               <div className="log-entry"><span className="text-[#3B82F6]">[14:22:01]</span> Connected to SSF2_Project_B.exe (PID: 4412)</div>
               <div className="log-entry"><span className="text-[#3B82F6]">[14:22:05]</span> Initializing PyTorch CUDA context...</div>
               <div className="log-entry"><span className="text-[#3B82F6]">[14:22:08]</span> Model weight 'nexus_v1' loaded successfully.</div>
               <div className="log-entry"><span className="text-[#10B981]">[ACTIVE]</span> Inference loop running at 60.2 FPS.</div>
               <div className="log-entry text-white/40 italic">&gt; {activeStep?.details}</div>
            </div>
          </div>

          {/* Keyboard / Code Output */}
          <div className="w-[400px] border-l border-[#2D333F] flex flex-col p-5 overflow-hidden">
             <div className="panel-label">
                <span>Network Output</span>
                <Code2 className="w-3 h-3" />
             </div>
             <div className="flex-1 bg-black rounded p-4 font-mono text-[11px] overflow-y-auto text-[#10B981]/80">
                <pre className="whitespace-pre-wrap">
                  {activeStep?.codeSnippet}
                </pre>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
