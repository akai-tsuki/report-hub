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
  SelectChangeEvent,
} from "@mui/material";
import { createThread, getGroups } from "../../services/reports";
import { useAuth } from "../../context/AuthContext";
import { GroupConfig } from "../../types";
import { getPriorityOptions } from "../../utils/formatUtils";

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
  const [authorName, setAuthorName] = useState("");
  const [group, setGroup] = useState("");
  const [groupName, setGroupName] = useState("");
  const [recipient, setRecipient] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [groups, setGroups] = useState<GroupConfig[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [authorNameError, setAuthorNameError] = useState("");

  useEffect(() => {
    if (currentUser) {
      setAuthorName(currentUser.displayName || "Anonymous User");
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (open) {
        setIsLoading(true);
        try {
          const fetchedGroups = await getGroups();
          setGroups(fetchedGroups);
        } catch (error) {
          console.error("Error fetching groups:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchGroups();
  }, [open]);

  const handleGroupChange = (event: SelectChangeEvent) => {
    const selectedGroupId = event.target.value;
    setGroup(selectedGroupId);
    
    // グループIDから名前を設定
    if (selectedGroupId) {
      const selectedGroup = groups.find(g => g.id === selectedGroupId);
      setGroupName(selectedGroup ? selectedGroup.name : '');
    } else {
      setGroupName('');
    }
  };

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

    if (!authorName.trim()) {
      setAuthorNameError("Name is required");
      isValid = false;
    } else {
      setAuthorNameError("");
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
        groupName || undefined,
        recipient || undefined,
        authorName !== (currentUser.displayName || "Anonymous User") ? authorName : undefined,
        currentUser.photoURL || undefined,
        priority
      );
      onThreadCreated();
      
      // Reset form
      setTitle("");
      setContent("");
      setAuthorName(currentUser.displayName || "Anonymous User");
      setGroup("");
      setGroupName("");
      setRecipient("");
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
      setAuthorNameError("");
      setGroup("");
      setGroupName("");
      setRecipient("");
      setPriority("medium");
      if (currentUser) {
        setAuthorName(currentUser.displayName || "Anonymous User");
      }
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Thread</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {/* 1. 名前 */}
          <TextField
            autoFocus
            margin="dense"
            label="Your Name"
            fullWidth
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            disabled={isSubmitting}
            error={!!authorNameError}
            helperText={authorNameError}
            sx={{ mb: 2 }}
          />
          
          {/* 2. グループ */}
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="group-select-label">Group</InputLabel>
            <Select
              labelId="group-select-label"
              id="group-select"
              value={group}
              label="Group"
              onChange={handleGroupChange}
              disabled={isSubmitting || isLoading}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 3. タイトル */}
          <TextField
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
          
          {/* 4. 宛先 */}
          <TextField
            margin="dense"
            label="Recipient"
            fullWidth
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          />
          
          {/* 5. 重要度 */}
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="priority-select-label">Priority</InputLabel>
            <Select
              labelId="priority-select-label"
              id="priority-select"
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value)}
              disabled={isSubmitting}
            >
              {getPriorityOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* 6. 内容 */}
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