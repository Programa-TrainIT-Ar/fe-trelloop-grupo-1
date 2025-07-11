import React from "react";
import Image from "next/image";

export const Hero: React.FC = () => {

  return (
    <>
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto flex flex-col lg:flex-row items-start px-6 lg:px-0">
          {/* Left side: heading and call-to-action */}
          <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
            <h1 className="text-6xl ml-10 flex items-center" style={{ fontFamily: 'var(--font-geist-sans)' }}>
              Make it
              {/* Icono de assets */}
              <Image
                src={require("../assets/icon-rectangle-check.webp")}
                alt="Icono Check"
                width={120}
                height={32}
                className="ml-4"
              />
            </h1>
            <div className="flex items-center text-xl italic ml-10 mt-4 text-5xl">

              <Image
                src={require("../assets/icon-business-progress.webp")}
                alt="Icono progreso"
                width={90}
                height={90}
                className="mr-6"
              />
              <p style={{ fontFamily: 'var(--font-geist-mono)' }}>Happen</p>
            </div>
            <div className="ml-10 mt-6">
              <p className="mb-6 mt-4 ml-5 text-gray-300">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <button
                className="bg-[#736CFD] text-white rounded-full px-6 py-2 text-sm hover:bg-[#5b53d8] transition ml-5"
                onClick={() => {
                  // TODO: logica de navigate
                }}
              >
                Crear cuenta
              </button>
            </div>

          </div>

          {/* Right side grid: solo una imagen desde public */}
          <div className="w-full lg:w-1/2 flex justify-center items-center mt-16 lg:mt-32">
            <Image
              src="/img-collages.webp"
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
