import React from "react";
import { FaDiscord, FaLinkedin, FaFacebook } from 'react-icons/fa';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-900 text-white py-10 px-6 relative z-10">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="font-semibold mb-2">Acerca de</h3>
          <ul>
            <li>Programa Trainit</li>
            <li>Contacto</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Legal</h3>
          <ul>
            <li>Política de cookies</li>
            <li>Política de privacidad</li>
            <li>Aviso legal y condiciones de uso</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Sedes</h3>
          <ul>
            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
            <li>Ut enim ad minim veniam, quis nostrud exercitation</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Redes sociales</h3>
          <div className="flex gap-3 text-xl">
            <FaDiscord />
            <FaLinkedin />
            <FaFacebook />
          </div>
        </div>
      </div>
      <div className="text-center text-xs mt-10 text-gray-400">
        © 2025 Copyright | Programa Trainit
      </div>
    </footer>
  );
};

