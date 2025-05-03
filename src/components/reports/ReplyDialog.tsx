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
import { createPost } from "../../services/reports";
import { useAuth } from "../../context/AuthContext";

interface ReplyDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string;
  threadId: string;
  onReplySubmitted: () => void;
}

const ReplyDialog: React.FC<ReplyDialogProps> = ({
  open,
  onClose,
  parentId,
  threadId,
  onReplySubmitted,
}) => {
  const { currentUser } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentError, setContentError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!content.trim()) {
      setContentError("Reply content is required");
      return;
    } else {
      setContentError("");
    }

    if (!currentUser) {
      console.error("User not authenticated");
      return;
    }

    try {
      setIsSubmitting(true);
      await createPost(
        content,
        parentId,
        threadId,
        currentUser.uid,
        currentUser.displayName || "Anonymous User",
        currentUser.photoURL || undefined
      );
      
      onReplySubmitted();
      
      // Reset form
      setContent("");
    } catch (error) {
      console.error("Error creating reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setContent("");
      setContentError("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reply</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Reply"
            fullWidth
            multiline
            rows={4}
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
            {isSubmitting ? <CircularProgress size={24} /> : "Submit Reply"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ReplyDialog;