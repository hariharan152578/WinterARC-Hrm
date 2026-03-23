"use client";

import React, { useEffect, useRef } from 'react';
import { useCall } from '@/context/CallContext';
import { Phone, Video, X, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';

export default function CallingModal() {
  const { 
    isCalling, 
    isIncoming, 
    activeCall, 
    localStream, 
    remoteStream, 
    answerCall, 
    rejectCall, 
    endCall,
    toggleMute,
    toggleVideo,
    isMuted,
    isVideoEnabled
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!isCalling && !isIncoming) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 mx-4">
        
        {/* Background Ambient Effect */}
        <div className="absolute inset-0 bg-linear-to-b from-[#4db6ac]/20 to-transparent pointer-events-none" />

        <div className="relative p-8 flex flex-col items-center text-center">
          
          {/* Peer Info */}
          <div className="mb-12">
            <div className="w-24 h-24 rounded-full bg-[#e8f5f4] flex items-center justify-center mb-6 mx-auto border-4 border-[#4db6ac]/30 shadow-xl overflow-hidden animate-pulse">
              {activeCall?.name?.charAt(0) || 'U'}
            </div>
            <h2 className="text-2xl font-black text-white mb-2">{activeCall?.name || 'Someone'}</h2>
            <p className="text-[#4db6ac] font-bold tracking-widest uppercase text-[10px]">
              {isIncoming ? "Incoming " : isCalling && !remoteStream ? "Calling... " : "On Call "}
              {activeCall?.type === 'video' ? "Video" : "Voice"}
            </p>
          </div>

          {/* Video Streams */}
          {activeCall?.type === 'video' && (isCalling || remoteStream) && (
            <div className="w-full aspect-video bg-black rounded-3xl mb-8 overflow-hidden relative border border-white/5 ring-1 ring-white/10">
              {/* Remote Video */}
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              
              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute top-4 right-4 w-1/4 aspect-video bg-gray-800 rounded-xl overflow-hidden border border-white/20 shadow-xl">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover ${!isVideoEnabled && 'opacity-0'}`} 
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VideoOff size={16} className="text-gray-500" />
                  </div>
                )}
              </div>

              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-[#4db6ac] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#4db6ac] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#4db6ac] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-6 mt-4">
            {isIncoming ? (
              <>
                <button 
                  onClick={answerCall}
                  className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 hover:scale-110 transition-transform animate-bounce"
                >
                  <Phone size={28} />
                </button>
                <button 
                  onClick={rejectCall}
                  className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 hover:scale-110 transition-transform"
                >
                  <PhoneOff size={28} />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={toggleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                {activeCall?.type === 'video' && (
                  <button 
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${!isVideoEnabled ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {!isVideoEnabled ? <VideoOff size={24} /> : <Video size={24} />}
                  </button>
                )}

                <button 
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/40 hover:scale-110 transition-transform"
                >
                  <PhoneOff size={28} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
