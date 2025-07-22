"use client";
import { useState } from 'react';
import { FaLock, FaGlobe, FaPlus, FaTag, FaSearch } from "react-icons/fa";

export const BoardSettings = () => {
    const [tags, setTags] = useState<string[]>(["etiqueta"]);
    const [newTag, setNewTag] = useState("");
    const [visibility, setVisibility] = useState<"private" | "public">("private");

    const handleAddTag = () => {
        if (newTag.trim() !== "" && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    return (
        <div className="min-h-screen bg-[#1c1c1c] text-white p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Miembros */}
                <div>
                    <label htmlFor="miembros" className="block font-medium mb-2 text-sm">
                        Miembros{' '}

                    </label>
                    <div className="relative">
                        <input
                            id="miembros"
                            type="text"
                            placeholder="Buscar por nombre o @usuario..."
                            className="bg-neutral-800 px-4 py-2 rounded w-full text-sm border border-gray-700 pr-10"
                        />
                        <button
                            type='button'
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                            <FaSearch />
                        </button>
                    </div>
                </div>

                {/* Etiquetas */}
                <div>
                    <label htmlFor="etiquetas" className="block font-medium mb-2 text-sm">
                        Etiquetas{' '}

                    </label>
                    <div className="relative">
                        <input
                            id="etiquetas"
                            type="text"
                            className="bg-neutral-800 px-4 py-2 rounded w-full text-sm border border-gray-700"
                            placeholder="Escribe un nombre de etiqueta para crearla..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleAddTag}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                            <FaPlus />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {tags.map((tag, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 rounded-full border border-gray-500 text-sm flex items-center gap-1"
                            >
                                <FaTag className="text-gray-400" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Visibilidad */}
                <div>

                    <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="visibility"
                                value="private"
                                checked={visibility === 'private'}
                                onChange={() => setVisibility('private')}
                                className="mt-1"
                            />
                            <div className='flex flex-col'>
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <FaLock className='text-white' />
                                    <span>Privado</span>
                                </span>
                                <span className="text-xs text-gray-400">
                                    (Solo tú y los miembros invitados pueden verlo.)
                                </span>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="visibility"
                                value="public"
                                checked={visibility === 'public'}
                                onChange={() => setVisibility('public')}
                                className="mt-1"
                            />
                            <div className='flex flex-col'>
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <FaGlobe className='text-white' />
                                    <span>Público</span>
                                </span>
                                <span className="text-xs text-gray-400">
                                    (Cualquier miembro del equipo puede acceder.)
                                </span>
                            </div>
                        </label>
                    </div>
                </div>


                {/*Botones de cancelar y guardar*/}

                <div className='pt-6'>
                    <button
                        type='button'
                        className='bg-[#1f1f1f] border border-gray-500 text-white px-6 py-2 rounded text-sm hover:bg-[#2a2a2a]'>
                        Cancelar creación
                    </button>
                </div>
            </div>
        </div>


    );
};
