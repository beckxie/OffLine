import { useRef, useEffect, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Message } from '../types';
import { MessageItem } from './MessageItem';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
  highlightedId?: number | null;
  onMessageClick?: (message: Message) => void;
  scrollToIndex?: number | null;
}

// Increased row height for bubble layout
const ROW_HEIGHT = 80;

export function MessageList({
  messages,
  highlightedId,
  onMessageClick,
  scrollToIndex,
}: MessageListProps) {
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Memoize item data properly for react-window
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
        height={window.innerHeight - 180} // Ideally should be dynamic/responsive
        itemCount={messages.length}
        itemSize={ROW_HEIGHT}
        width="100%"
        overscanCount={5}
        itemData={itemData}
      >
        {MessageItem}
      </List>
    </div>
  );
}
