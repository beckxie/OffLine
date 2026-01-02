/**
 * LINE 聊天記錄資料模型
 */

/** 單則訊息 */
export interface Message {
    /** 唯一識別碼 (基於行號) */
    id: number;
    /** 完整時間戳 */
    timestamp: Date;
    /** 發言人名稱 */
    author: string;
    /** 訊息內容 */
    content: string;
    /** 是否為系統訊息 (如：已收回訊息、加入聊天) */
    isSystemMessage: boolean;
}

/** 解析後的聊天檔案 */
export interface ChatFile {
    /** 群組名稱 */
    groupName: string;
    /** 匯出日期 */
    exportDate: Date | null;
    /** 所有訊息 */
    messages: Message[];
    /** 所有發言人 (不重複) */
    speakers: string[];
    /** 日期範圍 */
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
}

/** 搜尋/篩選條件 */
export interface SearchFilters {
    /** 關鍵字 */
    keyword: string;
    /** 選中的發言人 */
    selectedSpeakers: string[];
    /** 日期範圍 */
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
}

/** 應用程式狀態 */
export type AppView = 'landing' | 'viewer';
