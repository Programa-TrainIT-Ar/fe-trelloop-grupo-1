'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';

interface BoardPageProps {
    params: {
        boardId: string;
    };
}

export default function BoardPage({ params }: BoardPageProps) {
    const { boardId } = params;
    const [boardData, setBoardData] = useState(null);
    const { accessToken } = useAuthStore();

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

    return (
        <div>
            <h1>{boardData.name}</h1>
            <p>{boardData.description}</p>
        </div>
    );
}