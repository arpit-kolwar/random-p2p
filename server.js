const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const app = express();

const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

app.use(cors());

//Queue for user waiting
let waitingUsers = [];
let activeRooms = new Map();

const handleUserLeave = (socket) => {
  //SKIP LOGIC WILL COME HERE
};

io.on("connection", (socket) => {
  console.log("User connected" + socket.id);

  //JOIN QUEUE
  socket.on("join-queue", () => {
    if (waitingUsers.length > 0) {
      const partner = waitingUsers.shift();

      const roomId = `room-${socket.id}-${partner.id}`;

      //Both joined
      socket.join(roomId);
      partner.join(roomId);
      //Both joined

      //Added both users to active room with there room id and there partner id

      activeRooms.set(socket.id, {
        roomId,
        partnerId: partner.id,
      });

      activeRooms.set(partner.id, {
        roomId,
        partnerId: socket.id,
      });

      //Added both users to active room with there room id and there partner id

      socket.emit("matched", {
        roomId,
        partnerId: partner.id,
      });
      partner.emit("matched", {
        roomId,
        partnerId: socket.id,
      });
    } else {
      waitingUsers.push(socket);
      socket.emit("waiting");
    }
  });
  //JOIN QUEUE

  //OFFER
  socket.on("offer", ({ target, offer }) => {
    socket.to(target).emit("offer", {
      offer,
      senderId: socket.id,
    });
  });

  //ANSWER
  socket.on("answer", ({ target, answer }) => {
    socket.to(target).emit("answer", {
      answer,
      senderId: socket.id,
    });
  });

  //GATHERING ICE CANDIDATE
  socket.on("ice-candidate", ({ target, candidate }) => {
    socket.to(target).emit("ice-candidate", {
      candidate: candidate,
      senderId: socket.id,
    });
  });

  //SKIP USER

  socket.on("skip", () => {
    handleUserLeave(socket);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
