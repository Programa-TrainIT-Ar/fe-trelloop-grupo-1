'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaEllipsisV, FaTimes, FaClock, FaPlay,FaPercent } from 'react-icons/fa';
import { useAuthStore } from '@/store/auth';

type Member = {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
};

type CardData = {
    id: number;
    title: string;
    responsable?: Member;
    members?: Member[];
    dueDate?: string;
};

export default function ViewCardPage() {
    const searchParams = useSearchParams();
    const cardId = searchParams.get("cardId");
    const router = useRouter();
    const { accessToken } = useAuthStore();

    const [card, setCard] = useState<CardData | null>(null);

    useEffect(() => {
        if (!cardId || !accessToken) return;
        fetch(`${process.env.NEXT_PUBLIC_API}/card/getCard/${cardId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        })
            .then(res => res.json())
            .then(data => setCard(data))
            .catch(() => setCard(null));
    }, [cardId, accessToken]);

    const handleGoBack = () => {
        router.back();
    };

    // Convierte la fecha a formato YYYY-MM-DD para el input date
    function getDateForInput(dateStr?: string) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    }

    return (
        <div className="p-4 text-white">
            <div className="flex items-center gap-3 px-4 py-3 text-lg bg-[#313131B3] rounded-xl border-2 border-[#3C3C3CB2] mb-6">
                <FaArrowLeft
                    onClick={handleGoBack}
                    className="cursor-pointer text-lg" />
                <p className="text-sm">Volver al tablero</p>
                <FaEllipsisV className="ml-auto cursor-pointer text-lg" />
                <FaTimes className="cursor-pointer text-lg" />
            </div>

            <h1 className="text-3xl font-bold mb-8">
                {card?.title || "Cargando..."}
            </h1>

            <div className="flex flex-row gap-16 mb-12">
                {/* Responsable */}
                <div className="flex-1 flex flex-col items-center">
                    <span className="text-white font-semibold mb-2">Responsable</span>
                    <span className="text-gray-400 text-center text-lg">
                        {card?.responsable
                            ? `${card.responsable.first_name} ${card.responsable.last_name}`
                            : "Cargando..."}
                    </span>
                </div>

                {/* Miembros */}
                <div className="flex-1 flex flex-col items-center">
                    <span className="text-white font-semibold mb-2">Miembros</span>
                    <div className="flex flex-row flex-wrap justify-center gap-2">
                        {card?.members && card.members.length > 0 ? (
                            card.members.map(member => (
                                <img
                                    key={member.id}
                                    src={member.avatar || `https://ui-avatars.com/api/?name=${member.first_name}+${member.last_name}`}
                                    alt={member.first_name}
                                    className="w-10 h-10 rounded-full border-2 border-gray-600"
                                    title={`${member.first_name} ${member.last_name}`}
                                />
                            ))
                        ) : (
                            <span className="text-gray-400 ml-2">Cargando...</span>
                        )}
                    </div>
                </div>

                {/* Fecha de entrega */}
                <div className="flex-1 flex flex-col items-center">
                    <span className="text-white font-semibold mb-2">Fecha de entrega</span>
                    <input
                        type="date"
                        
                        className="bg-[#232323] text-gray-400 rounded px-3 py-2 border border-gray-600 text-center text-lg w-[170px]"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-5 mt-8">
                <div className="rounded-lg overflow-hidden shadow-lg flex flex-col h-[88px] w-[215px]" style={{ backgroundColor: "#2E90FA" }}>
                    <div className="px-4 py-2 flex-1">
                        <div className="flex flex-row items-center mb-2 gap-2" >
                            <FaClock className="text-white text-2xl" style={{ padding: "2px" }} />
                            <p className="text-sm p-2" style={{ color: "#ffffffff" }}> Tiempo estimado</p>
                        </div>
                        <div>
                            <p className="text-sm " style={{ color: "#ffffff" }}> 3h 20m </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg flex flex-col h-[88px] w-[215px]" style={{ backgroundColor: "#DF8200" }}>
                    <div className="px-4 py-2 flex-1">
                        <div className="flex flex-row items-center mb-2  gap-2  ">
                            <FaPlay className="text-white text-2xl" style={{ padding: "2px" }} />
                            <p className="text-sm p-2" style={{ color: "#ffffff" }}> Tiempo trabajado</p>
                        </div>
                        <div>
                            <p className="text-base " style={{ color: "#ffffff" }}> 20 hrs </p>
                        </div>
                    </div>
                </div>
                <div className="rounded overflow-hidden shadow-lg flex flex-col h-[88px] w-[215px]" style={{ backgroundColor: "#A70000" }}>
                    <div className="px-4 py-2 flex-1">
                        <div className="flex flex-row items-center mb-2 gap-2  ">
                            <FaPercent className="text-white text-2xl" style={{ padding: "2px" }} />
                            <p className="text-sm p-2" style={{ color: "#ffffff" }}> Progreso</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="h-2.5 rounded-full" style={{ width: "35%", background: "var(--global-color-primary-500)" }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

