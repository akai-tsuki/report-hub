import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Paper,
  Breadcrumbs,
  Link,
  AppBar,
  Toolbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReplyIcon from "@mui/icons-material/Reply";
import { getThreadById, getPostsByThreadId } from "../services/reports";
import { ReportPostWithChildren, ReportThread } from "../types";
import { useAuth } from "../context/AuthContext";
import PostTree from "../components/reports/PostTree";
import ReplyDialog from "../components/reports/ReplyDialog";
import { signOut } from "../services/auth";
import LogoutIcon from "@mui/icons-material/Logout";

const ReportContent: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [thread, setThread] = useState<ReportThread | null>(null);
  const [postTree, setPostTree] = useState<ReportPostWithChildren | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!threadId) {
      navigate("/reports");
      return;
    }

    loadThreadAndPosts();
  }, [currentUser, threadId, navigate]);

  const loadThreadAndPosts = async () => {
    if (!threadId) return;

    try {
      setLoading(true);
      const [threadData, postsData] = await Promise.all([
        getThreadById(threadId),
        getPostsByThreadId(threadId),
      ]);

      setThread(threadData);
      setPostTree(postsData);
    } catch (error) {
      console.error("Error loading thread and posts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  const handleBackClick = () => {
    navigate("/reports");
  };

  const handleReplyClick = (postId: string) => {
    setSelectedPostId(postId);
    setReplyDialogOpen(true);
  };

  const handleReplySubmitted = () => {
    setReplyDialogOpen(false);
    loadThreadAndPosts();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!thread || !postTree) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5">Thread not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick} sx={{ mt: 2 }}>
          Back to Reports
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Report Hub
          </Typography>
          <Button color="inherit" onClick={handleSignOut} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            color="inherit"
            sx={{ cursor: "pointer" }}
            onClick={handleBackClick}
          >
            Reports
          </Link>
          <Typography color="textPrimary">{thread.title}</Typography>
        </Breadcrumbs>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" component="h1">
            {thread.title}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
          >
            Back
          </Button>
        </Box>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Typography variant="h6">
              Thread by {postTree.authorName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {postTree.createdAt.toLocaleDateString()} at{" "}
              {postTree.createdAt.toLocaleTimeString()}
            </Typography>
          </Box>

          <Typography variant="body1" paragraph>
            {postTree.content}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<ReplyIcon />}
            onClick={() => handleReplyClick(postTree.id)}
          >
            Reply
          </Button>
        </Paper>

        {postTree.children.length > 0 && (
          <PostTree
            posts={postTree.children}
            level={0}
            onReplyClick={handleReplyClick}
          />
        )}
      </Container>

      {selectedPostId && (
        <ReplyDialog
          open={replyDialogOpen}
          onClose={() => setReplyDialogOpen(false)}
          parentId={selectedPostId}
          threadId={threadId}
          onReplySubmitted={handleReplySubmitted}
        />
      )}
    </Box>
  );
};

export default ReportContent;