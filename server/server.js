import { Server } from "socket.io";
import express from "express";
import http from "http";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const PORT = process.env.PORT || "3000";
const app = express();
const server = http.createServer(app);
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const prisma = new PrismaClient();

const getNotes = async () => {
  const notes = await prisma.note.findMany({
    select: {
      id: true,
      description: true,
    },
    orderBy: {
      created_At: "asc",
    },
  });
  return notes;
};

io.on("connection", async (socket) => {
  console.log("connected");

  socket.on("add_note", async (newNote) => {
    const note = await prisma.note.create({
      data: newNote,
    });
    socket.emit("note_added", note);

    const notes = await getNotes();
    socket.broadcast.emit("send_notes", notes);
  });

  const notes = await getNotes();

  socket.on("delete_note", async (note) => {
    await prisma.note.delete({
      where: {
        id: note.id,
      },
    });
    socket.emit("note_deleted", note.id);

    const notes = await getNotes();
    socket.broadcast.emit("send_notes", notes);
  });

  socket.emit("send_notes", notes);
});

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
