import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ReportThread, ReportPostWithChildren } from '../../types';
import formatConfig from '../../config/format.json';

interface ThreadPostsTreeProps {
  thread: ReportThread;
  rootPost: ReportPostWithChildren;
  onPostClick: (postId: string) => void;
}

/**
 * ツリーの表示前缀を取得する
 */
const getPostPrefix = (isLast: boolean, hasChildren: boolean): string => {
  return isLast 
    ? formatConfig.hierarchyTree.postLastPrefix
    : formatConfig.hierarchyTree.postPrefix;
};

/**
 * 子供の接続線を描画するための前缀を取得する
 */
const getContinuePrefix = (isLast: boolean): string => {
  return isLast 
    ? formatConfig.hierarchyTree.postIndent
    : formatConfig.hierarchyTree.postContinuePrefix;
};

/**
 * 投稿内容を表示する
 */
const displayPostTitle = (post: ReportPostWithChildren): string => {
  // 投稿にタイトルがあればそれを使用、なければ内容の最初の部分を表示
  if (post.title) {
    return post.title;
  }
  
  // 内容は最大30文字まで表示
  const contentPreview = post.content.substring(0, 30);
  return contentPreview + (post.content.length > 30 ? '...' : '');
};

/**
 * 再帰的に投稿ツリーを表示するコンポーネント
 */
const PostItems: React.FC<{
  posts: ReportPostWithChildren[]; 
  level: number;
  parentPreContinue: string;
  onPostClick: (postId: string) => void;
}> = ({ posts, level, parentPreContinue, onPostClick }) => {
  return (
    <>
      {posts.map((post, index) => {
        const isLast = index === posts.length - 1;
        const hasChildren = post.children.length > 0;
        const prefix = getPostPrefix(isLast, hasChildren);
        const continuePrefix = getContinuePrefix(isLast);
        const fullPrefix = parentPreContinue + prefix;
        const childParentPrefix = parentPreContinue + continuePrefix;
        
        return (
          <React.Fragment key={post.id}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              my: 0.5,
              cursor: 'pointer',
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
              borderRadius: 1,
              p: 0.5
            }} onClick={() => onPostClick(post.id)}>
              <Typography 
                variant="body2" 
                component="div" 
                fontFamily="monospace"
                sx={{ 
                  whiteSpace: 'pre',
                  mr: 1,
                  color: 'text.secondary'
                }}
              >
                {fullPrefix}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  flex: 1, 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {displayPostTitle(post)}
              </Typography>
            </Box>

            {/* 子投稿を再帰的に表示 */}
            {post.children.length > 0 && (
              <PostItems 
                posts={post.children} 
                level={level + 1}
                parentPreContinue={childParentPrefix}
                onPostClick={onPostClick}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

/**
 * スレッドとそのツリー構造の投稿を表示するコンポーネント
 */
const ThreadPostsTree: React.FC<ThreadPostsTreeProps> = ({ 
  thread, 
  rootPost,
  onPostClick
}) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        backgroundColor: 'transparent',
        mb: 2 
      }}
    >
      {/* スレッドタイトル */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mb: 0.5,
        cursor: 'pointer',
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
        borderRadius: 1,
        p: 0.5
      }} onClick={() => onPostClick(rootPost.id)}>
        <Typography 
          variant="body1" 
          component="div" 
          fontFamily="monospace"
          sx={{ 
            whiteSpace: 'pre',
            mr: 1,
            fontWeight: 'bold'
          }}
        >
          {formatConfig.hierarchyTree.threadPrefix}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 'medium',
            flex: 1, 
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {thread.title}
        </Typography>
      </Box>

      {/* 子投稿を表示 */}
      {rootPost.children.length > 0 && (
        <PostItems 
          posts={rootPost.children} 
          level={1}
          parentPreContinue=""
          onPostClick={onPostClick}
        />
      )}
    </Paper>
  );
};

export default ThreadPostsTree;