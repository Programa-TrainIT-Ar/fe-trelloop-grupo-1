'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useBoardStore } from "@/store/boards";
import { FaPlus } from "react-icons/fa6";
import { LuPencilLine } from "react-icons/lu";
import { FaRegTrashAlt } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { SlOptions } from "react-icons/sl";
import { BsShare } from "react-icons/bs";
import Image from 'next/image';
import clsx from 'clsx';
import PriorityBadge from '@/components/card/PriorityBagde';
import StateBadge from '@/components/card/StateBadge';
import EmptyBadge from '@/components/ui/EmptyBadge';
import Swal from 'sweetalert2';
import { FaPen, FaTrash, FaEllipsisH, FaEye } from 'react-icons/fa';
import { deleteCardById } from '@/services/cardService';
import '@/styles/delete-modal.css'
import ShareBoardPanel from '@/components/board/ShareBoardPanel';
import { LuArrowRightFromLine, LuArrowLeftFromLine } from "react-icons/lu";

interface Card {
  id: number;
  title: string;
  description?: string;
  responsableId?: number;
  responsable?: { id: number; first_name: string; last_name: string; email: string; };
  priority?: 'Baja' | 'Media' | 'Alta' | null;
  state?: string;            // fallback mientras migran
  listId?: number | null;    // clave para columnas
  dueDate?: string | null;
  beginDate?: string | null;
  members?: { id: number; first_name: string; last_name: string; email: string; }[];
}

interface List {
  id: number;
  board_id: number;
  name: string;
  position: number;
  created_by?: number;
}

interface BoardPageProps {
  params: Promise<{ boardId: string }>;
}

export default function BoardPage({ params }: BoardPageProps) {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<any>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [lists, setLists] = useState<List[]>([]);

  const { accessToken } = useAuthStore();
  const [activeSection, setActiveSection] = useState<'backlog' | 'listas'>('backlog');
  const [showMenu, setShowMenu] = useState<{ [key: string]: boolean }>({});
  const menuRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const router = useRouter();
  const [showSharePanel, setShowSharePanel] = useState(false);

  const [isListMenuOpen, setIsListMenuOpen] = useState(false);
  const [newListName, setNewListName] = useState('');

  const API = process.env.NEXT_PUBLIC_API;

  // userId del token (para permisos sobre listas)
  const myUserId = useMemo(() => {
    if (!accessToken) return null;
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const v = payload.sub ?? payload.identity ?? payload.user_id ?? payload.id;
      return typeof v === 'string' ? parseInt(v) : v;
    } catch { return null; }
  }, [accessToken]);

  const isOwner = useMemo(() => {
    if (!boardData || !myUserId) return false;
    const ownerId = boardData.userId ?? boardData.user_id;
    return Number(ownerId) === Number(myUserId);
  }, [boardData, myUserId]);

  useEffect(() => {
    const getParams = async () => {
      const { boardId: id } = await params;
      setBoardId(id);
    };
    getParams();
  }, [params]);

  // Helpers de prioridad
  const calculatePriority = (dueDate?: string | null): 'Baja' | 'Media' | 'Alta' | null => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Alta';      // vencida
    if (diffDays <= 3) return 'Alta';
    if (diffDays <= 7) return 'Media';
    return 'Baja';
  };
  const getEffectivePriority = (c: Card): 'Baja' | 'Media' | 'Alta' | null =>
    c.priority ?? calculatePriority(c.dueDate);

  // Refrescar datos (board, listas, cards)
  const refreshData = async () => {
    if (!boardId || !accessToken) return;

    try {
      // Board
      const boardRes = await fetch(`${API}/board/getBoard/${boardId}`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      });

      let boardMembers: any[] = [];
      if (boardRes.ok) {
        const bd = await boardRes.json();
        setBoardData(bd);
        boardMembers = bd.members || [];
      }

      // Lists
      const listRes = await fetch(`${API}/list/by-board/${boardId}`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      });

      if (listRes.ok) {
        const ldata = await listRes.json();
        const raw = Array.isArray(ldata) ? ldata : (ldata.items || ldata.lists || []);
        const normalized: List[] = raw.map((l: any) => ({
          id: l.id,
          board_id: l.board_id ?? l.boardId,
          name: l.name,
          position: l.position,
          created_by: l.created_by ?? l.createdBy,
        }));
        normalized.sort((a, b) => a.position - b.position);
        setLists(normalized);
      } else {
        setLists([]);
      }

      // Cards
      const res = await fetch(`${API}/card/getCards/${boardId}`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      });

      if (res.ok) {
        const cardsData = await res.json();

        const cardsWithData = await Promise.all(
          cardsData.map(async (raw: any) => {
            // normalización de campos del backend
            const base: Card = {
              id: raw.id,
              title: raw.title,
              description: raw.description ?? null,
              responsableId: raw.responsableId ?? raw.responsable_id ?? null,
              priority: (raw.priority ?? null) as Card['priority'],
              state: raw.state ?? null,
              listId: raw.listId ?? raw.list_id ?? null,
              beginDate: raw.beginDate ?? raw.begin_date ?? null,
              dueDate: raw.dueDate ?? raw.due_date ?? null,
            };

            try {
              const membersRes = await fetch(`${API}/card/getMembers/${base.id}`, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
              });

              let members: any[] = [];
              if (membersRes.ok) members = await membersRes.json();

              let responsable = null;
              if (base.responsableId) {
                responsable = boardMembers.find((m: any) => m.id === base.responsableId) || null;
              }

              return { ...base, members, responsable };
            } catch (error) {
              console.error(`Error fetching data for card ${base.id}:`, error);
              return { ...base, members: [], responsable: null };
            }
          })
        );

        setCards(cardsWithData);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // on focus vuelve a cargar
  useEffect(() => {
    const handleFocus = () => refreshData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [boardId, accessToken]);

  // cerrar menús al click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const openMenus = Object.entries(showMenu).filter(([_, isOpen]) => isOpen);
      for (const [cardId] of openMenus) {
        const menuElement = menuRefs.current.get(parseInt(cardId));
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setShowMenu(prev => ({ ...prev, [cardId]: false }));
        }
      }
    };
    if (Object.values(showMenu).some(Boolean)) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [showMenu]);

  useEffect(() => { refreshData(); }, [boardId, accessToken]);

  if (!boardId) return <div className='text-white'>Error: ID del tablero no encontrado</div>;
  if (!boardData) return <div className='text-white'>Cargando...</div>;

  const handleSectionChange = (section: 'backlog' | 'listas') => setActiveSection(section);
  const toggleListMenu = () => setIsListMenuOpen(!isListMenuOpen);

  // crear lista vacía
  const handleAddNewStateList = async () => {
    if (!newListName.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Ingresa un nombre para la nueva lista',
        icon: 'warning',
        background: '#222',
        color: '#fff',
        confirmButtonText: 'Aceptar',
        customClass: { confirmButton: 'btn-cancel', popup: 'mi-modal' }
      });
      return;
    }

    const currentBoardId = boardId ? parseInt(boardId) : null;
    if (!currentBoardId) {
      Swal.fire({
        title: 'Error de Tablero',
        text: 'No se pudo obtener el ID del tablero.',
        icon: 'error',
        background: '#222',
        color: '#fff',
        confirmButtonText: 'Aceptar',
        customClass: { confirmButton: 'btn-cancel', popup: 'mi-modal' },
      });
      return;
    }

    try {
      const res = await fetch(`${API}/list/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ boardId: currentBoardId, name: newListName }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Error al crear la lista.');
      }

      Swal.fire({
        title: '¡Éxito!',
        text: `Lista "${newListName}" creada correctamente.`,
        icon: 'success',
        background: '#222',
        color: '#fff',
        confirmButtonText: 'Aceptar',
        customClass: { confirmButton: 'btn-cancel', popup: 'mi-modal' },
      });
      setNewListName('');
      setIsListMenuOpen(false);
      refreshData();
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudo crear la lista',
        icon: 'error',
        background: '#222',
        color: '#fff',
        confirmButtonText: 'Aceptar',
        customClass: { confirmButton: 'btn-cancel', popup: 'mi-modal' },
      });
    }
  };

  // Backlog (mantengo tu visual)
  const defaultStates = ['TODO', 'IN_PROGRESS', 'DONE'];
  const uniqueStates = Array.from(new Set(cards.map(c => c.state || ''))).filter(Boolean).sort();
  const customStates = uniqueStates.filter(state => !defaultStates.includes(state));
  const backlogCards = cards;

  const stateLabels: Record<string, string> = {
    'TODO': 'Por hacer',
    'IN_PROGRESS': 'En progreso',
    'DONE': 'Hecho',
    ...Object.fromEntries(customStates.map(state => [state, state]))
  };

  const stateColors: Record<string, string> = {
    'TODO': 'bg-[#60584E]',
    'IN_PROGRESS': 'bg-[#2E90FA]',
    'DONE': 'bg-[#12B76A]',
    ...Object.fromEntries(customStates.map(state => [state, 'bg-gray-500']))
  };

  const handleDelete = async (cardId: number) => {
    const result = await Swal.fire({
      html: `
        <div class="modal-content-custom">
          <img class="modal-icon" src="https://cdn-icons-png.flaticon.com/512/595/595067.png" alt="Warning" />
          <p class="modal-text">¿Estás seguro de que quieres proceder con esta acción?<br/>No será reversible.</p>
        </div>`,
      background: "#222222",
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      customClass: { popup: "mi-modal", confirmButton: "btn-confirm", cancelButton: "btn-cancel" },
    });

    if (!result.isConfirmed) return;

    try {
      if (!accessToken) throw new Error('No se encontró token de autenticación');
      await deleteCardById(cardId, accessToken);

      await Swal.fire({
        title: '¡Eliminado!',
        text: 'La tarjeta se ha eliminado correctamente',
        icon: 'success',
        background: '#222',
        color: '#fff',
        showConfirmButton: true,
        confirmButtonText: 'Aceptar',
        customClass: { confirmButton: 'btn-cancel', popup: 'mi-modal' },
      });

      refreshData();
    } catch (error: any) {
      await Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudo eliminar la tarjeta',
        icon: 'error',
        background: '#222',
        color: '#fff',
        confirmButtonText: 'Aceptar',
        customClass: { confirmButton: 'btn-cancel', popup: 'mi-modal' },
      });
    }
  };

  const handleDeleteList = async (list: List, cardsInListCount: number) => {
    const canDelete = isOwner || cardsInListCount === 0;
    if (!canDelete) {
      Swal.fire({
        title: 'Acción no permitida',
        text: 'Solo el dueño puede eliminar listas con tarjetas. Los miembros solo pueden eliminar listas vacías.',
        icon: 'info',
        background: '#222',
        color: '#fff',
        confirmButtonText: 'Entendido',
        customClass: { confirmButton: 'btn-cancel', popup: 'mi-modal' },
      });
      return;
    }

    const confirm = await Swal.fire({
      title: `Eliminar lista "${list.name}"`,
      text: cardsInListCount > 0 ? 'La lista tiene tarjetas. ¿Deseas eliminarla de todos modos?' : 'Se eliminará la lista.',
      icon: 'warning',
      background: '#222',
      color: '#fff',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: 'Eliminar lista',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'mi-modal', confirmButton: 'btn-confirm', cancelButton: 'btn-cancel' },
    });
    if (!confirm.isConfirmed) return;

    try {
      const resp = await fetch(`${API}/list/${list.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'No se pudo eliminar la lista');
      }

      Swal.fire({
        title: '¡Lista eliminada!',
        icon: 'success',
        background: '#222',
        color: '#fff',
        confirmButtonText: 'Aceptar',
        customClass: { confirmButton: 'btn-cancel', popup: 'mi-modal' },
      });

      refreshData();
    } catch (e: any) {
      Swal.fire({
        title: 'Error',
        text: e.message || 'No se pudo eliminar la lista',
        icon: 'error',
        background: '#222',
        color: '#fff',
        confirmButtonText: 'Aceptar',
        customClass: { confirmButton: 'btn-cancel', popup: 'mi-modal' },
      });
    }
  };

  return (
    <>
      <div className='relative flex justify-between mb-6 ps-1 pe-6 py-1 w-full h-[54px] text-lg text-white border border-[--global-color-neutral-700] rounded-2xl dark:bg-[--global-color-neutral-800]'>
        <div className='flex gap-6'>
          <button
            onClick={() => handleSectionChange('backlog')}
            className={clsx('px-12 h-auto rounded-lg text-white hover:bg-[--global-color-primary-500]', {
              'bg-[--global-color-primary-500]': activeSection === 'backlog'
            })}
          >
            Backlog
          </button>

          <div className="my-1 border-l border-[--global-color-neutral-700] mx-3"></div>

          <button
            onClick={() => handleSectionChange('listas')}
            className={clsx('px-12 rounded-lg text-white hover:bg-[--global-color-primary-500]', {
              'bg-[--global-color-primary-500]': activeSection === 'listas'
            })}
          >
            Listas
          </button>
        </div>

        <div className='flex items-center gap-6 py-2'>
          <div className='w-[32px] h-[32px] rounded-full overflow-hidden'>
            <Image
              src={'https://picsum.photos/200/200?random=1'}
              width={60}
              height={60}
              alt="User profile photo"
              className="object-cover"
            />
          </div>
          <button
            onClick={() => setShowSharePanel(true)}
            className='flex justify-center items-center rounded-full bg-black w-[34px] h-[34px] text-center'
            aria-label="Compartir tablero"
            title="Compartir tablero"
          >
            <FaPlus />
          </button>
        </div>
      </div>

      {showSharePanel && accessToken && boardId && (
        <ShareBoardPanel
          boardId={boardId}
          token={accessToken}
          onClose={() => setShowSharePanel(false)}
          onChanged={refreshData}
        />
      )}

      {activeSection === 'backlog' ? (
        <>
          <div className='grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-3 px-4 py-3 text-lg bg-[#313131B3] rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-white mb-6 text-center'>
            <input id="default-checkbox" type="checkbox" className="w-4 h-4 bg-transparent rounded-sm" />
            <h6>Descripción</h6>
            <h6>Responsables</h6>
            <h6>Prioridad</h6>
            <h6>Estado</h6>
            <h6>Miembros</h6>
            <h6>Fecha</h6>
            <h6>Acciones</h6>
          </div>

          {backlogCards.map(card => {
            const effectivePriority = getEffectivePriority(card);
            return (
              <div key={card.id} className='grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-3 px-4 bg-[#313131B3] rounded-xl border-2 border-[#3C3C3CB2] text-white h-[50px] mb-6'>
                <input id="default-checkbox" type="checkbox" className="w-4 bg-transparent rounded-sm border border-[--global-color-neutral-700] h-10" />
                <p className='text-white text-sm'>{card.title}</p>

                <div>
                  {card.responsable ? (
                    <div className='flex items-center gap-2'>
                      <div className='w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white'>
                        {card.responsable.first_name?.[0]}{card.responsable.last_name?.[0]}
                      </div>
                      <span className='text-sm'>{card.responsable.first_name} {card.responsable.last_name}</span>
                    </div>
                  ) : (
                    <span className='text-gray-400 text-sm'>Sin responsable</span>
                  )}
                </div>

                <div className='flex justify-center'>
                  {effectivePriority
                    ? <PriorityBadge label={effectivePriority} />
                    : <EmptyBadge text="Sin prioridad" />}
                </div>

                <div className='flex justify-center'>
                  <StateBadge label={card.state || '—'} labelsMap={stateLabels} colorsMap={stateColors} />
                </div>

                <div className='flex -space-x-2'>
                  {card.members && card.members.length > 0 ? (
                    card.members.slice(0, 3).map((member) => (
                      <div key={member.id} className='w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white border-2 border-gray-800'>
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </div>
                    ))
                  ) : (
                    <span className='text-gray-400 text-sm'>Sin miembros</span>
                  )}
                  {card.members && card.members.length > 3 && (
                    <div className='w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-xs text-white border-2 border-gray-800'>
                      +{card.members.length - 3}
                    </div>
                  )}
                </div>

                <p className='text-sm'>{card.dueDate ? new Date(card.dueDate).toLocaleDateString('es') : 'Sin fecha'}</p>

                <div className='flex items-center gap-3'>
                  <button
                    onClick={() => {
                      setShowMenu(prev => ({ ...prev, [card.id]: false }));
                      router.push(`/dashboard/cards/edit?cardId=${card.id}&boardId=${boardId}`);
                    }}>
                    <LuPencilLine />
                  </button>
                  <button onClick={() => handleDelete(card.id)}><FaRegTrashAlt /></button>
                </div>
              </div>
            );
          })}

          <div className='fixed bottom-8 right-10 z-50'>
            <button
              onClick={() => window.location.href = `/dashboard/cards/create?boardId=${boardId}`}
              className='flex justify-center items-center rounded-full bg-[--global-color-primary-500] h-20 w-20 text-center text-white '
            >
              <FaPlus className='h-10 w-10' />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-row gap-6 w-full overflow-x-auto h-[calc(100vh-180px)]">
            {lists.map((list) => {
              const cardsInList = cards.filter(card =>
                card.listId != null ? card.listId === list.id
                  : (card.state || '').toLowerCase() === list.name.toLowerCase()
              );

              return (
                <div key={list.id} className='flex-none w-80 p-1 border border-[--global-color-neutral-700] rounded-2xl bg-[--global-color-neutral-800] flex flex-col gap-4'>
                  <div className={clsx('flex justify-between items-center px-2 py-1 text-xl rounded-lg text-center text-white', 'bg-zinc-700')}>
                    <h2 title={list.name} className='truncate max-w-[70%]'>{list.name}</h2>
                    <div className='flex gap-3 items-center'>
                      <h2>{cardsInList.length}</h2>
                      <button title="Renombrar lista"><FiEdit /></button>
                      <button
                        title={(!isOwner && cardsInList.length > 0) ? 'Solo el dueño puede eliminar listas con tarjetas' : 'Eliminar lista'}
                        onClick={() => handleDeleteList(list, cardsInList.length)}
                        className={clsx('transition-opacity', { 'opacity-50 cursor-not-allowed': !isOwner && cardsInList.length > 0 })}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {cardsInList.map(card => {
                    const effectivePriority = getEffectivePriority(card);
                    return (
                      <div key={card.id} className='bg-[--global-color-neutral-700] p-4 rounded-lg text-white'>
                        <div className='flex justify-between items-start'>
                          <h3 className='mb-3 bg-[--global-color-neutral-600] rounded-2xl py-1 px-2'>{card.title}</h3>

                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setShowMenu(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
                              className="text-white text-lg hover:opacity-80"
                            >
                              <FaEllipsisH />
                            </button>

                            {showMenu[card.id] && (
                              <div
                                ref={(el) => {
                                  if (el) { menuRefs.current.set(card.id, el); } else { menuRefs.current.delete(card.id); }
                                }}
                                className="absolute left-0 top-[36px] w-56 rounded-xl bg-zinc-900 text-white shadow-lg z-[9999] p-4"
                              >
                                <button
                                  onClick={() => {
                                    setShowMenu(prev => ({ ...prev, [card.id]: false }));
                                    router.push(`/dashboard/cards/view?cardId=${card.id}&boardId=${boardId}`);
                                  }}
                                  className="flex items-center gap-3 w-full text-left text-base py-2 hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                  <FaEye className="text-white text-lg" />
                                  <span>Ver tarjeta</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setShowMenu(prev => ({ ...prev, [card.id]: false }));
                                    router.push(`/dashboard/cards/edit?cardId=${card.id}&boardId=${boardId}`);
                                  }}
                                  className="flex items-center gap-3 w-full text-left text-base py-2 hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                  <FaPen className="text-white text-lg" />
                                  <span>Editar tarjeta</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(card.id)}
                                  className="flex items-center justify-between w-full text-left text-base py-2 hover:bg-zinc-800 rounded-lg transition-colors mt-1"
                                >
                                  <span>Eliminar tarjeta</span>
                                  <FaTrash className="text-white text-lg" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Prioridad en la card de la lista */}
                        <div className='mt-2'>
                          {effectivePriority
                            ? <PriorityBadge label={effectivePriority} />
                            : <EmptyBadge text="Sin prioridad" />}
                        </div>

                        <p className='mt-3'>{card.description || 'Sin descripción'}</p>

                        <div className='flex items-center justify-between mt-3'>
                          <div className='w-12 h-12 rounded-full overflow-hidden'>
                            <Image
                              src={'https://picsum.photos/200/200?random=1'}
                              width={60}
                              height={60}
                              alt="User profile photo"
                              className="object-cover"
                            />
                          </div>
                          <button><BsShare /></button>
                        </div>
                      </div>
                    );
                  })}

                  <div className='mt-auto'>
                    <button
                      onClick={() => window.location.href = `/dashboard/cards/create?boardId=${boardId}&listId=${list.id}`}
                      className='flex items-center py-2 gap-2 justify-center w-full text-white bg-[--global-color-primary-500] rounded-lg'
                    >
                      <FaPlus />
                      Agregar tarea
                    </button>
                  </div>
                </div>
              );
            })}

            <div className='relative'>
              <div>
                <button
                  id="list-menu-button"
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={isListMenuOpen ? "true" : "false"}
                  onClick={toggleListMenu}
                  className='relative rounded-xl p-3 text-2xl text-white bg-black'>
                  <FaPlus />
                </button>
              </div>

              <div
                role="menu"
                tabIndex={1}
                aria-labelledby="user-menu-button"
                aria-orientation="vertical"
                className={`${isListMenuOpen ? '' : 'hidden'} shadow-xl/20 absolute right-0 z-50 w-60 origin-top-right rounded-xl bg-black flex flex-col gap-y-3 py-3 shadow-lg ring-1 ring-black/5 focus:outline-none`}>

                <input
                  className='mx-4 mt-2 rounded-md ps-3 py-1 text-white bg-transparent border border-gray-500 placeholder-gray-600'
                  type="text"
                  placeholder='Nombre de la lista…'
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />

                <a id="list-menu-item-0" role="menuitem" href="#" tabIndex={1} className="flex gap-3 items-center ps-6 py-2 text-sm text-white hover:bg-[--global-color-neutral-800]">
                  <LuArrowRightFromLine /> Insertar lista después
                </a>
                <a id="list-menu-item-1" role="menuitem" href="#" tabIndex={1} className="flex gap-3 items-center ps-6 py-2 text-sm text-white hover:bg-[--global-color-neutral-800]">
                  <LuArrowLeftFromLine /> Insertar lista antes
                </a>
                <button
                  id="list-menu-item-2"
                  role="menuitem"
                  tabIndex={1}
                  onClick={handleAddNewStateList}
                  className=" gap-3 text-center py-2 text-sm mx-4 rounded-md text-white bg-[--global-color-primary-500] hover:bg-[--global-color-primary-700]">
                  Agregar lista
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
