import { useCallback, useState, useMemo } from 'react';
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
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSpeakers = useMemo(() => {
        if (!searchTerm) {
            return speakers;
        }
        const lowerTerm = searchTerm.toLowerCase();
        return speakers.filter(speaker =>
            speaker.toLowerCase().includes(lowerTerm)
        );
    }, [speakers, searchTerm]);

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
        onChange([]);
    }, [onChange]);

    if (speakers.length === 0) return null;

    return (
        <div className="speaker-filter">
            <h3 className="speaker-filter__title">發言人 ({speakers.length})</h3>

            <div className="speaker-filter__search-wrapper">
                <input
                    type="text"
                    className="speaker-filter__search"
                    placeholder="搜尋發言人..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="speaker-filter__list">
                {filteredSpeakers.length > 0 ? (
                    filteredSpeakers.map((speaker) => (
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
                    ))
                ) : (
                    <div className="speaker-filter__empty">找不到發言人</div>
                )}
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
