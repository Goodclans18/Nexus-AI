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
  Info,
  Power,
  Database,
  Square,
  ShieldCheck,
  Lock,
  Eye
} from 'lucide-react';
import { StepStatus, ProjectStep, KeyStatus, ApiKey, GameState } from './types';
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

interface Dataset {
  id: string;
  name: string;
  frames: number;
  date: string;
  size: string;
}

const CHAR_DATABASE: Record<string, any> = {
  "Mario": { startup: 3, active: 4, recovery: 12, shield: -2, tier: 'A' },
  "Link": { startup: 6, active: 3, recovery: 18, shield: -5, tier: 'B' },
  "Kirby": { startup: 2, active: 5, recovery: 10, shield: -1, tier: 'S' },
  "Pikachu": { startup: 1, active: 3, recovery: 8, shield: 0, tier: 'S' },
  "Sonic": { startup: 2, active: 4, recovery: 15, shield: -4, tier: 'A' },
  "Ichigo": { startup: 4, active: 6, recovery: 20, shield: -7, tier: 'B' },
  "Naruto": { startup: 3, active: 4, recovery: 14, shield: -3, tier: 'A' },
  "Desconhecido": { startup: 0, active: 0, recovery: 0, shield: 0, tier: '?' }
};

export default function App() {
  const [steps, setSteps] = useState(INITIAL_STEPS);
  const [activeStepId, setActiveStepId] = useState('2');
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [connected, setConnected] = useState(false);
  const [running, setRunning] = useState(false);
  const [safetyLock, setSafetyLock] = useState(false);
  const [controlMode, setControlMode] = useState<'PASSIVE' | 'OVERRIDE'>('PASSIVE');
  const [gamePath, setGamePath] = useState<string>(localStorage.getItem('nexus_game_path') || 'C:/Games/SSF2');
  const [showSettings, setShowSettings] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    p1Char: "Mario",
    cpuChar: "Link",
    stage: "Final Destination",
    detectedFrame: 0,
    activeMove: "Idle"
  });

  const currentCharData = CHAR_DATABASE[gameState.p1Char] || CHAR_DATABASE["Desconhecido"];
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Inicializando Nexus AI Dashboard...",
    "[INFO] Carregando arquivos locais arquivados..."
  ]);
  const [currentPrediction, setCurrentPrediction] = useState<{ action: string; confidence: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeStep = steps.find(s => s.id === activeStepId);

  // Persistence: Load datasets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nexus_datasets');
    if (saved) {
      try {
        setDatasets(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar datasets locais", e);
      }
    } else {
      const initial: Dataset[] = [
        { id: 'ds1', name: 'Training_Set_Alpha', frames: 12450, date: '2024-05-10', size: '1.2GB' },
        { id: 'ds2', name: 'Combo_Patterns_Beta', frames: 3200, date: '2024-05-12', size: '240MB' }
      ];
      setDatasets(initial);
      localStorage.setItem('nexus_datasets', JSON.stringify(initial));
    }
  }, []);

  useEffect(() => {
    // Poll server for status
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setConnected(data.active);
        setRunning(data.running);
        setSafetyLock(data.safetyLock);
        
        if (data.safetyLock && data.running) {
           handlePanicStop();
        }

        if (data.gameState) setGameState(data.gameState);
      } catch (e) {
        setConnected(false);
        setRunning(false);
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

  const handleShutdown = async () => {
    setIsShuttingDown(true);
    addLog("Comando de interrupção total recebido...");
    try {
      await fetch('/api/shutdown', { method: 'POST' });
      addLog("Sistema encerrado com sucesso.");
      setConnected(false);
      setRunning(false);
      setCurrentPrediction(null);
    } catch (e) {
      addLog("Erro ao comunicar desligamento.");
    } finally {
      setTimeout(() => setIsShuttingDown(false), 2000);
    }
  };

  const handlePanicStop = async () => {
    addLog("!!! FAILSAFE ACIONADO: Interrupção de Emergência !!!");
    try {
      await fetch('/api/safety/failsafe', { method: 'POST' });
      setRunning(false);
      setControlMode('PASSIVE');
    } catch (e) {
      addLog("Erro crítico na comunicação de segurança.");
    }
  };

  const toggleEngine = async () => {
    if (safetyLock) {
      addLog("ERRO: Sistema bloqueado por protocolos de segurança.");
      return;
    }
    if (running) {
      await fetch('/api/stop', { method: 'POST' });
      addLog("Sistema em modo PASSIVO (Apenas Monitoramento).");
      setRunning(false);
      setControlMode('PASSIVE');
    } else {
      await fetch('/api/start', { method: 'POST' });
      addLog("Sistema em modo OVERRIDE (Nexus AI no controle).");
      setRunning(true);
      setControlMode('OVERRIDE');
      simulatePrediction();
    }
  };

  const saveGamePath = (path: string) => {
    setGamePath(path);
    localStorage.setItem('nexus_game_path', path);
    addLog(`Diretório do jogo atualizado: ${path}`);
  };

  const handleDeepScan = async () => {
    setIsScanning(true);
    addLog(`Iniciando varredura em: ${gamePath}...`);
    try {
      const res = await fetch('/api/scan', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: gamePath })
      });
      const data = await res.json();
      setGameState(data.gameState);
      addLog(`Identificado: ${data.gameState.p1Char} vs ${data.gameState.cpuChar} em ${data.gameState.stage}`);
      addLog("Sprites e Frame Data extraídos com sucesso.");
    } catch (e) {
      addLog("Erro ao acessar arquivos do jogo. Verifique permissões da ponte.");
    } finally {
      setTimeout(() => setIsScanning(false), 2000);
    }
  };

  const simulatePrediction = async () => {
    if (!running && !connected) return;
    
    addLog("Processando decisão via IA...");
    try {
      const res = await fetch('/api/predict', { method: 'POST' });
      const data = await res.json();
      setCurrentPrediction({ action: data.action, confidence: data.confidence });
      addLog(`Mapeado: ${data.action} (${data.confidence})`);
      
      if (Math.random() > 0.8) {
        saveDatasetFrame();
      }
    } catch (e) {
      addLog("Latência de rede excedida.");
    }
  };

  const saveDatasetFrame = () => {
    setDatasets(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[0] = { ...updated[0], frames: updated[0].frames + 1 };
      }
      localStorage.setItem('nexus_datasets', JSON.stringify(updated));
      return updated;
    });
  };

  const downloadAgent = () => {
    const blob = new Blob([PYTHON_SCRIPTS.EXEC], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus_agent.py';
    a.click();
    addLog("Agente baixado para uso offline.");
  };

  return (
    <div className={`flex flex-col h-screen bg-[#0F1115] text-[#E2E8F0] select-none overflow-hidden transition-all duration-1000 ${isShuttingDown ? 'grayscale brightness-50 contrast-125 translate-y-full opacity-0' : 'opacity-100'}`}>
      {/* Top Navigation / Status Bar */}
      <header className="h-[50px] border-b border-[#2D333F] bg-[#16181D] flex items-center justify-between px-6 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${connected ? 'text-[#3B82F6]' : 'text-zinc-600'} fill-current`} />
            <span className="font-bold tracking-tighter text-sm uppercase">Nexus AI Bridge</span>
          </div>
          <div className="h-4 w-[1px] bg-[#2D333F]"></div>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-black/40 border border-white/5">
            <div className={`status-dot ${connected ? 'bg-[#10B981]' : 'bg-[#EF4444] animate-pulse'}`}></div>
            <span className="terminal-text uppercase text-[10px] tracking-widest px-1">
              {connected ? (running ? 'ENGINE RUNNING' : 'LOCAL BRIDGE READY') : 'OFFLINE MODE'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6 terminal-text">
          <div className="flex gap-4">
            <div className={`flex items-center gap-2 p-1.5 px-3 rounded-full border transition-all ${running ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#3B82F6]' : 'bg-zinc-800/50 border-zinc-700 text-zinc-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-[#3B82F6] animate-pulse' : 'bg-zinc-600'}`}></div>
              <span className="text-[9px] font-black tracking-[0.2em] uppercase">{controlMode === 'OVERRIDE' ? 'AI_OVERRIDE_ACTIVE' : 'PASSIVE_MONITORING'}</span>
            </div>
            <div className="flex gap-4 text-[#94A3B8]">
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {running ? '24%' : '4%'}</span>
              <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {running ? '4.2ms' : '-'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded bg-black/20 border ${safetyLock ? 'border-red-500 text-red-500' : 'border-emerald-500/30 text-emerald-500'}`}>
               <ShieldCheck className={`w-3 h-3 ${safetyLock ? 'animate-bounce' : ''}`} />
               <span className="text-[9px] font-black uppercase tracking-tighter">
                 {safetyLock ? 'Safety Breach' : 'Bridge Secure'}
               </span>
            </div>
            <button 
              onClick={handleShutdown}
              className="p-1.5 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-colors group relative"
              title="Encerrar Sistema"
            >
              <Power className="w-4 h-4" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap border border-white/10 pointer-events-none">KILL PROCESS</span>
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="text-[#94A3B8] hover:text-white transition-colors p-1.5 rounded hover:bg-white/5"
              title="Configurações Locais"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workbench */}
      <main className="flex-1 grid grid-cols-[300px_1fr_350px] overflow-hidden">
        
        {/* Left: Project Explorer */}
        <aside className="border-r border-[#2D333F] bg-[#0F1115] p-4 flex flex-col gap-6 overflow-y-auto">
          <div>
            <span className="panel-label">Workflow Module</span>
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
            <span className="panel-label">Archived Datasets (Offline)</span>
            <div className="space-y-2">
              {datasets.map(ds => (
                <div key={ds.id} className="p-3 bg-black/20 border border-[#2D333F] rounded hover:border-zinc-700 transition-colors">
                   <div className="flex items-center gap-2 mb-1">
                      <Database className="w-3 h-3 text-[#3B82F6]" />
                      <span className="text-[10px] font-bold truncate">{ds.name}</span>
                   </div>
                   <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                      <span>{ds.frames.toLocaleString()} frames</span>
                      <span>{ds.size}</span>
                   </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 py-2 bg-white/5 hover:bg-white/10 text-[9px] font-bold text-zinc-500 rounded border border-dashed border-[#2D333F]">
              + IMPORT OFFLINE DATA
            </button>
          </div>

          <div>
            <span className="panel-label">Active Intelligence: {gameState.p1Char}</span>
            <div className="hardware-card bg-black/40 p-4 space-y-4">
               <div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2 font-black flex justify-between">
                    <span>Frame Data Summary</span>
                    <span className="text-blue-500">TIER {currentCharData.tier}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                     <div className="p-2 bg-white/5 rounded border border-white/5">
                        <div className="opacity-50 font-mono">Startup</div>
                        <div className="text-white font-bold">{currentCharData.startup}F</div>
                     </div>
                     <div className="p-2 bg-white/5 rounded border border-white/5">
                        <div className="opacity-50 font-mono">Active</div>
                        <div className="text-white font-bold">{currentCharData.active}F</div>
                     </div>
                     <div className="p-2 bg-white/5 rounded border border-white/5">
                        <div className="opacity-50 font-mono">Recovery</div>
                        <div className="text-white font-bold">{currentCharData.recovery}F</div>
                     </div>
                     <div className="p-2 bg-white/5 rounded border border-white/5">
                        <div className="opacity-50 font-mono">Shield</div>
                        <div className={`font-bold ${currentCharData.shield >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                          {currentCharData.shield > 0 ? '+' : ''}{currentCharData.shield}F
                        </div>
                     </div>
                  </div>
               </div>
               
               <div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2 font-black">Movement Analytics</div>
                  <div className="text-[10px] space-y-2">
                     <div className="flex justify-between">
                        <span className="opacity-50">Ground Speed</span>
                        <span className="text-[#10B981]">OPTIMAL</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="opacity-50">Recovery Route</span>
                        <span className="text-[#3B82F6]">MAPPED</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div>
            <span className="panel-label">Safety Protocols</span>
            <div className={`hardware-card p-4 flex flex-col gap-3 transition-colors ${safetyLock ? 'border-red-500 bg-red-500/5' : 'bg-black/40'}`}>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Lock className={`w-3 h-3 ${safetyLock ? 'text-red-500' : 'text-emerald-500'}`} />
                     <span className="text-[10px] font-bold">Encrypted Tunnel</span>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${safetyLock ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></div>
               </div>
               
               <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-zinc-500">
                     <span>Input Randomized</span>
                     <span className="text-zinc-300">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-zinc-500">
                     <span>Human Latency</span>
                     <span className="text-zinc-300">ENABLE (50ms)</span>
                  </div>
               </div>

               {running && (
                 <button 
                   onClick={handlePanicStop}
                   className="w-full mt-2 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-500 text-[9px] font-bold rounded border border-red-500/30 transition-all uppercase tracking-widest"
                 >
                   Emergency Panic Stop
                 </button>
               )}
            </div>
          </div>
        </aside>

        {/* Center: Main Viewport / Control Surface */}
        <section className="bg-[#0F1115] flex flex-col overflow-hidden">
          <div className="p-6 pb-2">
             <div className="flex items-center justify-between terminal-text text-[#94A3B8] mb-4">
                <span className="flex items-center gap-2 uppercase tracking-widest"><Activity className="w-3 h-3 text-[#3B82F6]" /> Live Session Engine</span>
                <span>ENC: H.264 // 60 FPS</span>
             </div>
             
             {/* Virtual Screen */}
             <div className="aspect-video bg-black rounded border border-[#2D333F] relative group overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-[#000] z-0 overflow-hidden">
                   {/* Grid Background */}
                   <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                   {isShuttingDown ? (
                     <div className="flex flex-col items-center gap-2">
                        <RotateCw className="w-8 h-8 text-white animate-spin" />
                        <span className="terminal-text text-white">SYSTEM_SHUTDOWN_IN_PROGRESS</span>
                     </div>
                   ) : !connected ? (
                     <div className="flex flex-col items-center gap-4 text-center p-8">
                        <Link className="w-12 h-12 text-[#EF4444] mb-2" />
                        <h3 className="text-xl font-bold tracking-tight">PONTE DESCONECTADA</h3>
                        <p className="text-sm text-zinc-500 max-w-xs">
                          O dashboard não detectou o agente local. Baixe o script ao lado e execute-o para iniciar a ponte de comando.
                        </p>
                        <button onClick={downloadAgent} className="btn-secondary mt-4">
                          OBTER nexus_agent.py
                        </button>
                     </div>
                   ) : (
                     <div className="relative w-full h-full">
                        {/* Simulated UI labels */}
                        <div className="absolute top-4 left-4 p-2 bg-black/60 border border-white/10 backdrop-blur rounded">
                           <span className="text-[10px] text-[#10B981] font-bold flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></div>
                              CAPTURA ATIVA
                           </span>
                        </div>

                        {/* Prediction Visual */}
                        <AnimatePresence>
                          {currentPrediction && !isScanning && (
                            <motion.div 
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className="absolute bottom-10 left-10 p-6 rounded-lg bg-black/90 border border-[#3B82F6]/30 backdrop-blur shadow-2xl min-w-[240px]"
                            >
                               <div className="flex justify-between items-center mb-4">
                                  <span className="text-[11px] text-zinc-500 font-bold tracking-widest uppercase">Decisão Neural</span>
                                  <div className="px-2 py-0.5 bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-bold rounded">LIVE</div>
                               </div>
                               <div className="flex items-end justify-between gap-8">
                                  <div>
                                     <div className="text-4xl font-black text-white tracking-tighter leading-none mb-1">
                                       {currentPrediction.action}
                                     </div>
                                     <div className="text-[10px] text-zinc-400 font-mono tracking-wider">PREDICTED ACTION</div>
                                  </div>
                                  <div className="text-right">
                                     <div className="text-xl font-bold text-[#3B82F6] font-mono">{currentPrediction.confidence}</div>
                                     <div className="text-[10px] text-zinc-400 font-mono">CONFIDENCE</div>
                                  </div>
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Scanner Visual Overlay */}
                        <AnimatePresence>
                          {isScanning && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm flex flex-col items-center justify-center z-50"
                            >
                              <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden mb-4 border border-white/5">
                                <motion.div 
                                  animate={{ x: [-256, 256] }}
                                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                  className="w-full h-full bg-blue-500 shadow-[0_0_15px_#3B82F6]"
                                />
                              </div>
                              <span className="terminal-text text-white text-lg animate-pulse tracking-widest uppercase">SCANNING_GAME_FILES...</span>
                              <span className="text-[10px] text-blue-400 font-mono mt-2 uppercase tracking-widest">EXTRACTING_FRAMEDATA_AND_SPRITES</span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Character Info Banner */}
                        {connected && !isScanning && (
                          <div className="absolute top-4 right-4 flex gap-2">
                             <div className="px-3 py-1.5 bg-black/80 border border-white/10 backdrop-blur rounded flex items-center gap-3 shadow-xl">
                                <div className="text-right">
                                   <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">P1 Character</div>
                                   <div className="text-xs font-black text-[#3B82F6] uppercase">{gameState.p1Char}</div>
                                </div>
                                <div className="w-8 h-8 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center overflow-hidden">
                                   <span className="text-xs font-black text-blue-400">{gameState.p1Char?.[0] || '?'}</span>
                                </div>
                             </div>
                             <div className="px-3 py-1.5 bg-black/80 border border-white/10 backdrop-blur rounded flex items-center gap-3 shadow-xl">
                                <div className="w-8 h-8 rounded bg-red-500/20 border border-red-500/30 flex items-center justify-center overflow-hidden">
                                   <span className="text-xs font-black text-red-400">{gameState.cpuChar?.[0] || '?'}</span>
                                </div>
                                <div className="text-left">
                                   <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">CPU Player</div>
                                   <div className="text-xs font-black text-[#EF4444] uppercase">{gameState.cpuChar}</div>
                                </div>
                             </div>
                          </div>
                        )}
                     </div>
                   )}
                </div>

                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20"></div>
                
                <motion.div 
                  animate={{ top: ['0%', '100%'] }} 
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-[2px] bg-[#3B82F6]/30 z-30 shadow-[0_0_15px_#3B82F6]"
                />
             </div>
          </div>

          {/* Workbench Controls */}
          <div className="flex-1 p-6 pt-0 flex flex-col gap-6 overflow-hidden">
             <div className="flex items-center gap-4">
                <button 
                  onClick={toggleEngine} 
                  disabled={!connected || isShuttingDown}
                  className={`flex-1 ${running ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 text-white'} flex items-center justify-center gap-3 px-8 py-4 rounded font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl border border-white/5 relative overflow-hidden group`}
                >
                  <div className={`absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out`}></div>
                  {running ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  <span>{running ? 'DESATIVAR IA (VOLTAR AO JOGO)' : 'ATIVAR NEXUS IA'}</span>
                </button>
                
                <div className="flex gap-2">
                  <button 
                    onClick={handleDeepScan}
                    disabled={!connected || isShuttingDown || isScanning}
                    className="btn-secondary h-[54px] px-6 text-blue-400 border-blue-500/30 hover:bg-blue-500/10" 
                    title="Varredura Profunda"
                  >
                    <RotateCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                  </button>
                  <button className="btn-secondary h-[54px] px-6" disabled={isShuttingDown} title="Exportar Dados">
                    <Upload className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="btn-secondary h-[54px] px-6" 
                    disabled={isShuttingDown} 
                    title="Configurações"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
             </div>

             <div className="flex-1 overflow-hidden flex flex-col">
                <div className="panel-label flex items-center justify-between">
                  <span>Current Module: {activeStep?.title}</span>
                  <Code2 className="w-3 h-3 opacity-40" />
                </div>
                <div className="flex-1 bg-black/40 border border-[#2D333F] rounded p-4 font-mono text-[11px] overflow-y-auto text-[#10B981]/80 shadow-inner scroll-smooth">
                   <pre className="whitespace-pre-wrap">{activeStep?.codeSnippet}</pre>
                </div>
             </div>
          </div>
        </section>

        {/* Right: Monitoring & Key Pool */}
        <aside className="border-l border-[#2D333F] bg-[#16181D] p-5 flex flex-col gap-6 overflow-y-auto shadow-[-10px_0_30px_rgba(0,0,0,0.2)]">
          <div>
            <div className="panel-label">Hardware Profile</div>
            <div className="hardware-card p-4 bg-black/40 flex flex-col gap-4">
               <div className="flex justify-between items-center">
                  <div className="flex gap-1.5">
                     {[1,2,3].map(i => <div key={i} className={`w-2 h-2 rounded-full ${running ? 'bg-[#3B82F6]' : 'bg-zinc-700'} animate-pulse`}></div>)}
                  </div>
                  <span className={`text-[10px] font-bold ${running ? 'text-[#10B981]' : 'text-zinc-600'}`}>
                    {running ? 'PROCESSING...' : 'STANDBY'}
                  </span>
               </div>
               <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-[9px] text-zinc-500 mb-1">
                      <span className="uppercase tracking-widest">Tensor Core Load</span>
                      <span className="font-bold text-white">{running ? '42%' : '0%'}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div animate={{ width: running ? '42%' : '0%' }} className="h-full bg-[#3B82F6]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-[9px] text-zinc-500 mb-1">
                      <span className="uppercase tracking-widest">Memory Buffer</span>
                      <span className="font-bold text-white">{running ? '128MB' : '12MB'}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div animate={{ width: running ? '15%' : '2%' }} className="h-full bg-[#10B981]" />
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div>
            <div className="panel-label flex items-center justify-between">
              <span>Token Rotation Pool</span>
              <RotateCw className={`w-3 h-3 text-zinc-600 ${running ? 'animate-spin' : ''}`} />
            </div>
            <div className="space-y-2">
              {keys.map((k, i) => (
                <div key={k.id} className={`hardware-card p-3 bg-black/20 group relative overflow-hidden ${k.status === KeyStatus.ACTIVE ? 'border-[#3B82F6]/40' : 'opacity-40'}`}>
                   {k.status === KeyStatus.ACTIVE && running && (
                     <div className="absolute inset-y-0 left-0 w-0.5 bg-[#3B82F6] animate-pulse"></div>
                   )}
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <Key className={`w-3 h-3 ${k.status === KeyStatus.ACTIVE ? 'text-[#3B82F6]' : 'text-zinc-600'}`} />
                      <span className="text-[10px] font-bold tracking-tight">ROTA_ENTRY_0{i+1}</span>
                    </div>
                  </div>
                  <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: `${k.usage}%` }} 
                      className={`h-full ${k.usage > 80 ? 'bg-red-500' : 'bg-[#3B82F6]'}`} 
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[8px] text-zinc-500 font-mono">
                    <span className="italic">{k.key}</span>
                    <span>{k.usage}% USE</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="panel-label flex items-center justify-between">
              <span>System Logs</span>
              <Terminal className="w-3 h-3 opacity-40" />
            </div>
            <div 
              ref={scrollRef}
              className="flex-1 hardware-card bg-black p-3 terminal-text text-zinc-500 overflow-y-auto space-y-1.5 scroll-smooth border-white/5"
            >
              {logs.map((log, i) => (
                <div key={i} className="animate-in slide-in-from-left duration-200 leading-tight">
                  {log}
                </div>
              ))}
              <div className="flex items-center gap-1">
                 <div className="w-1 h-3 bg-[#3B82F6] animate-pulse"></div>
                 <span className="text-zinc-700 italic">Listening for local events...</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-[30px] border-t border-[#2D333F] bg-[#0C0E12] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
              <Info className="w-3 h-3" />
              <span>Personal Nexus Edition // v2.48-STABLE</span>
           </div>
           <div className="h-2 w-px bg-white/5"></div>
           <div className="text-[9px] text-zinc-600 font-mono">
              DB_LOC: localStorage_archived // UID: {Math.random().toString(36).substring(7).toUpperCase()}
           </div>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-black tracking-widest text-red-500/60 uppercase">
           <ShieldAlert className="w-3 h-3" />
           CUIDADO: INTERFACE DE CONTROLE ATIVA
        </div>
      </footer>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md hardware-card bg-[#16181D] border-blue-500/20 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                  <Settings className="w-5 h-5 text-blue-500" />
                  Configurações Nexus
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <Square className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="panel-label">Localização do Jogo (SSF2)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={gamePath}
                      onChange={(e) => setGamePath(e.target.value)}
                      placeholder="C:/Games/Super Smash Flash 2"
                      className="flex-1 bg-black border border-white/10 rounded px-4 py-3 text-xs font-mono text-zinc-300 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic">
                    * Necessário para extração de frames e dados de personagens.
                  </p>
                </div>

                <div>
                  <label className="panel-label">Distribuição</label>
                  <button 
                    onClick={() => {
                        addLog("Preparando pacote PWA standalone...");
                        window.print(); // Fallback simulation for "save as"
                    }}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-3"
                  >
                    <Download className="w-4 h-4" />
                    Instalar como Aplicativo (PWA)
                  </button>
                </div>

                <div className="pt-4 border-t border-white/5">
                   <button 
                    onClick={() => {
                      localStorage.setItem('nexus_game_path', gamePath);
                      setShowSettings(false);
                      addLog("Configurações salvas.");
                    }}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-xs uppercase transition-colors"
                  >
                    Salvar e Bloquear
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}