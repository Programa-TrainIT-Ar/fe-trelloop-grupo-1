'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaPlus, FaTag, FaTimes, FaSearch, FaRegTrashAlt } from 'react-icons/fa';
import PrioritySelector from '@/components/card/PrioritySelector';
import PriorityBadge from '@/components/card/PriorityBagde';
import Calendar from '@/components/ui/Calendar';
import Swal from 'sweetalert2';
import {
  getCardById,
  updateCardById,
  getCardMembers,
  addCardMember,
  removeCardMember,
} from '@/services/cardService';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface BoardList {
  id: number;
  name: string;
  position?: number;
}

function EditCardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const boardId = searchParams.get('boardId');
  const cardId = searchParams.get('cardId');

  const [token, setToken] = useState<string | null>(null);

  // card fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<'Baja' | 'Media' | 'Alta' | ''>('');

  // responsable
  const [responsable, setResponsable] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // members (si ya lo usas en UI)
  const [members, setMembers] = useState<any[]>([]);

  // listas
  const [lists, setLists] = useState<BoardList[]>([]);
  const [listId, setListId] = useState<number | ''>('');     // lista seleccionada
  const [newListName, setNewListName] = useState('');        // crear nueva lista al vuelo

  // ---------------- token ----------------
  useEffect(() => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        const storedToken = authData?.state?.accessToken;
        if (storedToken) setToken(storedToken);
        else router.push('/login');
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    }
  }, [router]);

  // ---------------- cargar listas del tablero ----------------
  useEffect(() => {
    if (!token || !boardId) return;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/list/by-board/${boardId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          console.error('Error cargando listas:', res.status, await res.text());
          return;
        }
        const data = await res.json();
        setLists(data.items ?? data.lists ?? data ?? []);
      } catch (e) {
        console.error('Error cargando listas:', e);
      }
    })();
  }, [token, boardId]);

  // ---------------- cargar tarjeta y miembros ----------------
  useEffect(() => {
    const loadCard = async () => {
      if (!token || !cardId) return;
      try {
        const cardData = await getCardById(cardId, token);

        setTitle(cardData.title || '');
        setDescription(cardData.description || '');
        setTags(cardData.tags || []);
        if (cardData.beginDate) setStartDate(new Date(cardData.beginDate));
        if (cardData.dueDate) setEndDate(new Date(cardData.dueDate));

        // prioridad desde dueDate
        if (cardData.dueDate) {
          const due = new Date(cardData.dueDate);
          const diff = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          setPriority(diff <= 1 ? 'Alta' : diff <= 7 ? 'Media' : 'Baja');
        } else {
          setPriority('');
        }

        // responsable (si viene id)
        if (cardData.responsableId) {
          try {
            const boardRes = await fetch(`${process.env.NEXT_PUBLIC_API}/board/getBoard/${boardId}`, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
            if (boardRes.ok) {
              const boardData = await boardRes.json();
              const found = (boardData.members || []).find(
                (m: any) => m.id === cardData.responsableId
              );
              if (found) setResponsable(found);
            }
          } catch (e) {
            console.error('Error cargando responsable:', e);
          }
        }

        // lista actual de la tarjeta
        const detectedListId =
          cardData.listId ??
          cardData.list_id ??
          cardData.list?.id ??
          ''; // fallback vacío si el backend aún no lo envía
        setListId(detectedListId || '');
      } catch (e) {
        console.error('Error cargando tarjeta:', e);
      }
    };

    const loadMembers = async () => {
      if (!token || !cardId) return;
      try {
        const membersData = await getCardMembers(cardId, token);
        setMembers(membersData || []);
      } catch (e) {
        console.error('Error cargando miembros:', e);
      }
    };

    loadCard();
    loadMembers();
  }, [token, cardId, boardId]);

  // recalcular prioridad al cambiar fecha fin
  useEffect(() => {
    if (!endDate) return setPriority('');
    const diff = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    setPriority(diff <= 1 ? 'Alta' : diff <= 7 ? 'Media' : 'Baja');
  }, [endDate]);

  // ----------- búsqueda de responsable -----------
  const handleSearchResponsable = async () => {
    if (!searchQuery.trim() || !token) return;
    try {
      const { searchUsersByEmail } = await import('@/services/cardService');
      const results = await searchUsersByEmail(searchQuery, token);
      setSearchResults((results || []) as User[]);
      setShowSearchResults(true);
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo buscar el usuario.',
        icon: 'error',
        background: 'rgb(26, 26, 26)',
        color: '#fff',
      });
    }
  };

  const handleSelectResponsable = (user: User) => {
    setResponsable(user);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleAddMember = async (userId: number) => {
    if (!token || !cardId) return;
    try {
      await addCardMember(cardId, userId, token);
      const membersData = await getCardMembers(cardId, token);
      setMembers(membersData || []);
      setSearchQuery('');
      setSearchResults([]);
      setShowSearchResults(false);
    } catch (e) {
      console.error('Error al agregar miembro:', e);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!token || !cardId) return;
    try {
      await removeCardMember(cardId, userId, token);
      const membersData = await getCardMembers(cardId, token);
      setMembers(membersData || []);
    } catch (e) {
      console.error('Error al eliminar miembro:', e);
    }
  };

  // ----------- etiquetas -----------
  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setNewTag('');
    }
  };
  const handleRemoveTag = (i: number) => setTags(tags.filter((_, idx) => idx !== i));

  // ----------- actualizar tarjeta -----------
  const handleUpdateCard = async () => {
    if (!token || !boardId || !cardId || !title.trim()) return;

    const payload: any = {
      title,
      description,
      boardId: parseInt(boardId),
      responsableId: responsable?.id || null,
      beginDate: startDate?.toISOString(),
      dueDate: endDate?.toISOString(),
      tags,
      priority: priority || null,
    };

    if (listId !== '') payload.listId = Number(listId);
    if (newListName.trim()) payload.listName = newListName.trim();

    try {
      await updateCardById(cardId, payload, token);
      await Swal.fire({
        icon: 'success',
        text: 'Tarjeta actualizada exitosamente',
        background: 'rgb(26, 26, 26)',
        iconColor: '#6A5FFF',
        color: '#FFFFFF',
        confirmButtonColor: '#6A5FFF',
        confirmButtonText: 'Cerrar',
      });
      router.push(`/dashboard/boards/${boardId}`);
    } catch (err: any) {
      await Swal.fire({
        title: 'Error',
        text: err.message || 'Error al actualizar tarjeta',
        icon: 'error',
        background: 'rgb(26, 26, 26)',
        color: '#fff',
      });
    }
  };

  if (!token) return <p className="p-4 text-white">Cargando...</p>;
  if (!boardId || !cardId) return <p className="p-4">Error: ID del tablero o tarjeta no encontrado</p>;

  return (
    <div className="min-h-screen text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl text-left text-white">Editar Tarjeta</h1>
            <p className="text-gray-400">Tablero ID: {boardId} | Tarjeta ID: {cardId}</p>
          </div>
          <button
            onClick={() => router.push(`/dashboard/boards/${boardId}`)}
            className="flex justify-center items-center rounded-full bg-[--global-color-primary-500] h-20 w-20 text-center text-white "
          >
            <FaTimes className="h-10 w-10" />
          </button>
        </div>

        <h4>Fecha de tarjeta</h4>
        <div className="flex gap-8">
          <div className="w-1/3">
            <Calendar
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </div>

          <div className="w-2/3 space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="title" className="block font-medium mb-2 text-sm">Título de la tarjeta *</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 h-[41px]"
                placeholder="Escribe el título de la tarjeta..."
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
                className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 h-[127px]"
                placeholder="Escribe aquí ..."
              />
            </div>

            {/* Responsable */}
            <div>
              <label htmlFor="responsable" className="block font-medium mb-2 text-sm">Responsable</label>
              <div className="relative">
                <input
                  id="responsable"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchResponsable();
                    }
                  }}
                  placeholder="Buscar responsable por email..."
                  className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 h-[41px]"
                />
                <button
                  type="button"
                  onClick={handleSearchResponsable}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FaSearch style={{ fontSize: '20px' }} />
                </button>
              </div>

              {showSearchResults && searchResults.length > 0 && (
                <div className="mt-2 bg-[#313131B3] rounded-lg max-h-40 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-700">
                      <div>
                        <span className="text-white">{user.first_name} {user.last_name}</span>
                        <span className="text-gray-400 ml-2">({user.email})</span>
                      </div>
                      <button
                        onClick={() => handleSelectResponsable(user)}
                        className="text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                        style={{ backgroundColor: '#6A5FFF' }}
                      >
                        Seleccionar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {responsable && (
                <div className="mt-3">
                  <div className="flex items-center justify-between p-2 bg-neutral-800 rounded w-60">
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium text-white">
                        {responsable.first_name || (responsable as any).firstName}{' '}
                        {responsable.last_name || (responsable as any).lastName}
                      </span>
                      <span className="text-xs text-gray-400">({responsable.email})</span>
                    </div>
                    <button
                      onClick={() => setResponsable(null)}
                      className="text-white hover:text-red-300 transition"
                    >
                      <FaRegTrashAlt />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Prioridad */}
            <div>
              <label className="block font-medium mb-2 text-sm">Prioridad</label>
              <PrioritySelector value={priority} onChange={setPriority} />
              {priority && <PriorityBadge label={priority} />}
            </div>

            {/* Lista */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-2 text-sm">Lista</label>
                <select
                  value={listId === '' ? '' : String(listId)}
                  onChange={(e) => setListId(e.target.value ? Number(e.target.value) : '')}
                  className="block w-full h-11 px-3 rounded-xl border-2 border-[#3C3C3CB2] bg-[#313131B3] text-base text-white"
                >
                  <option value="">Selecciona una lista…</option>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
                {lists.length === 0 && (
                  <p className="text-sm text-gray-400 mt-2">Este tablero aún no tiene listas.</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-2 text-sm">O crea una lista nueva</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Ej: Trabajo, Estudio..."
                  className="block w-full h-11 px-3 rounded-xl border-2 border-[#3C3C3CB2] bg-[#313131B3] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Si escribes un nombre aquí, crearemos esa lista y la tarjeta irá ahí.
                </p>
              </div>
            </div>

            {/* Etiquetas */}
            <div>
              <label htmlFor="tags" className="block font-medium mb-2 mt-4 text-sm">Etiquetas</label>
              <div className="relative">
                <input
                  id="tags"
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 h-[41px]"
                  placeholder="Agregar etiqueta..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FaPlus />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-full border border-gray-500 text-sm flex items-center gap-1">
                    <FaTag className="text-gray-400" />
                    {tag}
                    <FaTimes
                      className="cursor-pointer hover:text-red-400 transition"
                      onClick={() => handleRemoveTag(i)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                onClick={() => router.push(`/dashboard/boards/${boardId}`)}
                className="text-state-default font-light border border-state-default rounded-lg px-16 py-2 text-sm hover:bg-background-medium transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateCard}
                disabled={!title.trim()}
                className="bg-state-default font-light text-white rounded-lg px-16 py-2 text-sm hover:bg-state-hover transition"
              >
                Actualizar
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default EditCardPage;
