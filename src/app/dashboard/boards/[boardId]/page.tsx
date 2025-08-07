'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useBoardStore } from "@/store/boards";
import { FaPlus } from "react-icons/fa6";
import { LuPencilLine } from "react-icons/lu";
import { FaRegTrashAlt } from "react-icons/fa";
import Image from 'next/image';
import clsx from 'clsx';

//const user = useAuthStore(state => state.user);

interface BoardPageProps {
    params: {
        boardId: string;
    };
}

export default function BoardPage({ params }: BoardPageProps) {
    const { boardId } = params;
    const [boardData, setBoardData] = useState(null);
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

        fetchBoardData();
    }, [boardId, accessToken]);

    if (!boardData) {
        return <div className='text-white'>Cargando...</div>;
    }

    const handleClick = (buttonName: string) => {
        setActiveButton(buttonName);
    }

    const priorityTags = {
        'Alta': 'bg-[#A70000]',
        'Media': 'bg-[#DF8200]',
        'Baja': 'bg-[#667085]'
    }

    const statusTags = {
        'Hecho': 'bg-[#12B76A]',
        'En progreso': 'bg-[#2E90FA]',
        'Por hacer': 'bg-[#60584E]'
    }


    const tasks = [
        {
            id: 1,
            description: "Crear el componente de navegación",
            assignee: "Iván Andrade",
            priority: "Media",
            status: "Hecho",
            members: [],
            date: "Julio 15 de 2025"
        },
        {
            id: 2,
            description: "Configurar el servidor de autenticación",
            assignee: "Sofía Pérez",
            priority: "Alta",
            status: "En progreso",
            members: ['Andres López', 'Enrique Guilbert'],
            date: "Julio 20 de 2025"
        },
        {
            id: 3,
            description: "Diseñar la interfaz de usuario",
            assignee: "Carlos Ruiz",
            priority: "Baja",
            status: "Por hacer",
            members: [],
            date: "Julio 25 de 2025"
        }
    ];

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
            {tasks.map(task => (
                <div key={task.id} className='grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center justify-around gap-3 px-4 py-3 text-lg text-white border border-[--global-color-neutral-700] rounded-2xl mb-6 text-start'>
                    <input id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-transparent rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <p className='text-white'>{task.description}</p>
                    <p>{task.assignee}</p>
                    <div className='flex justify-center'>
                        <span className={clsx(
                            'px-4 py-1 rounded-lg',
                            priorityTags[task.priority]
                        )}>
                            {task.priority}
                        </span>
                    </div>
                    <div className='flex justify-center'>
                        <span className={clsx(
                            'px-4 py-1 rounded-lg text-center',
                            statusTags[task.status]
                        )}>
                            {task.status}
                        </span>
                    </div>
                    <p>{task.members.length > 0 ? task.members.join(', ') : 'N/A'}</p>
                    <p>{task.date}</p>
                    <div className='flex items-center gap-3'>
                        <button><LuPencilLine /></button>
                        <button><FaRegTrashAlt /></button>
                    </div>
                </div>
            ))
            }
            <div className='fixed bottom-8 right-10 z-50'>
                <button className='flex justify-center items-center rounded-full bg-[--global-color-primary-500] h-20 w-20 text-center text-white '><FaPlus className='h-10 w-10'/></button>
            </div>
        </>
    );
}