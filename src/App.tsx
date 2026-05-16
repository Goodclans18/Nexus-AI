import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Activity, 
  Cpu, 
  Play, 
  CheckCircle2, 
  Circle,
  Terminal,
  Code2,
  Settings,
  ChevronRight,
  ShieldAlert,
  RotateCw,
  Key,
  Download,
  Upload,
  Link,
  Info
} from 'lucide-react';
import { StepStatus, ProjectStep, KeyStatus, ApiKey } from './types';
import { PYTHON_SCRIPTS } from './constants';

const INITIAL_STEPS: ProjectStep[] = [
  {
    id: '1',
    title: 'Preparando o Arsenal',
    description: 'Instalação das ferramentas essenciais: Python, OpenCV e PyTorch.',
    status: StepStatus.COMPLETED,
    details: 'Ambiente configurado. Dependências prontas para ponte local.',
    codeSnippet: PYTHON_SCRIPTS.PREP
  },
  {
    id: '2',
    title: 'Coleta de Dados',
    description: 'Capturando frames do jogo e seus inputs simultaneamente.',
    status: StepStatus.ACTIVE,
    details: 'Gravando 60 FPS. Armazenando em datasets/SSF2_v1.',
    codeSnippet: PYTHON_SCRIPTS.COLLECT
  },
  {
    id: '3',
    title: 'Cérebro da IA (CNN)',
    description: 'Construindo a Rede Neural Convolucional para visão computacional.',
    status: StepStatus.IDLE,
    details: 'NexusNet v1: Arquitetura otimizada para mínima latência.',
    codeSnippet: PYTHON_SCRIPTS.BRAIN
  },
  {
    id: '4',
    title: 'Treinamento (Study)',
    description: 'A fase onde a IA aprende seu estilo de jogo através do erro.',
    status: StepStatus.IDLE,
    details: 'Necessário 50k frames. Progresso atual: 12k.',
    codeSnippet: PYTHON_SCRIPTS.TRAIN
  },
  {
    id: '5',
    title: 'Execução do Bot',
    description: 'Bot jogando em tempo real no SSF2.',
    status: StepStatus.IDLE,
    details: 'Pronto para inferência local.',
    codeSnippet: PYTHON_SCRIPTS.EXEC
  }
];

const INITIAL_KEYS: ApiKey[] = [
  { id: '1', key: 'sk-...4f2a', status: KeyStatus.ACTIVE, usage: 42 },
  { id: '2', key: 'sk-...9d11', status: KeyStatus.ACTIVE, usage: 0 },
];

export default function App() {
  const [steps, setSteps] = useState(INITIAL_STEPS);
  const [activeStepId, setActiveStepId] = useState('2');
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Inicializando Nexus AI Dashboard...",
    "[NETWORK] Tentando conectar à ponte local (localhost:3000)...",
    "[INFO] Dashboard rodando em modo web. Use a ponte Python para controle total."
  ]);
  const [currentPrediction, setCurrentPrediction] = useState<{ action: string; confidence: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeStep = steps.find(s => s.id === activeStepId);

  useEffect(() => {
    // Poll server for status
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setConnected(data.active);
      } catch (e) {
        setConnected(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-100), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const simulatePrediction = async () => {
    addLog("Invocando cérebro (API Predict)...");
    try {
      const res = await fetch('/api/predict', { method: 'POST' });
      const data = await res.json();
      setCurrentPrediction({ action: data.action, confidence: data.confidence });
      addLog(`AI sugeriu: ${data.action} (${data.confidence} confiabilidade)`);
    } catch (e) {
      addLog("Erro ao conectar com a IA.");
    }
  };

  const downloadAgent = () => {
    const blob = new Blob([PYTHON_SCRIPTS.EXEC], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus_agent.py';
    a.click();
    addLog("Agente baixado. Siga as instruções do Passo 1.");
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F1115] text-[#E2E8F0] select-none overflow-hidden">
      {/* Top Navigation / Status Bar */}
      <header className="h-[50px] border-b border-[#2D333F] bg-[#16181D] flex items-center justify-between px-6 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#3B82F6] fill-[#3B82F6]" />
            <span className="font-bold tracking-tighter text-sm uppercase">Nexus AI Bridge</span>
          </div>
          <div className="h-4 w-[1px] bg-[#2D333F]"></div>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-black/40 border border-white/5">
            <div className={`status-dot ${connected ? 'bg-[#10B981]' : 'bg-[#EF4444] animate-pulse'}`}></div>
            <span className="terminal-text uppercase text-[10px] tracking-widest">
              {connected ? 'Local Agent Connected' : 'Waiting for Bridge...'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6 terminal-text">
          <div className="flex gap-4 text-[#94A3B8]">
            <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> 14%</span>
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> 1.2ms</span>
          </div>
          <button className="text-[#94A3B8] hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workbench */}
      <main className="flex-1 grid grid-cols-[300px_1fr_350px] overflow-hidden">
        
        {/* Left: Project Explorer */}
        <aside className="border-r border-[#2D333F] bg-[#0F1115] p-4 flex flex-col gap-6 overflow-y-auto">
          <div>
            <span className="terminal-text text-[#94A3B8] uppercase block mb-3">Workflow Module</span>
            <div className="space-y-1">
              {steps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStepId(step.id)}
                  className={`w-full p-3 flex gap-3 text-left transition-all ${
                    activeStepId === step.id 
                      ? 'bg-[#3B82F6]/10 text-white border-l-2 border-[#3B82F6]' 
                      : 'text-[#94A3B8] hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                >
                  <div className="mt-1 shrink-0">
                    {step.status === StepStatus.COMPLETED && <CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
                    {step.status === StepStatus.ACTIVE && <Activity className="w-4 h-4 text-[#3B82F6] animate-pulse" />}
                    {step.status === StepStatus.IDLE && <Circle className="w-4 h-4 opacity-20" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] mb-0.5 opacity-50 font-mono">0{idx+1}</div>
                    <div className="text-xs font-bold truncate tracking-tight">{step.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="terminal-text text-[#94A3B8] uppercase block mb-3">Local Bridge Agent</span>
            <div className="p-4 hardware-card bg-black/20 space-y-3">
              <div className="flex items-center gap-2">
                <Link className="w-3 h-3 text-[#3B82F6]" />
                <span className="text-[10px] font-bold">nexus_agent_v1.py</span>
              </div>
              <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                Este script permite que o Dashboard controle o jogo SSF2 no seu computador.
              </p>
              <button 
                onClick={downloadAgent}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-[10px] font-bold flex items-center justify-center gap-2 rounded border border-white/10"
              >
                <Download className="w-3 h-3" /> BAIXAR AGENTE
              </button>
            </div>
          </div>
        </aside>

        {/* Center: Main Viewport / Control Surface */}
        <section className="bg-[#0F1115] flex flex-col overflow-hidden">
          <div className="p-6 pb-2">
             <div className="flex items-center justify-between terminal-text text-[#94A3B8] mb-4">
                <span className="flex items-center gap-2"><Activity className="w-3 h-3" /> LIVE STREAM: {activeStep?.title}</span>
                <span>ENC: H.264 // 60 FPS</span>
             </div>
             
             {/* Virtual Screen */}
             <div className="aspect-video bg-black rounded border border-[#2D333F] relative group overflow-hidden shadow-[0_0_50px_rgba(30,32,38,0.5)]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10 opacity-30"></div>
                
                {/* Simulated Game Layer */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <h2 className="text-[#2D333F] font-black text-7xl tracking-tighter opacity-10 select-none -rotate-3">SSF2 PROJECT B</h2>
                   {!connected && (
                     <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                        <div className="flex items-center gap-4 p-4 rounded bg-black/80 border border-white/5 backdrop-blur">
                            <Link className="w-5 h-5 text-[#EF4444] animate-pulse" />
                            <span className="text-xs font-bold text-[#E2E8F0]">CONECTE O AGENTE LOCAL PARA VER O FEED</span>
                        </div>
                        <button className="btn-secondary text-[10px]" onClick={simulatePrediction}>
                          TESTAR VISÃO DA IA (SIMULADO)
                        </button>
                     </div>
                   )}
                </div>

                {/* AI Overlay (If prediction exists or connected) */}
                <AnimatePresence>
                  {(currentPrediction || connected) && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 pointer-events-none"
                    >
                       <div className="absolute top-1/2 left-1/3 w-20 h-40 border border-[#3B82F6] bg-[#3B82F6]/5 p-2">
                          <span className="text-[9px] text-[#3B82F6] font-mono">P1 // TRACKING</span>
                       </div>
                       <div className="absolute bottom-10 left-10 p-4 rounded bg-black/80 border border-white/10 backdrop-blur min-w-[200px]">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-[10px] terminal-text text-[#94A3B8]">NEXT DECISION</span>
                             <span className="text-[10px] text-[#10B981] font-bold">READY</span>
                          </div>
                          <div className="text-2xl font-black text-white flex items-center justify-between">
                            {currentPrediction?.action || 'IDLE'}
                            <span className="text-xs text-[#3B82F6]">{currentPrediction?.confidence || '0.00'}</span>
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Scanline */}
                <motion.div 
                  animate={{ top: ['0%', '100%'] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-px bg-[#3B82F6]/20 z-10"
                />
             </div>
          </div>

          {/* Workbench Controls */}
          <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
             <div className="flex gap-4">
                <button onClick={simulatePrediction} className="btn-primary">
                  <Play className="w-4 h-4 fill-current" />
                  START IA SESSION
                </button>
                <button className="btn-secondary">
                  <Upload className="w-4 h-4" />
                  IMPORT DATASET
                </button>
                <button className="btn-secondary">
                  <Activity className="w-4 h-4" />
                  DEBUG VIEW
                </button>
             </div>

             <div className="flex-1 overflow-hidden flex flex-col">
                <div className="panel-label flex items-center justify-between">
                  <span>Code Workspace - python_bridge.py</span>
                  <Code2 className="w-3 h-3" />
                </div>
                <div className="flex-1 bg-black/40 border border-[#2D333F] rounded p-4 font-mono text-[11px] overflow-y-auto text-[#10B981]/80 shadow-inner">
                   <pre className="whitespace-pre-wrap">{activeStep?.codeSnippet}</pre>
                </div>
             </div>
          </div>
        </section>

        {/* Right: Monitoring & Key Pool */}
        <aside className="border-l border-[#2D333F] bg-[#16181D] p-5 flex flex-col gap-6 overflow-y-auto shadow-[-10px_0_30px_rgba(0,0,0,0.2)]">
          <div>
            <div className="panel-label mb-4">Neural Architecture (v4)</div>
            <div className="hardware-card p-4 bg-black/40 flex flex-col gap-4">
               <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                     {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse"></div>)}
                  </div>
                  <span className="text-[10px] text-[#10B981] font-bold">OPTIMIZED</span>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#94A3B8]">CONV LAYERS</span>
                    <span className="font-bold">03</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div animate={{ width: '80%' }} className="h-full bg-[#3B82F6]" />
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#94A3B8]">DENSE LAYERS</span>
                    <span className="font-bold">02</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div animate={{ width: '40%' }} className="h-full bg-[#3B82F6]" />
                  </div>
               </div>
            </div>
          </div>

          <div>
            <div className="panel-label mb-4">API Token Rotation</div>
            <div className="space-y-3">
              {keys.map((k, i) => (
                <div key={k.id} className="hardware-card p-3 bg-black/20 group hover:border-[#3B82F6]/40 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Key className="w-3 h-3 text-[#3B82F6]" />
                      <span className="text-[10px] font-bold">MASTER_KEY_{i+1}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] font-bold">ACTIVE</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3B82F6]" style={{ width: `${k.usage}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-2 text-[9px] text-[#94A3B8] font-mono">
                    <span>{k.key}</span>
                    <span>{k.usage}% QUOTA</span>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-[#94A3B8] rounded border border-dashed border-[#2D333F]">
                + ADD BACKUP KEY
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="panel-label mb-2 flex items-center justify-between">
              <span>System Output</span>
              <Terminal className="w-3 h-3" />
            </div>
            <div 
              ref={scrollRef}
              className="flex-1 glass-card bg-black p-3 terminal-text text-[#94A3B8] overflow-y-auto space-y-1 scroll-smooth"
            >
              {logs.map((log, i) => (
                <div key={i} className="animate-in slide-in-from-left duration-200">
                  {log}
                </div>
              ))}
              <div className="h-4 w-1 bg-[#3B82F6] animate-pulse inline-block"></div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Info / Safety */}
      <footer className="h-[40px] border-t border-[#2D333F] bg-[#16181D] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 text-[10px] text-[#94A3B8]">
              <Info className="w-3 h-3" />
              <span>LICENÇA: NEXUS_CORE_PERSONAL_EDITION</span>
           </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-[#EF4444] animate-pulse">
           <ShieldAlert className="w-3 h-3" />
           CUIDADO: CONTROLE SIMULADO ATIVO
        </div>
      </footer>
    </div>
  );
}
