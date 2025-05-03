import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { getThreads, createPost } from "../../services/reports";
import { useAuth } from "../../context/AuthContext";
import { ReportThread } from "../../types";

interface NewPostDialogProps {
  open: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

const NewPostDialog: React.FC<NewPostDialogProps> = ({
  open,
  onClose,
  onPostCreated,
}) => {
  const { currentUser } = useAuth();
  const [content, setContent] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [threads, setThreads] = useState<ReportThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [threadError, setThreadError] = useState("");
  const [contentError, setContentError] = useState("");

  useEffect(() => {
    if (open) {
      loadThreads();
    }
  }, [open]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const result = await getThreads();
      setThreads(result.threads);
      
      // Automatically select the first thread if there is only one
      if (result.threads.length === 1) {
        setSelectedThreadId(result.threads[0].id);
      }
    } catch (error) {
      console.error("Error loading threads", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    let isValid = true;
    
    if (!selectedThreadId) {
      setThreadError("Please select a thread");
      isValid = false;
    } else {
      setThreadError("");
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
      
      // Get the thread to find its root post ID
      const thread = threads.find(t => t.id === selectedThreadId);
      
      if (!thread) {
        console.error("Selected thread not found");
        return;
      }

      await createPost(
        content,
        thread.rootPostId,  // Using the root post as parent
        selectedThreadId,
        currentUser.uid,
        currentUser.displayName || "Anonymous User",
        currentUser.photoURL || undefined
      );
      
      onPostCreated();
      
      // Reset form
      setContent("");
      setSelectedThreadId("");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setContent("");
      setSelectedThreadId("");
      setThreadError("");
      setContentError("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Post</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <FormControl 
            fullWidth 
            margin="dense" 
            error={!!threadError}
            disabled={loading || isSubmitting}
            sx={{ mb: 2 }}
          >
            <InputLabel id="thread-select-label">Select Thread</InputLabel>
            <Select
              labelId="thread-select-label"
              value={selectedThreadId}
              label="Select Thread"
              onChange={(e) => setSelectedThreadId(e.target.value)}
            >
              {loading ? (
                <MenuItem disabled>Loading threads...</MenuItem>
              ) : threads.length === 0 ? (
                <MenuItem disabled>No threads available</MenuItem>
              ) : (
                threads.map((thread) => (
                  <MenuItem key={thread.id} value={thread.id}>
                    {thread.title}
                  </MenuItem>
                ))
              )}
            </Select>
            {threadError && <FormHelperText>{threadError}</FormHelperText>}
          </FormControl>

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
            disabled={loading || isSubmitting || threads.length === 0}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Create Post"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default NewPostDialog;