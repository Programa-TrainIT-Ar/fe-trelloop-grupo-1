import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import logo from '@/assets/logo-dark-trainit-horizontal.png';

export const Navbar: React.FC = () => {
  return (
    <>
      <main className="bg-[#313131] text-white flex items-center justify-between p-5 px-7">
        <div className="flex justify-end items-center">
          <Image src={logo} alt="Logo TrainIT"  width={180}/>
        </div>
        <div>
          <ul className="flex gap-26 justify-center text-xl p-2">
            <li className="hover:text-[#3447F0] px-2 py-1">
              <Link href="/ingresar">Inicio</Link>
            </li>
            <li className="hover:text-[#3447F0] px-2 py-1">
              <Link href="/articulos">Acerca de</Link>
            </li>
            <li className="hover:text-[#3447F0] px-2 py-1">
              <Link href="/posts">Contacto</Link>
            </li>
          </ul>
        </div>
        <div></div>
      </main>
    </>
  );
};

