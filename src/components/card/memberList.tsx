interface Member {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface MemberListProps {
    members: Member[];
    onClose: () => void;
}

export default function MembersList({ members, onClose }: MemberListProps) {
    return (
        <div
            role="dialog"
            aria-label="Lista de miembros"
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[--global-color-neutral-700] text-white rounded-xl shadow-lg p-3 z-50"
        >
            <div className="flex items-center justify-between mb-2">
                <strong>Miembros del tablero</strong>
                <button
                    onClick={onClose}
                    className="text-sm px-2 py-1 rounded hover:bg-[--global-color-neutral-800]"
                >
                    ✕
                </button>
            </div>

            {members.length === 0 ? (
                <p className="text-sm text-gray-300">No hay miembros en este tablero.</p>
            ) : (
                members.map((member) => (
                    <div
                        key={member.id}
                        className="p-2 rounded mb-2 hover:bg-white/10 flex items-center gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
                            {member.first_name?.[0]}{member.last_name?.[0]}
                        </div>
                        <div>
                            <div className="text-sm font-medium">{member.first_name} {member.last_name}</div>
                            <div className="text-xs text-gray-300">{member.email}</div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
                