'use client';

type StateLevel = 'TODO' | 'IN_PROGRESS' | 'DONE';
interface StateSelectorProps{
    value: StateLevel | '';
    onChange: (value: StateLevel| '') => void;
}

const stateOptions = [
    { value: 'TODO', label: 'Por hacer' },
    { value: 'IN_PROGRESS', label: 'En progreso' },
    { value: 'DONE', label: 'Hecho' },
];

export default function StateSelector ({value, onChange} : StateSelectorProps) {
    return (
        <div className="relative">
            <select
                className="mt-2 py-2 px-3 pr-12 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-sm font-light text-white focus:outline-none focus:border-purple-500 bg-[#313131] h-[41px] appearance-none"
                value={value}
                onChange={(e) => onChange(e.target.value as StateLevel | '')}
            >
                <option value="" className="bg-[#313131] text-white text-xs">Selecciona un estado</option>
                {stateOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#313131] text-white">
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
}