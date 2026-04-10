import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone, MessageSquare, Settings, Sparkles, Activity, Shield, Cpu, Loader2, Play, Pause, Volume2, VolumeX, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGeminiLive } from "@/src/hooks/useGeminiLive";
import { AI3DScene } from "@/src/components/AI3DScene";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export default function App() {
  const {
    isActive,
    isConnecting,
    messages,
    isMicOn,
    setIsMicOn,
    isCameraOn,
    setIsCameraOn,
    isScreenSharing,
    toggleScreenSharing,
    volume,
    error,
    startSession,
    stopSession,
    videoRef,
    canvasRef
  } = useGeminiLive();

  const [isPreviewPaused, setIsPreviewPaused] = useState(false);
  const [isPreviewMuted, setIsPreviewMuted] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      if (isPreviewPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isPreviewPaused, videoRef]);

  useEffect(() => {
    const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  return (
    <TooltipProvider>
      <div className="relative min-h-screen flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden">
        {/* Premium Background Effects */}
        <div className="atmosphere" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full -z-10"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full -z-10"
        />
        <div className="grid-lines" />
      
      {/* Decorative Elements */}
      <div className="absolute top-24 left-8 vertical-text h-32 flex items-center justify-between">
        <span>Lombardi Systems</span>
        <div className="w-px h-12 bg-white/10" />
        <span>v1.0.42</span>
      </div>

      {/* Header */}
      <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 glass z-20">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            {isActive && (
              <motion.div 
                layoutId="active-glow"
                className="absolute -inset-1 bg-blue-500/20 blur-md rounded-xl -z-10"
              />
            )}
          </div>
          <div>
            <h1 className="text-xl font-medium tracking-tight flex items-center gap-2">
              LombardiAI
              <span className="text-[10px] font-mono text-white/30 font-normal">CORE_PROCESS_01</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
                {isActive ? 'System Online' : 'Standby Mode'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Secure Link</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              <span>Latency: 24ms</span>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8 bg-white/10" />
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/5 rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: 3D Visualization */}
        <div className="flex-1 relative flex flex-col">
          {/* Background Typography */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none overflow-hidden w-full text-center">
            <span className="font-display italic text-[20vw] text-white/[0.02] leading-none whitespace-nowrap">
              Lombardi AI
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center relative z-10">
            <AnimatePresence mode="wait">
              {!isActive ? (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                  className="text-center space-y-10"
                >
                  <div className="space-y-4">
                    <h2 className="text-6xl font-light tracking-tighter text-white/90">
                      Initiate <span className="italic font-display">Neural</span> Link
                    </h2>
                    <p className="text-white/40 max-w-sm mx-auto font-mono text-xs uppercase tracking-widest leading-relaxed">
                      Advanced multimodal interaction powered by Gemini 3.1 Flash Live.
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 text-[10px] font-mono uppercase tracking-wider max-w-xs mx-auto"
                    >
                      Error: {error}
                    </motion.div>
                  )}

                  <Button 
                    size="lg" 
                    onClick={startSession}
                    disabled={isConnecting}
                    className="group relative bg-white text-black hover:bg-white/90 px-12 h-16 rounded-full text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                  >
                    <div className="absolute -inset-4 bg-white/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full flex flex-col items-center justify-center"
                >
                  <AI3DScene isActive={isActive} volume={volume} />
                  
                  {isConnecting && (
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute bottom-24 flex flex-col items-center gap-4"
                    >
                      <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          className="w-1/2 h-full bg-blue-500"
                        />
                      </div>
                      <span className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.4em]">Synchronizing...</span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Floating Camera Preview */}
          <AnimatePresence>
            {isCameraOn && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute bottom-10 left-10 w-72 aspect-video rounded-3xl overflow-hidden glass shadow-2xl border-white/10 group"
              >
                {/* Animated Border */}
                <motion.div
                  animate={{ 
                    background: [
                      "conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.5), transparent)",
                      "conic-gradient(from 360deg, transparent, rgba(59, 130, 246, 0.5), transparent)"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-[2px] rounded-3xl -z-10 opacity-50"
                />

                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted={isPreviewMuted}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isPreviewPaused ? 'filter grayscale blur-sm' : 'grayscale brightness-110 contrast-125 group-hover:grayscale-0'
                  }`}
                />
                
                {/* Scanning Line */}
                {!isPreviewPaused && (
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-blue-400/30 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10"
                  />
                )}

                <canvas ref={canvasRef} className="hidden" width={320} height={240} />
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white"
                      onClick={() => setIsPreviewMuted(!isPreviewMuted)}
                    >
                      {isPreviewMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${isPreviewPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                      <span className="text-[9px] font-mono uppercase tracking-widest text-white/70">
                        {isPreviewPaused ? 'Paused' : 'Optical Input Active'}
                      </span>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => setIsPreviewPaused(!isPreviewPaused)}
                    >
                      {isPreviewPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel: Data Stream */}
        <aside className="w-[400px] border-l border-white/5 glass flex flex-col relative z-20">
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5">
                <MessageSquare className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">Data Stream</span>
            </div>
            <Badge variant="outline" className="font-mono text-[9px] border-white/10 text-white/40">
              {messages.length} Packets
            </Badge>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              {messages.length === 0 && (
                <div className="h-[400px] flex flex-col items-center justify-center text-center px-12 opacity-10">
                  <Sparkles className="w-16 h-16 mb-6 stroke-[1]" />
                  <p className="text-xs font-mono uppercase tracking-widest leading-loose">
                    Awaiting neural input. Start speaking to initiate transcription.
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.timestamp + i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono uppercase tracking-widest ${msg.role === 'user' ? 'text-blue-400' : 'text-indigo-400'}`}>
                      [{msg.role}]
                    </span>
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[9px] font-mono text-white/20">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-white/90' : 'text-white/60'}`}>
                    {msg.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          {/* Controls Footer */}
          <div className="p-8 bg-black/60 border-t border-white/5 backdrop-blur-md">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-white/30">Audio Input</span>
                  <div className="flex gap-1">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          height: isActive ? [4, 4 + Math.random() * volume * 40, 4] : 4,
                          opacity: isActive ? [0.2, 0.8, 0.2] : 0.1
                        }}
                        transition={{ duration: 0.2, repeat: Infinity }}
                        className="w-1 bg-blue-500 rounded-full"
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-white/30">Signal Strength</span>
                  <div className="flex gap-0.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`w-3 h-1 rounded-full ${i < 3 ? 'bg-blue-500' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsMicOn(!isMicOn)}
                      className={`rounded-2xl w-14 h-14 border-white/5 transition-all ${!isMicOn ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white/5 text-white hover:bg-white/10'}`}
                    >
                      {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-black border-white/10 text-[10px] uppercase tracking-widest">
                    Microphone: {isMicOn ? 'On' : 'Off'}
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsCameraOn(!isCameraOn)}
                      className={`rounded-2xl w-14 h-14 border-white/5 transition-all ${isCameraOn ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-white/5 text-white hover:bg-white/10'}`}
                    >
                      {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-black border-white/10 text-[10px] uppercase tracking-widest">
                    Camera: {isCameraOn ? 'On' : 'Off'}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleScreenSharing}
                      className={`rounded-2xl w-14 h-14 border-white/5 transition-all ${isScreenSharing ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-white/5 text-white hover:bg-white/10'}`}
                    >
                      <Monitor className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-black border-white/10 text-[10px] uppercase tracking-widest">
                    Screen Share: {isScreenSharing ? 'On' : 'Off'}
                  </TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-10 bg-white/10 mx-2" />

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={stopSession}
                  disabled={!isActive && !isConnecting}
                  className="rounded-2xl w-16 h-16 bg-red-600 hover:bg-red-700 shadow-2xl shadow-red-600/20 transition-all active:scale-95 disabled:opacity-20"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </main>
      </div>
    </TooltipProvider>
  );
}
