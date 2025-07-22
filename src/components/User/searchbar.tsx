'use client';

import Link from "next/link";
import { LuListFilter } from "react-icons/lu";
import { IoPersonCircleOutline } from "react-icons/io5";
import { GoBell } from "react-icons/go";
import { useState } from "react";
import { IoPersonOutline } from "react-icons/io5";
import { LuKey } from "react-icons/lu";
import { RxExit } from "react-icons/rx";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { PiTagSimple } from "react-icons/pi";
import { IoCalendarClearOutline } from "react-icons/io5";
import { IoHeartOutline } from "react-icons/io5";

export default function SearchBar() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const toggleProfileMenu = () => {
        setIsProfileOpen(!isProfileOpen);
    }

    const toggleFilterOptions = () => {
        setIsFilterOpen(!isFilterOpen);
    }

    return (
        <nav className="w-full mx-auto mb-8">
            <div className="relative flex h-16 items-center justify-between gap-4">

                {/* Barra de búsqueda */}

                <div className="flex flex-1 min-w-0 items-center gap-4">
                    <form className="w-full max-w-md">
                        <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-white">
                                <HiMiniMagnifyingGlass className="size-8" />
                            </div>
                            <input type="search" id="default-search" className="block w-full p-4 ps-12 text-lg text-white border border-[--global-color-neutral-700] rounded-2xl focus:ring-blue-500 focus:border-blue-500 dark:bg-[--global-color-neutral-800] dark:border-[--global-color-neutral-700] dark:placeholder-white dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Buscar tablero..." required />
                        </div>
                    </form>

                    {/* Botón de opciones de filtro */}

                    <button
                        id="user-filter-options"
                        type="button"
                        onClick={toggleFilterOptions}
                        className="flex-shrink-0 size-12 flex items-center justify-center text-white hover:bg-[--global-color-neutral-700] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[--global-color-neutral-800]">
                        <LuListFilter className="size-10" />
                    </button>
                </div>

                <div className="flex min-w-0 items-center gap-4">

                    {/* Botón de notificaciones */}

                    <button type="button" className="relative rounded-full text-white hover:text-white hover:bg-[--global-color-neutral-700] p-2">
                        <GoBell className="size-10" />
                    </button>
                    <div className="relative">
                        <div>
                            <button
                                id="user-menu-button"
                                type="button"
                                aria-haspopup="true"
                                aria-expanded={isProfileOpen ? "true" : "false"}
                                onClick={toggleProfileMenu}
                                className="relative flex rounded-full text-white hover:bg-[--global-color-neutral-700] p-2">
                                <IoPersonCircleOutline className="size-10" />

                            </button>
                        </div>

                        {/* Menú desplegable del perfil (oculto por defecto) */}

                        <div
                            role="menu"
                            tabIndex={-1}
                            aria-labelledby="user-menu-button"
                            aria-orientation="vertical"
                            className={`${isProfileOpen ? '' : 'hidden'} shadow-xl/20 absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-[--global-color-neutral-700] flex flex-col gap-y-3 py-3 shadow-lg ring-1 ring-black/5 focus:outline-none`}>
                            <a id="user-menu-item-0" role="menuitem" href="#" tabIndex={-1} className="flex gap-3 items-center ps-6 py-2 text-sm text-white hover:bg-[--global-color-neutral-800]">
                                <IoPersonOutline className="size-6" />Perfil de usuario
                            </a>
                            <a id="user-menu-item-1" role="menuitem" href="#" tabIndex={-1} className="flex gap-3 items-center ps-6 py-2 text-sm text-white hover:bg-[--global-color-neutral-800]">
                                <LuKey className="size-6" />Contraseña
                            </a>
                            <div className="my-1 border-t border-gray-500 mx-3"></div>
                            <a id="user-menu-item-2" role="menuitem" href="#" tabIndex={-1} className="flex gap-3 items-center ps-6 py-2 text-sm text-white hover:bg-[--global-color-neutral-800]">
                                <RxExit className="size-6" />Cerrar sesión
                            </a>
                        </div>
                    </div>
                </div>

            </div>

            <div
                aria-labelledby="user-filter-options"
                className={`${isFilterOpen ? '' : 'hidden'} flex gap-14 mt-4 border-t-black border-t-[1px] py-6 text-lg items-center`}>
                <button className="text-white flex items-center">
                    <MdOutlinePeopleAlt className="me-2 size-8"/>Miembros
                </button>
                <button className="text-white flex items-center">
                    <PiTagSimple className="me-2 size-8"/>Etiquetas
                </button>
                <button className="text-white flex items-center">
                    <IoCalendarClearOutline className="me-2 size-8"/>Fecha
                </button>
                <button className="text-[#F200FF] flex items-center">
                    <IoHeartOutline className="me-2 size-8"/>Solo favoritos
                </button>
            </div>
        </nav>
    );
}