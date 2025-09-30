const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const Note = require("../models/Notes");
const NoteController = require("../controllers/NoteController");

router.post("/create-note", protect, NoteController.createNote);
router.get("/get-notes", protect, NoteController.getNotes);
router.get("/get-note/:id", protect, NoteController.getNoteById);
router.put("/update-note/:id", protect, NoteController.updateNote);
router.delete("/delete-note/:id", protect, NoteController.deleteNote);

module.exports = router;