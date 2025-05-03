export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'report' | 'none';

export interface ReportPost {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  parentId: string | null;
  threadId: string;
  childrenIds: string[];
  group?: string;
  recipient?: string;
  title?: string;
  priority?: PriorityLevel;
}

export interface ReportThread {
  id: string;
  title: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
  rootPostId: string;
  group?: string;
  recipient?: string;
}

export type ReportPostWithChildren = ReportPost & {
  children: ReportPostWithChildren[];
};

// グループ設定用
export interface GroupConfig {
  id: string;
  name: string;
  createdAt: Date;
}