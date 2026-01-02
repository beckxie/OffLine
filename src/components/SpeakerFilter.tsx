import { useCallback } from 'react';
import './SpeakerFilter.css';

interface SpeakerFilterProps {
    speakers: string[];
    selectedSpeakers: string[];
    onChange: (selected: string[]) => void;
}

export function SpeakerFilter({
    speakers,
    selectedSpeakers,
    onChange,
}: SpeakerFilterProps) {
    const handleSpeakerChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const speaker = event.target.value;
            const isChecked = event.target.checked;

            if (isChecked) {
                onChange([...selectedSpeakers, speaker]);
            } else {
                onChange(selectedSpeakers.filter((s) => s !== speaker));
            }
        },
        [selectedSpeakers, onChange]
    );

    const handleSelectAll = useCallback(() => {
        onChange([]); // Empty means "all" in our logic usually, or we can explicit select all.
        // Let's adopt the convention: empty array = show all.
        // If user explicitly clicks "select all", we clear the filter.
    }, [onChange]);

    if (speakers.length === 0) return null;

    return (
        <div className="speaker-filter">
            <h3 className="speaker-filter__title">發言人 ({speakers.length})</h3>
            <div className="speaker-filter__list">
                {speakers.map((speaker) => (
                    <label key={speaker} className="speaker-filter__item">
                        <input
                            type="checkbox"
                            value={speaker}
                            checked={selectedSpeakers.includes(speaker)}
                            onChange={handleSpeakerChange}
                            className="speaker-filter__checkbox"
                        />
                        <span className="speaker-filter__label" title={speaker}>
                            {speaker}
                        </span>
                    </label>
                ))}
            </div>
            {selectedSpeakers.length > 0 && (
                <button
                    className="speaker-filter__reset"
                    onClick={handleSelectAll}
                    title="清除發言人篩選"
                >
                    重設 ({selectedSpeakers.length})
                </button>
            )}
        </div>
    );
}
