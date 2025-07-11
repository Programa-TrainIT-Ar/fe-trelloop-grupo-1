"use client";

import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import logo from '@/assets/logo-dark-trainit-horizontal.png';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  return (
    <main className="bg-[#313131] text-white flex items-center justify-between px-7 py-4">
      {/* Logo */}
      <div className="flex items-center">
        <Image src={logo} alt="Logo TrainIT" width={180} />
      </div>
      <ul className="flex items-center gap-10 text-lg">
        <li className="hover:text-[#736CFD] font-medium">
          <Link href="/">Inicio</Link>
        </li>
        <li className="hover:text-[#736CFD] font-medium">
          <Link href="/about">Acerca de</Link>
        </li>
        <li className="hover:text-[#736CFD] font-medium">
          <Link href="/contact">Contacto</Link>
        </li>
      </ul>

      <div className="flex items-center gap-4">
        {pathname !== "/login" && (
          <Link
            href="/login"
            className="text-[#736CFD] border border-[#736CFD] rounded-full px-6 py-2 text-sm hover:bg-[#736CFD]/10 transition"
          >
            LOGIN
          </Link>
        )}
        {pathname !== "/register" && (
          <Link
            href="/register"
            className="bg-[#736CFD] text-white rounded-full px-6 py-2 text-sm hover:bg-[#5b53d8] transition"
          >
            REGISTRARSE
          </Link>
        )}
      </div>
    </main>
  );
};
