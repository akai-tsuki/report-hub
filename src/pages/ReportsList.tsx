import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
  List,
  Divider,
  CircularProgress,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { getThreads } from "../services/reports";
import { ReportThread } from "../types";
import { useAuth } from "../context/AuthContext";
import ThreadListItem from "../components/reports/ThreadListItem";
import NewThreadDialog from "../components/reports/NewThreadDialog";
import NewPostDialog from "../components/reports/NewPostDialog";
import Header from "../components/layout/Header";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

const ReportsList: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [threads, setThreads] = useState<ReportThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [newThreadDialogOpen, setNewThreadDialogOpen] = useState(false);
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      loadThreads();
    }
  }, [currentUser, navigate]);

  const loadThreads = async (reset = true) => {
    try {
      setLoading(true);
      const result = await getThreads(reset ? undefined : lastVisible || undefined);
      
      if (reset) {
        setThreads(result.threads);
      } else {
        setThreads((prev) => [...prev, ...result.threads]);
      }
      
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error loading threads", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreThreads = () => {
    if (!loading && hasMore) {
      loadThreads(false);
    }
  };


  const handleNewThread = () => {
    setNewThreadDialogOpen(true);
  };

  const handleNewPost = () => {
    setNewPostDialogOpen(true);
  };

  const handleThreadCreated = () => {
    setNewThreadDialogOpen(false);
    loadThreads();
  };

  const handlePostCreated = () => {
    setNewPostDialogOpen(false);
    loadThreads();
  };

  const handleThreadClick = (threadId: string) => {
    navigate(`/reports/${threadId}`);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Container maxWidth="md" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h4" component="h1">
              Reports
            </Typography>
            <Button 
              variant="outlined"
              size="small"
              onClick={() => navigate('/settings/groups')}
              sx={{ ml: 2 }}
            >
              Group Settings
            </Button>
          </Box>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleNewPost}
              sx={{ mr: 2 }}
            >
              New Post
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<ListAltIcon />}
              onClick={handleNewThread}
            >
              New Thread
            </Button>
          </Box>
        </Box>

        <Paper elevation={2} sx={{ p: 2 }}>
          {loading && threads.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : threads.length === 0 ? (
            <Typography variant="body1" sx={{ p: 2, textAlign: "center" }}>
              No reports found. Create a new thread to get started.
            </Typography>
          ) : (
            <>
              <List>
                {threads.map((thread, index) => (
                  <React.Fragment key={thread.id}>
                    <ThreadListItem
                      thread={thread}
                      onClick={() => handleThreadClick(thread.id)}
                    />
                    {index < threads.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
              {hasMore && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={loadMoreThreads}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : "Load More"}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Container>

      <NewThreadDialog
        open={newThreadDialogOpen}
        onClose={() => setNewThreadDialogOpen(false)}
        onThreadCreated={handleThreadCreated}
      />

      <NewPostDialog
        open={newPostDialogOpen}
        onClose={() => setNewPostDialogOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </Box>
  );
};

export default ReportsList;