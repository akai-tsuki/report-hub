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
}

export interface ReportThread {
  id: string;
  title: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
  rootPostId: string;
}

export type ReportPostWithChildren = ReportPost & {
  children: ReportPostWithChildren[];
};