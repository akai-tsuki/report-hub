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
import { createPost, getGroups } from "../../services/reports";
import { useAuth } from "../../context/AuthContext";
import { GroupConfig } from "../../types";
import { getPriorityOptions } from "../../utils/formatUtils";

interface ReplyDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string;
  threadId: string | undefined;
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
  const [authorName, setAuthorName] = useState("");
  const [group, setGroup] = useState("");
  const [groupName, setGroupName] = useState("");
  const [recipient, setRecipient] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [groups, setGroups] = useState<GroupConfig[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    if (!content.trim()) {
      setContentError("Reply content is required");
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
      if (!threadId) {
        console.error("Thread ID is undefined");
        return;
      }
      
      await createPost(
        content,
        parentId,
        threadId,
        currentUser.uid,
        currentUser.displayName || "Anonymous User",
        groupName || undefined,
        recipient || undefined,
        authorName !== (currentUser.displayName || "Anonymous User") ? authorName : undefined,
        title || undefined,
        currentUser.photoURL || undefined,
        priority
      );
      
      onReplySubmitted();
      
      // Reset form
      setContent("");
      setTitle("");
      setRecipient("");
      setGroup("");
      setGroupName("");
      if (currentUser) {
        setAuthorName(currentUser.displayName || "Anonymous User");
      }
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
      setAuthorNameError("");
      setTitle("");
      setRecipient("");
      setGroup("");
      setGroupName("");
      setPriority("medium");
      if (currentUser) {
        setAuthorName(currentUser.displayName || "Anonymous User");
      }
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reply</DialogTitle>
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
            <InputLabel id="reply-group-select-label">Group</InputLabel>
            <Select
              labelId="reply-group-select-label"
              id="reply-group-select"
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
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
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
            <InputLabel id="reply-priority-select-label">Priority</InputLabel>
            <Select
              labelId="reply-priority-select-label"
              id="reply-priority-select"
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value)}
              disabled={isSubmitting}
            >
              {getPriorityOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.value === 'none' ? <em>{option.label}</em> : option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* 6. 内容 */}
          <TextField
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