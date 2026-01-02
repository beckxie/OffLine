import { useCallback } from 'react';
import './DateRangePicker.css';

interface DateRangePickerProps {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    minDate?: string;
    maxDate?: string;
    onChange: (start: string, end: string) => void;
}

export function DateRangePicker({
    startDate,
    endDate,
    minDate,
    maxDate,
    onChange,
}: DateRangePickerProps) {
    const handleStartChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value, endDate);
        },
        [endDate, onChange]
    );

    const handleEndChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(startDate, e.target.value);
        },
        [startDate, onChange]
    );

    const handleReset = useCallback(() => {
        onChange('', '');
    }, [onChange]);

    return (
        <div className="date-range-picker">
            <div className="date-range-picker__header">
                <h3 className="date-range-picker__title">日期範圍</h3>
                {(startDate || endDate) && (
                    <button className="date-range-picker__reset" onClick={handleReset}>
                        重設
                    </button>
                )}
            </div>
            <div className="date-range-picker__inputs">
                <div className="date-range-picker__field">
                    <label className="date-range-picker__label">開始</label>
                    <input
                        type="date"
                        className="date-range-picker__input"
                        value={startDate}
                        min={minDate}
                        max={endDate || maxDate}
                        onChange={handleStartChange}
                        aria-label="開始日期"
                    />
                </div>
                <div className="date-range-picker__field">
                    <label className="date-range-picker__label">結束</label>
                    <input
                        type="date"
                        className="date-range-picker__input"
                        value={endDate}
                        min={startDate || minDate}
                        max={maxDate}
                        onChange={handleEndChange}
                        aria-label="結束日期"
                    />
                </div>
            </div>
        </div>
    );
}
