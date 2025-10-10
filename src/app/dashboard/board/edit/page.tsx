'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaCamera, FaLock, FaGlobe, FaPlus, FaTag, FaTimes, FaRegTrashAlt } from 'react-icons/fa';
import {
  getBoardById,
  updateBoardById,
  removeMemberFromBoard,
  searchUsersByEmail,
  addMemberToBoard
} from '@/services/boardService';
import Swal from 'sweetalert2';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export default function EditBoardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const boardId = searchParams.get('id');

  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(true);

  // miembros
  const [members, setMembers] = useState<User[]>([]); // miembros originales (sin el owner)
  const [draftMembers, setDraftMembers] = useState<string[]>([]); // emails draft
  const [memberInput, setMemberInput] = useState('');
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [sugOpen, setSugOpen] = useState(false);
  const sugBoxRef = useRef<HTMLDivElement | null>(null);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [boardOwnerId, setBoardOwnerId] = useState<number | null>(null);

  // ---- load ----
  useEffect(() => {
    let storedToken: string | null = null;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        storedToken = authData?.state?.accessToken ?? null;
      }
    } catch {}

    if (!storedToken) { router.push('/login'); return; }
    if (!boardId) { setLoading(false); return; }

    setToken(storedToken);

    try {
      const payload = storedToken.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      const uid = decoded.sub || decoded.user_id || decoded.identity;
      setCurrentUserId(parseInt(uid));
    } catch {}

    getBoardById(boardId, storedToken)
      .then((data) => {
        const nameValue = typeof data?.name === 'string' ? data.name : (data?.name?.name || '');
        setName(nameValue);
        setDescription(data?.description || '');

        const tagsData = data?.tags || [];
        const processedTags = Array.isArray(tagsData)
          ? tagsData.map((t: any) => typeof t === 'string' ? t : (t?.name || '')).filter((n: string) => n.trim())
          : [];
        setTags(processedTags);

        const membersData = data?.members || data?.users || data?.collaborators || [];
        const filteredMembers: User[] = Array.isArray(membersData)
          ? membersData
              .filter((m: any) => m.id !== data?.userId)
              .map((m: any) => ({
                id: m.id,
                firstName: m.first_name ?? m.firstName ?? '',
                lastName: m.last_name ?? m.lastName ?? '',
                email: m.email
              }))
          : [];
        setMembers(filteredMembers);

        // set draft con los emails actuales
        setDraftMembers(filteredMembers.map(m => m.email));

        setVisibility(data?.isPublic ? 'public' : 'private');
        setImagePreview(data?.image || null);
        setBoardOwnerId(data?.userId);

        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar el tablero:', err);
        if (String(err.message).includes('403')) setCanEdit(false);
        setLoading(false);
      });
  }, [boardId, router]);

  // cerrar dropdown al click fuera
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!sugBoxRef.current) return;
      if (!sugBoxRef.current.contains(e.target as Node)) setSugOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // autocomplete con debounce
  useEffect(() => {
    let t: any;
    const q = memberInput.trim();
    if (!token) return;

    if (!q || EMAIL_RE.test(q)) { setSuggestions([]); setSugOpen(false); return; }

    t = setTimeout(async () => {
      try {
        const res = await searchUsersByEmail(q, token);
        // res => array de users
        const emailsEnDraft = new Set(draftMembers);
        const filtered = (res || []).filter((u: any) => !emailsEnDraft.has(u.email));
        setSuggestions(filtered);
        setSugOpen(filtered.length > 0);
      } catch {
        setSuggestions([]);
        setSugOpen(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [memberInput, token, draftMembers]);

  const initialEmails = useMemo(() => members.map(m => m.email), [members]);
  const isValidEmail = useMemo(() => EMAIL_RE.test(memberInput.trim()), [memberInput]);

  // ---- handlers ----
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddTag = () => {
    const t = newTag.trim();
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t]);
      setNewTag('');
    }
  };
  const handleRemoveTag = (i: number) => setTags(prev => prev.filter((_, idx) => idx !== i));

  // draft members
  const addDraftEmail = (email: string) => {
    if (!email) return;
    if (draftMembers.includes(email)) { setMemberInput(''); setSugOpen(false); return; }
    setDraftMembers(prev => [...prev, email]);
    setMemberInput('');
    setSugOpen(false);
  };

  const handleAddMemberDraft = () => {
    if (!isValidEmail) return;
    addDraftEmail(memberInput.trim());
  };

  const handleRemoveMemberDraft = (email: string) => {
    setDraftMembers(prev => prev.filter(e => e !== email));
  };

  // Eliminar (UI) miembro ya existente (también lo saca del draft)
  const handleRemoveMemberExisting = async (memberId: number, email: string) => {
    // Solo lo quitamos del draft; la persistencia real se hace en Guardar.
    setMembers(prev => prev.filter(m => m.id !== memberId));
    setDraftMembers(prev => prev.filter(e => e !== email));
  };

  const handleSave = async () => {
    if (!token || !boardId) return;

    const data = {
      name,
      description,
      isPublic: visibility === 'public',
      tags
    };

    try {
      // 1) Actualizar tablero (nombre/desc/visibilidad/tags)
      await updateBoardById(boardId, data, token);

      // 2) Persistir cambios de miembros por diff
      const toAdd = draftMembers.filter(e => !initialEmails.includes(e));
      const toRemoveEmails = initialEmails.filter(e => !draftMembers.includes(e));

      // Para toRemove necesitamos IDs; los tenemos del estado 'members' inicial,
      // pero si quitaste alguno en UI usamos ese estado (ya filtrado).
      const currentInitialMap = new Map(members.map(m => [m.email, m.id]));
      const removesPromises = toRemoveEmails
        .map(email => currentInitialMap.get(email))
        .filter((id): id is number => typeof id === 'number')
        .map(id => removeMemberFromBoard(boardId, id, token));

      // Para toAdd necesitamos el ID del user — pedimos por email
      const addsPromises: Promise<any>[] = [];
      for (const email of toAdd) {
        const users = await searchUsersByEmail(email, token);
        const u = (users || []).find((x: any) => x.email === email) || (users || [])[0];
        if (u?.id) addsPromises.push(addMemberToBoard(boardId, u.id, token));
      }

      await Promise.all([...removesPromises, ...addsPromises]);

      await Swal.fire({
        icon: 'success',
        text: 'Tablero actualizado con éxito',
        background: 'rgb(26, 26, 26)',
        iconColor: '#6A5FFF',
        color: '#FFFFFF',
        confirmButtonColor: '#6A5FFF',
        confirmButtonText: 'Cerrar',
        customClass: { popup: 'swal2-dark', confirmButton: 'swal2-confirm' }
      });

      router.push('/dashboard');
    } catch (err: any) {
      if (String(err?.message).includes('401')) {
        await Swal.fire({
          title: 'Sesión Expirada',
          text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          icon: 'warning',
          background: '#222',
          color: '#fff',
          confirmButtonText: 'Ir al Login',
          customClass: { confirmButton: 'btn-cancel', popup: 'mi-modal' },
        });
        router.push('/login');
      } else {
        await Swal.fire({
          title: 'Error',
          text: err?.message || 'No se pudo actualizar el tablero',
          icon: 'error',
          background: '#222',
          color: '#fff',
          confirmButtonText: 'Aceptar',
          customClass: { confirmButton: 'btn-cancel', popup: 'mi-modal' },
        });
      }
    }
  };

  const handleCancel = () => {
    // No persistimos nada — volvemos al dashboard
    router.push('/dashboard');
  };

  if (loading) return <p className="p-4 text-white">Cargando...</p>;
  if (!token) return <div className="p-4"><p>Error: No se encontró token</p></div>;
  if (!boardId) return <p className="p-4">Error: ID del tablero no encontrado</p>;
  if (!canEdit) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] text-white p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">Acceso Denegado</h1>
          <p className="text-gray-300">No tienes permisos para editar este tablero. Solo el creador puede editarlo.</p>
          <button onClick={() => router.push('/dashboard')} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="mb-12">
          <h1 className="text-white text-3xl">Edición de tablero: {typeof name === 'string' ? name : 'Cargando...'}</h1>
          <p className="text-gray-400 text-sm">ID: {boardId}</p>
        </div>

        {/* Imagen */}
        <div>
          <label className="block font-medium mb-2 text-sm">Imagen del tablero</label>
          <div className="relative w-32 h-32 bg-neutral-800 rounded flex items-center justify-center cursor-pointer overflow-hidden">
            {imagePreview ? <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" /> : <FaCamera className="text-gray-500 text-2xl" />}
            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label htmlFor="boardName" className="block font-medium mb-2 text-sm">Nombre de tablero</label>
          <input
            id="boardName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[41px]"
            placeholder="Escribe aquí"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block font-medium mb-2 text-sm">Descripción</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[127px]"
            placeholder="Escribe aquí"
            required
          />
        </div>

        {/* Miembros */}
        <div>
          <label htmlFor="members" className="block font-medium mb-2 text-sm">Miembros</label>

          <div className="relative" ref={sugBoxRef}>
            <input
              id="members"
              value={memberInput}
              type="text"
              placeholder="Buscar por nombre o email…"
              className="mt-2 p-3 pr-12 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[41px]"
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleAddMemberDraft(); }
              }}
            />
            <button
              type="button"
              onClick={handleAddMemberDraft}
              disabled={!isValidEmail}
              title={isValidEmail ? 'Agregar' : 'Ingresa un email válido'}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${isValidEmail ? 'text-white' : 'text-zinc-500 cursor-not-allowed'}`}
            >
              <FaPlus style={{ fontSize: 20 }} />
            </button>

            {/* dropdown sugerencias */}
            {sugOpen && (
              <div className="absolute z-[10000] mt-2 w-full rounded-xl bg-black border border-zinc-700 shadow-lg">
                {suggestions.length === 0 && (
                  <div className="px-3 py-2 text-sm text-zinc-400">Sin resultados</div>
                )}
                {suggestions.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => addDraftEmail(u.email)}
                    className="w-full text-left px-3 py-2 hover:bg-zinc-800 text-white"
                  >
                    <div className="text-sm">{u.firstName} {u.lastName}</div>
                    <div className="text-xs text-zinc-400">{u.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chips draft */}
          {draftMembers.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {draftMembers.map((email) => (
                <span key={email} className="px-3 py-1 rounded-full bg-neutral-800 text-sm flex items-center gap-2">
                  {email}
                  <button className="text-zinc-400 hover:text-white" onClick={() => handleRemoveMemberDraft(email)}>×</button>
                </span>
              ))}
            </div>
          )}

          {/* Lista original (solo visual) con quitar (lo mueve del draft) */}
          {members.length > 0 && (
            <div className="mt-3 space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2 bg-neutral-800 rounded">
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-medium text-white">{m.firstName} {m.lastName}</span>
                    <span className="text-xs text-gray-400">({m.email})</span>
                  </div>
                  {currentUserId === boardOwnerId && (
                    <button
                      onClick={() => handleRemoveMemberExisting(m.id, m.email)}
                      className="text-white hover:text-red-300 transition"
                      title="Quitar (se aplicará al guardar)"
                    >
                      <FaRegTrashAlt />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Etiquetas */}
        <div>
          <label htmlFor="tags" className="block font-medium mb-2 text-sm">Etiquetas</label>
          <div className="relative">
            <input
              id="tags"
              type="text"
              className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[41px]"
              placeholder="Escribe un nombre de etiqueta para crearla..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
            />
            <button type="button" onClick={handleAddTag} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaPlus style={{ fontSize: 20 }} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.filter(t => typeof t === 'string' && t.trim()).map((t, i) => (
              <span key={i} className="px-3 py-1 rounded-full border border-gray-500 text-sm flex items-center gap-1">
                <FaTag className="text-gray-400" />
                {t}
                <FaTimes className="cursor-pointer hover:text-red-400 transition" onClick={() => handleRemoveTag(i)} />
              </span>
            ))}
          </div>
        </div>

        {/* Visibilidad */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={visibility === 'private'}
              onChange={() => setVisibility('private')}
              className="mt-1 h-[18px] w-[18px] appearance-none rounded-full border border-gray-400 checked:bg-[var(--global-color-primary-600)]"
              style={{ accentColor: 'var(--global-color-primary-600)' }}
            />
            <div className="flex items-start gap-2">
              <FaLock className="text-white mt-1" />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-white">Privado</span>
                <span className="text-xs text-gray-400">(Solo tú y los miembros invitados pueden verlo.)</span>
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
              className="mt-1 h-[18px] w-[18px] appearance-none rounded-full border border-gray-400 checked:bg-[var(--global-color-primary-600)]"
              style={{ accentColor: 'var(--global-color-primary-600)' }}
            />
            <div className="flex items-start gap-2">
              <FaGlobe className="text-white mt-1" />
              <div className="flex flex-col leading-tight">
                <span>Público</span>
                <span className="text-xs text-gray-400">(Cualquier miembro del equipo puede acceder.)</span>
              </div>
            </div>
          </label>
        </div>

        {/* Botones */}
        <div className="pt-6 flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="text-state-default font-light border border-state-default rounded-lg px-16 py-2 text-sm hover:bg-background-medium transition"
          >
            Cancelar edición
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-state-default font-light text-white rounded-lg px-16 py-2 text-sm hover:bg-state-hover transition"
          >
            Actualizar tablero
          </button>
        </div>
      </div>
    </div>
  );
}
