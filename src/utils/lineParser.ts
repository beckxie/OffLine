import { Message, ChatFile } from '../types';

/**
 * LINE 聊天記錄解析器
 * 支援 LINE 匯出的 .txt 格式
 */

// 日期標題行正則：
// Mobile: 2022/03/31（四）
// PC: 2025.02.15 星期六
// Mobile: 2022/03/31（四）
// PC: 2025.02.15 星期六
const DATE_HEADER_REGEX = new RegExp('^(\\d{4})[/.](\\d{2})[/.](\\d{2})(?:(?:（([一二三四五六日])）)|(?:\\s+星期([一二三四五六日])))?\\s*$');

// 訊息行正則：(上午|下午)?時:分\t(發言人\t)?內容
// Mobile: 上午09:46\tSender\tContent
// PC (Tab): 17:22\tSender\tContent OR 08:26\tSystemContent
const MESSAGE_REGEX_TAB = /^(?:(上午|下午))?(\d{1,2}):(\d{2})\t(?:([^\t]*)\t)?(.*)$/;

// PC (Space): 17:22 Sender Content OR 08:26 SystemContent
// Fallback for when tabs are converted to spaces
const MESSAGE_REGEX_SPACE = /^(?:(上午|下午))?(\d{1,2}):(\d{2})\s+(?:([^\s]+)\s+)?(.*)$/;

// 儲存日期正則：儲存日期： 2026/01/03 01:14
// 儲存日期正則：儲存日期： 2026/01/03 01:14
const EXPORT_DATE_REGEX = new RegExp('^儲存日期[：:]\\s*(\\d{4})[/.](\\d{2})[/.](\\d{2})\\s+(\\d{2}):(\\d{2})\\s*$');

/**
 * 解析時間字串為 Date 物件
 */
function parseTime(
    dateBase: Date,
    ampm: string | undefined,
    hour: string,
    minute: string
): Date {
    let h = parseInt(hour, 10);
    const m = parseInt(minute, 10);

    // 處理 12 小時制
    if (ampm) {
        if (ampm === '下午' && h !== 12) {
            h += 12;
        } else if (ampm === '上午' && h === 12) {
            h = 0;
        }
    }
    // 24 小時制直接使用 parsed hour

    const result = new Date(dateBase);
    result.setHours(h, m, 0, 0);
    return result;
}

/**
 * 解析 LINE 聊天記錄
 * @param content 檔案內容字串
 * @param onProgress 進度回調 (0-100)
 */
export async function parseLineChatFile(
    content: string,
    onProgress?: (progress: number) => void
): Promise<ChatFile> {
    const totalLen = content.length;
    const messages: Message[] = [];
    const speakerSet = new Set<string>();

    let groupName = '未命名聊天室';
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

    let lineStart = 0;
    let lineIndex = 0;

    while (lineStart < totalLen) {
        let lineEnd = content.indexOf('\n', lineStart);
        if (lineEnd === -1) {
            lineEnd = totalLen;
        }

        // Get line content, handling CR if present
        let line = content.slice(lineStart, lineEnd);
        if (line.endsWith('\r')) {
            line = line.slice(0, -1);
        }

        const i = lineIndex;
        lineIndex++;
        lineStart = lineEnd + 1;

        // 進度回報與讓步 (Yield to UI)
        if (i % 2000 === 0) {
            if (onProgress) {
                // Use position in file for more accurate progress
                onProgress(Math.round((lineStart / totalLen) * 100));
            }
            if (i > 0) {
                // Yield to main thread
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
        }

        // 嘗試解析 metadata (僅在前幾行)
        if (i < 5) {
            // 群組名稱 (以 [LINE] 開頭)
            if (line.startsWith('[LINE]')) {
                groupName = line.replace(/^\[LINE\]\s*/, '').trim();
                continue;
            }

            // 儲存日期
            const exportMatch = line.match(EXPORT_DATE_REGEX);
            if (exportMatch) {
                exportDate = new Date(
                    parseInt(exportMatch[1], 10),
                    parseInt(exportMatch[2], 10) - 1,
                    parseInt(exportMatch[3], 10),
                    parseInt(exportMatch[4], 10),
                    parseInt(exportMatch[5], 10)
                );
                continue;
            }
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
        let msgMatch = line.match(MESSAGE_REGEX_TAB);
        if (!msgMatch) {
            msgMatch = line.match(MESSAGE_REGEX_SPACE);
        }

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

            const [, ampm, hour, minute, rawAuthor, content] = msgMatch;
            const timestamp = parseTime(currentDate, ampm, hour, minute);

            // 判斷是否為系統訊息
            // Mobile system msg: time\t\tcontent (rawAuthor is empty string)
            // PC system msg: time\tcontent (rawAuthor is undefined)
            const isSystemMessage = rawAuthor === undefined || rawAuthor === '';

            // 決定顯示的 author 和 content
            // 如果是系統訊息，Author 欄位通常顯示內容，Content 欄位留空(或依 UI 需求調整)
            // 這裡保持與原始邏輯一致：系統訊息內容放在 Author，Content 為空
            // 但若是 PC 版 time\tcontent，content 變數已經抓到了內容
            const finalAuthor = isSystemMessage ? content : rawAuthor;
            const finalContent = isSystemMessage ? '' : content;

            // 收集發言人
            if (!isSystemMessage && finalAuthor) {
                speakerSet.add(finalAuthor);
            }

            messageId++;

            // 檢查是否為多行訊息開頭 (僅針對非系統訊息且有引號包圍的內容)
            if (!isSystemMessage && finalContent.startsWith('"') && !finalContent.endsWith('"')) {
                pendingMessage = {
                    id: messageId,
                    timestamp,
                    author: finalAuthor,
                    content: finalContent.slice(1), // 移除開頭引號
                };
            } else {
                // 單行訊息
                let cleanContent = finalContent;
                // 移除完整引號包圍
                if (!isSystemMessage && finalContent.startsWith('"') && finalContent.endsWith('"')) {
                    cleanContent = finalContent.slice(1, -1);
                }

                messages.push({
                    id: messageId,
                    timestamp,
                    author: finalAuthor,
                    content: cleanContent,
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
                // 多行訊息中間 (保留完整 line)
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
