// Updated Meeting.jsx with Google Meet-like design
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneCall, 
  Users,
  Settings,
  Maximize2,
  Volume2,
  VolumeX,
  LogOut,
  Monitor,
  MoreVertical,
  MessageSquare,
  Info,
  X,
  Minimize2
} from "lucide-react";
import { SOCKET_URL } from "@/config/constants";

const SOCKET_SERVER_URL = SOCKET_URL;

function MeetingPage() {
  const { meetingUrl } = useParams();
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState(null);
  const [peers, setPeers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [remoteUsers, setRemoteUsers] = useState(new Map());
  const [isHost, setIsHost] = useState(false);
  const [hostId, setHostId] = useState(null);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const userVideo = useRef();
  const peersRef = useRef([]);
  const streamRef = useRef();
  const isCleaningUp = useRef(false);
  const hasCleanedUp = useRef(false);
  const controlsTimeoutRef = useRef();
  
  // Refs to hold the latest state values
  const isVideoOnRef = useRef(isVideoOn);
  const isMutedRef = useRef(isMuted);
  
  // Update refs whenever state changes
  useEffect(() => {
    isVideoOnRef.current = isVideoOn;
  }, [isVideoOn]);
  
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Auto-hide controls after inactivity (like Google Meet)
  useEffect(() => {
    const handleMouseMove = () => {
      setIsControlsVisible(true);
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    };

    const handleMouseLeave = () => {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 1000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  // Fullscreen functionality
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Enhanced track stopping function
  const stopAllTracks = (stream) => {
    if (stream && stream.getTracks) {
      const tracks = stream.getTracks();
      console.log(`Found ${tracks.length} tracks to stop`);
      
      tracks.forEach((track, index) => {
        console.log(`Stopping track ${index}: ${track.kind}, state: ${track.readyState}`);
        try {
          track.stop();
          track.onended = null;
          track.onmute = null;
          track.onunmute = null;
          console.log(`Track ${index} stopped successfully, new state: ${track.readyState}`);
        } catch (error) {
          console.error(`Error stopping track ${index}:`, error);
        }
      });
      
      try {
        tracks.forEach(track => {
          stream.removeTrack(track);
        });
      } catch (error) {
        console.error('Error during additional stream cleanup:', error);
      }
    }
  };

  // Enhanced cleanup function
  const cleanupMediaStream = async () => {
    console.log('Starting comprehensive media cleanup...');
    
    if (isCleaningUp.current || hasCleanedUp.current) {
      console.log('Cleanup already in progress or completed, skipping...');
      return;
    }
    
    isCleaningUp.current = true;
    hasCleanedUp.current = true;
    
    try {
      if (streamRef.current) {
        console.log('Cleaning up local stream...');
        stopAllTracks(streamRef.current);
        
        if (userVideo.current) {
          userVideo.current.pause();
          userVideo.current.srcObject = null;
          userVideo.current.load();
        }
        
        streamRef.current = null;
      }
      
      console.log(`Cleaning up ${peersRef.current.length} peer connections...`);
      const peerCleanupPromises = peersRef.current.map(async (peerObj, index) => {
        try {
          if (peerObj.peer && !peerObj.peer.destroyed) {
            peerObj.peer.removeAllListeners();
            peerObj.peer.destroy();
            console.log(`Peer ${index} cleaned up successfully`);
          }
        } catch (error) {
          console.error(`Error cleaning up peer ${index}:`, error);
        }
      });
      
      await Promise.all(peerCleanupPromises);
      peersRef.current = [];
      setPeers([]);
      
      if (window.gc && typeof window.gc === 'function') {
        try {
          window.gc();
        } catch (e) {
          // Ignore if gc is not available
        }
      }
      
      console.log('Comprehensive media cleanup completed');
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      isCleaningUp.current = false;
    }
  };

  const handleCallEnd = async () => {
    console.log("User ending call...");
    
    if (hasCleanedUp.current) {
      console.log("Already cleaned up, navigating...");
      navigate("/dashboard");
      return;
    }
    
    await cleanupMediaStream();
    setIsCallEnded(true);
    
    setTimeout(() => {
      navigate("/dashboard");
    }, 100);
  };

  useEffect(() => {
    let newSocket = null;
    let mounted = true;
    
    const initializeConnection = async () => {
      try {
        newSocket = io(SOCKET_SERVER_URL);
        setSocket(newSocket);
        
        // Connection status handlers
        newSocket.on('connect', () => {
          console.log('Connected to socket server');
          setConnectionStatus("connected");
        });
        
        newSocket.on('disconnect', () => {
          console.log('Disconnected from socket server');
          setConnectionStatus("disconnected");
        });

        // IMPROVED: More robust media access with error handling
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        if (!mounted) {
          console.log('Component unmounted during media access, cleaning up...');
          stopAllTracks(stream);
          return;
        }

        console.log('Got local media stream:', {
          id: stream.id,
          active: stream.active,
          tracks: stream.getTracks().map(track => ({
            kind: track.kind,
            enabled: track.enabled,
            readyState: track.readyState,
            id: track.id
          }))
        });
        
        streamRef.current = stream;
        
        if (userVideo.current && mounted) {
          userVideo.current.srcObject = stream;
        }
        
        // Socket event handlers
        newSocket.on("allUsers", users => {
          if (!mounted) return;
          console.log("Received allUsers event", users);
          const peers = [];
          users.forEach(({ userId }) => {
            const peer = createPeer(userId, newSocket.id, stream);
            peersRef.current.push({
              peerID: userId,
              peer,
            });
            peers.push({
              peerID: userId,
              peer,
            });
          });
          setPeers(peers);
          setParticipantCount(users.length + 1);
        });

        // Rest of your socket event handlers remain the same...
        newSocket.on("hostInfo", ({ hostId, isHost: userIsHost }) => {
          if (!mounted) return;
          console.log("Received host info:", { hostId, userIsHost });
          setHostId(hostId);
          setIsHost(userIsHost);
        });

        newSocket.on("hostChanged", ({ newHostId }) => {
          if (!mounted) return;
          console.log("Host changed to:", newHostId);
          setHostId(newHostId);
          setIsHost(newHostId === newSocket.id);
        });
        
        newSocket.on("userJoined", payload => {
          if (!mounted) return;
          console.log("User joined", payload);
          const peer = addPeer(payload.userId, stream, payload.signal);
          peersRef.current.push({
            peerID: payload.userId,
            peer,
          });
          setPeers(prevPeers => [...prevPeers, { peerID: payload.userId, peer }]);
          setParticipantCount(prev => prev + 1);
        });
        
        newSocket.on("receivingSignal", payload => {
          if (!mounted) return;
          console.log("Received signal from peer", payload);
          const item = peersRef.current.find(p => p.peerID === payload.callerID);
          if (item) {
            item.peer.signal(payload.signal);
          } else {
            console.warn("Could not find peer for signal", payload);
          }
        });
        
        newSocket.on("receivingReturnedSignal", payload => {
          if (!mounted) return;
          console.log("Received returned signal", payload);
          const item = peersRef.current.find(p => p.peerID === payload.id);
          if (item) {
            item.peer.signal(payload.signal);
          } else {
            console.warn("Could not find peer for returned signal", payload);
          }
        });
        
        newSocket.on("userLeft", payload => {
          if (!mounted) return;
          console.log("User left", payload);
          const peerObj = peersRef.current.find(p => p.peerID === payload.userId);
          if (peerObj) {
            peerObj.peer.destroy();
            peersRef.current = peersRef.current.filter(p => p.peerID !== payload.userId);
            setPeers(prevPeers => prevPeers.filter(p => p.peerID !== payload.userId));
            setParticipantCount(prev => prev - 1);
            setRemoteUsers(prev => {
              const newMap = new Map(prev);
              newMap.delete(payload.userId);
              return newMap;
            });
          }
        });
        
        newSocket.on("userMuted", payload => {
          if (!mounted) return;
          console.log("User muted/unmuted", payload);
          setRemoteUsers(prev => {
            const newMap = new Map(prev);
            const user = newMap.get(payload.userId) || {};
            newMap.set(payload.userId, { ...user, isMuted: payload.isMuted });
            return newMap;
          });
        });
        
        newSocket.on("userVideo", payload => {
          if (!mounted) return;
          console.log("User video toggled", payload);
          setRemoteUsers(prev => {
            const newMap = new Map(prev);
            const user = newMap.get(payload.userId) || {};
            newMap.set(payload.userId, { ...user, isVideoOn: payload.isVideoOn });
            return newMap;
          });
        });
        
        newSocket.on("callEnded", () => {
          if (!mounted) return;
          console.log("Call ended by host");
          handleCallEnd();
        });

        newSocket.on("error", ({ message }) => {
          if (!mounted) return;
          console.error("Socket error:", message);
          alert(message);
        });
        
        if (mounted) {
          newSocket.emit("joinMeeting", { meetingId: meetingUrl, userId: newSocket.id });
        }
        
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setConnectionStatus("error");
        
        // Show user-friendly error message
        let errorMessage = "Could not access camera and microphone. ";
        if (err.name === 'NotAllowedError') {
          errorMessage += "Please allow camera and microphone permissions.";
        } else if (err.name === 'NotFoundError') {
          errorMessage += "No camera or microphone found.";
        } else {
          errorMessage += "Please check your device settings.";
        }
        alert(errorMessage);
      }
    };

initializeConnection();
    
    return () => {
      console.log("Component unmounting, starting cleanup...");
      mounted = false;
      
      const immediateCleanup = () => {
        if (newSocket) {
          newSocket.close();
        }
        
        if (streamRef.current) {
          stopAllTracks(streamRef.current);
          streamRef.current = null;
        }
        
        if (userVideo.current) {
          userVideo.current.pause();
          userVideo.current.srcObject = null;
          userVideo.current.load();
        }
        
        peersRef.current.forEach(peerObj => {
          if (peerObj.peer && !peerObj.peer.destroyed) {
            peerObj.peer.removeAllListeners();
            peerObj.peer.destroy();
          }
        });
        peersRef.current = [];
      };
      
      immediateCleanup();
    };
  }, [meetingUrl, navigate]);

  // Rest of your functions remain the same...
  function createPeer(userToSignal, callerID, stream) {
    console.log('Creating peer connection as initiator', { userToSignal, callerID });
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: [
          {
            urls: "stun:stun.relay.metered.ca:80",
          },
          {
            urls: "turn:global.relay.metered.ca:80",
            username: "035647be0aa0d64714193c7a",
            credential: "sFUP3Scg5ghewv9D",
          },
          {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: "035647be0aa0d64714193c7a",
            credential: "sFUP3Scg5ghewv9D",
          },
          {
            urls: "turn:global.relay.metered.ca:443",
            username: "035647be0aa0d64714193c7a",
            credential: "sFUP3Scg5ghewv9D",
          },
          {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: "035647be0aa0d64714193c7a",
            credential: "sFUP3Scg5ghewv9D",
          },
        ],
      }
    });

    peer.on("signal", signal => {
      console.log(`Sending signal to ${userToSignal}`, signal);
      if (socket && socket.connected) {
        socket.emit("sendingSignal", { userToSignal, callerID, signal });
      }
    });
    
    peer.on('connect', () => {
      console.log('Peer connection established');
    });
    
    peer.on('error', (err) => {
      console.error('Peer connection error:', err);
    });
    
    return peer;
  }

  const addPeer = (callerID, stream, incomingSignal) => {
    console.log('Adding peer connection as receiver', { callerID });
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: {
        iceServers: [
          {
            urls: "stun:stun.relay.metered.ca:80",
          },
          {
            urls: "turn:global.relay.metered.ca:80",
            username: "035647be0aa0d64714193c7a",
            credential: "sFUP3Scg5ghewv9D",
          },
          {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: "035647be0aa0d64714193c7a",
            credential: "sFUP3Scg5ghewv9D",
          },
          {
            urls: "turn:global.relay.metered.ca:443",
            username: "035647be0aa0d64714193c7a",
            credential: "sFUP3Scg5ghewv9D",
          },
          {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: "035647be0aa0d64714193c7a",
            credential: "sFUP3Scg5ghewv9D",
          },
        ],
      }
    });

    peer.on("signal", signal => {
      console.log(`Returning signal to ${callerID}`, signal);
      if (socket && socket.connected) {
        socket.emit("returningSignal", { signal, callerID });
      }
    });
    
    peer.on('connect', () => {
      console.log('Peer connection established');
    });
    
    peer.on('error', (err) => {
      console.error('Peer connection error:', err);
    });

    if (incomingSignal) {
      console.log('Signaling with incoming signal', incomingSignal);
      peer.signal(incomingSignal);
    }

    return peer;
  };

  const handleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const newMuteState = !isMutedRef.current;
        console.log(`Toggling mute. New state: ${newMuteState}`);
        audioTrack.enabled = !newMuteState;
        setIsMuted(newMuteState);
        
        if (socket && socket.connected) {
          socket.emit("toggleMute", {
            meetingId: meetingUrl,
            userId: socket.id,
            isMuted: newMuteState
          });
        }
      }
    }
  };

  const handleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const newVideoState = !isVideoOnRef.current;
        console.log(`Toggling video. New state: ${newVideoState}`);
        videoTrack.enabled = newVideoState;
        setIsVideoOn(newVideoState);
        
        if (socket && socket.connected) {
          socket.emit("toggleVideo", {
            meetingId: meetingUrl,
            userId: socket.id,
            isVideoOn: newVideoState
          });
        }
      }
    }
  };

  const handleEndCall = () => {
    console.log("Host ending call for everyone...");
    
    if (socket && socket.connected) {
      socket.emit("endCall", { meetingId: meetingUrl });
    }
    
    handleCallEnd();
  };

  const handleLeaveCall = () => {
    console.log("Leaving call...");
    
    if (socket && socket.connected) {
      socket.emit("leaveCall", { meetingId: meetingUrl });
    }
    
    handleCallEnd();
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected": return "bg-green-500";
      case "connecting": return "bg-yellow-500";
      case "disconnected": return "bg-red-500";
      case "error": return "bg-red-600";
      default: return "bg-gray-500";
    }
  };

const getVideoGridClass = () => {
    const totalParticipants = peers.length + 1;
    
    if (totalParticipants === 1) return "grid-cols-1";
    if (totalParticipants === 2) return "grid-cols-2";
    if (totalParticipants <= 4) return "grid-cols-2";
    if (totalParticipants <= 6) return "grid-cols-3";
    if (totalParticipants <= 9) return "grid-cols-3";
    return "grid-cols-4";
  };

  if (isCallEnded) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Call ended. Redirecting...</div>
      </div>
    );
  }

return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      {/* Top Bar - Google Meet Style */}
      <div className={`absolute top-0 left-0 right-0 z-50 transition-opacity duration-300 ${
        isControlsVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-white text-sm font-medium">
                Meeting ID: {meetingUrl}
              </span>
            </div>
            {isHost && (
              <Badge className="bg-red-600 text-white">
                Host
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users className="w-4 h-4 mr-2" />
              {participantCount}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={handleLeaveCall}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Video Grid - Full Screen */}
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className={`grid gap-2 w-full h-full ${getVideoGridClass()}`}>
          {/* Local Video */}
          <div className="relative rounded-xl overflow-hidden bg-gray-900 group">
            <video
              muted
              ref={userVideo}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!isVideoOn && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold">
                    {user?.name?.charAt(0) || 'Y'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Video Overlay Info */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
                You {isHost && '(Host)'}
              </div>
              {isMuted && (
                <div className="bg-red-600 rounded-full p-2">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Remote Videos */}
          {peers.map((peer, index) => {
            const remoteUser = remoteUsers.get(peer.peerID) || {};
            const isRemoteHost = peer.peerID === hostId;
            
            return (
              <div key={peer.peerID} className="relative rounded-xl overflow-hidden bg-gray-900 group">
                <VideoPlayer 
                  peer={peer.peer} 
                  isVideoOn={remoteUser.isVideoOn !== false} 
                />
                
                {remoteUser.isVideoOn === false && (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-semibold">
                        P{index + 1}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className={`backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm ${
                    isRemoteHost ? 'bg-red-600/80' : 'bg-black/60'
                  }`}>
                    Participant {index + 1} {isRemoteHost && '(Host)'}
                  </div>
                  {remoteUser.isMuted && (
                    <div className="bg-red-600 rounded-full p-2">
                      <MicOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls - Google Meet Style */}
      <div className={`absolute bottom-0 left-0 right-0 z-50 transition-opacity duration-300 ${
        isControlsVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center justify-center p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-4 bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3">
            {/* Microphone */}
            <Button 
              onClick={handleMute} 
              variant="ghost"
              size="lg"
              className={`rounded-full w-12 h-12 transition-all ${
                isMuted 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            {/* Camera */}
            <Button 
              onClick={handleVideo} 
              variant="ghost"
              size="lg"
              className={`rounded-full w-12 h-12 transition-all ${
                !isVideoOn 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>

            {/* Screen Share */}
            <Button 
              variant="ghost"
              size="lg"
              className="rounded-full w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white"
            >
              <Monitor className="w-5 h-5" />
            </Button>

            {/* End Call */}
            {isHost ? (
              <Button 
                onClick={handleEndCall} 
                variant="ghost"
                size="lg"
                className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700 text-white"
              >
                <PhoneCall className="w-5 h-5" />
              </Button>
            ) : (
              <Button 
                onClick={handleLeaveCall} 
                variant="ghost"
                size="lg"
                className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700 text-white"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}

            {/* More Options */}
            <Button 
              variant="ghost"
              size="lg"
              className="rounded-full w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Participants Panel */}
      {showParticipants && (
        <div className="absolute right-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-sm border-l border-gray-700 z-40">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Participants ({participantCount})</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-white"
                onClick={() => setShowParticipants(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">Y</span>
              </div>
              <div className="flex-1">
                <div className="text-white text-sm">You {isHost && '(Host)'}</div>
              </div>
              <div className="flex gap-1">
                {isMuted && <MicOff className="w-4 h-4 text-red-400" />}
                {!isVideoOn && <VideoOff className="w-4 h-4 text-red-400" />}
              </div>
            </div>
            {/* Add remote participants here */}
          </div>
        </div>
      )}
    </div>
  );
}

const VideoPlayer = ({ peer, isVideoOn = true }) => {
  const ref = useRef();
  const playAttempts = useRef(0);
  const maxPlayAttempts = 5;
  const streamCleanupRef = useRef();

  const attemptPlay = async () => {
    if (!ref.current || !ref.current.srcObject || playAttempts.current >= maxPlayAttempts) return;
    
    try {
      await ref.current.play();
      console.log('Remote video playing successfully');
      playAttempts.current = 0;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log(`Play attempt ${playAttempts.current + 1} was aborted, retrying in 1 second...`);
        playAttempts.current++;
        setTimeout(attemptPlay, 1000);
      } else {
        console.error('Error playing remote video:', err);
      }
    }
  };

  useEffect(() => {
    if (!peer) return;

    const handleStream = (stream) => {
      console.log("Received remote stream in VideoPlayer");
      
      if (ref.current) {
        if (streamCleanupRef.current) {
          streamCleanupRef.current();
        }
        
        playAttempts.current = 0;
        ref.current.srcObject = stream;
        
        streamCleanupRef.current = () => {
          if (ref.current) {
            ref.current.pause();
            ref.current.srcObject = null;
            ref.current.load();
          }
        };
        
        ref.current.onloadedmetadata = () => {
          console.log('Remote video metadata loaded, attempting to play...');
          attemptPlay();
        };
      }
    };

    peer.on("stream", handleStream);

    if (peer.streams && peer.streams[0]) {
      console.log("Peer already has stream, setting it immediately");
      handleStream(peer.streams[0]);
    }

    return () => {
      if (ref.current) {
        const video = ref.current;
        video.onloadedmetadata = null;
        video.pause();
        video.srcObject = null;
        video.load();
      }
      
      if (streamCleanupRef.current) {
        streamCleanupRef.current();
        streamCleanupRef.current = null;
      }
      
      if (peer) {
        peer.removeListener("stream", handleStream);
      }
    };
  }, [peer]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={false}
      className="w-full h-full object-cover"
    />
  );
};

export default MeetingPage;