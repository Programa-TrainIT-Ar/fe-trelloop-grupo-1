'use client';

import { useEffect, useState, useRef } from 'react';
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
import { de } from 'date-fns/locale';
import '@/styles/delete-modal.css'
import { MembersList } from '@/components/card/memberList';
import ShareBoardPanel from '@/components/board/ShareBoardPanel';
import { LuArrowRightFromLine } from "react-icons/lu";
import { LuArrowLeftFromLine } from "react-icons/lu";
import Link from "next/link";


interface Card {
    id: number;
    title: string;
    description?: string;
    responsableId?: number;
    responsable?: { id: number; first_name: string; last_name: string; email: string; };
    priority?: 'Baja' | 'Media' | 'Alta';
    state: string;
    dueDate?: string;
    beginDate?: string;
    members?: { id: number; first_name: string; last_name: string; email: string; }[];
}

interface BoardPageProps {
    params: Promise<{
        boardId: string;
    }>;
}

export default function BoardPage({ params }: BoardPageProps) {
    const [boardId, setBoardId] = useState<string | null>(null);
    const [boardData, setBoardData] = useState(null);
    const [cards, setCards] = useState<Card[]>([]);
    const { accessToken } = useAuthStore();
    const [activeSection, setActiveSection] = useState<'backlog' | 'listas'>('backlog');
    const [showMenu, setShowMenu] = useState<{ [key: string]: boolean }>({});
    const [showMemberList, setShowMemberList] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const [showSharePanel, setShowSharePanel] = useState(false);

    const [isListMenuOpen, setIsListMenuOpen] = useState(false);
    const [newListName, setNewListName] = useState('');

    useEffect(() => {
        const getParams = async () => {
            const { boardId: id } = await params;
            setBoardId(id);
        };
        getParams();
    }, [params]);

    // Función para refrescar los datos
    const refreshData = async () => {
        if (!boardId || !accessToken) return;

        try {
            // Obtener datos del tablero
            const boardRes = await fetch(`${process.env.NEXT_PUBLIC_API}/board/getBoard/${boardId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            let boardMembers = [];
            if (boardRes.ok) {
                const boardData = await boardRes.json();
                setBoardData(boardData);
                boardMembers = boardData.members || [];
            }

            // Obtener tarjetas
            const res = await fetch(`${process.env.NEXT_PUBLIC_API}/card/getCards/${boardId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (res.ok) {
                const cardsData = await res.json();

                const cardsWithData = await Promise.all(
                    cardsData.map(async (card: Card) => {
                        try {
                            const membersRes = await fetch(`${process.env.NEXT_PUBLIC_API}/card/getMembers/${card.id}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${accessToken}`,
                                },
                            });

                            let members = [];
                            if (membersRes.ok) {
                                members = await membersRes.json();
                            }

                            let responsable = null;
                            if (card.responsableId) {
                                responsable = boardMembers.find((member: any) => member.id === card.responsableId);
                            }

                            return { ...card, members, responsable };
                        } catch (error) {
                            console.error(`Error fetching data for card ${card.id}:`, error);
                            return { ...card, members: [], responsable: null };
                        }
                    })
                );

                setCards(cardsWithData);
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    };

    // Escuchar cuando se regresa de otra página
    useEffect(() => {
        const handleFocus = () => {
            refreshData();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [boardId, accessToken]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu({});
            }
        };

        if (Object.values(showMenu).some(Boolean)) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    useEffect(() => {
        refreshData();
    }, [boardId, accessToken]);

    if (!boardId) {
        return <div className='text-white'>Error: ID del tablero no encontrado</div>;
    }

    if (!boardData) {
        return <div className='text-white'>Cargando...</div>;
    }

    const handleSectionChange = (section: 'backlog' | 'listas') => {
        setActiveSection(section);
    }

    const toggleListMenu = () => {
        setIsListMenuOpen(!isListMenuOpen);
    }

    const handleAddNewStateList = async () => {
        if (!newListName.trim()) {
            Swal.fire({
                title: 'Error',
                text: 'Ingresa un nombre para la nueva lista',
                icon: 'warning',
                background: '#222',
                color: '#fff',
                confirmButtonText: 'Aceptar',
                customClass: {
                    confirmButton: 'btn-cancel',
                    popup: 'mi-modal'
                }
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
                customClass: {
                    confirmButton: 'btn-cancel',
                    popup: 'mi-modal',
                },
            });
            return; // Detener la ejecución si no hay un boardId válido
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API}/card/createCard`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    boardId: currentBoardId,
                    title: 'Nueva tarea en ' + newListName, // Título temporal para que la tarjeta no esté vacía
                    state: newListName,
                }),
            });

            if (res.ok) {
                Swal.fire({
                    title: '¡Éxito!',
                    text: `Lista "${newListName}" creada correctamente.`,
                    icon: 'success',
                    background: '#222',
                    color: '#fff',
                    confirmButtonText: 'Aceptar',
                    customClass: {
                        confirmButton: 'btn-cancel',
                        popup: 'mi-modal',
                    },
                });
                setNewListName('');
                setIsListMenuOpen(false);
                refreshData();
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al crear la lista.');
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo crear la lista',
                icon: 'error',
                background: '#222',
                color: '#fff',
                confirmButtonText: 'Aceptar',
                customClass: {
                    confirmButton: 'btn-cancel',
                    popup: 'mi-modal',
                },
            });
        }
    }

    const calculatePriority = (dueDate: string | null): 'Baja' | 'Media' | 'Alta' | null => {
        if (!dueDate) return null;

        const today = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Alta'; // Vencida
        if (diffDays <= 3) return 'Alta'; // 3 días o menos
        if (diffDays <= 7) return 'Media'; // 7 días o menos
        return 'Baja'; // Más de 7 días
    };

    const defaultStates = ['TODO', 'IN_PROGRESS', 'DONE'];
    const uniqueStates = Array.from(new Set(cards.map(card => card.state))).sort();
    const customStates = uniqueStates.filter(state => !defaultStates.includes(state));
    const backlogCards = cards

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
          <p class="modal-text">
            ¿Estás seguro de que quieres proceder con esta acción?<br/>No será reversible.
          </p>
        </div>
      `,
            background: "#222222",
            showCancelButton: true,
            reverseButtons: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
            customClass: {
                popup: "mi-modal",
                confirmButton: "btn-confirm",
                cancelButton: "btn-cancel",
            },
        });

        if (result.isConfirmed) {
            try {
                if (!accessToken) {
                    throw new Error('No se encontró token de autenticación');
                }

                await deleteCardById(cardId, accessToken);


                await Swal.fire({
                    title: '¡Eliminado!',
                    text: 'La tarjeta se ha eliminado correctamente',
                    icon: 'success',
                    background: '#222',
                    color: '#fff',
                    showConfirmButton: true,
                    confirmButtonText: 'Aceptar',
                    customClass: {
                        confirmButton: 'btn-cancel',
                        popup: 'mi-modal',
                    },
                });

                // Refrescar datos
                refreshData();

            } catch (error: any) {
                await Swal.fire({
                    title: 'Error',
                    text: error.message || 'No se pudo eliminar la tarjeta',
                    icon: 'error',
                    background: '#222',
                    color: '#fff',
                    confirmButtonText: 'Aceptar',
                    customClass: {
                        confirmButton: 'btn-cancel',
                        popup: 'mi-modal',
                    },
                });
            }
        }
    };

    return (
        <>

            <div className='relative flex justify-between mb-6 ps-1 pe-6 py-1 w-full h-[54px] text-lg text-white border border-[--global-color-neutral-700] rounded-2xl focus:ring-blue-500 focus:border-blue-500 dark:bg-[--global-color-neutral-800] dark:border-[--global-color-neutral-700] dark:placeholder-white dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'>
                <div className='flex gap-6'>
                    <button
                        onClick={() => handleSectionChange('backlog')}
                        className={clsx('px-12 h-auto rounded-lg text-white hover:bg-[--global-color-primary-500] text-blue-600', {
                            'bg-[--global-color-primary-500]': activeSection === 'backlog'
                        })}
                    >
                        Backlog
                    </button>

                    <div className="my-1 border-l border-[--global-color-neutral-700] mx-3"></div>

                    <button
                        onClick={() => handleSectionChange('listas')}
                        className={clsx('px-12 rounded-lg text-white hover:bg-[--global-color-primary-500] text-blue-600', {
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
                        <input id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-transparent rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <h6>Descripción</h6>
                        <h6>Responsables</h6>
                        <h6>Prioridad</h6>
                        <h6>Estado</h6>
                        <h6>Miembros</h6>
                        <h6>Fecha</h6>
                        <h6>Acciones</h6>
                    </div>
                    {backlogCards.map(card => {
                        //const translatedState = stateLabels[card.state] || card.state;
                        return (
                            <div key={card.id} className='grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-3 px-4 bg-[#313131B3] rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-white h-[50px] mb-6'>
                                <input id="default-checkbox" type="checkbox" value="" className="w-4 bg-transparent rounded-sm border border-[--global-color-neutral-700] focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 h-10" />
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
                                    {calculatePriority(card.dueDate) ? <PriorityBadge label={calculatePriority(card.dueDate)!} /> : <EmptyBadge text="Sin prioridad" />}
                                </div>

                                <div className='flex justify-center'>
                                    <StateBadge label={card.state} labelsMap={stateLabels} colorsMap={stateColors} />
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
                        )
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
                        {uniqueStates.map((state) => {
                            const cardsInState = cards.filter(card => card.state === state);
                            const translatedState = stateLabels[state] || state;
                            const headerColorClass = stateColors[state] || 'bg-gray-500';

                            return (

                                <div key={state} className='flex-none w-80 p-1 border border-[--global-color-neutral-700] rounded-2xl bg-[--global-color-neutral-800] flex flex-col gap-4'>
                                    <div className={clsx('flex justify-between items-center px-2 py-1 text-xl rounded-lg text-center text-white', headerColorClass)}>
                                        <h2>{translatedState}</h2>
                                        <div className='flex gap-3 items-center'>
                                            <h2>{cardsInState.length}</h2>
                                            <button>
                                                <FiEdit />
                                            </button>
                                        </div>
                                    </div>

                                    {cardsInState.map(card => (
                                        <div key={card.id} className='bg-[--global-color-neutral-700] p-4 rounded-lg text-white'>
                                            <div className='flex justify-between items-start'>
                                                <h3 className='mb-3 bg-[--global-color-neutral-600] rounded-2xl py-1 px-2'>{card.title}</h3>

                                                <div ref={menuRef} className="relative inline-block text-left">
                                                    <button
                                                        onClick={() => setShowMenu(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
                                                        className="text-white text-lg hover:opacity-80"
                                                    >
                                                        <FaEllipsisH />
                                                    </button>

                                                    {showMenu[card.id] && (
                                                        <div className="absolute left-0 top-[36px] w-56 rounded-xl bg-zinc-900 text-white shadow-lg z-[9999] p-4">
                                                            
                                                            <button onClick={() => {
                                                                setShowMenu(prev => ({ ...prev, [card.id]: false }));
                                                                router.push(`/dashboard/cards/view?cardId=${card.id}&boardId=${boardId}`);
                                                            }}
                                                                className="flex items-center gap-3 w-full text-left text-base py-2 hover:bg-zinc-800 rounded-lg transition-colors">

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
                                                                className="flex items-center gap-3 w-full text-left text-base py-2 hover:bg-zinc-800 rounded-lg transition-colors mt-1"
                                                            >
                                                                <FaTrash className="text-white text-lg" />
                                                                <span>Eliminar tarjeta</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <p className='mb-3'>{card.description || 'Sin descripción'}</p>

                                            <div className='flex items-center justify-between'>
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
                                    ))}

                                    <div className='mt-auto'>
                                        <button
                                            onClick={() => window.location.href = `/dashboard/cards/create?boardId=${boardId}`}
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
                                    placeholder='Escribe aquí...'
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