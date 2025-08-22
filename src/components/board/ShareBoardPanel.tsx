'use client';

import { useEffect, useState } from 'react';
import { FaTimes, FaRegCopy, FaTrashAlt } from 'react-icons/fa';

type Member = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role?: 'ADMIN' | 'MEMBER';
};

type Props = {
    boardId: string;
    token: string;
    onClose: () => void;
    onChanged?: () => void; 
};

export default function ShareBoardPanel({ boardId, token, onClose, onChanged }: Props) {
    const [query, setQuery] = useState('');
    const [role, setRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [ownerId, setOwnerId] = useState<number | null>(null);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API}/board/getBoard/${boardId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('No se pudo obtener el tablero');
            const data = await res.json();

          
            const owner = typeof data?.userId === 'number' ? data.userId : undefined;
            if (owner) setOwnerId(owner);

           
            const rawMembers: Member[] = data?.members || data?.board?.members || [];

            
            const normalized = rawMembers.map((m) => ({
                ...m,
                role: m.id === owner ? 'ADMIN' : (m.role ?? 'MEMBER'),
            }));

            setMembers(normalized);
        } catch (e) {
            console.error(e);
            setMembers([]);
            setOwnerId(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [boardId, token]);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText('www.url.com');
        } catch (e) {
            console.error('No se pudo copiar');
        }
    };

    //prueba de conectar al endpoint real de invitaciones 
    const handleInvite = async () => {
        if (!query.trim()) return;
        try {
            setInviting(true);
            
            // const res = await fetch(`${process.env.NEXT_PUBLIC_API}/board/invite`, {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json',
            //     Authorization: `Bearer ${token}`,
            //   },
            //   body: JSON.stringify({ boardId: Number(boardId), email: query.trim(), role }),
            // });
            // if (!res.ok) throw new Error('No se pudo invitar');

            setQuery('');
            await fetchMembers();
            onChanged?.();
        } catch (e) {
            console.error(e);
        } finally {
            setInviting(false);
        }
    };

    //Por si e quiere eliminar a un miembro del tablero
    const handleRemove = async (memberId: number) => {
        try {
            // await fetch(`${process.env.NEXT_PUBLIC_API}/board/removeMember`, { ... })
            setMembers((prev) => prev.filter((m) => m.id !== memberId));
            onChanged?.();
        } catch (e) {
            console.error(e);
        }
    };

    //opcional cambiar rol desde el panel
    const handleChangeRole = async (memberId: number, newRole: 'ADMIN' | 'MEMBER') => {
        try {
            setMembers((prev) =>
                prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
            );
            // await fetch(`${process.env.NEXT_PUBLIC_API}/board/changeRole`, { ... })
            onChanged?.();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[9998] flex items-start justify-end">
            {/* overlay */}
            <div
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
                aria-label="Cerrar"
            />

            {/* panel */}
            <div className="relative z-[9999] mt-16 mr-6 w-[820px] max-w-[92vw] max-h-[80vh] overflow-hidden bg-[#1f1f1f] text-white rounded-2xl shadow-2xl border border-[#3C3C3CB2]">
                {/* header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#3C3C3CB2]">
                    <h2 className="text-lg font-semibold">Compartir tablero</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-white/10"
                        aria-label="Cerrar"
                        title="Cerrar"
                    >
                        <FaTimes />
                    </button>
                </div>

           
                <div
                    className="px-6 pb-6 pt-4 overflow-y-auto"
                    style={{ maxHeight: "calc(80vh - 64px)" }}
                >
               
                    <div className="flex gap-3 items-center">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar por nombre, email..."
                            className="flex-1 h-12 px-4 bg-[#313131] border-2 border-[#3C3C3CB2] rounded-lg placeholder:text-[#A9A9A9] focus:outline-none focus:border-purple-500"
                        />

                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as "MEMBER" | "ADMIN")}
                            className="h-12 px-3 bg-[#313131] border-2 border-[#3C3C3CB2] rounded-lg focus:outline-none focus:border-purple-500"
                        >
                            <option value="MEMBER">Miembro</option>
                            <option value="ADMIN">Administrador</option>
                        </select>

                        <button
                            onClick={handleInvite}
                            disabled={inviting || !query.trim()}
                            className="h-12 px-5 rounded-lg bg-[#6A5FFF] hover:bg-[#5c52ff] disabled:opacity-60"
                        >
                            {inviting ? "Enviando..." : "Buscar"}
                        </button>
                    </div>

              
                    <div className="mt-4">
                        <input
                            value="www.url.com"
                            readOnly
                            className="w-full h-12 px-4 bg-[#313131] border-2 border-[#3C3C3CB2] rounded-lg text-[#cfcfcf]"
                        />
                    </div>

                 
                    <div className="flex gap-3 mt-3">
                        <button
                            onClick={copyLink}
                            className="flex-1 h-12 px-4 rounded-lg bg-[#2b2b2b] hover:bg-[#343434] border border-[#3C3C3CB2] flex items-center justify-center gap-2"
                        >
                            <FaRegCopy /> Copiar enlace
                        </button>
                        <button
                            className="flex-1 h-12 px-4 rounded-lg bg-[#2b2b2b] hover:bg-[#343434] border border-[#3C3C3CB2]"
                            title="(Pendiente) Eliminar enlace público"
                            disabled
                        >
                            Eliminar enlace
                        </button>
                    </div>

                
                    <hr className="border-[#3C3C3CB2] my-5" />

                 
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-base font-semibold">Miembros del tablero</p>
                        <div className="min-w-8 h-8 px-2 rounded-full bg-[#2b2b2b] border border-[#3C3C3CB2] flex items-center justify-center">
                            <span className="text-sm">{members.length}</span>
                        </div>
                    </div>

                 
                    {loading ? (
                        <p className="text-sm text-gray-400">Cargando miembros…</p>
                    ) : members.length === 0 ? (
                        <p className="text-sm text-gray-400">Aún no hay miembros.</p>
                    ) : (
                        <ul className="space-y-3 pr-1">
                            {members.map((m) => {
                                const isOwner = ownerId !== null && m.id === ownerId;
                                return (
                                    <li
                                        key={m.id}
                                        className="flex items-center justify-between bg-[#262626] border border-[#3C3C3CB2] rounded-xl px-4 py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#3b3b3b] flex items-center justify-center text-sm">
                                                {`${m.first_name?.[0] ?? ""}${m.last_name?.[0] ?? ""}`}
                                            </div>
                                            <div className="flex flex-col leading-tight">
                                                <div className="text-sm font-medium flex items-center gap-2">
                                                    <span>
                                                        {m.first_name} {m.last_name}
                                                    </span>
                                                    {isOwner && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#3b3b3b]">
                                                            Propietario
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    ({m.email})
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <select
                                                value={
                                                    isOwner
                                                        ? "ADMIN"
                                                        : m.role === "ADMIN"
                                                            ? "ADMIN"
                                                            : "MEMBER"
                                                }
                                                onChange={(e) =>
                                                    !isOwner &&
                                                    handleChangeRole(m.id, e.target.value as "ADMIN" | "MEMBER")
                                                }
                                                disabled={isOwner}
                                                className={`h-9 px-3 bg-[#313131] border-2 border-[#3C3C3CB2] rounded-md text-sm ${isOwner ? "opacity-60 cursor-not-allowed" : ""
                                                    }`}
                                                title={
                                                    isOwner
                                                        ? "El propietario siempre es Administrador"
                                                        : "Cambiar rol"
                                                }
                                            >
                                                <option value="ADMIN">Administrador</option>
                                                <option value="MEMBER">Miembro</option>
                                            </select>

                                            <button
                                                onClick={() => !isOwner && handleRemove(m.id)}
                                                className={`p-2 rounded-md ${isOwner ? "opacity-40 cursor-not-allowed" : "hover:bg-white/10"
                                                    }`}
                                                title={
                                                    isOwner
                                                        ? "No puedes eliminar al propietario"
                                                        : "Eliminar del tablero"
                                                }
                                                disabled={isOwner}
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );

}
