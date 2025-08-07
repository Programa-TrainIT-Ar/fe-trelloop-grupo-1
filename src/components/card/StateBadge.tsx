type StateLevel = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface StateBadgeProps {
    label: StateLevel;
}

const stateColors: Record<StateLevel, string> = {
    TODO: '#60584E',
    IN_PROGRESS: '#2E90FA',
    DONE: '#12B76A',
};

const stateLabels: Record<StateLevel, string> = {
    TODO: 'Por hacer',
    IN_PROGRESS: 'En progreso',
    DONE: 'Hecho',
};

export default function StateBadge({ label }: StateBadgeProps) {
    return (
        <span
            className="inline-block px-4 py-1 rounded-lg text-white text-sm mb-5 mt-2"
            style={{ backgroundColor: stateColors[label] }}
        >
            {stateLabels[label]}
        </span>
    );
}