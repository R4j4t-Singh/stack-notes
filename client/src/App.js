import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io(process.env.REACT_APP_SERVER_URL);

const App = () => {
  const [notes, setNotes] = useState([]);
  const [description, setDescription] = useState("");

  useEffect(() => {
    socket.on("send_notes", (notes) => {
      setNotes(notes);
    });

    socket.on("note_added", (note) => {
      setNotes((prevNotes) => [...prevNotes, note]);
      setDescription("");
    });

    socket.on("note_deleted", (id) => {
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    });

    return () => {
      socket.off("send_notes");
      socket.off("note_added");
      socket.off("note_deleted");
    };
  }, []);

  const addNote = () => {
    if (description.trim()) {
      socket.emit("add_note", { description });
    }
  };

  const deleteNote = (id) => {
    socket.emit("delete_note", { id });
  };

  return (
    <div className="container">
      <div className="notes-container">
        {notes.slice(0, 5).map((note) => (
          <div key={note.id} id={note.id} className="note">
            {note.description}
            <button
              className="delete-button"
              onClick={() => deleteNote(note.id)}
            >
              X
            </button>
          </div>
        ))}
        {notes.length > 5 && (
          <div className="remaining-notes">+{notes.length - 5} more</div>
        )}
      </div>
      <div className="inner-container">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="add-note" onClick={addNote}>
          +
        </button>
      </div>
    </div>
  );
};

export default App;
