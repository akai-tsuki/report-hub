import formatConfig from '../config/format.json';
import { format } from 'date-fns';
import { ReportPost, ReportPostWithChildren } from '../types';

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
  
  // テンプレートの変数を実際の値に置換
  return template
    .replace('{{ title }}', post.title || '')
    .replace('{{ recipient }}', post.recipient || '');
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
  
  // テンプレートの変数を実際の値に置換
  return template
    .replace('{{ authorName }}', post.authorName)
    .replace('{{ group }}', post.group || '')
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
 * 設定を取得する
 * @returns フォーマット設定
 */
export const getFormatConfig = () => {
  return formatConfig;
};