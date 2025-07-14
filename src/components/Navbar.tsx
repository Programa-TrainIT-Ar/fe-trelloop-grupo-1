"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import logo from '@/assets/logo-dark-trainit-horizontal.png'; 


export const Navbar: React.FC = () => {
  const pathname = usePathname();
  return (
    <main className="bg-background-height text-text-default flex items-center justify-between px-7 py-4">
      {/* Logo */}
      <div className="flex items-center">
        <Image 
        src={logo} 
        alt="Logo TrainIT" 
        width={180}
        style={{ height: 'auto' }}
        loading="lazy" />
      </div>
      <ul className="flex items-center gap-10 text-lg">
        <li className="hover:text-state-default font-medium">
          <Link href="/">Inicio</Link>
        </li>
        <li className="hover:text-state-default font-medium">
          <Link href="/about">Acerca de</Link>
        </li>
        <li className="hover:text-state-default font-medium">
          <Link href="/contact">Contacto</Link>
        </li>
      </ul>

      <div className="flex items-center gap-4">
        {pathname !== "/login" && (
          <Link
            href="/login"
            className="text-state-default border border-state-default rounded-full px-6 py-2 text-sm hover:bg-background-medium transition"
          >
            LOGIN
          </Link>
        )}
        {pathname !== "/register" && (
          <Link
            href="/register"
            className="bg-state-default text-white rounded-full px-6 py-2 text-sm hover:bg-state-hover transition"
          >
            REGISTRARSE
          </Link>
        )}
      </div>
    </main>
  );
};
