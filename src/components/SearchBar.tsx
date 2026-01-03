import { useCallback, useState, useRef, useEffect } from 'react';
import './SearchBar.css';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    resultCount?: number;
    totalCount?: number;
}

export function SearchBar({ value, onChange, resultCount, totalCount }: SearchBarProps) {
    const [inputValue, setInputValue] = useState(value);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync external value changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setInputValue(newValue);

            // Debounce search
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
                onChange(newValue);
            }, 300);
        },
        [onChange]
    );

    const handleClear = useCallback(() => {
        setInputValue('');
        onChange('');
    }, [onChange]);

    return (
        <div className="search-bar">
            <div className="search-bar__input-wrapper">
                <span className="search-bar__icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </span>
                <input
                    type="text"
                    className="search-bar__input"
                    placeholder="搜尋訊息內容..."
                    value={inputValue}
                    onChange={handleChange}
                    aria-label="搜尋訊息"
                />
                {inputValue && (
                    <button
                        className="search-bar__clear"
                        onClick={handleClear}
                        aria-label="清除搜尋"
                    >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
                            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                        </svg>
                    </button>
                )}
            </div>
            {resultCount !== undefined && totalCount !== undefined && (
                <div className="search-bar__result">
                    {value ? (
                        <span>
                            找到 <strong>{resultCount.toLocaleString()}</strong> 則訊息
                        </span>
                    ) : (
                        <span>
                            共 <strong>{totalCount.toLocaleString()}</strong> 則訊息
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
