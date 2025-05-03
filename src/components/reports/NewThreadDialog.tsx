import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { createThread } from "../../services/reports";
import { useAuth } from "../../context/AuthContext";

interface NewThreadDialogProps {
  open: boolean;
  onClose: () => void;
  onThreadCreated: () => void;
}

const NewThreadDialog: React.FC<NewThreadDialogProps> = ({
  open,
  onClose,
  onThreadCreated,
}) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    let isValid = true;
    if (!title.trim()) {
      setTitleError("Title is required");
      isValid = false;
    } else {
      setTitleError("");
    }

    if (!content.trim()) {
      setContentError("Content is required");
      isValid = false;
    } else {
      setContentError("");
    }

    if (!isValid) return;

    if (!currentUser) {
      console.error("User not authenticated");
      return;
    }

    try {
      setIsSubmitting(true);
      await createThread(
        title,
        content,
        currentUser.uid,
        currentUser.displayName || "Anonymous User",
        currentUser.photoURL || undefined
      );
      onThreadCreated();
      
      // Reset form
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error creating thread:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setContent("");
      setTitleError("");
      setContentError("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Thread</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Thread Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            error={!!titleError}
            helperText={titleError}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            error={!!contentError}
            helperText={contentError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Create Thread"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default NewThreadDialog;