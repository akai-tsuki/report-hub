import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  DocumentData, 
  QueryDocumentSnapshot, 
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { ReportPost, ReportThread, ReportPostWithChildren } from "../types";

const POSTS_PER_PAGE = 20;

// Create a new thread
export const createThread = async (title: string, content: string, userId: string, userName: string, userPhotoURL?: string): Promise<string> => {
  try {
    // Create the root post first
    const postRef = await addDoc(collection(db, "posts"), {
      content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      authorId: userId,
      authorName: userName,
      authorPhotoURL: userPhotoURL || null,
      parentId: null,
      threadId: "temp", // Will update after thread creation
      childrenIds: []
    });

    // Now create the thread with reference to root post
    const threadRef = await addDoc(collection(db, "threads"), {
      title,
      createdAt: serverTimestamp(),
      authorId: userId,
      authorName: userName,
      rootPostId: postRef.id
    });

    // Update the post with the correct threadId
    await updateDoc(postRef, {
      threadId: threadRef.id
    });

    return threadRef.id;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
};

// Create a new post (reply)
export const createPost = async (
  content: string,
  parentId: string,
  threadId: string,
  userId: string,
  userName: string,
  userPhotoURL?: string
): Promise<string> => {
  try {
    // Create the new post
    const postRef = await addDoc(collection(db, "posts"), {
      content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      authorId: userId,
      authorName: userName,
      authorPhotoURL: userPhotoURL || null,
      parentId,
      threadId,
      childrenIds: []
    });

    // Update parent post's childrenIds array
    const parentRef = doc(db, "posts", parentId);
    const parentDoc = await getDoc(parentRef);
    
    if (parentDoc.exists()) {
      const parentData = parentDoc.data();
      await updateDoc(parentRef, {
        childrenIds: [...(parentData.childrenIds || []), postRef.id]
      });
    }

    return postRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// Get all threads with pagination
export const getThreads = async (lastVisible?: QueryDocumentSnapshot<DocumentData>): Promise<{
  threads: ReportThread[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> => {
  try {
    let threadsQuery;

    if (lastVisible) {
      threadsQuery = query(
        collection(db, "threads"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(POSTS_PER_PAGE)
      );
    } else {
      threadsQuery = query(
        collection(db, "threads"),
        orderBy("createdAt", "desc"),
        limit(POSTS_PER_PAGE)
      );
    }

    const snapshot = await getDocs(threadsQuery);
    const threads: ReportThread[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      threads.push({
        id: doc.id,
        title: data.title,
        createdAt: (data.createdAt as Timestamp).toDate(),
        authorId: data.authorId,
        authorName: data.authorName,
        rootPostId: data.rootPostId,
      });
    });

    const newLastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
    const hasMore = snapshot.docs.length === POSTS_PER_PAGE;

    return { threads, lastVisible: newLastVisible, hasMore };
  } catch (error) {
    console.error("Error getting threads:", error);
    throw error;
  }
};

// Get a single thread by ID
export const getThreadById = async (threadId: string): Promise<ReportThread | null> => {
  try {
    const threadRef = doc(db, "threads", threadId);
    const threadDoc = await getDoc(threadRef);
    
    if (!threadDoc.exists()) {
      return null;
    }

    const data = threadDoc.data();
    return {
      id: threadDoc.id,
      title: data.title,
      createdAt: (data.createdAt as Timestamp).toDate(),
      authorId: data.authorId,
      authorName: data.authorName,
      rootPostId: data.rootPostId,
    };
  } catch (error) {
    console.error("Error getting thread:", error);
    throw error;
  }
};

// Get all posts for a thread with tree structure
export const getPostsByThreadId = async (threadId: string): Promise<ReportPostWithChildren | null> => {
  try {
    // Get all posts for this thread
    const postsQuery = query(
      collection(db, "posts"),
      where("threadId", "==", threadId)
    );
    
    const snapshot = await getDocs(postsQuery);
    
    if (snapshot.empty) {
      return null;
    }

    // Convert to map for easy lookup
    const postsMap = new Map<string, ReportPostWithChildren>();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      postsMap.set(doc.id, {
        id: doc.id,
        content: data.content,
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate(),
        authorId: data.authorId,
        authorName: data.authorName,
        authorPhotoURL: data.authorPhotoURL,
        parentId: data.parentId,
        threadId: data.threadId,
        childrenIds: data.childrenIds || [],
        children: []
      });
    });

    // Build tree structure
    let rootPost: ReportPostWithChildren | null = null;
    
    // For each post
    postsMap.forEach((post) => {
      // If it's the root post
      if (post.parentId === null) {
        rootPost = post;
      } else {
        // Add this post to its parent's children
        const parent = postsMap.get(post.parentId);
        if (parent) {
          parent.children.push(post);
        }
      }
    });

    return rootPost;
  } catch (error) {
    console.error("Error getting posts:", error);
    throw error;
  }
};