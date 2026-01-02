import { useRef, useEffect, memo } from 'react';
import { Message } from '../types';
import './MessageItem.css';

interface MessageItemProps {
    index: number;
    style: React.CSSProperties;
    data: {
        messages: Message[];
        onMessageClick?: (message: Message) => void;
        highlightedId: number | null;
    };
}

export const MessageItem = memo(({ index, style, data }: MessageItemProps) => {
    const { messages, onMessageClick, highlightedId } = data;
    const message = messages[index];
    const isHighlighted = message.id === highlightedId;
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isHighlighted && itemRef.current) {
            itemRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }, [isHighlighted]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    const isMedia = /^\[(照片|貼圖|影片)\]/.test(message.content);

    const handleClick = () => {
        if (onMessageClick) {
            onMessageClick(message);
        }
    };

    return (
        <div
            ref={itemRef}
            className={`message-item ${message.isSystemMessage ? 'message-item--system' : ''} ${isHighlighted ? 'message-item--highlighted' : ''}`}
            style={style}
            onClick={onMessageClick ? handleClick : undefined}
            role={onMessageClick ? 'button' : undefined}
            tabIndex={onMessageClick ? 0 : undefined}
        >
            {message.isSystemMessage ? (
                <div className="message-item__system-content">{message.author}</div>
            ) : (
                <div className="message-item__container">
                    <div className="message-item__author">{message.author}</div>
                    <div className="message-item__bubble-row">
                        <div className={`message-item__bubble ${isMedia ? 'message-item__content--media' : ''}`}>
                            {message.content}
                        </div>
                        <div className="message-item__time">
                            {formatTime(message.timestamp)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
