// 统一响应体
export interface Result<T> {
  code: number;
  message: string;
  data: T;
}

// 分页响应
export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// 用户相关
export interface LoginResponse {
  token: string;
  userId: number;
  nickname: string;
  email: string;
  role: string;
}

export interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  avatarUrl: string;
  role: string;
  createdAt: string;
}

// 图片相关
export interface ImageInfo {
  id: number;
  userId: number;
  prompt: string;
  filePath: string;
  imageUrl: string;
  fileSize: number;
  width: number;
  height: number;
  model: string;
  style: string;
  isPublic: boolean;
  createdAt: string;
  nickname?: string;
  avatarUrl?: string;
}

// 生图请求
export interface GenerateRequest {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  style?: string;
}

export interface GenerateResponse {
  imageUrl: string;
  prompt: string;
  model: string;
  width: number;
  height: number;
}

// 提示词模板
export interface PromptTemplate {
  id: number;
  userId: number;
  name: string;
  templateText: string;
  category: string;
  createdAt: string;
}

// 收藏
export interface Favorite {
  id: number;
  userId: number;
  imageId: number;
  createdAt: string;
}

// 标签
export interface Tag {
  id: number;
  name: string;
}

// 评论
export interface Comment {
  id: number;
  userId: number;
  imageId: number;
  content: string;
  nickname: string;
  isAiReview: boolean;
  createdAt: string;
}

// 提示词历史
export interface PromptHistory {
  id: number;
  userId: number;
  prompt: string;
  createdAt: string;
}

// 统计
export interface MyStats {
  totalImages: number;
  thisWeekImages: number;
  mostUsedModel: string;
  mostUsedStyle: string;
}
