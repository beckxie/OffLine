import { memo } from 'react';
import { Message } from '../types';
import './MessageItem.css';

interface MessageItemProps {
    message: Message;
    style?: React.CSSProperties;
    isHighlighted?: boolean;
    onClick?: () => void;
}

function formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '下午' : '上午';
    const h = hours % 12 || 12;
    const m = minutes.toString().padStart(2, '0');
    return `${ampm}${h}:${m}`;
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
}

export const MessageItem = memo(function MessageItem({
    message,
    style,
    isHighlighted = false,
    onClick,
}: MessageItemProps) {
    const isMedia =
        message.content === '[照片]' ||
        message.content === '[貼圖]' ||
        message.content === '[影片]';

    return (
        <div
            className={`message-item ${message.isSystemMessage ? 'message-item--system' : ''} ${isHighlighted ? 'message-item--highlighted' : ''}`}
            style={style}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="message-item__time">
                <span className="message-item__date">{formatDate(message.timestamp)}</span>
                <span className="message-item__clock">{formatTime(message.timestamp)}</span>
            </div>
            {message.isSystemMessage ? (
                <div className="message-item__system-content">{message.author}</div>
            ) : (
                <>
                    <div className="message-item__author">{message.author}</div>
                    <div className={`message-item__content ${isMedia ? 'message-item__content--media' : ''}`}>
                        {message.content}
                    </div>
                </>
            )}
        </div>
    );
});
