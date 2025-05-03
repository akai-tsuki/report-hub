import formatConfig from '../config/format.json';
import { format } from 'date-fns';
import { ReportPost, ReportPostWithChildren, ReportThread, PriorityLevel } from '../types';

/**
 * 日付を指定されたフォーマットで整形する
 * @param date 日付オブジェクト
 * @returns フォーマットされた日付文字列
 */
export const formatDate = (date: Date): string => {
  return format(date, formatConfig.date.format);
};

/**
 * 投稿のタイトルを整形する
 * @param post 投稿データ
 * @returns フォーマットされたタイトル
 */
export const formatPostTitle = (post: ReportPost | ReportPostWithChildren): string => {
  // 宛先がある場合と無い場合でテンプレートを分ける
  const template = post.recipient 
    ? formatConfig.post.titleWithRecipient 
    : formatConfig.post.title;
  
  // タイトルが無い場合、空文字を返す
  if (!post.title) return '';
  
  // 優先度の文字列を取得
  const priorityText = formatPriority(post.priority as PriorityLevel);
  const prefix = priorityText ? `【${priorityText}】` : '';
  
  // テンプレートの変数を実際の値に置換
  return prefix + template
    .replace('{{ title }}', post.title || '')
    .replace('{{ recipient }}', post.recipient || '');
};

/**
 * スレッドの一覧表示用文字列を整形する
 * @param thread スレッドデータ
 * @param priority 優先度（任意）
 * @returns フォーマットされた表示文字列
 */
export const formatThreadListItem = (thread: ReportThread, priority?: PriorityLevel): string => {
  const template = formatConfig.thread.listFormat;
  const dateStr = formatDate(thread.createdAt);
  
  // 重要度情報を取得
  const priorityStr = priority ? formatPriority(priority) : '';
  
  return template
    .replace('{{ authorName }}', thread.authorName)
    .replace('{{ group }}', thread.group || '')
    .replace('{{ title }}', thread.title)
    .replace('{{ priority }}', priorityStr)
    .replace('{{ createdAt }}', dateStr);
};

/**
 * 投稿者情報を整形する
 * @param post 投稿データ
 * @returns フォーマットされた投稿者情報
 */
export const formatPostAuthorInfo = (post: ReportPost | ReportPostWithChildren): string => {
  // グループがある場合と無い場合でテンプレートを分ける
  const template = post.group 
    ? formatConfig.post.authorInfo 
    : formatConfig.post.authorInfoWithoutGroup;
  
  // 日付をフォーマット
  const dateStr = formatDate(post.createdAt);
  
  // 優先度をフォーマット
  const priorityStr = formatPriority(post.priority as PriorityLevel);
  
  // テンプレートの変数を実際の値に置換
  return template
    .replace('{{ authorName }}', post.authorName)
    .replace('{{ group }}', post.group || '')
    .replace('{{ priority }}', priorityStr || '')
    .replace('{{ createdAt }}', dateStr);
};

/**
 * テンプレートに基づいて値を置換する
 * @param template テンプレート文字列
 * @param values 置換する値のオブジェクト
 * @returns 置換後の文字列
 */
export const parseTemplate = (template: string, values: Record<string, string | undefined>): string => {
  let result = template;
  
  // テンプレート内のすべての変数を実際の値に置換
  Object.entries(values).forEach(([key, value]) => {
    const placeholder = `{{ ${key} }}`;
    result = result.replace(new RegExp(placeholder, 'g'), value || '');
  });
  
  return result;
};

/**
 * 優先度を表示用にフォーマットする
 * @param priority 優先度
 * @returns フォーマットされた優先度文字列
 */
export const formatPriority = (priority?: PriorityLevel): string => {
  if (!priority || priority === 'none') {
    return '';
  }
  
  // format.jsonから該当する優先度の表示文字列を取得
  if (formatConfig.priority && formatConfig.priority[priority]) {
    return formatConfig.priority[priority];
  }
  
  return '';
};

/**
 * 優先度のリストを取得する
 * @returns 優先度のリスト（キーと表示名のペア）
 */
export const getPriorityOptions = (): { value: PriorityLevel, label: string }[] => {
  const priorityConfig = formatConfig.priority;
  const options: { value: PriorityLevel, label: string }[] = [];
  
  // priorityConfigのキーをPriorityLevel型にキャストして使用
  Object.keys(priorityConfig).forEach(key => {
    // 'none'は含めない
    if (key !== 'none') {
      const priorityKey = key as PriorityLevel;
      options.push({
        value: priorityKey,
        label: priorityConfig[priorityKey] || key
      });
    }
  });
  
  return options;
};

/**
 * 設定を取得する
 * @returns フォーマット設定
 */
export const getFormatConfig = () => {
  return formatConfig;
};