import { useCallback, useRef, useEffect } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { Message } from '../types';
import { MessageItem } from './MessageItem';
import './MessageList.css';

interface MessageListProps {
    messages: Message[];
    highlightedId?: number | null;
    onMessageClick?: (message: Message) => void;
    scrollToIndex?: number | null;
}

const ROW_HEIGHT = 60;

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
        if (scrollToIndex !== null && scrollToIndex !== undefined && listRef.current) {
            listRef.current.scrollToItem(scrollToIndex, 'center');
        }
    }, [scrollToIndex]);

    const Row = useCallback(
        ({ index, style }: ListChildComponentProps) => {
            const message = messages[index];
            return (
                <MessageItem
                    key={message.id}
                    message={message}
                    style={style}
                    isHighlighted={message.id === highlightedId}
                    onClick={onMessageClick ? () => onMessageClick(message) : undefined}
                />
            );
        },
        [messages, highlightedId, onMessageClick]
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
                height={window.innerHeight - 180}
                itemCount={messages.length}
                itemSize={ROW_HEIGHT}
                width="100%"
                overscanCount={10}
            >
                {Row}
            </List>
        </div>
    );
}
