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
  Eye,
  Search,
  X,
  Monitor
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
    progress: 100,
    codeSnippet: PYTHON_SCRIPTS.PREP
  },
  {
    id: '2',
    title: 'Coleta de Dados',
    description: 'Capturando frames do jogo e seus inputs simultaneamente.',
    status: StepStatus.ACTIVE,
    details: 'Gravando 60 FPS. Armazenando em datasets/SSF2_v1.',
    progress: 45,
    codeSnippet: PYTHON_SCRIPTS.COLLECT
  },
  {
    id: '3',
    title: 'Cérebro da IA (CNN)',
    description: 'Construindo a Rede Neural Convolucional para visão computacional.',
    status: StepStatus.IDLE,
    details: 'NexusNet v1: Arquitetura otimizada para mínima latência.',
    progress: 0,
    codeSnippet: PYTHON_SCRIPTS.BRAIN
  },
  {
    id: '4',
    title: 'Treinamento (Study)',
    description: 'A fase onde a IA aprende seu estilo de jogo através do erro.',
    status: StepStatus.IDLE,
    details: 'Necessário 50k frames. Progresso atual: 12k.',
    progress: 0,
    codeSnippet: PYTHON_SCRIPTS.TRAIN
  },
  {
    id: '5',
    title: 'Execução do Bot',
    description: 'Bot jogando em tempo real no SSF2.',
    status: StepStatus.IDLE,
    details: 'Pronto para inferência local.',
    progress: 0,
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

const getIcon = (id: string) => {
  switch (id) {
    case '1': return <Cpu className="w-3 h-3" />;
    case '2': return <Activity className="w-3 h-3" />;
    case '3': return <Zap className="w-3 h-3" />;
    case '4': return <Code2 className="w-3 h-3" />;
    case '5': return <Play className="w-3 h-3" />;
    default: return <Circle className="w-3 h-3" />;
  }
};

export default function App() {
  const [steps, setSteps] = useState(INITIAL_STEPS);
  const [activeStepId, setActiveStepId] = useState('2');
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [connected, setConnected] = useState(false);
  const [running, setRunning] = useState(false);
  const [safetyLock, setSafetyLock] = useState(false);
  const [systemOffline, setSystemOffline] = useState(localStorage.getItem('nexus_system_offline') === 'true');
  const [controlMode, setControlMode] = useState<'PASSIVE' | 'OVERRIDE'>('PASSIVE');
  const [gamePath, setGamePath] = useState<string>(localStorage.getItem('nexus_game_path') || 'C:/Games/SSF2');
  const [showSettings, setShowSettings] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const [visionStatus, setVisionStatus] = useState<'IDLE' | 'TRACKING' | 'ANALYZING'>('IDLE');
  const [matchState, setMatchState] = useState<'SEARCHING' | 'MATCH_START' | 'IN_GAME' | 'RESULTS'>('SEARCHING');
  const [isScanning, setIsScanning] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const startScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any,
        audio: false
      });
      setScreenStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      addLog("[VISION] Captura de tela iniciada. NexusNet vinculada.");
      setVisionStatus('TRACKING');
    } catch (err) {
      console.error(err);
      addLog("[ERRO] Falha ao iniciar captura de tela.");
    }
  };

  const stopScreenCapture = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setVisionStatus('IDLE');
      addLog("[VISION] Captura de tela encerrada.");
    }
  };

  // Simulação de Auto-Detecção e Ciclo de Vida do Jogo
  useEffect(() => {
    if (!isAutoPilot || systemOffline) return;

    const interval = setInterval(() => {
      // Lógica de Transição de Estado Automática (Simulada para visualização)
      setMatchState(prev => {
        if (prev === 'SEARCHING') {
          if (Math.random() > 0.95) {
            setConnected(true);
            addLog("[AUTO] Jogo detectado via NexusNet Vision.");
            return 'MATCH_START';
          }
        }
        if (prev === 'MATCH_START') {
          setRunning(true);
          setVisionStatus('TRACKING');
          return 'IN_GAME';
        }
        if (prev === 'IN_GAME') {
          // Monitorando frames...
          if (Math.random() > 0.98) {
            addLog("[COLETA] Partida finalizada. Sincronizando metadados...");
            setVisionStatus('ANALYZING');
            return 'RESULTS';
          }
        }
        if (prev === 'RESULTS') {
          setTimeout(() => {
             setMatchState('SEARCHING');
             setVisionStatus('IDLE');
             addLog("[SISTEMA] Aguardando nova partida...");
          }, 3000);
          return 'RESULTS';
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoPilot, systemOffline]);
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
      
      setTimeout(() => {
        setSystemOffline(true);
        localStorage.setItem('nexus_system_offline', 'true');
        setIsShuttingDown(false);
      }, 2000);
    } catch (e) {
      addLog("Erro ao comunicar desligamento.");
      setSystemOffline(true);
      localStorage.setItem('nexus_system_offline', 'true');
      setIsShuttingDown(false);
    }
  };

  const activateSystem = () => {
    setIsScanning(true);
    addLog("Verificando credenciais de administrador...");
    setTimeout(() => {
      setSystemOffline(false);
      localStorage.removeItem('nexus_system_offline');
      setIsScanning(false);
      addLog("SISTEMA REATIVADO. Bem-vindo de volta, Operador.");
    }, 1500);
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

  const handleScan = () => {
    setIsScanning(true);
    addLog("Escaneando arquivos de SSF2...");
    setTimeout(() => {
      setIsScanning(false);
      addLog("Assets sincronizados com sucesso.");
    }, 2000);
  };

  const handleStart = () => {
    if (!connected) {
      addLog("[ERRO] Agente Python offline. Inicie o servidor local primeiro.");
      return;
    }
    setRunning(true);
    addLog("Nexus Core Iniciado.");
    simulatePrediction();
  };

  return (
    <div className={`flex flex-col h-screen bg-[#0F1115] text-[#E2E8F0] select-none overflow-hidden transition-all duration-1000 ${isShuttingDown ? 'grayscale brightness-50 contrast-125 translate-y-full opacity-0' : 'opacity-100'}`}>
      <AnimatePresence>
        {systemOffline && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full hardware-card p-12 border-red-500/20 bg-[#16181D]"
            >
              <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-red-500 animate-pulse" />
                </div>
              </div>
              <h1 className="text-2xl font-black italic tracking-tighter uppercase mb-4 text-white">
                Sistema Offline
              </h1>
              <p className="text-[10px] text-zinc-500 mb-8 leading-relaxed font-mono uppercase tracking-widest">
                Protocolo de Segurança Ativado.<br/>
                O Dashboard foi bloqueado pelo operador.<br/>
                Aguardando autenticação.
              </p>
              
              <button 
                onClick={activateSystem}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group"
              >
                {isScanning ? (
                  <RotateCw className="w-4 h-4 animate-spin text-blue-500" />
                ) : (
                  <Power className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                )}
                {isScanning ? 'Verificando...' : 'Reativar Sistema'}
              </button>
            </motion.div>
            <div className="mt-8 text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
              Nexus Intelligent Guard v2.1.0 • Stable Build
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Top Navigation / Status Bar */}
      <header className="h-[50px] border-b border-[#2D333F] bg-[#16181D] flex items-center justify-between px-6 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-zinc-600 animate-pulse'}`}></div>
            <span className="text-[10px] font-black italic tracking-tighter uppercase text-white">Project Nexus <span className="text-blue-500">v2.1</span></span>
          </div>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <div className="flex items-center gap-3">
             <div className="flex flex-col">
                <span className="text-[7px] text-zinc-500 uppercase tracking-widest font-bold">Local Bridge</span>
                <span className="text-[9px] font-mono text-blue-400">127.0.0.1:3000</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[7px] text-zinc-500 uppercase tracking-widest font-bold">Match Status</span>
                <span className={`text-[9px] font-mono font-bold uppercase ${matchState === 'IN_GAME' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {matchState.replace('_', ' ')}
                </span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-r border-white/5 pr-4">
             <div className="flex items-center gap-2">
                <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">Auto-Pilot</span>
                <button 
                  onClick={() => setIsAutoPilot(!isAutoPilot)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${isAutoPilot ? 'bg-blue-500' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${isAutoPilot ? 'left-5' : 'left-1'}`}></div>
                </button>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleShutdown}
              disabled={isShuttingDown}
              className="group relative p-1.5 rounded hover:bg-red-500/10 text-[#94A3B8] hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
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

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Left Column: Vision & Neural */}
        <div className="w-[420px] flex flex-col gap-6">
          {/* AI VISION FEED */}
          <div className="h-[280px] hardware-card bg-black/60 relative overflow-hidden group border-blue-500/20">
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
               <div className={`w-2 h-2 ${screenStream ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'} rounded-full`}></div>
               <span className="text-[10px] font-black text-white uppercase tracking-tighter">Nexus Vision / {screenStream ? 'LIVE SCREEN' : 'FEED IDLE'}</span>
            </div>

            {/* Stream Viewport */}
            <div className="absolute inset-0 bg-black">
              {screenStream ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover grayscale brightness-75 contrast-125"
                />
              ) : (
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)] z-10"></div>
                  <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale contrast-150"></div>
                </div>
              )}
            </div>

            {/* Action Button for Capture */}
            {!screenStream && !isShuttingDown && (
              <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={startScreenCapture}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded shadow-2xl flex items-center gap-3 border border-blue-400/50"
                >
                  <Monitor className="w-4 h-4" />
                  Capturar Tela do Jogo
                </button>
              </div>
            )}

            {screenStream && (
              <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={stopScreenCapture}
                  className="px-2 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-500 rounded border border-red-500/30 text-[9px] font-bold uppercase flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Encerrar
                </button>
              </div>
            )}
            
            {/* HUD Overlays */}
            <AnimatePresence mode="wait">
               {screenStream && visionStatus === 'TRACKING' ? (
                 <>
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="absolute top-[40%] left-[25%] w-20 h-32 border-2 border-blue-500/50 flex flex-col justify-start p-2 gap-1"
                   >
                     <div className="bg-blue-500 text-[7px] font-bold text-white px-1 self-start uppercase">P1: {gameState.p1Char}</div>
                     <div className="w-full h-0.5 bg-white/20"><div className="w-4/5 h-full bg-blue-500"></div></div>
                   </motion.div>
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="absolute top-[40%] right-[25%] w-20 h-32 border-2 border-red-500/50 flex flex-col justify-start p-2 gap-1"
                   >
                     <div className="bg-red-500 text-[7px] font-bold text-white px-1 self-start uppercase">CPU: {gameState.cpuChar}</div>
                     <div className="w-full h-0.5 bg-white/20"><div className="w-3/5 h-full bg-red-500"></div></div>
                   </motion.div>
                   
                   {/* Scanning Scanline */}
                   <motion.div 
                     animate={{ top: ['0%', '100%'] }}
                     transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                     className="absolute inset-x-0 h-[1px] bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,1)] z-10"
                   />
                 </>
               ) : visionStatus === 'ANALYZING' ? (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-blue-900/20 backdrop-blur-sm"
                 >
                   <RotateCw className="w-8 h-8 text-blue-500 animate-spin" />
                   <span className="text-[10px] text-blue-200 uppercase tracking-[0.3em] font-black">Processando Dados da Partida</span>
                 </motion.div>
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                   <Search className="w-8 h-8 text-zinc-700 animate-pulse" />
                   <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black">Escaneando...</span>
                 </div>
               )}
            </AnimatePresence>

            <div className="absolute bottom-4 right-4 text-[9px] font-mono text-zinc-600 bg-black/80 px-2 py-1 rounded">
               FFMPEG_STREAM_01 // 60FPS
            </div>
          </div>

          {/* Steps Pipeline (Old Left Column) */}
          <div className="flex-1 hardware-card bg-[#16181D] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
               <span className="panel-label">Pipeline Module</span>
               <span className="text-[9px] text-blue-500 font-mono animate-pulse">● ACTIVE</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {steps.map((step, idx) => (
                <div 
                  key={step.id}
                  onClick={() => setActiveStepId(step.id)}
                  className={`p-3 rounded border transition-all cursor-pointer ${
                    activeStepId === step.id 
                    ? 'bg-blue-500/10 border-blue-500/30' 
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded bg-black text-zinc-500`}>{getIcon(step.id)}</div>
                      <span className="text-[10px] font-bold uppercase text-white">{step.title}</span>
                    </div>
                    <span className={`text-[8px] uppercase tracking-widest ${step.status === 'COMPLETED' ? 'text-emerald-500' : 'text-zinc-500'}`}>{step.status}</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${step.status === 'ERROR' ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${step.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

          {/* Center: Main Viewport / Control Surface */}
        <section className="flex-1 flex flex-col gap-4 overflow-hidden">
           <div className="flex-1 hardware-card bg-black border-zinc-800 relative group overflow-hidden shadow-2xl">
              {/* Virtual Screen Grid */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" 
                   style={{ backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
              </div>

              {/* Action Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                 {!connected ? (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="flex flex-col items-center gap-6 text-center p-12 bg-black/80 backdrop-blur-md rounded-2xl border border-white/5"
                   >
                      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <Link className="w-8 h-8 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">Aguardando Nexus Agent</h3>
                        <p className="text-[10px] text-zinc-500 mt-2 max-w-xs leading-relaxed uppercase tracking-widest font-mono">
                          Nenhuma ponte detectada. Execute o script python para transmitir a visão do jogo.
                        </p>
                      </div>
                      <button onClick={downloadAgent} className="btn-secondary px-8 py-3 bg-white/5 hover:bg-white/10 text-white border-white/10">
                        BAIXAR AGENTE (.PY)
                      </button>
                   </motion.div>
                 ) : (
                    <div className="absolute inset-0 flex flex-col pointer-events-none p-12">
                       {/* Character Health & UI simulation */}
                       <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/40 rounded flex items-center justify-center text-blue-500 font-black italic">P1</div>
                                <div className="flex flex-col">
                                   <div className="text-xl font-black italic text-white uppercase tracking-tighter tracking-widest">{gameState.p1Char}</div>
                                   <div className="w-48 h-2 bg-black/60 border border-white/10 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: '0%' }}
                                        animate={{ width: matchState === 'IN_GAME' ? '80%' : '100%' }}
                                        className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]"
                                      />
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 text-right">
                             <div className="flex items-center gap-3 flex-row-reverse">
                                <div className="w-12 h-12 bg-red-500/20 border border-red-500/40 rounded flex items-center justify-center text-red-500 font-black italic">CPU</div>
                                <div className="flex flex-col items-end">
                                   <div className="text-xl font-black italic text-white uppercase tracking-tighter tracking-widest">{gameState.cpuChar}</div>
                                   <div className="w-48 h-2 bg-black/60 border border-white/10 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: '0%' }}
                                        animate={{ width: matchState === 'IN_GAME' ? '65%' : '100%' }}
                                        className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]"
                                      />
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Central Detection Info */}
                       <div className="flex-1 flex items-center justify-center">
                          <AnimatePresence>
                             {currentPrediction && matchState === 'IN_GAME' && (
                               <motion.div 
                                 initial={{ opacity: 0, scale: 0.5 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0, scale: 0.5 }}
                                 className="flex flex-col items-center"
                               >
                                  <div className="text-4xl font-black italic text-white uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                     {currentPrediction.action}
                                  </div>
                                  <div className="text-[10px] font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded mt-2 uppercase tracking-widest">
                                     Confidence: {currentPrediction.confidence}
                                  </div>
                               </motion.div>
                             )}
                          </AnimatePresence>
                       </div>
                    </div>
                 )}
              </div>

              {/* Video Artifacts */}
              <div className="absolute inset-x-0 bottom-0 p-6 flex justify-between items-end z-20 pointer-events-none">
                 <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                       <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Enc: H.264 / NVENC</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                       <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Dec: DXVA2_BUFFER</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-[20px] font-black italic text-white/20 uppercase tracking-tighter">PROJECT_NEXUS</div>
                 </div>
              </div>
           </div>

           {/* Quick Actions Footer */}
           <div className="h-[80px] hardware-card bg-[#16181D] flex items-center px-6 gap-6">
              <div className="flex-1 flex gap-4">
                 <button 
                  onClick={handleScan}
                  disabled={!connected || isScanning || running}
                  className="btn-primary flex-1 flex items-center justify-center gap-3 px-6 h-12"
                 >
                    <Download className="w-4 h-4" />
                    Sincronizar Assets
                 </button>
                 <button 
                  onClick={handleDeepScan}
                  disabled={!connected || isScanning}
                  className="btn-secondary flex-1 flex items-center justify-center gap-3 px-6 h-12"
                 >
                    <Search className="w-4 h-4" />
                    Deep Scan
                 </button>
              </div>
              <div className="h-10 w-[1px] bg-white/5"></div>
              <div className="flex-1 flex gap-4">
                 <button 
                  onClick={handleStart}
                  disabled={!connected || running}
                  className="btn-primary flex-1 flex items-center justify-center gap-3 px-6 h-12 !bg-emerald-600 !hover:bg-emerald-700 !shadow-emerald-500/10"
                 >
                    <Play className="w-4 h-4" />
                    Iniciar Agente
                 </button>
                 <button 
                  onClick={handlePanicStop}
                  disabled={!running}
                  className="btn-primary flex-1 flex items-center justify-center gap-3 px-6 h-12 !bg-red-600 !hover:bg-red-700 !shadow-red-500/10"
                 >
                    <Square className="w-4 h-4" />
                    Abortar Lógica
                 </button>
              </div>
           </div>
        </section>

        {/* Right Column: Intelligence & Logs */}
        <div className="w-[380px] flex flex-col gap-6 overflow-hidden">
          {/* Intelligence Panel */}
          <div className="hardware-card bg-[#16181D] p-6 space-y-6">
             <div>
                <span className="panel-label">Neural Engine Status</span>
                <div className="grid grid-cols-2 gap-3 mt-3">
                   <div className="p-3 bg-black/40 rounded border border-white/5">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Inference</div>
                      <div className="text-xl font-black italic tracking-tighter text-blue-500">4.2<span className="text-[10px] ml-1">ms</span></div>
                   </div>
                   <div className="p-3 bg-black/40 rounded border border-white/5">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Queue</div>
                      <div className="text-xl font-black italic tracking-tighter text-white">0.0<span className="text-[10px] ml-1">ms</span></div>
                   </div>
                </div>
             </div>

             <div>
                <span className="panel-label">Active Intelligence: {gameState.p1Char}</span>
                <div className="bg-black/40 p-4 rounded border border-white/5 space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] text-zinc-500 uppercase font-black">Tier Capability</span>
                      <span className="text-blue-500 font-black italic text-sm">TIER {currentCharData.tier}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <div className="text-[10px] text-zinc-500 uppercase font-bold">Startup</div>
                         <div className="text-white font-black italic text-lg">{currentCharData.startup}F</div>
                      </div>
                      <div>
                         <div className="text-[10px] text-zinc-500 uppercase font-bold">Shield</div>
                         <div className={`font-black italic text-lg ${currentCharData.shield >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                           {currentCharData.shield > 0 ? '+' : ''}{currentCharData.shield}F
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Activity Logs */}
          <div className="flex-1 hardware-card bg-[#16181D] flex flex-col overflow-hidden">
             <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                <span className="panel-label">Nexus Protocol Logs</span>
                <div className="flex items-center gap-1">
                   <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                   <span className="text-[7px] text-blue-500 uppercase font-bold">Streaming</span>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar scroll-smooth">
                {logs.map((log, i) => (
                  <div key={i} className="text-[10px] font-mono leading-relaxed border-l-2 border-white/5 pl-3 py-1">
                    <span className="text-zinc-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    <span className={`${log.includes('[CRITICAL]') ? 'text-red-500 font-black' : log.includes('[AUTO]') ? 'text-blue-400' : 'text-zinc-400'}`}>
                      {log}
                    </span>
                  </div>
                ))}
                <div ref={logContainerRef} />
              </div>
            </div>
          </div>
      </main>

      {/* Footer */}
      <footer className="h-[30px] border-t border-[#2D333F] bg-[#0C0E12] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6 text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
          Project Nexus / Live Interface
        </div>
      </footer>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md hardware-card bg-[#16181D] p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black italic uppercase italic">Nexus Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="panel-label">Game Path (SSF2)</label>
                  <input 
                    type="text" value={gamePath} onChange={(e) => setGamePath(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded px-4 py-3 text-xs font-mono"
                  />
                </div>
                <button onClick={downloadAgent} className="w-full py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest">
                  Download Agent Script
                </button>
                <button onClick={() => setShowSettings(false)} className="w-full py-3 bg-zinc-800 text-white font-bold text-xs uppercase">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {systemOffline && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#0A0B0E] flex flex-col items-center justify-center text-center p-12"
          >
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
               <Power className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-4">Sistema Encerrado</h1>
            <p className="text-zinc-500 max-w-sm mb-12 uppercase tracking-widest text-[10px] leading-relaxed">
              O núcleo de IA foi desativado. Reinicie o sistema para voltar ao monitoramento.
            </p>
            <button 
              onClick={activateSystem}
              className="px-12 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-2xl shadow-emerald-500/20"
            >
              Reativar Nexus Core
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

