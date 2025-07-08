import React from "react";

const Home: React.FC = () => {

  return (
    <section className="bg-gray-900 text-white py-16">
      <div className="container mx-auto flex flex-col lg:flex-row items-start px-6 lg:px-0">
        {/* Left side: heading and call-to-action */}
        <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
          <h1 className="text-4xl font-bold mb-4 flex items-center">
            Make it
            {/* Inline SVG arrow icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="ml-4 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </h1>
          <p className="text-xl italic mb-6">Happen</p>
          <p className="mb-6 text-gray-300">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded transition"
            onClick={() => {
              // TODO: logica de navigate
            }}
          >
            Crear cuenta
          </button>
        </div>

        {/* Right side grid: solo una imagen desde public */}
        <div className="w-full lg:w-1/2 flex justify-center items-center mt-16 lg:mt-32">
          <img
            src="/img-collages.webp"
            alt="Imagen principal"
            className="rounded-lg shadow-lg max-w-full h-auto"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

export default Home;


