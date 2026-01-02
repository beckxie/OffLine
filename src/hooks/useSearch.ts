import { useState, useMemo, TransitionStartFunction } from 'react';
import { Message, SearchFilters } from '../types';

interface UseSearchResult {
    filters: SearchFilters;
    setKeyword: (keyword: string) => void;
    setSelectedSpeakers: (speakers: string[]) => void;
    setDateRange: (start: string, end: string) => void;
    filteredMessages: Message[];
    isFiltering: boolean;
    totalResults: number;
}

export function useSearch(
    messages: Message[],
    startTransition: TransitionStartFunction
): UseSearchResult {
    const [filters, setFiltersState] = useState<SearchFilters>({
        keyword: '',
        selectedSpeakers: [],
        dateRange: { start: null, end: null },
    });

    // Filter setters with transition for better UI responsiveness
    const setKeyword = (keyword: string) => {
        startTransition(() => {
            setFiltersState((prev) => ({ ...prev, keyword }));
        });
    };

    const setSelectedSpeakers = (selectedSpeakers: string[]) => {
        startTransition(() => {
            setFiltersState((prev) => ({ ...prev, selectedSpeakers }));
        });
    };

    const setDateRange = (start: string, end: string) => {
        startTransition(() => {
            setFiltersState((prev) => ({
                ...prev,
                dateRange: {
                    start: start ? new Date(start) : null,
                    end: end ? new Date(end) : null,
                },
            }));
        });
    };

    // Perform filtering
    const filteredMessages = useMemo(() => {
        const { keyword, selectedSpeakers, dateRange } = filters;
        const hasKeyword = keyword.trim().length > 0;
        const hasSpeakers = selectedSpeakers.length > 0;
        const hasDateRange = dateRange.start !== null || dateRange.end !== null;

        if (!hasKeyword && !hasSpeakers && !hasDateRange) {
            return messages;
        }

        const lowerKeyword = keyword.toLowerCase();
        const startDate = dateRange.start ? dateRange.start.getTime() : -Infinity;
        const endDate = dateRange.end
            ? new Date(dateRange.end).setHours(23, 59, 59, 999)
            : Infinity;

        return messages.filter((msg) => {
            // 1. Keyword search (content)
            if (hasKeyword && !msg.content.toLowerCase().includes(lowerKeyword)) {
                return false;
            }

            // 2. Speaker filter (system messages are usually excluded if checking specific speakers, but let's include if selectedSpeakers is empty)
            if (
                hasSpeakers &&
                (!msg.author || !selectedSpeakers.includes(msg.author))
            ) {
                return false;
            }

            // 3. Date range filter
            if (hasDateRange) {
                const msgTime = msg.timestamp.getTime();
                if (msgTime < startDate || msgTime > endDate) {
                    return false;
                }
            }

            return true;
        });
    }, [messages, filters]);

    const isFiltering =
        filters.keyword.length > 0 ||
        filters.selectedSpeakers.length > 0 ||
        filters.dateRange.start !== null ||
        filters.dateRange.end !== null;

    return {
        filters,
        setKeyword,
        setSelectedSpeakers,
        setDateRange,
        filteredMessages,
        isFiltering,
        totalResults: filteredMessages.length,
    };
}
