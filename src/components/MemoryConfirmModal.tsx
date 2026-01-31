import { useEffect, useState, useRef } from 'react';
import './MemoryConfirmModal.css';

interface MemoryConfirmModalProps {
    estimatedMemory: string;
    onConfirm: () => void;
    onCancel: () => void;
    autoStartSeconds?: number;
}

export function MemoryConfirmModal({ 
    estimatedMemory, 
    onConfirm, 
    onCancel, 
    autoStartSeconds = 3 
}: MemoryConfirmModalProps) {
    const [secondsLeft, setSecondsLeft] = useState(autoStartSeconds);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    // Timeout finished, trigger confirm
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Trigger onConfirm when seconds hit 0
    useEffect(() => {
        if (secondsLeft === 0) {
            onConfirm();
        }
    }, [secondsLeft, onConfirm]);

    return (
        <div className="memory-modal-overlay">
            <div className="memory-modal glass">
                <div className="memory-modal__icon">
                    ⚠️
                </div>
                <h3 className="memory-modal__title">資源預估確認</h3>
                <p className="memory-modal__text">
                    此檔案較大，預計將佔用約 <strong>{estimatedMemory}</strong> 的記憶體資源。
                </p>
                <p className="memory-modal__subtext">
                    將在 {secondsLeft} 秒後自動開始...
                </p>
                
                <div className="memory-modal__actions">
                    <button 
                        className="memory-modal__btn memory-modal__btn--cancel"
                        onClick={onCancel}
                    >
                        取消
                    </button>
                    <button 
                        className="memory-modal__btn memory-modal__btn--confirm"
                        onClick={onConfirm}
                    >
                        立即開始 ({secondsLeft}s)
                    </button>
                </div>
                
                {/* Progress Bar Animation */}
                <div 
                    className="memory-modal__progress" 
                    style={{ animationDuration: `${autoStartSeconds}s` }}
                />
            </div>
        </div>
    );
}
