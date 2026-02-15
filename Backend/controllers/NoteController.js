const express = require("express");
const Note = require("../models/Notes");
const mongoose = require("mongoose");

exports.createNote = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.id;
        const newNote = new Note({ content, userId });
        await newNote.save();
        res.status(201).json(newNote);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getNotes = async (req, res) => {
    try {
        const userId = req.user.id;
        const notes = await Note.find({ userId });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getNoteById = async (req, res) => {
    try {
        const userId = req.user.id;
        const noteId = req.params.id;
        const note = await Note.findOne({ _id: noteId, userId });
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateNote = async (req, res) => {
    try {
        const userId = req.user.id;
        const noteId = req.params.id;
        const { content } = req.body;
        const note = await Note.findOne({ _id: noteId, userId });
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        note.content = content;
        note.updatedAt = Date.now();
        await note.save();
        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteNote = async (req, res) => {
    try {
        const userId = req.user.id;
        const noteId = req.params.id;
        const note = await Note.findOneAndDelete({ _id: noteId, userId });
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};