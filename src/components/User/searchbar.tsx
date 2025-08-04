'use client';

import { LuListFilter } from "react-icons/lu";
import { IoPersonCircleOutline } from "react-icons/io5";
import { GoBell } from "react-icons/go";
import { useState, useRef, useEffect } from "react";
import { IoPersonOutline } from "react-icons/io5";
import { LuKey } from "react-icons/lu";
import { RxExit } from "react-icons/rx";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { PiTagSimple } from "react-icons/pi";
import { IoCalendarClearOutline } from "react-icons/io5";
import { IoHeartOutline } from "react-icons/io5";
import Image from "next/image";
import FilterDropdownButton from "./filterDropdownButtons";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";


export default function SearchBar() {
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const profileMenuRef = useRef<HTMLDivElement>(null);
    const filterOptions = useRef<HTMLDivElement>(null);

    const user = useAuthStore(state => state.user);
    const storeLogout = useAuthStore(state => state.logout);

    const userFullName = user ? `${user.firstName} ${user.lastName}`: 'Usuario';    

    const handleLogout = () => {
        storeLogout()
        router.push('/')
    }

    const toggleProfileMenu = () => {
        setIsProfileOpen(!isProfileOpen);
        setOpenDropdownId(null);
        setIsFilterOpen(false);
    }

    const toggleFilterOptions = () => {
        setIsFilterOpen(!isFilterOpen);
        setOpenDropdownId(null);        
    }

    const handleToggleDropdown = (id: string) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
        setIsProfileOpen(false);
    }

    const miembrosItems = [
        { id: 'all-members', label: 'Todos los miembros' },
        { id: 'active-members', label: 'Miembros activos' },
        { id: 'inactive-members', label: 'Miembros inactivos' },
    ];

    const etiquetasItems = [
        { id: 'tag-1', label: 'Urgente' },
        { id: 'tag-2', label: 'En Progreso' },
        { id: 'tag-3', label: 'Completado' },
    ];

    const fechaItems = [
        { id: 'today', label: 'Hoy' },
        { id: 'this-week', label: 'Esta semana' },
        { id: 'this-month', label: 'Este mes' },
    ];

    const favoritosItems = [
        { id: 'show-fav', label: 'Mostrar favoritos' },
        { id: 'hide-fav', label: 'Ocultar favoritos' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (filterOptions.current && !filterOptions.current.contains(event.target as Node)) {
                if (!(event.target as HTMLElement).closest('[data-dropdown-trigger]')) {
                    setIsFilterOpen(false);
                    setOpenDropdownId(null);
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }

    }, [isFilterOpen, isFilterOpen, openDropdownId])

    return (
        <nav className="w-full mx-auto mb-8">
            <div className="relative flex h-16 items-center justify-between gap-4">
                <div className="flex flex-1 min-w-0 items-center gap-4">

                    {/* Barra de búsqueda */}

                    <form className={`${isFilterOpen ? 'w-full' : 'w-full max-w-md'}`}>
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

                    <button type="button" className={`${!isFilterOpen ? '' : 'hidden'} relative rounded-full text-white hover:text-white hover:bg-[--global-color-neutral-700] p-2`}>
                        <GoBell className="size-10" />
                    </button>
                    <div className={`${!isFilterOpen ? '' : 'hidden'} relative`}>
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
                            tabIndex={1}
                            aria-labelledby="user-menu-button"
                            aria-orientation="vertical"
                            className={`${isProfileOpen ? '' : 'hidden'} shadow-xl/20 absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-[--global-color-neutral-700] flex flex-col gap-y-3 py-3 shadow-lg ring-1 ring-black/5 focus:outline-none`}>
                            <div className="flex gap-3 items-center">
                                <Image
                                    src={user?.profilePicture || 'https://picsum.photos/200/200?random=1'}
                                    alt="User profile photo"
                                    width={60}
                                    height={60}
                                    className="object-cover rounded-full ms-4"
                                />
                                <div className="text-white flex-col">
                                    <h4 className="text-lg text-">{userFullName}</h4>
                                    <h5>Miembro</h5>
                                </div>
                            </div>
                            <a id="user-menu-item-0" role="menuitem" href="#" tabIndex={1} className="flex gap-3 items-center ps-6 py-2 text-sm text-white hover:bg-[--global-color-neutral-800]">
                                <IoPersonOutline className="size-6" />Perfil de usuario
                            </a>
                            <a id="user-menu-item-1" role="menuitem" href="#" tabIndex={1} className="flex gap-3 items-center ps-6 py-2 text-sm text-white hover:bg-[--global-color-neutral-800]">
                                <LuKey className="size-6" />Contraseña
                            </a>
                            <div className="my-1 border-t border-gray-500 mx-3"></div>
                            <a onClick={handleLogout} id="user-menu-item-2" role="menuitem" href="#" tabIndex={1} className="flex gap-3 items-center ps-6 py-2 text-sm text-white hover:bg-[--global-color-neutral-800]">
                                <RxExit className="size-6" />Cerrar sesión
                            </a>
                        </div>
                    </div>
                </div>

            </div>

            <div
                ref={filterOptions}
                className={`${isFilterOpen ? '' : 'hidden'} flex gap-8 mt-4 border-t-black border-t-[1px] py-3 text-lg items-center`}
            >
                <FilterDropdownButton 
                    id="miembros"
                    label="Miembros"
                    icon={MdOutlinePeopleAlt}
                    items={miembrosItems}
                    isOpen={openDropdownId === 'miembros'}
                    onToggle={handleToggleDropdown}
                />
                <FilterDropdownButton 
                    id="etiquetas"
                    label="Etiquetas"
                    icon={PiTagSimple}
                    items={etiquetasItems}
                    isOpen={openDropdownId === 'etiquetas'}
                    onToggle={handleToggleDropdown}
                />
                <FilterDropdownButton 
                    id="fecha"
                    label="Fecha"
                    icon={IoCalendarClearOutline}
                    items={fechaItems}
                    isOpen={openDropdownId === 'fecha'}
                    onToggle={handleToggleDropdown}
                />
                <FilterDropdownButton 
                    id="favoritos"
                    label="Solo favoritos"
                    icon={IoHeartOutline}
                    items={favoritosItems}
                    isOpen={openDropdownId === 'favoritos'}
                    onToggle={handleToggleDropdown}
                    buttonTextColor="text-[#F200FF]"
                />
            </div>
        </nav>
    );
}