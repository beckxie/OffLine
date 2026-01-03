import { useState, useTransition, useCallback, useMemo, useEffect, useRef } from 'react';
import { parseLineChatFile, readFileAsText } from './utils/lineParser';
import { ChatFile, Message } from './types';
import { useSearch } from './hooks/useSearch';
import { LandingPage } from './components/LandingPage';
import { MessageList } from './components/MessageList';
import { SearchBar } from './components/SearchBar';
import { SpeakerFilter } from './components/SpeakerFilter';
import { DateRangePicker } from './components/DateRangePicker';
import './App.css';

function App() {
    const [isPending, startTransition] = useTransition();

    // File & Parsing State
    const [chatFile, setChatFile] = useState<ChatFile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

    // Search Logic
    const {
        filters,
        setKeyword,
        setSelectedSpeakers,
        setDateRange,
        filteredMessages,
        isFiltering,
        totalResults,
    } = useSearch(chatFile?.messages || [], startTransition);

    // View State
    const [jumpTargetIndex, setJumpTargetIndex] = useState<number | null>(null);

    // Resizable Sidebar State
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);

    const resize = useCallback(
        (e: MouseEvent) => {
            if (isResizing) {
                // Limit width between 280px and 50% of screen
                const newWidth = Math.max(280, Math.min(e.clientX, window.innerWidth * 0.6));
                setSidebarWidth(newWidth);
            }
        },
        [isResizing]
    );

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none'; // Prevent selection while dragging
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, resize, stopResizing]);


    const handleFileSelect = useCallback(async (file: File) => {
        // ... existing logic ...
        setIsLoading(true);
        setLoadingProgress(0);
        try {
            const content = await readFileAsText(file);
            // Add small delay to show loading state initially
            await new Promise(resolve => setTimeout(resolve, 50));

            const parsed = await parseLineChatFile(content, (progress) => {
                setLoadingProgress(progress);
            });
            setChatFile(parsed);
            setIsLoading(false);
        } catch (error) {
            console.error('File reading failed', error);
            alert('檔案讀取失敗，請確認檔案格式是否正確。');
            setIsLoading(false);
        }
    }, []);

    const handleMessageClick = useCallback(
        (message: Message) => {
            if (!chatFile) return;

            const originalIndex = chatFile.messages.findIndex(
                (m) => m.id === message.id
            );
            if (originalIndex !== -1) {
                setKeyword('');
                setSelectedSpeakers([]);
                setDateRange('', '');
                setJumpTargetIndex(originalIndex);
            }
        },
        [chatFile, setKeyword, setSelectedSpeakers, setDateRange]
    );

    const dateRangeStr = useMemo(() => {
        return {
            min: chatFile?.dateRange.start?.toISOString().split('T')[0],
            max: chatFile?.dateRange.end?.toISOString().split('T')[0],
            start: filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : '',
            end: filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : '',
        };
    }, [chatFile?.dateRange, filters.dateRange]);

    if (!chatFile) {
        return (
            <LandingPage
                onFileSelect={handleFileSelect}
                isLoading={isLoading}
                progress={loadingProgress}
            />
        );
    }

    return (
        <div className="app">
            <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        handleFileSelect(file);
                        // Reset input so same file can be selected again
                        e.target.value = '';
                    }
                }}
                accept=".txt"
                style={{ display: 'none' }}
            />
            <aside
                className="app__sidebar"
                style={{ width: sidebarWidth }}
                ref={sidebarRef}
            >
                <div className="app__sidebar-header">
                    <button
                        className="app__icon-button"
                        onClick={() => setChatFile(null)}
                        title="回到首頁"
                        aria-label="回到首頁"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <button
                        className="app__icon-button"
                        onClick={() => fileInputRef.current?.click()}
                        title="開啟其他檔案"
                        aria-label="開啟其他檔案"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </button>
                    <div className="app__sidebar-title-wrapper">
                        <h2 className="app__group-name">{chatFile.groupName}</h2>
                        <div className="app__meta">
                            {chatFile.messages.length.toLocaleString()} 則訊息
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="app__sidebar-loading">
                        <div className="app__sidebar-progress">
                            <div
                                className="app__sidebar-progress-fill"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                        <p className="app__sidebar-loading-text">解析中... {loadingProgress}%</p>
                    </div>
                )}

                <div className="app__filters">
                    <SearchBar
                        value={filters.keyword}
                        onChange={setKeyword}
                        resultCount={isFiltering ? totalResults : undefined}
                        totalCount={chatFile.messages.length}
                    />

                    <div className="app__filter-scroller">
                        <DateRangePicker
                            startDate={dateRangeStr.start}
                            endDate={dateRangeStr.end}
                            minDate={dateRangeStr.min}
                            maxDate={dateRangeStr.max}
                            onChange={setDateRange}
                        />

                        <SpeakerFilter
                            speakers={chatFile.speakers}
                            selectedSpeakers={filters.selectedSpeakers}
                            onChange={setSelectedSpeakers}
                        />
                    </div>
                </div>
            </aside>

            {/* Resizer Handle */}
            <div
                className={`app__resizer ${isResizing ? 'app__resizer--active' : ''}`}
                onMouseDown={startResizing}
            />

            <main className="app__main">
                {isPending && <div className="app__loading-overlay">搜尋中...</div>}
                <MessageList
                    messages={filteredMessages}
                    onMessageClick={isFiltering ? handleMessageClick : undefined}
                    scrollToIndex={!isFiltering ? jumpTargetIndex : null}
                    highlightedId={!isFiltering && jumpTargetIndex !== null ? chatFile.messages[jumpTargetIndex].id : null}
                />
            </main>
        </div>
    );
}

export default App;
