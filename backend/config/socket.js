import { Server } from 'socket.io';

let ioInstance = null;

function userRoom(email) {
  return `user:${email.toLowerCase()}`;
}

function deliveryPartnerRoom(email) {
  return `delivery:${email.toLowerCase()}`;
}

function initializeSocket(server, allowedOrigins = []) {
  ioInstance = new Server(server, {
    cors: {
      origin(origin, callback) {
        const localOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'];
        const origins = [...localOrigins, ...allowedOrigins];

        if (!origin || origins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`Socket.IO CORS blocked origin: ${origin}`));
      },
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    const email = String(socket.handshake.auth?.email || socket.handshake.query?.email || '').toLowerCase();
    const isAdmin = socket.handshake.auth?.isAdmin === true || socket.handshake.query?.isAdmin === 'true';

    if (email) {
      socket.join(userRoom(email));
      if (isAdmin === false && socket.handshake.auth?.role === 'delivery_partner') {
        socket.join(deliveryPartnerRoom(email));
      }
    }

    if (isAdmin) {
      socket.join('admins');
    }

    socket.on('join-admin', () => {
      socket.join('admins');
    });

    socket.on('join-user', (payload = {}) => {
      if (payload.email) {
        socket.join(userRoom(payload.email));
      }
    });

    socket.on('join-delivery-partner', (payload = {}) => {
      if (payload.email) {
        socket.join(deliveryPartnerRoom(payload.email));
      }
    });
  });

  return ioInstance;
}

function getSocketServer() {
  return ioInstance;
}

function emitToAdmins(event, payload) {
  ioInstance?.to('admins').emit(event, payload);
}

function emitToUser(email, event, payload) {
  if (!email) return;
  ioInstance?.to(userRoom(email)).emit(event, payload);
}

function emitToDeliveryPartner(email, event, payload) {
  if (!email) return;
  ioInstance?.to(deliveryPartnerRoom(email)).emit(event, payload);
}

export {
  emitToDeliveryPartner,
  emitToAdmins,
  emitToUser,
  getSocketServer,
  initializeSocket
};
