type PriorityLevel = 'Baja'| 'Media'| 'Alta';

interface PriorityBadgeProps{
    label: PriorityLevel;
}

const priorityColors : Record<PriorityLevel,string> = {
    Baja : '#667085',
    Media : '#DF8200',
    Alta : '#A70000',
};

export default function PriorityBadge ({label} : PriorityBadgeProps) {
    return (
        <span 
            className="inline-block px-4 py-1 rounded-lg text-white text-sm mb-5 mt-2" 
            style={{ backgroundColor: priorityColors[label] }}
        >
            {label}
        </span>
    );
}