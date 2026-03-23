"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CallContextType {
  isCalling: boolean;
  isIncoming: boolean;
  activeCall: any;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  initiateCall: (to: number, type: 'voice' | 'video', name: string) => void;
  answerCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, socket } = useAuth();
  const [isCalling, setIsCalling] = useState(false);
  const [isIncoming, setIsIncoming] = useState(false);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const pc = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:answered", handleCallAnswered);
    socket.on("call:ice-candidate", handleIceCandidate);
    socket.on("call:rejected", handleCallRejected);
    socket.on("call:hungup", handleCallHungup);

    return () => {
      socket.off("call:incoming");
      socket.off("call:answered");
      socket.off("call:ice-candidate");
      socket.off("call:rejected");
      socket.off("call:hungup");
    };
  }, [socket]);

  const cleanup = () => {
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsCalling(false);
    setIsIncoming(false);
    setActiveCall(null);
    setIsMuted(false);
    setIsVideoEnabled(true);
  };

  const initPeerConnection = () => {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && activeCall) {
        socket.emit("call:ice-candidate", {
          to: activeCall.from || activeCall.to,
          candidate: event.candidate
        });
      }
    };

    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.current = peerConnection;
    return peerConnection;
  };

  const handleIncomingCall = (data: any) => {
    // If already in a call, auto-reject or handle busy
    if (activeCall) {
      socket.emit("call:reject", { to: data.from });
      return;
    }
    setActiveCall(data);
    setIsIncoming(true);
  };

  const initiateCall = async (to: number, type: 'voice' | 'video', name: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      });
      setLocalStream(stream);
      setIsVideoEnabled(type === 'video');

      setActiveCall({ to, type, name });
      setIsCalling(true);

      const peerConnection = initPeerConnection();
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit("call:offer", {
        to,
        offer,
        type,
        callerName: user?.name,
        callerId: user?.id
      });
    } catch (err) {
      console.error("Calling error:", err);
      toast.error("Could not access camera/microphone");
    }
  };

  const answerCall = async () => {
    if (!activeCall) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: activeCall.type === 'video'
      });
      setLocalStream(stream);
      setIsVideoEnabled(activeCall.type === 'video');
      setIsIncoming(false);
      setIsCalling(true);

      const peerConnection = initPeerConnection();
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

      await peerConnection.setRemoteDescription(new RTCSessionDescription(activeCall.offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit("call:answer", {
        to: activeCall.from,
        answer
      });
    } catch (err) {
      console.error("Answer error:", err);
      toast.error("Could not access camera/microphone");
      rejectCall();
    }
  };

  const handleCallAnswered = async (data: any) => {
    if (!pc.current) return;
    await pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
  };

  const handleIceCandidate = async (data: any) => {
    if (!pc.current) return;
    try {
      await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (err) {
      console.error("ICE error:", err);
    }
  };

  const rejectCall = () => {
    if (activeCall) {
      socket.emit("call:reject", { to: activeCall.from });
    }
    cleanup();
  };

  const handleCallRejected = () => {
    toast.error("Call rejected");
    cleanup();
  };

  const endCall = () => {
    if (activeCall) {
      socket.emit("call:hangup", { to: activeCall.from || activeCall.to });
    }
    cleanup();
  };

  const handleCallHungup = () => {
    toast("Call ended", { icon: '📞' });
    cleanup();
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  return (
    <CallContext.Provider value={{
      isCalling,
      isIncoming,
      activeCall,
      localStream,
      remoteStream,
      initiateCall,
      answerCall,
      rejectCall,
      endCall,
      toggleMute,
      toggleVideo,
      isMuted,
      isVideoEnabled
    }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCall must be used within a CallProvider");
  return context;
};
