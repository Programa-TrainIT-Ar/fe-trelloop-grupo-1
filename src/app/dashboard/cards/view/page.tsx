'use client';

import { useSearchParams, useRouter } from "next/navigation";

import { FaArrowLeft, FaEllipsisV, FaTimes, FaClock, FaPlay, FaPercent } from 'react-icons/fa';

export default function ViewCardPage() {
    const searchParams = useSearchParams();
    const cardId = searchParams.get("cardId");
    const boardId = searchParams.get("boardId");
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    }

    return (
        <div className="p-6 text-white">


            <div className="flex items-center gap-3 px-4 py-3 text-lg bg-[#313131B3] rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-white mb-6">
                <FaArrowLeft
                    onClick={handleGoBack}
                    className="cursor-pointer text-lg" />
                <p className="text-sm">Volver al tablero</p>
                <FaEllipsisV className="ml-auto cursor-pointer text-lg" />
                <FaTimes className="cursor-pointer text-lg" />
            </div>

            <div className="flex flex-wrap gap-5  mt-8">
                <div className=" rounded-lg overflow-hidden shadow-lg flex flex-col h-[88px] w-[215px]" style={{ backgroundColor: "#2E90FA" }}>
                    <div className="px-4 py-2 flex-1">
                        <div className="flex flex-row items-center mb-2 gap-2" >
                            <FaClock className="text-white text-2xl" style={{padding:"2px"}} />
                            <p className="text-sm p-2" style={{ color: "#ffffffff" }}> Tiempo estimado</p>
                        </div>
                        <div>
                            <p className="text-sm " style={{ color: "#ffffff" }}> 3h 20m </p>
                        </div>
                    </div>
                </div>
                <div className="  rounded-lg overflow-hidden shadow-lg flex flex-col h-[88px] w-[215px]" style={{ backgroundColor: "#DF8200" }}>
                    <div className="px-4 py-2 flex-1">
                        <div className="flex flex-row items-center mb-2  gap-2  ">
                            <FaPlay className="text-white text-2xl" style={{padding:"2px"}} />
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
                            <FaPercent className="text-white text-2xl" style={{padding:"2px"}} />
                            <p className="text-sm p-2" style={{ color: "#ffffff" }}> Progreso</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="h-2.5 rounded-full" style={{width: "35%", background:"var(--global-color-primary-500)" }}></div>
                        </div>
                    </div>
                </div>
            </div>





        </div>
    );
}

