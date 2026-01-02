import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { VariableSizeList as List } from 'react-window';
import { Message } from '../types';
import { MessageItem } from './MessageItem';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
  highlightedId?: number | null;
  onMessageClick?: (message: Message) => void;
  scrollToIndex?: number | null;
}

// Estimate dimensions
// Sidebar is 320px.
// Message list width = Window - 320.
// Bubble max width = 80% of that.
// Font size 15px, roughly 15px-18px per CJK char, 8-10px per 0.5en char.
// We'll use a conservative estimate to avoid overlap.

const useWindowSize = () => {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
  useEffect(() => {
    const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

export function MessageList({
  messages,
  highlightedId,
  onMessageClick,
  scrollToIndex,
}: MessageListProps) {
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width] = useWindowSize();

  // Reset cache on width change (resize)
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [width, messages]); // Also reset when messages change

  // Scroll to specific message
  useEffect(() => {
    if (
      scrollToIndex !== null &&
      scrollToIndex !== undefined &&
      listRef.current
    ) {
      listRef.current.scrollToItem(scrollToIndex, 'center');
    }
  }, [scrollToIndex]);

  const getItemSize = useCallback(
    (index: number) => {
      const message = messages[index];

      // System Message
      if (message.isSystemMessage) {
        return 40; // Approx height for small system badge
      }

      // Normal Message
      // Layout:
      // Padding Top: 8px
      // Author: ~18px
      // Gap: 2px
      // Bubble Padding: 16px (8+8)
      // Content: calculated
      // Padding Bottom: 8px
      // Total Constant = 8 + 18 + 2 + 16 + 8 = 52px. Let's say 60px for safety (date line etc).

      const BASE_HEIGHT = 65;
      const LINE_HEIGHT = 24; // 15px font * 1.5 + buffer

      const content = message.content;
      const availableWidth = Math.max(300, width - 320); // main area width
      const bubbleWidth = availableWidth * 0.8; // max-width 80%

      // Heuristic:
      // Count total characters.
      // Average char width ~14px (mix of CJK and Latin).
      const charWidth = 14;
      const charsPerLine = Math.floor(bubbleWidth / charWidth);

      // Split by newlines to handle explicit breaks
      const lines = content.split('\n');
      let totalLines = 0;

      lines.forEach(line => {
        const lineLen = line.length;
        if (lineLen === 0) {
          totalLines += 1;
        } else {
          totalLines += Math.ceil(lineLen / charsPerLine);
        }
      });

      // Min 1 line
      totalLines = Math.max(1, totalLines);

      return BASE_HEIGHT + totalLines * LINE_HEIGHT;
    },
    [messages, width]
  );

  const itemData = useMemo(
    () => ({
      messages,
      onMessageClick,
      highlightedId: highlightedId ?? null,
    }),
    [messages, onMessageClick, highlightedId]
  );

  if (messages.length === 0) {
    return (
      <div className="message-list__empty">
        <p>沒有找到符合條件的訊息</p>
      </div>
    );
  }

  return (
    <div className="message-list" ref={containerRef}>
      <List
        ref={listRef}
        height={window.innerHeight - 130} // Subtract header/margin. Can utilize useWindowSize height
        itemCount={messages.length}
        itemSize={getItemSize}
        width="100%"
        overscanCount={5}
        itemData={itemData}
      >
        {MessageItem}
      </List>
    </div>
  );
}
