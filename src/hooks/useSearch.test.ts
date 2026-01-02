import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../hooks/useSearch';
import { Message } from '../types';

// Mock data
const mockMessages: Message[] = [
    { id: 1, timestamp: new Date('2022-04-01T10:00:00'), author: 'Alice', content: 'Hello world', isSystemMessage: false },
    { id: 2, timestamp: new Date('2022-04-01T10:05:00'), author: 'Bob', content: 'Hi there', isSystemMessage: false },
    { id: 3, timestamp: new Date('2022-04-02T09:00:00'), author: 'Alice', content: 'Good morning', isSystemMessage: false },
    { id: 4, timestamp: new Date('2022-04-02T09:30:00'), author: '', content: '', isSystemMessage: true }, // System msg
];

describe('useSearch', () => {
    it('should return all messages initially', () => {
        const { result } = renderHook(() => useSearch(mockMessages, (cb) => cb()));
        expect(result.current.filteredMessages).toHaveLength(4);
        expect(result.current.isFiltering).toBe(false);
    });

    it('should filter by keyword', () => {
        const { result } = renderHook(() => useSearch(mockMessages, (cb) => cb()));

        act(() => {
            result.current.setKeyword('Hello');
        });

        expect(result.current.filteredMessages).toHaveLength(1);
        expect(result.current.filteredMessages[0].content).toBe('Hello world');
        expect(result.current.isFiltering).toBe(true);
    });

    it('should filter by speaker', () => {
        const { result } = renderHook(() => useSearch(mockMessages, (cb) => cb()));

        act(() => {
            result.current.setSelectedSpeakers(['Bob']);
        });

        expect(result.current.filteredMessages).toHaveLength(1);
        expect(result.current.filteredMessages[0].author).toBe('Bob');
    });

    it('should filter by date range', () => {
        const { result } = renderHook(() => useSearch(mockMessages, (cb) => cb()));

        act(() => {
            result.current.setDateRange('2022-04-02', '2022-04-02');
        });

        // Should include Alice's morning msg and system msg
        expect(result.current.filteredMessages).toHaveLength(2);
        expect(result.current.filteredMessages[0].id).toBe(3);
        expect(result.current.filteredMessages[1].id).toBe(4);
    });

    it('should combined filters', () => {
        const { result } = renderHook(() => useSearch(mockMessages, (cb) => cb()));

        act(() => {
            result.current.setKeyword('morning');
            result.current.setSelectedSpeakers(['Alice']);
        });

        expect(result.current.filteredMessages).toHaveLength(1);
        expect(result.current.filteredMessages[0].content).toBe('Good morning');
    });
});
