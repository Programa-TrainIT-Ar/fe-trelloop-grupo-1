"use client";
import { useState, useEffect } from 'react';


import { FaLock, FaGlobe, FaPlus, FaTag, FaSearch, FaUser } from "react-icons/fa";
type UserType = {
    id: number;
    fullName: string;
    username: string;
    avatarUrl: string;
};


export const BoardSettings = () => {
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [visibility, setVisibility] = useState<"private" | "public">("private");
    const [allUsers, setAllUsers] = useState<UserType[]>([]);
        
    


    const handleAddTag = () => {
        if (newTag.trim() !== "" && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    const [search, setSearch] = useState("");
    const [suggestedUsers, setSuggestedUsers] = useState<UserType[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);

    const handleSearchChange = (value: string) => {
        setSearch(value);

        if (value.trim() === "") {
            setSuggestedUsers([]);
            return;
        }

        
    };

    const handleSelectUser = (user: UserType) => {
        if (!selectedUsers.some((u) => u.id === user.id)) {
            setSelectedUsers([...selectedUsers, user]);
            setSearch("");
            setSuggestedUsers([]);
        }
    };

    const results = allUsers.filter((user) =>
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase())
    );
        setSuggestedUsers(results.slice(0, 5));
    
        
    

    useEffect(() => {
        const handleClickOutside = () => {
            setSuggestedUsers([]);
        
        };
         if (suggestedUsers.length > 0) {

            document.addEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [suggestedUsers]);

    
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
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="bg-neutral-800 px-4 py-2 rounded w-full text-sm border border-gray-700 pr-10"
                        />
                        <button
                            type='button'
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                            <FaSearch />
                        </button>
                    </div>
                    {suggestedUsers.length > 0 && (
                        <div className='bg-neutral-800 mt-2 rounded border border-gray-600'>
                            {suggestedUsers.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => handleSelectUser(user)}
                                    className="flex items-center gap-3 p-2 w-full hover:bg-neutral-700 text-left"
                                >
                                    {user.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.fullName}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white'>
                                            <FaUser />
                                        </div>
                                    )}
                                    <div>
                                        <p className='text-sm'>{user.fullName}</p>
                                        <p className='text-xs text-gray-400'>@{user.username}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Miembros seleccionados */}
                    <div className='flex flex-wrap gap-3 mt-4'>
                        {selectedUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-600"
                            >
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.fullName}
                                        className="w-8 h-8 rounded-full"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
                                        <FaUser />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm">{user.fullName}</p>
                                    <p className="text-xs text-gray-400">@{user.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Etiquetas */}
                <div className='mt-6'>
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
                    {tags.length > 0 && (
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
                    )}
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
                        className='px-10 py-2 border rounded-md text-sm font-medium
             text-[#6A5FFF] border-[#706FE5] bg-[#1a1a1a]
             hover:bg-[#6A5FFF] hover:text-white transition'>
                        Cancelar creación
                    </button>
                </div>
            </div>
        </div>


    );
};
