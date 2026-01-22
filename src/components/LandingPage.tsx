import { useCallback, useState } from 'react';
import './LandingPage.css';

interface LandingPageProps {
    onFileSelect: (file: File) => void;
    isLoading: boolean;
    progress: number;
}

export function LandingPage({ onFileSelect, isLoading, progress }: LandingPageProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                onFileSelect(file);
            }
        },
        [onFileSelect]
    );

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file && file.name.endsWith('.txt')) {
                onFileSelect(file);
            }
        },
        [onFileSelect]
    );

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        // Keep dragging true while over
        setIsDragging(true);
    }, []);

    const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        // Only set false if leaving the main container
        if (event.currentTarget.contains(event.relatedTarget as Node)) {
            return;
        }
        setIsDragging(false);
    }, []);

    return (
        <main className="landing">
            <div className="landing__container">
                {/* Hero Section */}
                <header className="landing__hero">
                    <div className="landing__logo">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="32" cy="32" r="30" fill="var(--color-primary)" />
                            <path
                                d="M20 28C20 22.477 24.477 18 30 18H34C39.523 18 44 22.477 44 28V36C44 41.523 39.523 46 34 46H30C24.477 46 20 41.523 20 36V28Z"
                                fill="white"
                            />
                            <circle cx="28" cy="30" r="3" fill="var(--color-primary)" />
                            <circle cx="36" cy="30" r="3" fill="var(--color-primary)" />
                            <path
                                d="M28 38C28 38 30 40 32 40C34 40 36 38 36 38"
                                stroke="var(--color-primary)"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <h1 className="landing__title">OffLine</h1>
                    <p className="landing__subtitle">離線聊天記錄搜尋工具</p>
                </header>

                {/* Features */}
                <section className="landing__features">
                    <div className="landing__feature glass">
                        <span className="landing__feature-icon">🔒</span>
                        <div className="landing__feature-text">
                            <strong>完全離線</strong>
                            <span>資料不會上傳至任何伺服器</span>
                        </div>
                    </div>
                    <div className="landing__feature glass">
                        <span className="landing__feature-icon">⚡</span>
                        <div className="landing__feature-text">
                            <strong>快速搜尋</strong>
                            <span>支援大型聊天記錄檔案</span>
                        </div>
                    </div>
                    <div className="landing__feature glass">
                        <span className="landing__feature-icon">🎯</span>
                        <div className="landing__feature-text">
                            <strong>精準篩選</strong>
                            <span>依發言人、日期範圍篩選</span>
                        </div>
                    </div>
                </section>

                {/* Upload Area */}
                <section
                    className={`landing__upload ${isLoading ? 'landing__upload--loading' : ''} ${isDragging ? 'landing__upload--dragging' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                >
                    {isLoading ? (
                        <div className="landing__progress">
                            <div className="landing__progress-bar">
                                <div
                                    className="landing__progress-fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="landing__progress-text">解析中... {progress}%</p>
                        </div>
                    ) : (
                        <>
                            <div className="landing__upload-icon">📁</div>
                            <p className="landing__upload-text">
                                {isDragging ? '放開以開始解析' : '拖放 LINE 聊天記錄 (.txt) 至此處'}
                            </p>
                            <p className="landing__upload-or">或</p>
                            <label className="landing__upload-button">
                                選擇檔案
                                <input
                                    type="file"
                                    accept=".txt"
                                    onChange={handleFileChange}
                                    className="visually-hidden"
                                    aria-label="選擇 LINE 聊天記錄檔案"
                                />
                            </label>
                        </>
                    )}
                </section>

                {/* Instructions */}
                <section className="landing__instructions">
                    <h2 className="landing__instructions-title">如何取得 LINE 聊天記錄？</h2>
                    <ol className="landing__instructions-list">
                        <li>開啟 LINE 聊天室 → 點擊右上角選單</li>
                        <li>選擇「其他設定」→「傳送聊天記錄」</li>
                        <li>選擇「以文字檔傳送」</li>
                        <li>將檔案儲存後即可得到 .txt 檔案</li>
                    </ol>
                </section>

                {/* Footer */}
                <footer className="landing__footer">
                    <p>您的聊天記錄完全在瀏覽器中處理，絕不離開您的裝置。</p>
                </footer>
            </div>
        </main>
    );
}
