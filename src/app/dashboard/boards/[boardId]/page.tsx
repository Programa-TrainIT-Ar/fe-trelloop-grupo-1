'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useBoardStore } from "@/store/boards";
import { FaPlus } from "react-icons/fa6";
import { LuPencilLine } from "react-icons/lu";
import { FaRegTrashAlt } from "react-icons/fa";
import Image from 'next/image';
import clsx from 'clsx';
import PriorityBadge from '@/components/card/PriorityBagde';
import StateBadge from '@/components/card/StateBadge';
import EmptyBadge from '@/components/ui/EmptyBadge';

//const user = useAuthStore(state => state.user);

interface Card {
    id: number;
    title: string;
    description?: string;
    assignee?: string;
    priority?: 'Baja' | 'Media' | 'Alta';
    state: string;
    dueDate?: string;
    beginDate?: string;
    members?: any[];
}

interface BoardPageProps {
    params: {
        boardId: string;
    };
}

export default function BoardPage({ params }: BoardPageProps) {
    const { boardId } = params || {};
    const [boardData, setBoardData] = useState(null);
    const [cards, setCards] = useState<Card[]>([]);
    const { accessToken } = useAuthStore();
    const [activeButton, setActiveButton] = useState('backlog');

    useEffect(() => {
        if (!boardId || !accessToken) return;

        const fetchBoardData = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API}/board/getBoard/${boardId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    console.error("Error del servidor:", errorData);
                    throw new Error(`Error al obtener los datos del tablero: ${res.statusText}`);
                }

                const data = await res.json();
                setBoardData(data);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };

        const fetchCards = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API}/card/getCards/${boardId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setCards(data);
                }
            } catch (error) {
                console.error('Error fetching cards:', error);
            }
        };

        fetchBoardData();
        fetchCards();
    }, [boardId, accessToken]);



    if (!boardId) {
        return <div className='text-white'>Error: ID del tablero no encontrado</div>;
    }

    if (!boardData) {
        return <div className='text-white'>Cargando...</div>;
    }

    const handleClick = (buttonName: string) => {
        setActiveButton(buttonName);
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






    return (
        <>

            <div className='flex justify-between mb-6 ps-1 pe-6 py-1 w-full text-lg text-white border border-[--global-color-neutral-700] rounded-2xl focus:ring-blue-500 focus:border-blue-500 dark:bg-[--global-color-neutral-800] dark:border-[--global-color-neutral-700] dark:placeholder-white dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'>
                <div className='flex gap-6'>
                    <button
                        onClick={() => handleClick('backlog')}
                        className={clsx('px-12 h-auto rounded-lg text-white hover:bg-[--global-color-primary-500] text-blue-600',
                            {
                                'bg-[--global-color-primary-500]': activeButton === 'backlog'
                            }
                        )}>
                        Backlog

                    </button>
                    <div className="my-1 border-l border-[--global-color-neutral-700] mx-3"></div>
                    <button
                        onClick={() => handleClick('listas')}
                        className={clsx('px-12 rounded-lg text-white  hover:bg-[--global-color-primary-500] text-blue-600',
                            {
                                'bg-[--global-color-primary-500]': activeButton === 'listas'
                            }
                        )}>
                        Listas
                    </button>
                </div>
                <div className='flex items-center gap-6 py-2'>
                    <div className='w-12 h-12 rounded-full overflow-hidden'>
                        <Image
                            src={'https://picsum.photos/200/200?random=1'}
                            width={60}
                            height={60}
                            alt="User profile photo"
                            className="object-cover"
                        />
                    </div>
                    <button className='flex justify-center items-center rounded-full bg-black h-12 w-12 text-center'><FaPlus /></button>
                </div>
            </div>
            <div className='grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-3 px-4 py-3 text-lg text-white border border-[--global-color-neutral-700] rounded-2xl mb-6 text-center font-bold'>
                <input id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-transparent rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                <h6>Descripción</h6>
                <h6>Responsables</h6>
                <h6>Prioridad</h6>
                <h6>Estado</h6>
                <h6>Miembros</h6>
                <h6>Fecha</h6>
                <h6>Acciones</h6>
            </div>

            
            {cards.map(card => (
                <div key={card.id} className='grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center justify-around gap-3 px-4 py-3 text-lg text-white border border-[--global-color-neutral-700] rounded-2xl mb-6 text-start'>
                    <input id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-transparent rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <p className='text-white'>{card.title}</p>
                    <p>{card.assignee || 'Sin asignar'}</p>
                    <div className='flex justify-center'>
                        {calculatePriority(card.dueDate) ? <PriorityBadge label={calculatePriority(card.dueDate)!} /> : <EmptyBadge text="Sin prioridad" />}
                    </div>
                    <div className='flex justify-center'>
                        <StateBadge label={card.state === 'To Do' ? 'TODO' : card.state === 'In Progress' ? 'IN_PROGRESS' : card.state === 'Done' ? 'DONE' : card.state} />
                    </div>
                    <p>N/A</p>
                    <p>{card.dueDate ? new Date(card.dueDate).toLocaleDateString('es') : 'Sin fecha'}</p>
                    <div className='flex items-center gap-3'>
                        <button><LuPencilLine /></button>
                        <button><FaRegTrashAlt /></button>
                    </div>
                </div>
            ))
            }
            <div className='fixed bottom-8 right-10 z-50'>
                <button 
                    onClick={() => window.location.href = `/dashboard/cards/create?boardId=${boardId}`}
                    className='flex justify-center items-center rounded-full bg-[--global-color-primary-500] h-20 w-20 text-center text-white '
                >
                    <FaPlus className='h-10 w-10'/>
                </button>
            </div>
        </>
    );
}