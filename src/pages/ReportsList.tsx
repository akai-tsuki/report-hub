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
import { getThreads, getThreadsWithRootPosts } from "../services/reports";
import { ReportThread, ReportPostWithChildren, ReportPost } from "../types";
import { useAuth } from "../context/AuthContext";
import ThreadListItem from "../components/reports/ThreadListItem";
import ThreadPostsTree from "../components/reports/ThreadPostsTree";
import NewThreadDialog from "../components/reports/NewThreadDialog";
import NewPostDialog from "../components/reports/NewPostDialog";
import PostDetail from "../components/reports/PostDetail";
import ThreadView from "../components/reports/ThreadView";
import ReplyDialog from "../components/reports/ReplyDialog";
import Header from "../components/layout/Header";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

const ReportsList: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [threads, setThreads] = useState<ReportThread[]>([]);
  const [threadsWithPosts, setThreadsWithPosts] = useState<{thread: ReportThread, rootPost: ReportPostWithChildren}[]>([]);
  const [viewMode, setViewMode] = useState<'simple' | 'tree'>('tree');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [newThreadDialogOpen, setNewThreadDialogOpen] = useState(false);
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  
  // 表示モード管理
  type DisplayMode = 'list' | 'post' | 'thread';
  const [displayMode, setDisplayMode] = useState<DisplayMode>('list');
  
  // 投稿詳細・スレッド表示用の状態
  const [selectedPost, setSelectedPost] = useState<ReportPost | null>(null);
  const [currentThread, setCurrentThread] = useState<ReportThread | null>(null);
  const [rootPost, setRootPost] = useState<ReportPostWithChildren | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyToPostId, setReplyToPostId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      loadThreadsAndPosts();
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
  
  const loadThreadsAndPosts = async () => {
    try {
      setLoading(true);
      
      // サイズは必要に応じて調整
      const limit = 20;
      const result = await getThreadsWithRootPosts(limit);
      
      setThreadsWithPosts(result);
      
      // シンプルビュー用のスレッドリストも更新
      const simpleThreads = result.map(item => item.thread);
      setThreads(simpleThreads);
      
      setHasMore(false); // ページネーションは後で追加
    } catch (error) {
      console.error("Error loading threads with posts", error);
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
    loadThreadsAndPosts();
  };

  const handlePostCreated = () => {
    setNewPostDialogOpen(false);
    loadThreadsAndPosts();
  };
  
  const handlePostClick = (postId: string) => {
    // クリックされた投稿を見つけて表示する
    for (const item of threadsWithPosts) {
      // ルート投稿の場合はスレッド全体を表示
      if (item.rootPost.id === postId) {
        setCurrentThread(item.thread);
        setRootPost(item.rootPost);
        setDisplayMode('thread');
        return;
      }
      
      // 子投稿の場合（再帰的に探索）- 個別投稿を表示
      const findPostInChildren = (children: ReportPostWithChildren[]): boolean => {
        for (const child of children) {
          if (child.id === postId) {
            setSelectedPost(child);
            setCurrentThread(item.thread);
            setDisplayMode('post');
            return true;
          }
          
          if (child.children.length > 0 && findPostInChildren(child.children)) {
            return true;
          }
        }
        return false;
      };
      
      if (item.rootPost.children.length > 0 && findPostInChildren(item.rootPost.children)) {
        break;
      }
    }
  };
  
  // 詳細表示から一覧に戻る
  const handleBackFromDetail = () => {
    setSelectedPost(null);
    setCurrentThread(null);
    setRootPost(null);
    setDisplayMode('list');
  };
  
  // 返信ダイアログを開く
  const handleReply = (postId: string) => {
    if (postId) {
      setReplyToPostId(postId);
      setReplyDialogOpen(true);
    }
  };
  
  // 返信完了時の処理
  const handleReplyComplete = () => {
    setReplyDialogOpen(false);
    loadThreadsAndPosts();
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

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            size="small"
            variant={viewMode === 'simple' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('simple')}
            sx={{ mr: 1 }}
          >
            Simple View
          </Button>
          <Button
            size="small" 
            variant={viewMode === 'tree' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('tree')}
          >
            Tree View
          </Button>
        </Box>
        
        <Paper elevation={2} sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : displayMode === 'post' && selectedPost ? (
            // 個別投稿の詳細表示
            <PostDetail 
              post={selectedPost} 
              onBack={handleBackFromDetail}
              onReply={handleReply}
            />
          ) : displayMode === 'thread' && currentThread && rootPost ? (
            // スレッド全体表示（全投稿表示）
            <ThreadView
              thread={currentThread}
              rootPost={rootPost}
              onBack={handleBackFromDetail}
              onReplyClick={handleReply}
            />
          ) : viewMode === 'simple' && threads.length === 0 ? (
            <Typography variant="body1" sx={{ p: 2, textAlign: "center" }}>
              No reports found. Create a new thread to get started.
            </Typography>
          ) : viewMode === 'tree' && threadsWithPosts.length === 0 ? (
            <Typography variant="body1" sx={{ p: 2, textAlign: "center" }}>
              No reports found. Create a new thread to get started.
            </Typography>
          ) : (
            <>
              {viewMode === 'simple' ? (
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
              ) : (
                <Box>
                  {threadsWithPosts.map((item, index) => (
                    <React.Fragment key={item.thread.id}>
                      <ThreadPostsTree
                        thread={item.thread}
                        rootPost={item.rootPost}
                        onPostClick={handlePostClick}
                      />
                      {index < threadsWithPosts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Box>
              )}
              
              {hasMore && viewMode === 'simple' && (
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
      
      {/* 返信ダイアログ */}
      {replyDialogOpen && currentThread && replyToPostId && (
        <ReplyDialog
          open={replyDialogOpen}
          threadId={currentThread.id}
          parentId={replyToPostId}
          onClose={() => setReplyDialogOpen(false)}
          onReplySubmitted={handleReplyComplete}
        />
      )}
    </Box>
  );
};

export default ReportsList;