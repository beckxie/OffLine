import { describe, it, expect } from 'vitest';
import { parseLineChatFile } from './lineParser';

// Sample chat content (Mobile Format)
const SAMPLE_CHAT = `[LINE] 測試群組
儲存日期： 2026/01/03 01:14

2022/03/31（四）
上午09:46	UserA	Hello
上午09:46	UserB	Hi there
上午10:38	UserC	"這是
多行訊息測試"
上午09:53	UserD	[照片]
上午11:09		System Message
`;

describe('lineParser', () => {
    it('should parse metadata correctly', async () => {
        const result = await parseLineChatFile(SAMPLE_CHAT);
        expect(result.groupName).toBe('測試群組');
        expect(result.exportDate).toBeInstanceOf(Date);
        expect(result.exportDate?.getFullYear()).toBe(2026);
    });

    it('should parse normal messages', async () => {
        const result = await parseLineChatFile(SAMPLE_CHAT);
        const msgs = result.messages;
        expect(msgs.length).toBe(5);

        expect(msgs[0].author).toBe('UserA');
        expect(msgs[0].content).toBe('Hello');
        expect(msgs[0].timestamp.getHours()).toBe(9);
        expect(msgs[0].timestamp.getMinutes()).toBe(46);
    });

    it('should parse multi-line messages', async () => {
        const result = await parseLineChatFile(SAMPLE_CHAT);
        const multiLineMsg = result.messages[2];

        expect(multiLineMsg.author).toBe('UserC');
        expect(multiLineMsg.content).toContain('這是');
        expect(multiLineMsg.content).toContain('多行訊息測試');
        // The parser removes the wrapping quotes
        expect(multiLineMsg.content).not.toMatch(/^"/);
        expect(multiLineMsg.content).not.toMatch(/"$/);
    });

    it('should parse system messages', async () => {
        const result = await parseLineChatFile(SAMPLE_CHAT);
        const systemMsg = result.messages[4];

        expect(systemMsg.isSystemMessage).toBe(true);
        // For system messages, content is empty string, author field holds the text
        expect(systemMsg.author).toBe('System Message');
    });

    it('should collect unique speakers', async () => {
        const result = await parseLineChatFile(SAMPLE_CHAT);
        expect(result.speakers).toContain('UserA');
        expect(result.speakers).toContain('UserB');
        expect(result.speakers).toContain('UserC');
        expect(result.speakers).toContain('UserD');
        expect(result.speakers).not.toContain('System Message'); // System msg
        expect(result.speakers.length).toBe(4);
    });

    it('should calculate date range', async () => {
        const result = await parseLineChatFile(SAMPLE_CHAT);
        expect(result.dateRange.start).toBeInstanceOf(Date);
        expect(result.dateRange.end).toBeInstanceOf(Date);
    });
});

const PC_SAMPLE_CHAT = `2025.02.15 星期六
17:22 UserPC1 測試訊息1
17:23 UserPC1 測試訊息2
08:26 系統訊息測試
20:53 SystemBot已將UserX強制退出社群。
`;

describe('lineParser (PC Format)', () => {
    it('should parse PC format metadata and messages', async () => {
        const result = await parseLineChatFile(PC_SAMPLE_CHAT);
        // Should parse date
        expect(result.messages.length).toBeGreaterThan(0);
        expect(result.messages[0].timestamp.getFullYear()).toBe(2025);
        expect(result.messages[0].timestamp.getMonth()).toBe(1); // Feb is 1
        expect(result.messages[0].timestamp.getDate()).toBe(15);

        // Should parse 24h time
        expect(result.messages[0].timestamp.getHours()).toBe(17);
        expect(result.messages[0].timestamp.getMinutes()).toBe(22);

        // Should parse sender and content
        expect(result.messages[0].author).toBe('UserPC1');
        expect(result.messages[0].content).toBe('測試訊息1');

        // Should parse system messages
        const sysMsg = result.messages.find(m => m.content === '' || m.isSystemMessage);
        expect(sysMsg).toBeDefined();
        // Updated expectation for dummy system message
        expect(sysMsg?.author).toContain('系統訊息測試');
    });
});
