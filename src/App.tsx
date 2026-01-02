import { useState, useTransition, useCallback, useMemo } from 'react';
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

    // View State (Task 5, 6: Context Jumping)
    // When jumpTargetId is set, we show all messages but scroll to target.
    const [jumpTargetIndex, setJumpTargetIndex] = useState<number | null>(null);

    // When we are "viewing context", we are technically looking at the full list
    // but maybe we want to keep the search bar active?
    // Let's define:
    // - If isFiltering: Show filtered list.
    // - If user clicks a message in filtered list: Clear filters (or switch mode) -> Show full list -> Scroll to message.

    const handleFileSelect = useCallback(async (file: File) => {
        setIsLoading(true);
        setLoadingProgress(0);
        try {
            const content = await readFileAsText(file);
            // Give UI a moment to show loading state before blocking
            setTimeout(() => {
                const parsed = parseLineChatFile(content, (progress) => {
                    setLoadingProgress(progress);
                });
                setChatFile(parsed);
                setIsLoading(false);
            }, 50);
        } catch (error) {
            console.error('File reading failed', error);
            alert('檔案讀取失敗，請確認檔案格式是否正確。');
            setIsLoading(false);
        }
    }, []);

    const handleMessageClick = useCallback(
        (message: Message) => {
            // If we are filtering, clicking a message means "Jump to context"
            // We need to find the index of this message in the *original* list
            if (!chatFile) return;

            const originalIndex = chatFile.messages.findIndex(
                (m) => m.id === message.id
            );
            if (originalIndex !== -1) {
                // Clear filters to show context
                setKeyword('');
                setSelectedSpeakers([]);
                setDateRange('', '');

                // Scroll to item
                // We set index immediately. The re-render will show full list (since filters cleared)
                // and MessageList will handle scrolling via useEffect.
                setJumpTargetIndex(originalIndex);
            }
        },
        [chatFile, setKeyword, setSelectedSpeakers, setDateRange]
    );

    // Derive date strings for picker
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
            <aside className="app__sidebar">
                <div className="app__sidebar-header">
                    <h2 className="app__group-name">{chatFile.groupName}</h2>
                    <div className="app__meta">
                        {chatFile.messages.length.toLocaleString()} 則訊息
                    </div>
                </div>

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
