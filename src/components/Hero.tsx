"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";

import collage from "@/assets/img-collages.webp";
import checkIcon from "@/assets/icon-rectangle-check.webp";
import progressIcon from "@/assets/icon-business-progress.webp";
import circleBottom from '@/assets/ui-fondo-circulo-derecha.webp';
import circleTop from '@/assets/ui-fondo-circulo-izquierda.webp';

export const Hero: React.FC = () => {

  return (
    <>
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Capa de fondo */}
        <div className="absolute inset-0 bg-background-body z-0" />
        {/* Círculos decorativos sobre el fondo pero debajo del contenido */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <Image
            src={circleTop}
            alt="Círculo superior"
            className="absolute bottom-0 left-0 w-[55vw] h-auto"
            draggable={false}
          />
          <Image
            src={circleBottom}
            alt="Círculo inferior"
            className="absolute top-0 right-0 w-[40vw] h-auto"
            draggable={false}
          />
        </div>
        {/* Contenido principal sobre los círculos */}
        <div className="container mx-auto flex flex-col lg:flex-row items-start px-6 lg:px-0 relative z-20">
          {/* Left side: heading and call-to-action */}
          <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
            <h1 className="text-6xl ml-10 flex items-center text-gray-300" style={{ fontFamily: 'var(--font-geist-sans)' }}>
              Make it
              {/* Icono de assets */}
              <Image
                src={checkIcon}
                alt="Icono Check"
                width={120}
                height={32}
                className="ml-4"
              />
            </h1>
            <div className="flex items-center italic ml-10 mt-4 text-5xl">

              <Image
                src={progressIcon}
                alt="Icono progreso"
                width={90}
                height={90}
                className="mr-6"
              />
              <p className="text-gray-300 text-6xl" style={{ fontFamily: 'var(--font-geist-mono)' }}>Happen</p>
            </div>
            <div className="ml-10 mt-6 ps-10">
              <p className="mb-6 mt-4 text-gray-300">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <Link
                href="/register"
                className="inline-block bg-state-default hover:bg-state-hover text-white font-semibold px-20 py-3 rounded-md transition"
              >
                Crear cuenta
              </Link>
            </div>
          </div>

          {/* Right side grid: solo una imagen desde public */}
          <div className="w-full lg:w-1/2 flex justify-center items-center mt-16 lg:mt-32">
            <Image
              src={collage}
              alt="Imagen principal"
              width={600}
              height={400}
              className="rounded-lg max-w-full h-auto"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}
