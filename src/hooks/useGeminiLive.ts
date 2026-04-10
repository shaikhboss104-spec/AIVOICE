import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export type Message = {
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
};

export function useGeminiLive() {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [volume, setVolume] = useState(0); // For orb animation
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const ai = useMemo(() => {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'undefined' || key === 'MY_GEMINI_API_KEY') {
      console.warn("GEMINI_API_KEY is missing or invalid. Please set it in your environment variables.");
      return null;
    }
    return new GoogleGenAI({ apiKey: key });
  }, []);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
    setIsScreenSharing(false);
  }, []);

  const toggleScreenSharing = useCallback(async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      // Revert to camera if it was on
      if (isCameraOn && streamRef.current && videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
      } else if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        setIsScreenSharing(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (isCameraOn && streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
          } else if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        };
      } catch (err) {
        console.error("Failed to share screen:", err);
      }
    }
  }, [isScreenSharing, isCameraOn]);

  const startSession = useCallback(async () => {
    if (isActive || isConnecting) return;
    setIsConnecting(true);
    setError(null);

    if (!ai) {
      setError("AI Service not initialized. Please check your GEMINI_API_KEY environment variable.");
      setIsConnecting(false);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isCameraOn
        });
      } catch (err: any) {
        // Fallback: if video was requested but failed, try audio only
        if (isCameraOn && (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError' || err.name === 'NotReadableError')) {
          console.warn("Camera not found or inaccessible, falling back to audio-only.");
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setIsCameraOn(false);
        } else {
          throw err;
        }
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = isScreenSharing ? screenStreamRef.current : (isCameraOn ? stream : null);
      }

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            processor.onaudioprocess = (e) => {
              if (!isMicOn) return;
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate volume for UI
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              setVolume(Math.sqrt(sum / inputData.length));

              // Convert to PCM 16-bit
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }
              
              const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
              session.sendRealtimeInput({
                audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
              });
            };
            source.connect(processor);
            processor.connect(audioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const binary = atob(base64Audio);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              const pcm16 = new Int16Array(bytes.buffer);
              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 0x7FFF;

              const buffer = audioContext.createBuffer(1, float32.length, 16000);
              buffer.getChannelData(0).set(float32);
              const source = audioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContext.destination);
              source.start();
            }

            // Handle transcriptions
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              const text = message.serverContent.modelTurn.parts[0].text;
              setMessages(prev => [...prev, { role: 'ai', text, timestamp: Date.now() }]);
            }
          },
          onerror: (err) => {
            console.error("Gemini Live Error:", err);
            stopSession();
          },
          onclose: () => {
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are LombardiAI, a sophisticated and helpful AI companion. You can see through the camera and hear through the microphone. Be concise, witty, and engaging.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      });

      sessionRef.current = session;

      // Video streaming loop
      const captureFrame = () => {
        if (!sessionRef.current || !videoRef.current || !canvasRef.current) return;
        if (!isCameraOn && !isScreenSharing) return;
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64Data = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
          sessionRef.current.sendRealtimeInput({
            video: { data: base64Data, mimeType: 'image/jpeg' }
          });
        }
        setTimeout(captureFrame, 1000); // Send frame every second
      };
      captureFrame();

    } catch (err: any) {
      console.error("Failed to start session:", err);
      let errorMessage = "Failed to start session. Please check your microphone and camera permissions.";
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = "Requested device not found. Please ensure your microphone is connected.";
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = "Permission denied. Please allow access to your microphone and camera.";
      }
      setError(errorMessage);
      setIsConnecting(false);
    }
  }, [isActive, isConnecting, isCameraOn, isMicOn, isScreenSharing, stopSession]);

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return {
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
  };
}
