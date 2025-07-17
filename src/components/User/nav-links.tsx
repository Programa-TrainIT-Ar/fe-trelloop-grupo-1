'use client';

import { icon } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from 'clsx';


const links = [
    {name: 'Tableros', href: '/dashboard', icon: ''},
    {name: 'Miembros', href: '/dashboard/members', icon: ''},
    {name: 'Configuración', href: '/dashboard/configuration', icon: ''},
];

export default function NavLinks() {
    const pathname = usePathname();

    return (
        <div className="bg-[--global-color-neutral-900] px-5">
            {links.map(link => {
                const LinkIcon = link.icon;
                return (
                    <Link
                        key = {link.name}
                        href = {link.href}
                        className = {clsx(
                            'flex h-[48px] my-3 grow items-center justify-center gap-2 rounded-lg p-3 text-white text-lg font-medium hover:bg- hover:bg-[--global-color-primary-500] text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
                            {
                                'bg-[--global-color-primary-500] text-white': pathname === link.href
                            }
                        )}
                    >
                        
                        <p className="hidden md:block">{link.name}</p>
                    </Link>
                )
            })

            }
        </div>
    )
}