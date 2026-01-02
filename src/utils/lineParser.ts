import { Message, ChatFile } from '../types';

/**
 * LINE 聊天記錄解析器
 * 支援 LINE 匯出的 .txt 格式
 */

// 日期標題行正則：2022/03/31（四）
const DATE_HEADER_REGEX = /^(\d{4})\/(\d{2})\/(\d{2})（[一二三四五六日]）\s*$/;

// 訊息行正則：時間\t發言人\t內容
const MESSAGE_REGEX = /^(上午|下午)(\d{1,2}):(\d{2})\t([^\t]*)\t(.*)$/;

// 儲存日期正則：儲存日期： 2026/01/03 01:14
const EXPORT_DATE_REGEX = /^儲存日期[：:]\s*(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})\s*$/;

/**
 * 解析時間字串為 Date 物件
 */
function parseTime(
    dateBase: Date,
    ampm: string,
    hour: string,
    minute: string
): Date {
    let h = parseInt(hour, 10);
    const m = parseInt(minute, 10);

    // 轉換為 24 小時制
    if (ampm === '下午' && h !== 12) {
        h += 12;
    } else if (ampm === '上午' && h === 12) {
        h = 0;
    }

    const result = new Date(dateBase);
    result.setHours(h, m, 0, 0);
    return result;
}

/**
 * 解析 LINE 聊天記錄
 * @param content 檔案內容字串
 * @param onProgress 進度回調 (0-100)
 */
export function parseLineChatFile(
    content: string,
    onProgress?: (progress: number) => void
): ChatFile {
    const lines = content.split(/\r?\n/);
    const totalLines = lines.length;
    const messages: Message[] = [];
    const speakerSet = new Set<string>();

    let groupName = '';
    let exportDate: Date | null = null;
    let currentDate: Date | null = null;
    let messageId = 0;

    // 多行訊息暫存
    let pendingMessage: {
        id: number;
        timestamp: Date;
        author: string;
        content: string;
    } | null = null;

    for (let i = 0; i < totalLines; i++) {
        const line = lines[i];

        // 進度回報
        if (onProgress && i % 1000 === 0) {
            onProgress(Math.round((i / totalLines) * 100));
        }

        // 第一行：群組名稱
        if (i === 0) {
            groupName = line.replace(/^\[LINE\]\s*/, '').trim();
            continue;
        }

        // 第二行：儲存日期
        if (i === 1) {
            const exportMatch = line.match(EXPORT_DATE_REGEX);
            if (exportMatch) {
                exportDate = new Date(
                    parseInt(exportMatch[1], 10),
                    parseInt(exportMatch[2], 10) - 1,
                    parseInt(exportMatch[3], 10),
                    parseInt(exportMatch[4], 10),
                    parseInt(exportMatch[5], 10)
                );
            }
            continue;
        }

        // 空行
        if (!line.trim()) {
            continue;
        }

        // 日期標題行
        const dateMatch = line.match(DATE_HEADER_REGEX);
        if (dateMatch) {
            currentDate = new Date(
                parseInt(dateMatch[1], 10),
                parseInt(dateMatch[2], 10) - 1,
                parseInt(dateMatch[3], 10)
            );
            continue;
        }

        // 訊息行
        const msgMatch = line.match(MESSAGE_REGEX);
        if (msgMatch && currentDate) {
            // 如果有未完成的多行訊息，先儲存
            if (pendingMessage) {
                messages.push({
                    ...pendingMessage,
                    content: pendingMessage.content,
                    isSystemMessage: false,
                });
                pendingMessage = null;
            }

            const [, ampm, hour, minute, author, content] = msgMatch;
            const timestamp = parseTime(currentDate, ampm, hour, minute);
            const isSystemMessage = author === '';

            // 收集發言人
            if (author && !isSystemMessage) {
                speakerSet.add(author);
            }

            messageId++;

            // 檢查是否為多行訊息開頭
            if (content.startsWith('"') && !content.endsWith('"')) {
                pendingMessage = {
                    id: messageId,
                    timestamp,
                    author: isSystemMessage ? content : author,
                    content: content.slice(1), // 移除開頭引號
                };
            } else {
                // 單行訊息
                let finalContent = content;
                // 移除完整引號包圍
                if (content.startsWith('"') && content.endsWith('"')) {
                    finalContent = content.slice(1, -1);
                }

                messages.push({
                    id: messageId,
                    timestamp,
                    author: isSystemMessage ? finalContent : author,
                    content: isSystemMessage ? '' : finalContent,
                    isSystemMessage,
                });
            }
            continue;
        }

        // 多行訊息續行
        if (pendingMessage) {
            if (line.endsWith('"')) {
                // 多行訊息結束
                pendingMessage.content += '\n' + line.slice(0, -1);
                messages.push({
                    ...pendingMessage,
                    isSystemMessage: false,
                });
                pendingMessage = null;
            } else {
                // 多行訊息中間
                pendingMessage.content += '\n' + line;
            }
        }
    }

    // 處理未完成的多行訊息
    if (pendingMessage) {
        messages.push({
            ...pendingMessage,
            isSystemMessage: false,
        });
    }

    // 進度完成
    if (onProgress) {
        onProgress(100);
    }

    // 計算日期範圍
    const dateRange = {
        start: messages.length > 0 ? messages[0].timestamp : null,
        end: messages.length > 0 ? messages[messages.length - 1].timestamp : null,
    };

    return {
        groupName,
        exportDate,
        messages,
        speakers: Array.from(speakerSet).sort(),
        dateRange,
    };
}

/**
 * 讀取檔案內容
 */
export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file, 'utf-8');
    });
}
