export default function MembersList({ onClose }: { onClose?: () => void }) {
    return (
        <div
            role="dialog"
            aria-label="Lista de miembros"
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[--global-color-neutral-700] text-white rounded-xl shadow-lg p-3 z-50"
        >
            <div className="flex items-center justify-between mb-2">
                <strong>Compartir tablero</strong>
                <button 
                    onClick={onClose}
                    className="text-sm px-2 py-1 rounded hover:bg-[--global-color-neutral-800]"
                >
                    ✕
                </button>
            </div>
            
            <p className="text-sm text-gray-300">Lista de miembros aquí</p>
        </div>
    );
}