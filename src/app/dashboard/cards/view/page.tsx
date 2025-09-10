'use client';

import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaEllipsisV, FaTimes, FaClock, FaPlay, FaPercent, } from 'react-icons/fa';
import { GoCommentDiscussion } from "react-icons/go";
import { useAuthStore } from '@/store/auth';
import { create } from "domain";
import { formatDistanceToNow, } from "date-fns";
import { es } from "date-fns/locale";
import { parse } from "path";
import { text } from "stream/consumers";
import Swal from "sweetalert2";


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
interface Comment {
    _id?: number | string;
    id?: number | string;
    content: string;
    createdAt?: string;
    parentId?: number | string | null;
    user: {
        id?: number;
        firstName?: string;
        lastName?: string;

        avatar?: string;
    };
    deleted?: boolean;

}
export default function ViewCardPage() {
    const searchParams = useSearchParams();
    const cardId = searchParams.get("cardId");

    const router = useRouter();
    const { accessToken, user } = useAuthStore();

    const [card, setCard] = useState<CardData | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);


    const userFirstName = (u?: Comment["user"] | null) => u?.firstName ?? "";
    const userLastName = (u?: Comment["user"] | null) => u?.lastName ?? "";

    const rootComments = comments.filter(c => !c.parentId);
    const getReplies = (parentId?: number | string | null) =>
        comments.filter(c => String(c.parentId) === String(parentId));

    const formatRelativeTime = (dateString?: string) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            const safeDate = date.getTime() > Date.now() ? new Date() : date;
            let text = formatDistanceToNow(safeDate, {
                addSuffix: true,
                locale: es,
            });


            if (text.startsWith("en")) {
                text = text.replace("en", "hace");
            }

            return text;
        } catch {
            return "";
        }
    };
    const handleSoftDelete = async (commentId: number | string) => {
        setComments(prev => prev.map(c =>
            (c.id === commentId || c._id === commentId)
                ? { ...c, content: 'Comentario eliminado', deleted: true, user: {} }
                : c
        ));
    };
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


        // Cargar comentarios
        fetch(`${process.env.NEXT_PUBLIC_API}/comment/list?cardId=${cardId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                const arr = Array.isArray(data) ? data : data.items ?? [];
                setComments(arr);
            })
            .catch(() => setComments([]));

    }, [cardId, accessToken]);

    const handleGoBack = () => {
        router.back();
    };


    const handleAddComment = async () => {
        if (!cardId) return;
        if (!newComment.trim()) return;

        const parsedCardId = Number(cardId);
        if (isNaN(parsedCardId)) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API}/comment/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    content: newComment,
                    cardId: parsedCardId,
                    parentId: replyingTo ? (replyingTo.id ?? replyingTo._id ?? null) : null,
                }),
            });

            let payload: any = {};
            try {
                payload = await res.json();
            } catch (err) {
                console.warn("⚠️ No se pudo parsear la respuesta como JSON");
            }

            if (!res.ok) {
                console.error("❌ Error en respuesta:", res.status, payload);
                throw new Error("Error al enviar el comentario");
            }

            setComments((prev) => [...prev, payload]);
            setNewComment("");
            setReplyingTo(null);
        } catch (error) {
            console.error("❌ handleAddComment error:", error);
        }
    };

    const handleEdit = async (comment: Comment) => {
        const id = comment.id ?? comment._id;
        if (!id) return;

        const { value: newContent } = await Swal.fire({
            title: "Editar comentario",
            input: "textarea",
            inputLabel: "Modifica tu comentario:",
            inputValue: comment.content,
            background: "rgb(26, 26, 26)",
            color: "#FFFFFF",
            confirmButtonColor: "#6A5FFF",
            cancelButtonColor: "#FF4B4B",
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            inputValidator: (value) => {
                if (!value?.trim()) {
                    return "El comentario no puede estar vacío";
                }
                return null;
            },
        });
        if (!newContent.trim() || newContent.trim() === comment.content) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API}/comment/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ content: newContent }),
            });

            if (!res.ok) {
                Swal.fire({
                    icon: "error",
                    text: "No se pudo editar el comentario",
                    background: "rgb(26, 26, 26)",
                    color: "#FFFFFF",
                    confirmButtonColor: "#6A5FFF",
                });
                return;

            }
            const updated = await res.json().catch(() => null);

            setComments((prev) => prev.map(c => ((c.id ?? c._id) === id ? { ...c, content: newContent, ...updated } : c))
            );
            setOpenMenuId(null);
            Swal.fire({
                icon: "success",
                text: "Comentario actualizado",
                background: "rgb(26, 26, 26)",
                color: "#FFFFFF",
                confirmButtonColor: "#6A5FFF",
            });
        } catch (err) {
            console.error("handleEdit error:", err);
        }
    };

    const handleDelete = async (comment: Comment) => {
        const id = comment.id ?? comment._id;
        if (!id) return;

        const result = await Swal.fire({
            title: "¿Eliminar comentario?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            background: "rgb(26, 26, 26)",
            color: "#FFFFFF",
            showCancelButton: true,
            confirmButtonColor: "#FF4B4B",
            cancelButtonColor: "#6A5FFF",
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
        });

        if (!result.isConfirmed) return;

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API}/comment/delete/${id}`,
                { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }
            );
            if (!res.ok) {
                Swal.fire({
                    icon: "error",
                    text: "No se pudo eliminar el comentario",
                    background: "rgb(26, 26, 26)",
                    color: "#FFFFFF",
                    confirmButtonColor: "#6A5FFF",
                });
                return;
            }

            setComments((prev) => prev.filter((c) => (c.id ?? c._id) !== id));
            setOpenMenuId(null);

            Swal.fire({
                icon: "success",
                text: "Comentario eliminado",
                background: "rgb(26, 26, 26)",
                color: "#FFFFFF",
                confirmButtonColor: "#6A5FFF",
            });

        } catch (err) {
            console.error("handleDelete error:", err);
        }
    };



    return (
        <div className="flex flex-row h-screen text-white">
            {/* Columna izquierda */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex items-center gap-3 px-4 py-3 text-lg bg-[#313131B3] rounded-xl border-2 border-[#3C3C3CB2] mb-6">
                    <FaArrowLeft onClick={handleGoBack} className="cursor-pointer text-lg" />
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
                                        card.members.map((member: Member) => (
                                            <img
                                                key={member.id}
                                                src={
                                                    member.avatar ||
                                                    `https://ui-avatars.com/api/?name=${member.first_name}+${member.last_name}`
                                                }
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

                        {/* Bloques de métricas */}
                        <div className="flex flex-wrap gap-5 mt-8">
                            <div
                                className="rounded-lg overflow-hidden shadow-lg flex flex-col h-[88px] w-[215px]"
                                style={{ backgroundColor: "#2E90FA" }}
                            >
                                <div className="px-4 py-2 flex-1">
                                    <div className="flex flex-row items-center mb-2 gap-2">
                                        <FaClock
                                            className="text-white text-2xl"
                                            style={{ padding: "2px" }}
                                        />
                                        <p className="text-sm p-2" style={{ color: "#ffffffff" }}>
                                            Tiempo estimado
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm " style={{ color: "#ffffff" }}>
                                            3h 20m
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="rounded-lg overflow-hidden shadow-lg flex flex-col h-[88px] w-[215px]"
                                style={{ backgroundColor: "#DF8200" }}
                            >
                                <div className="px-4 py-2 flex-1">
                                    <div className="flex flex-row items-center mb-2 gap-2">
                                        <FaPlay
                                            className="text-white text-2xl"
                                            style={{ padding: "2px" }}
                                        />
                                        <p className="text-sm p-2" style={{ color: "#ffffff" }}>
                                            Tiempo trabajado
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-base " style={{ color: "#ffffff" }}>
                                            20 hrs
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="rounded overflow-hidden shadow-lg flex flex-col h-[88px] w-[215px]"
                                style={{ backgroundColor: "#A70000" }}
                            >
                                <div className="px-4 py-2 flex-1">
                                    <div className="flex flex-row items-center mb-2 gap-2">
                                        <FaPercent
                                            className="text-white text-2xl"
                                            style={{ padding: "2px" }}
                                        />
                                        <p className="text-sm p-2" style={{ color: "#ffffff" }}>
                                            Progreso
                                        </p>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div
                                            className="h-2.5 rounded-full"
                                            style={{
                                                width: "35%",
                                                background: "var(--global-color-primary-500)",
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha - Comentarios */}
                    <div className="flex flex-col h-full border-l border-gray-700 p-4 w-80">
                        <div className="flex items-center gap-2 mb-4">
                            <GoCommentDiscussion className="text-lg" />
                            <h3 className="text-white font-semibold mb-4">Comentarios</h3>
                        </div>

                        {/* Input de comentario */}
                        <div className="flex items-start gap-2 mb-6">
                            <img
                                src={
                                    user?.avatar ||
                                    `https://ui-avatars.com/api/?name=${userFirstName(user) || "Tu"}+${userLastName(user)}`
                                }
                                alt="avatar"
                                className="w-9 h-9 rounded-full"
                            />
                            <div className="w-full">
                                {replyingTo && (
                                    <div className="text-sm text-gray-400 mb-2">
                                        Respondiendo a <b>{userFirstName(replyingTo.user) || "usuario"}</b>
                                        <button onClick={() => setReplyingTo(null)} className="ml-2 text-red-400">
                                            Cancelar
                                        </button>
                                    </div>
                                )}
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Escribe aquí..."
                                    className="w-full bg-[#232323] border border-gray-600 rounded-lg p-4 text-sm"
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleAddComment}
                                        className="px-6 py-2 rounded-lg bg-[#5B4BDB] hover:bg-[#4a3dc7] text-sm font-medium"
                                    >
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Lista de comentarios */}
                        <div className="flex-1 overflow-y-auto space-y-4">
                            {(() => {
                                // Comentarios raíz (sin parentId)
                                const rootComments = comments.filter((c) => c.parentId == null);

                                // Obtener respuestas de un comentario
                                const getReplies = (parentId: string | number) => {
                                    return comments.filter((cm) => String(cm.parentId) === String(parentId));
                                };

                                // Render recursivo de un comentario y sus hijos
                                const renderComment = (c: Comment, depth = 0): React.ReactNode => {
                                    const cid = c.id ?? c._id;
                                    if (cid == null) return null; // seguridad

                                    const author = c.user;
                                    const authorFirst = userFirstName(author ?? undefined);
                                    const authorLast = userLastName(author ?? undefined);
                                    const authorId = author?.id;
                                    const replies = comments.filter(
                                        (cm) => String(cm.parentId) === String(cid)
                                    );

                                    return (
                                        <div
                                            key={String(cid)}
                                            className="mb-3"
                                            style={{
                                                marginLeft: Math.min(depth * 20, 40),

                                            }}
                                        >
                                            <div className="flex gap-2">
                                                <img
                                                    src={
                                                        author?.avatar ||
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                            `${authorFirst || "?"} ${authorLast || ""}`
                                                        )}`
                                                    }
                                                    alt={`${authorFirst || "?"} ${authorLast || ""}`}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-sm font-semibold">
                                                            {authorFirst} {authorLast}
                                                            <span className="ml-2 text-gray-400 text-xs">
                                                                {c.createdAt ? formatRelativeTime(c.createdAt) : ""}
                                                            </span>
                                                        </p>

                                                        <div className="relative">
                                                            <FaEllipsisV
                                                                className="text-sm cursor-pointer"
                                                                onClick={() => setOpenMenuId(openMenuId === cid ? null : cid)}
                                                            />
                                                            {openMenuId === cid && (
                                                                <div className="absolute right-0 mt-2 w-32 bg-[#2b2b2b] rounded-lg shadow-lg text-sm z-50">
                                                                    {authorId === user?.id && (
                                                                        <button
                                                                            onClick={() => handleEdit(c)}
                                                                            className="block w-full text-left px-3 py-2 hover:bg-[#3a3a3a]">
                                                                            Editar
                                                                        </button>
                                                                    )}
                                                                    {(authorId === user?.id || user?.id === card?.responsable?.id) && (
                                                                        <button
                                                                            onClick={() => handleDelete(c)}
                                                                            className="block w-full text-left px-3 py-2 hover:bg-[#3a3a3a] text-red-400">
                                                                            Eliminar
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-gray-300">{c.content}</p>
                                                    <button
                                                        onClick={() => setReplyingTo(c)}
                                                        className="text-xs text-blue-400 mt-1">
                                                        Responder
                                                    </button>

                                                    {/* Renderizar respuestas */}
                                                    {replies.length > 0 && (
                                                        <div className="mt-2">
                                                            {replies.map((reply) => renderComment(reply, depth + 1))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                };

                                // Render inicial con comentarios raíz
                                return rootComments.map((c) => renderComment(c));
                            })()}
                        </div>



                    </div>
                </div>

            </div>
        </div>



    );
}


