const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
});

// Store meeting rooms and user info
const meetingRooms = new Map();
const userSockets = new Map();

// Socket.io setup
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Store user socket info
  userSockets.set(socket.id, {
    socketId: socket.id,
    connectedAt: new Date(),
    currentMeeting: null
  });

  socket.on('joinMeeting', ({ meetingId, userId }) => {
    console.log(`User ${userId} joining meeting ${meetingId}`);
    
    try {
      // Leave any previous rooms
      if (userSockets.has(socket.id) && userSockets.get(socket.id).currentMeeting) {
        const prevMeeting = userSockets.get(socket.id).currentMeeting;
        socket.leave(prevMeeting);
        console.log(`User ${socket.id} left previous meeting ${prevMeeting}`);
      }
      
      // Join the new meeting room
      socket.join(meetingId);
      
      // Update user info
      if (userSockets.has(socket.id)) {
        userSockets.set(socket.id, {
          ...userSockets.get(socket.id),
          currentMeeting: meetingId,
          userId: userId
        });
      }
      
      // Initialize meeting room if it doesn't exist
      if (!meetingRooms.has(meetingId)) {
        meetingRooms.set(meetingId, {
          id: meetingId,
          createdAt: new Date(),
          users: new Set(),
          userStates: new Map(),
          host: socket.id // Set the first user as host
        });
        console.log(`User ${socket.id} is now the host of meeting ${meetingId}`);
      }
      
      const meetingRoom = meetingRooms.get(meetingId);
      meetingRoom.users.add(socket.id);
      meetingRoom.userStates.set(socket.id, {
        userId: socket.id,
        isMuted: false,
        isVideoOn: true,
        joinedAt: new Date(),
        isHost: meetingRoom.host === socket.id
      });
      
      // Get all existing users in the room (excluding the newly joined user)
      const room = io.sockets.adapter.rooms.get(meetingId);
      const existingUsers = room ? Array.from(room).filter(id => id !== socket.id) : [];
      
      console.log(`Meeting ${meetingId} now has ${existingUsers.length + 1} participants`);
      
      // Send existing users to the newly joined user
      socket.emit('allUsers', existingUsers.map(id => ({ userId: id })));
      
      // Send host info to the newly joined user
      socket.emit('hostInfo', { hostId: meetingRoom.host, isHost: meetingRoom.host === socket.id });
      
      // Notify existing users about the new participant
      socket.to(meetingId).emit('userJoined', { userId: socket.id });
      
      // Send current states of existing users to new user
      existingUsers.forEach(existingUserId => {
        const userState = meetingRoom.userStates.get(existingUserId);
        if (userState) {
          socket.emit('userMuted', { userId: existingUserId, isMuted: userState.isMuted });
          socket.emit('userVideo', { userId: existingUserId, isVideoOn: userState.isVideoOn });
        }
      });
      
    } catch (error) {
      console.error('Error in joinMeeting:', error);
      socket.emit('error', { message: 'Failed to join meeting' });
    }
  });

  socket.on('sendingSignal', ({ userToSignal, callerID, signal }) => {
    console.log(`Signal from ${callerID} to ${userToSignal}`);
    
    // Validate that both users are in a meeting room
    const callerSocket = userSockets.get(callerID);
    const targetSocket = userSockets.get(userToSignal);
    
    if (callerSocket && targetSocket && callerSocket.currentMeeting === targetSocket.currentMeeting) {
      io.to(userToSignal).emit('receivingSignal', { signal, callerID });
    } else {
      console.warn(`Invalid signal routing: ${callerID} -> ${userToSignal}`);
    }
  });

  socket.on('returningSignal', ({ signal, callerID }) => {
    console.log(`Return signal to ${callerID} from ${socket.id}`);
    
    // Validate the connection
    const callerSocket = userSockets.get(callerID);
    const currentSocket = userSockets.get(socket.id);
    
    if (callerSocket && currentSocket && callerSocket.currentMeeting === currentSocket.currentMeeting) {
      io.to(callerID).emit('receivingReturnedSignal', { signal, id: socket.id });
    } else {
      console.warn(`Invalid return signal routing: ${socket.id} -> ${callerID}`);
    }
  });

  socket.on('toggleMute', ({ meetingId, userId, isMuted }) => {
    console.log(`User ${userId} toggled mute: ${isMuted} in meeting ${meetingId}`);
    
    try {
      // Validate user is in the meeting
      const userSocket = userSockets.get(socket.id);
      if (userSocket && userSocket.currentMeeting === meetingId) {
        // Update user state in meeting room
        const meetingRoom = meetingRooms.get(meetingId);
        if (meetingRoom && meetingRoom.userStates.has(socket.id)) {
          const userState = meetingRoom.userStates.get(socket.id);
          userState.isMuted = isMuted;
          meetingRoom.userStates.set(socket.id, userState);
        }
        
        // Broadcast to other users in the meeting
        socket.to(meetingId).emit('userMuted', { userId: socket.id, isMuted });
      } else {
        console.warn(`Invalid mute toggle: User ${socket.id} not in meeting ${meetingId}`);
      }
    } catch (error) {
      console.error('Error in toggleMute:', error);
    }
  });

  socket.on('toggleVideo', ({ meetingId, userId, isVideoOn }) => {
    console.log(`User ${userId} toggled video: ${isVideoOn} in meeting ${meetingId}`);
    
    try {
      // Validate user is in the meeting
      const userSocket = userSockets.get(socket.id);
      if (userSocket && userSocket.currentMeeting === meetingId) {
        // Update user state in meeting room
        const meetingRoom = meetingRooms.get(meetingId);
        if (meetingRoom && meetingRoom.userStates.has(socket.id)) {
          const userState = meetingRoom.userStates.get(socket.id);
          userState.isVideoOn = isVideoOn;
          meetingRoom.userStates.set(socket.id, userState);
        }
        
        // Broadcast to other users in the meeting
        socket.to(meetingId).emit('userVideo', { userId: socket.id, isVideoOn });
      } else {
        console.warn(`Invalid video toggle: User ${socket.id} not in meeting ${meetingId}`);
      }
    } catch (error) {
      console.error('Error in toggleVideo:', error);
    }
  });

  // Modified endCall handler - only host can end call for everyone
  socket.on('endCall', ({ meetingId }) => {
    console.log(`End call request in meeting ${meetingId} by user ${socket.id}`);
    
    try {
      const meetingRoom = meetingRooms.get(meetingId);
      const userSocket = userSockets.get(socket.id);
      
      // Check if user is in the meeting
      if (!userSocket || userSocket.currentMeeting !== meetingId) {
        console.warn(`User ${socket.id} not in meeting ${meetingId}`);
        socket.emit('error', { message: 'You are not in this meeting' });
        return;
      }
      
      // Check if user is the host
      if (!meetingRoom || meetingRoom.host !== socket.id) {
        console.warn(`User ${socket.id} is not the host of meeting ${meetingId}`);
        socket.emit('error', { message: 'Only the host can end the call for everyone' });
        return;
      }
      
      console.log(`Host ${socket.id} ending call for meeting ${meetingId}`);
      
      // Notify all users in the meeting that the call has ended
      io.to(meetingId).emit('callEnded', { endedBy: socket.id });
      
      // Get all users in the meeting room
      const room = io.sockets.adapter.rooms.get(meetingId);
      if (room) {
        // Make all users leave the meeting room
        room.forEach(socketId => {
          const userSocket = io.sockets.sockets.get(socketId);
          if (userSocket) {
            userSocket.leave(meetingId);
            // Update user info
            if (userSockets.has(socketId)) {
              const userData = userSockets.get(socketId);
              userData.currentMeeting = null;
              userSockets.set(socketId, userData);
            }
          }
        });
      }
      
      // Clean up meeting room data
      if (meetingRooms.has(meetingId)) {
        meetingRooms.delete(meetingId);
        console.log(`Meeting room ${meetingId} has been cleaned up`);
      }
      
    } catch (error) {
      console.error('Error in endCall:', error);
      socket.emit('error', { message: 'Failed to end call' });
    }
  });

  // Add new event for individual user leaving (not ending call for everyone)
  socket.on('leaveCall', ({ meetingId }) => {
    console.log(`User ${socket.id} leaving call in meeting ${meetingId}`);
    
    try {
      const userSocket = userSockets.get(socket.id);
      if (userSocket && userSocket.currentMeeting === meetingId) {
        // Just remove this user from the meeting
        socket.leave(meetingId);
        userSocket.currentMeeting = null;
        
        // Notify other users
        socket.to(meetingId).emit('userLeft', { userId: socket.id });
        
        // Clean up meeting room data for this user
        const meetingRoom = meetingRooms.get(meetingId);
        if (meetingRoom) {
          meetingRoom.users.delete(socket.id);
          meetingRoom.userStates.delete(socket.id);
          
          // If the host leaves, assign new host
          if (meetingRoom.host === socket.id && meetingRoom.users.size > 0) {
            const newHost = meetingRoom.users.values().next().value;
            meetingRoom.host = newHost;
            
            // Update the new host's state
            if (meetingRoom.userStates.has(newHost)) {
              const newHostState = meetingRoom.userStates.get(newHost);
              newHostState.isHost = true;
              meetingRoom.userStates.set(newHost, newHostState);
            }
            
            console.log(`New host assigned: ${newHost} for meeting ${meetingId}`);
            
            // Notify all users about the new host
            io.to(meetingId).emit('hostChanged', { newHostId: newHost });
          }
          
          // If the meeting room is empty, clean it up
          if (meetingRoom.users.size === 0) {
            meetingRooms.delete(meetingId);
            console.log(`Empty meeting room ${meetingId} has been cleaned up`);
          } else {
            console.log(`Meeting ${meetingId} now has ${meetingRoom.users.size} participants`);
          }
        }
      } else {
        console.warn(`Invalid leave call: User ${socket.id} not in meeting ${meetingId}`);
      }
    } catch (error) {
      console.error('Error in leaveCall:', error);
      socket.emit('error', { message: 'Failed to leave call' });
    }
  });

  // Modified disconnect handler
  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
    
    try {
      const userSocket = userSockets.get(socket.id);
      if (userSocket && userSocket.currentMeeting) {
        const meetingId = userSocket.currentMeeting;
        
        // Notify other users in the meeting about the disconnection
        socket.to(meetingId).emit('userLeft', { userId: socket.id });
        
        // Clean up meeting room data
        const meetingRoom = meetingRooms.get(meetingId);
        if (meetingRoom) {
          meetingRoom.users.delete(socket.id);
          meetingRoom.userStates.delete(socket.id);
          
          // If the host disconnects, assign new host
          if (meetingRoom.host === socket.id && meetingRoom.users.size > 0) {
            const newHost = meetingRoom.users.values().next().value;
            meetingRoom.host = newHost;
            
            // Update the new host's state
            if (meetingRoom.userStates.has(newHost)) {
              const newHostState = meetingRoom.userStates.get(newHost);
              newHostState.isHost = true;
              meetingRoom.userStates.set(newHost, newHostState);
            }
            
            console.log(`New host assigned after disconnect: ${newHost} for meeting ${meetingId}`);
            
            // Notify all users about the new host
            io.to(meetingId).emit('hostChanged', { newHostId: newHost });
          }
          
          // If the meeting room is empty, clean it up
          if (meetingRoom.users.size === 0) {
            meetingRooms.delete(meetingId);
            console.log(`Empty meeting room ${meetingId} has been cleaned up`);
          } else {
            console.log(`Meeting ${meetingId} now has ${meetingRoom.users.size} participants`);
          }
        }
      }
      
      // Clean up user socket data
      userSockets.delete(socket.id);
      
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  // Heartbeat mechanism to detect stale connections
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // Send initial connection confirmation
  socket.emit('connected', { 
    socketId: socket.id, 
    timestamp: new Date().toISOString() 
  });
});

// Periodic cleanup of stale data
setInterval(() => {
  const now = new Date();
  const staleThreshold = 30 * 60 * 1000; // 30 minutes
  
  // Clean up old meeting rooms
  meetingRooms.forEach((room, meetingId) => {
    if (now - room.createdAt > staleThreshold && room.users.size === 0) {
      meetingRooms.delete(meetingId);
      console.log(`Cleaned up stale meeting room: ${meetingId}`);
    }
  });
  
  // Clean up disconnected user sockets
  userSockets.forEach((userData, socketId) => {
    if (!io.sockets.sockets.has(socketId)) {
      userSockets.delete(socketId);
      console.log(`Cleaned up stale user socket: ${socketId}`);
    }
  });
}, 5 * 60 * 1000); // Run cleanup every 5 minutes

// Middleware setup
if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// Routes
app.use('/v1', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activeMeetings: meetingRooms.size,
    activeConnections: userSockets.size
  });
});

// Meeting stats endpoint (for debugging)
app.get('/v1/meetings/stats', (req, res) => {
  const stats = {
    totalMeetings: meetingRooms.size,
    totalConnections: userSockets.size,
    meetings: Array.from(meetingRooms.entries()).map(([id, room]) => ({
      id,
      participantCount: room.users.size,
      createdAt: room.createdAt,
      hostId: room.host
    }))
  };
  res.json(stats);
});

// Send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle error
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Export express app and server
module.exports = { app, server };