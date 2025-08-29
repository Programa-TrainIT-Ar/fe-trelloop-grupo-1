'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaEllipsisV, FaTimes, FaClock, FaPlay, FaPercent } from 'react-icons/fa';
import { useAuthStore } from '@/store/auth';
import { LuLayoutDashboard } from "react-icons/lu";
import { LuPanelRightOpen } from "react-icons/lu";
import { FaPlus } from "react-icons/fa6";
import Image from "next/image";

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
    const user = useAuthStore(state => state.user);

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
        <div className="p-4 text-white ">
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
            <div className="flex gap-3 w-full">
                <div className="w-4/6">
                    <label className="text-white font-bold text-xl" htmlFor="Card description label">Descripción:</label>
                    <textarea className="text-xl text-white my-3 p-3 bg-transparent border-2 border-[#3C3C3CB2] rounded-xl w-full h-40" name="description" id=""></textarea>

                    <div className="flex flex-row gap-16 mb-8">
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

                    <div className="flex items-center mb-6">
                        <label htmlFor="">Vista:</label>
                        <div className="border-2 border-[#3C3C3CB2] ms-4 gap-3 flex bg-[#212121] p-2 rounded-xl">
                            <button className="flex gap-2 items-center px-4 py-2 text-white rounded-xl hover:bg-[--global-color-primary-500]"><LuLayoutDashboard className="size-6" /> Detallada</button>
                            <div className="my-1 border-l border-[#3C3C3CB2]"></div>
                            <button className="flex px-4 py-2 items-center gap-2 rounded-xl text-white hover:bg-[--global-color-primary-500]"><LuPanelRightOpen className="size-6" /> Secciones</button>
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-6">Subtareas</h2>
                        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] items-center gap-3 border-2 border-[#3C3C3CB2] px-4 py-2 rounded-lg">
                            <input id="default-checkbox" type="checkbox" value="" className="w-4 me-8 h-4 bg-transparent rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                            <h6>Descripción</h6>
                            <h6>Responsable</h6>
                            <h6>Fecha límite</h6>
                            <h6>Acciones</h6>



                        </div>
                        <button className="flex items-center justify-center gap-3 mt-2 rounded-lg w-full border-2 border-dotted border-[#3C3C3CB2] py-1 hover:bg-[--global-color-primary-500]"><FaPlus className="size-5" /> Agregar subtarea</button>

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
                <div className="flex-col w-2/6">
                    <h2 className="text-white">Comentarios:</h2>
                    <div className="flex items-start gap-2 mt-5">
                        <div>
                            <Image
                                src={user?.profilePicture || 'https://picsum.photos/200/200?random=1'}
                                alt="user image"
                                width={60}
                                height={60}
                                className="object-cover rounded-full"
                            />
                        </div>
                        <textarea className="p-3 rounded-xl h-32 w-full bg-transparent border-2 border-[#3C3C3CB2]" placeholder="Escribe aquí..." name="comentary" id=""></textarea>
                        
                    </div>
                    <div className="flex justify-end mt-3">
                    <button className="flexpx-4 py-2 px-12 gap-2 rounded-xl text-white bg-[--global-color-primary-500]">Enviar</button>

                    </div>
                </div>
            </div>
        </div>
    );
}

