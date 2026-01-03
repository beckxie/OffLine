import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { VariableSizeList as List } from 'react-window';
import { Message } from '../types';
import { MessageItem } from './MessageItem';
import { formatDateForHeader } from '../utils/formatDate';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
  highlightedId?: number | null;
  onMessageClick?: (message: Message) => void;
  scrollToIndex?: number | null;
}

interface MessageListInnerProps extends MessageListProps {
  height: number;
  width: number;
}

function MessageListInner({
  messages,
  highlightedId,
  onMessageClick,
  scrollToIndex,
  height,
  width,
}: MessageListInnerProps) {
  const listRef = useRef<List>(null);
  const [stickyDate, setStickyDate] = useState<string>('');

  // Reset cache on size change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [width, messages]);

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

  // Initial date set
  useEffect(() => {
    if (messages.length > 0) {
      setStickyDate(formatDateForHeader(messages[0].timestamp));
    }
  }, [messages]);

  const onItemsRendered = useCallback(
    ({ visibleStartIndex }: { visibleStartIndex: number }) => {
      if (messages.length > 0 && visibleStartIndex >= 0 && visibleStartIndex < messages.length) {
        const firstVisibleMsg = messages[visibleStartIndex];
        setStickyDate(formatDateForHeader(firstVisibleMsg.timestamp));
      }
    },
    [messages]
  );

  const getMessageDisplayInfo = useCallback((index: number) => {
    const current = messages[index];
    if (index === 0) return { showDate: true, isGrouped: false };

    const prev = messages[index - 1];

    // Check Date Change
    const currentDate = current.timestamp.toDateString();
    const prevDate = prev.timestamp.toDateString();
    const showDate = currentDate !== prevDate;

    // Check Grouping (Same author, within 5 mins, no date change, neither is system)
    const isSameAuthor = current.author === prev.author;
    const isRecent = (current.timestamp.getTime() - prev.timestamp.getTime()) < 5 * 60 * 1000;
    const isGrouped = !showDate && !current.isSystemMessage && !prev.isSystemMessage && isSameAuthor && isRecent;

    return { showDate, isGrouped };
  }, [messages]);

  const getItemSize = useCallback(
    (index: number) => {
      const message = messages[index];
      const { showDate, isGrouped } = getMessageDisplayInfo(index);

      // Height Components
      let itemHeight = 0;

      // 1. Date Header
      if (showDate) {
        itemHeight += 40; // Date header height
      }

      // 2. System Message
      if (message.isSystemMessage) {
        return itemHeight + 40;
      }

      // 3. Message Body
      const LINE_HEIGHT = 24;
      const content = message.content;
      const availableWidth = Math.max(300, width);
      const bubbleWidth = availableWidth * 0.8;
      const charWidth = 14;
      const charsPerLine = Math.floor(bubbleWidth / charWidth);

      const lines = content.split('\n');
      let totalLines = 0;
      lines.forEach(line => {
        const lineLen = line.length;
        if (lineLen === 0) totalLines += 1;
        else totalLines += Math.ceil(lineLen / charsPerLine);
      });
      totalLines = Math.max(1, totalLines);
      const textHeight = totalLines * LINE_HEIGHT;

      // Base Padding logic
      if (isGrouped) {
        // Grouped: Small top padding (2px), No Author, Bubble Padding 16px, Bottom 2px
        itemHeight += 2 + textHeight + 16 + 2;
      } else {
        // Standard: Top 8px, Author 18px, Gap 2px, Text, Bubble Padding 16px, Bottom 8px
        itemHeight += 8 + 18 + 2 + textHeight + 16 + 8;
      }

      return itemHeight;
    },
    [messages, width, getMessageDisplayInfo]
  );

  const itemData = useMemo(
    () => ({
      messages,
      onMessageClick,
      highlightedId: highlightedId ?? null,
      getMessageDisplayInfo
    }),
    [messages, onMessageClick, highlightedId, getMessageDisplayInfo]
  );

  if (messages.length === 0) {
    return (
      <div className="message-list__empty">
        <p>沒有找到符合條件的訊息</p>
      </div>
    );
  }

  return (
    <>
      {stickyDate && (
        <div className="message-list__sticky-date">
          {stickyDate}
        </div>
      )}
      <List
        ref={listRef}
        height={height}
        width={width}
        itemCount={messages.length}
        itemSize={getItemSize}
        overscanCount={5}
        itemData={itemData}
        onItemsRendered={onItemsRendered}
      >
        {MessageItem}
      </List>
    </>
  );
}

// Custom hook to use ResizeObserver instead of AutoSizer
function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(element);

    // Get initial size
    const rect = element.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return size;
}

export function MessageList(props: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);

  return (
    <div className="message-list" ref={containerRef}>
      {height > 0 && width > 0 && (
        <MessageListInner
          {...props}
          height={height}
          width={width}
        />
      )}
    </div>
  );
}
