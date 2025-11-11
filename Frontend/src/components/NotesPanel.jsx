// src/components/NotesPanel.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useNotes, useCreateNote, useDeleteNote, useUpdateNote } from "./hooks/useNotes";
import { useUser } from "../context/UserContext";

export default function NotesPanel() {
    const [newNote, setNewNote] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingContent, setEditingContent] = useState("");

    const { user } = useUser();
    const userId = user?._id;

    const { data: notes = [] } = useNotes(userId);
    const createNoteMutation = useCreateNote(userId);
    const updateNoteMutation = useUpdateNote(userId);
    const deleteNoteMutation = useDeleteNote(userId);

    // Add note
    const handleAddNote = () => {
        if (newNote.trim() !== "") {
            createNoteMutation.mutate({ content: newNote });
            setNewNote("");
            setIsAdding(false);
        }
    };

    // Start editing
    const handleStartEdit = (note) => {
        setEditingId(note._id);
        setEditingContent(note.content);
    };

    // Save edit
    const handleSaveEdit = (id) => {
        if (editingContent.trim() !== "") {
            updateNoteMutation.mutate({ id, content: editingContent });
            setEditingId(null);
            setEditingContent("");
        }
    };

    // Cancel edit
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingContent("");
    };

    // Delete
    const handleDeleteNote = (id) => {
        deleteNoteMutation.mutate(id);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-white">Notes</h2>
                <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={() => setIsAdding((prev) => !prev)}
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            {/* Add Note Input */}
            {isAdding && (
                <div className="flex items-center gap-2 mb-2">
                    <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm rounded-lg border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder-gray-400"
                        placeholder="Write a note..."
                    />
                    <Button size="sm" onClick={handleAddNote}>
                        Save
                    </Button>
                </div>
            )}

            {/* Notes List */}
            <div className="overflow-y-auto flex-1 pr-1 max-h-60">
                {notes.length === 0 ? (
                    <p className="text-sm text-gray-400">No notes yet.</p>
                ) : (
                        <ul className="space-y-2 text-sm">
                            {notes.map((note) => (
                                <li
                                    key={note._id}
                                    className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-sm flex justify-between items-center group"
                                >
                                    {editingId === note._id ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                type="text"
                                                value={editingContent}
                                                onChange={(e) => setEditingContent(e.target.value)}
                                                className="flex-1 px-2 py-1 text-sm rounded-lg border border-white/20 bg-white/10 backdrop-blur-md text-white"
                                            />
                                            <Button
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => handleSaveEdit(note._id)}
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-7 w-7"
                                                onClick={handleCancelEdit}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-white">{note.content}</span>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-yellow-400 hover:text-yellow-300"
                                                    onClick={() => handleStartEdit(note)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-red-400 hover:text-red-300"
                                                    onClick={() => handleDeleteNote(note._id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                )}
            </div>
        </div>
    );
}
