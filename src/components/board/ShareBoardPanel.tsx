'use client';

import { useEffect, useRef, useState } from 'react';
import { FaTimes, FaRegCopy, FaTrashAlt, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import {
  getBoardById,
  removeMemberFromBoard,
  searchUsersByEmail,
  addMemberToBoard,
} from '@/services/boardService';

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
  const [pending, setPending] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [hiddenPanel, setHiddenPanel] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const getInitials = (m: Member) => {
    if (m.first_name || m.last_name) {
      return `${m.first_name?.[0] ?? ''}${m.last_name?.[0] ?? ''}`.toUpperCase();
    }
    const [local = '', domain = ''] = (m.email || '').split('@');
    return `${local[0] ?? ''}${domain[0] ?? ''}`.toUpperCase() || '?';
  };

  const getDisplayName = (m: Member) => {
    const name = [m.first_name, m.last_name].filter(Boolean).join(' ').trim();
    if (name) return name;
    const local = (m.email || '').split('@')[0] || '';
    return local ? local.charAt(0).toUpperCase() + local.slice(1) : m.email;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText('www.url.com');
      await Swal.fire({
        icon: 'success',
        title: 'Enlace copiado',
        timer: 1200,
        showConfirmButton: false,
        background: 'rgb(26,26,26)',
        color: '#fff',
        iconColor: '#6A5FFF',
      });
    } catch {
      console.error('No se pudo copiar');
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const data = await getBoardById(boardId, token);
      const owner = typeof data?.userId === 'number' ? data.userId : undefined;
      if (owner) setOwnerId(owner);

      const rawMembers: any[] = data?.members || data?.board?.members || [];
      const normalized: Member[] = rawMembers.map((m: any) => ({
        id: m.id,
        first_name: m.first_name ?? m.firstName ?? '',
        last_name:  m.last_name  ?? m.lastName  ?? '',
        email: m.email ?? '',
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
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, token]);

  const handleEnter = async () => {
    const text = query.trim();
    if (!text) return;

    try {
      const found = await searchUsersByEmail(text, token);
      const normalized: Member[] = (Array.isArray(found) ? found : []).map((u: any) => ({
        id: u.id,
        first_name: u.first_name ?? u.firstName ?? '',
        last_name:  u.last_name  ?? u.lastName  ?? '',
        email: u.email ?? '',
        role: 'MEMBER',
      }));

      if (normalized.length === 0) {
        await Swal.fire({
          icon: 'info',
          title: 'No se encontró ningún usuario',
          background: 'rgb(26,26,26)',
          color: '#fff',
        });
        return;
      }

      const existingIds = new Set(members.map((m) => m.id));
      const pendingIds  = new Set(pending.map((p) => p.id));
      const owner = ownerId;

      const toQueue: Member[] = [];
      for (const u of normalized) {
        if (owner !== null && u.id === owner) continue;
        if (existingIds.has(u.id)) continue;
        if (pendingIds.has(u.id)) continue;
        toQueue.push(u);
      }

      if (toQueue.length === 0) {
        await Swal.fire({
          icon: 'info',
          title: 'Ya están agregados o pendientes',
          background: 'rgb(26,26,26)',
          color: '#fff',
        });
        return;
      }

      setPending((prev) => [...prev, ...toQueue]);
      setQuery('');
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo buscar',
        background: 'rgb(26,26,26)',
        color: '#fff',
      });
    }
  };

  /** + Compartir: cerrar panel, alert, y reabrir con lista actualizada */
  const handleShareAll = async () => {
    if (pending.length === 0) return;

    setSharing(true);
    setHiddenPanel(true);           // cierra visualmente el panel
    await sleep(50);                // deja que se oculte antes del modal

    const ok: Member[] = [];
    const fail: { user: Member; error: any }[] = [];

    for (const u of pending) {
      try {
        await addMemberToBoard(boardId, u.id, token); // backend envía notificación
        ok.push(u);
      } catch (e) {
        fail.push({ user: u, error: e });
      }
    }

    // limpia pendientes de los que sí entraron
    if (ok.length) {
      setMembers((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const merged = [...prev];
        for (const u of ok) if (!ids.has(u.id)) merged.push(u);
        return merged;
      });
    }
    setPending((prev) => prev.filter((p) => !ok.some((u) => u.id === p.id)));

    // alerta (esperamos a que el usuario la cierre)
    if (ok.length && !fail.length) {
      await Swal.fire({
        icon: 'success',
        title: `Miembro${ok.length > 1 ? 's' : ''} agregado${ok.length > 1 ? 's' : ''}`,
        timer: 1300,
        showConfirmButton: false,
        background: 'rgb(26,26,26)',
        color: '#fff',
        iconColor: '#6A5FFF',
      });
    } else {
      await Swal.fire({
        icon: fail.length ? 'warning' : 'info',
        title: 'Compartir completado',
        html: `
          <div style="text-align:left">
            <div><b>Agregados:</b> ${ok.length}</div>
            <div><b>Fallidos:</b> ${fail.length}</div>
          </div>
        `,
        background: 'rgb(26,26,26)',
        color: '#fff',
      });
    }

    // refresca desde backend ANTES de reabrir
    await fetchMembers();
    onChanged?.();

    setSharing(false);
    setHiddenPanel(false);          // reabre el panel ya actualizado
  };

  const removePendingChip = (id: number) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRemove = async (member: Member) => {
    if (ownerId !== null && member.id === ownerId) {
      setHiddenPanel(true);
      await sleep(50);
      await Swal.fire({
        icon: 'info',
        title: 'No puedes eliminar al propietario',
        background: 'rgb(26,26,26)',
        color: '#fff',
      });
      setHiddenPanel(false);
      return;
    }

    setHiddenPanel(true);
    await sleep(50);

    const confirm = await Swal.fire({
      icon: 'warning',
      title: '¿Seguro que quieres eliminar al miembro del tablero?',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      background: 'rgb(26,26,26)',
      color: '#fff',
      iconColor: '#6A5FFF',
      confirmButtonColor: '#6A5FFF',
    });

    if (!confirm.isConfirmed) {
      setHiddenPanel(false);
      return;
    }

    setRemovingIds((prev) => new Set(prev).add(member.id));
    const snapshot = members;
    const optimistic = members.filter((m) => m.id !== member.id);
    setMembers(optimistic);

    try {
      await removeMemberFromBoard(boardId, member.id, token);
      await fetchMembers();
      onChanged?.();

      await Swal.fire({
        icon: 'success',
        title: 'Miembro eliminado',
        timer: 1200,
        showConfirmButton: false,
        background: 'rgb(26,26,26)',
        color: '#fff',
        iconColor: '#6A5FFF',
      });
    } catch (err: any) {
      setMembers(snapshot);
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo eliminar',
        text: err?.message || 'Intenta nuevamente',
        background: 'rgb(26,26,26)',
        color: '#fff',
      });
    } finally {
      setRemovingIds((prev) => {
        const c = new Set(prev);
        c.delete(member.id);
        return c;
      });
      setHiddenPanel(false);
    }
  };

  const handleChangeRole = async (memberId: number, newRole: 'ADMIN' | 'MEMBER') => {
    if (ownerId !== null && memberId === ownerId) return;
    const snapshot = members;
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
    try {
      onChanged?.();
    } catch (e) {
      console.error(e);
      setMembers(snapshot);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9998] flex items-start justify-end ${hiddenPanel ? 'pointer-events-none opacity-0' : ''}`}
      aria-hidden={hiddenPanel}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Cerrar" />

      {/* panel */}
      <div className="relative z-[9999] mt-16 mr-6 w-[820px] max-w-[92vw] max-h-[80vh] overflow-hidden bg-[#1f1f1f] text-white rounded-2xl shadow-2xl border border-[#3C3C3CB2]">
        {/* header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#3C3C3CB2]">
          <h2 className="text-lg font-semibold">Compartir tablero</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-white/10" aria-label="Cerrar" title="Cerrar">
            <FaTimes />
          </button>
        </div>

        {/* body */}
        <div className="px-6 pb-6 pt-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 64px)' }}>
          {/* fila superior */}
          <div className="flex gap-3 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleEnter(); }}
              placeholder="Buscar por nombre, email..."
              className="flex-1 h-12 px-4 bg-[#313131] border-2 border-[#3C3C3CB2] rounded-lg placeholder:text-[#A9A9A9] focus:outline-none focus:border-purple-500"
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'MEMBER' | 'ADMIN')}
              className="h-12 px-3 bg-[#000] border-2 border-[#3C3C3CB2] rounded-lg focus:outline-none focus:border-purple-500"
              title="Rol al unirse (no persistido aún)"
            >
              <option value="MEMBER">Miembro</option>
              <option value="ADMIN">Administrador</option>
            </select>

            <button
              onClick={handleShareAll}
              disabled={sharing || pending.length === 0}
              className="h-12 px-5 rounded-lg bg-[#6A5FFF] hover:bg-[#5c52ff] disabled:opacity-60 flex items-center gap-2"
              title={pending.length ? 'Agregar miembros' : 'Agrega correos con Enter primero'}
            >
              <FaPlus /> Compartir
            </button>
          </div>

          {/* chips pendientes */}
          {pending.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {pending.map((u) => (
                <div key={u.id} className="inline-flex items-center gap-3 px-3 py-2 rounded-full border border-[#3C3C3CB2] bg-[#2b2b2b]">
                  <div className="w-7 h-7 rounded-full bg-[#3b3b3b] flex items-center justify-center text-xs">
                    {getInitials(u)}
                  </div>
                  <div className="flex flex-col leading-tight mr-1">
                    <span className="text-sm font-medium">{getDisplayName(u)}</span>
                    <span className="text-[11px] text-gray-400">@{u.email}</span>
                  </div>
                  <button className="text-red-400 hover:text-red-300 ml-1" onClick={() => removePendingChip(u.id)} title="Quitar">
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* enlace */}
          <div className="mt-4">
            <input value="www.url.com" readOnly className="w-full h-12 px-4 bg-[#313131] border-2 border-[#3C3C3CB2] rounded-lg text-[#cfcfcf]" />
          </div>

          <div className="flex gap-3 mt-3">
            <button onClick={copyLink} className="flex-1 h-12 px-4 rounded-lg bg-[#2b2b2b] hover:bg-[#343434] border border-[#3C3C3CB2] flex items-center justify-center gap-2">
              <FaRegCopy /> Copiar enlace
            </button>
            <button className="flex-1 h-12 px-4 rounded-lg bg-[#2b2b2b] hover:bg-[#343434] border border-[#3C3C3CB2]" title="(Pendiente) Eliminar enlace público" disabled>
              Eliminar enlace
            </button>
          </div>

          <hr className="border-[#3C3C3CB2] my-5" />

          {/* miembros actuales */}
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
                const removing = removingIds.has(m.id);
                return (
                  <li key={m.id} className="flex items-center justify-between bg-[#262626] border border-[#3C3C3CB2] rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#3b3b3b] flex items-center justify-center text-sm">
                        {getInitials(m)}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <div className="text-sm font-medium flex items-center gap-2">
                          <span>{getDisplayName(m)}</span>
                          {isOwner && <span className="text-[10px] px-2 py-0.5 rounded bg-[#3b3b3b]">Propietario</span>}
                        </div>
                        <span className="text-xs text-gray-400">({m.email})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={isOwner ? 'ADMIN' : m.role === 'ADMIN' ? 'ADMIN' : 'MEMBER'}
                        onChange={(e) => !isOwner && handleChangeRole(m.id, e.target.value as 'ADMIN' | 'MEMBER')}
                        disabled={isOwner}
                        className={`h-9 px-3 bg-[#313131] border-2 border-[#3C3C3CB2] rounded-md text-sm ${isOwner ? 'opacity-60 cursor-not-allowed' : ''}`}
                        title={isOwner ? 'El propietario siempre es Administrador' : 'Cambiar rol'}
                      >
                        <option value="ADMIN">Administrador</option>
                        <option value="MEMBER">Miembro</option>
                      </select>

                      <button
                        onClick={() => !isOwner && handleRemove(m)}
                        disabled={isOwner || removing}
                        className={`p-2 rounded-md ${isOwner ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10'}`}
                        title={isOwner ? 'No puedes eliminar al propietario' : 'Eliminar del tablero'}
                      >
                        {removing ? <span className="text-xs opacity-70">Eliminando…</span> : <FaTrashAlt />}
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
