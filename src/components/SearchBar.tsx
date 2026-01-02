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
                <span className="search-bar__icon">🔍</span>
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
                        ✕
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
