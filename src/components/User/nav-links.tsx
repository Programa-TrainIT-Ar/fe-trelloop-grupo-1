'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from 'clsx';
import { RxDashboard } from "react-icons/rx";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";

const links = [
    { name: 'Tableros', href: '/dashboard', icon: <RxDashboard className="size-8"/> },
    { name: 'Miembros', href: '/dashboard/members', icon: <MdOutlinePeopleAlt className="size-8"/> },
    { name: 'Configuración', href: '/dashboard/settings', icon: <IoSettingsOutline className="size-8"/> },
];

export default function NavLinks() {
    const pathname = usePathname();

    return (
        <div className="bg-[--global-color-neutral-800] px-5">
            {links.map(link => {
                const LinkIcon = link.icon;
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={clsx(
                            'flex h-[48px] my-3 grow items-center justify-center gap-2 rounded-lg p-3 text-white text-lg font-medium hover:bg-[--global-color-primary-500] text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
                            {
                                'bg-[--global-color-primary-500] text-white': pathname === link.href
                            }
                        )}
                    >

                        <p className="flex items-center gap-2">{LinkIcon}{link.name}</p>
                    </Link>
                )
            })

            }
        </div>
    )
}