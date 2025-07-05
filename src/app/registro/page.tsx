"use client";

export default function Registro() {
    return (
        <main className="p-4">

            <h1 className="text-2xl font-bold mb-4">Registro de usuario</h1>

            <form className="container">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="Nombres" className="block text-sm font-medium text-white">Nombres</label>
                        <input
                            type="text"
                            id="Nombres"
                            name="Nombres"
                            className="mt-1 p-3 bg-[#313131] block w-full border-gray rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Escribe tus nombres"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="Apellidos" className="text-sm font-medium text-white">Apellidos</label>
                        <input type="text"
                            id="Apellidos"
                            name="Apellidos"
                            className="mt-1 p-3 bg-[#313131] block w-full border-gray rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Ecribe tus apellidos"
                            required />

                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="Correo electrónico" className="text-sm col-start-1 col-end-3 font-medium text-white">Correo electrónico*</label>
                        <input type="text"
                            id="Correo"
                            name="Correo"
                            className="mt-1 p-3 bg-[#313131] block w-full border-gray rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Escribe tu correo electrónico"
                            required />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="Contraseña" className="text-sm font-medium text-white">Contraseña*</label>
                        <input type="password"
                            id="Contraseña"
                            name="Contraseña"
                            className="mt-1 p-3 bg-[#313131] block w-full border-gray rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Escribe tu contraseña"
                            required />
                    </div>
                    <div>
                        <label htmlFor="Conformación de contraseña" className="text-sm font-medium text-white">Confirmación de contraseña*<a href=""></a></label>
                        <input type="password"
                            id="Contraseña"
                            name="Contraseña"
                            className="mt-1 p-3 bg-[#313131] block w-full border-gray rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Escribe tu confirmación"
                            required />
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <button className="col-span-full px-6 py-2 rounded-xl  text-white" style={{ backgroundColor: "#6a5fff" }}>Registrarme

                        </button>

                    </div>
                </div>
                <div>
                    Al registrarme, acepto las Condiciones del servicio, de Trainit y su Política de privacidad.
                </div>
                <div>
                    ¿Ya tienes cuenta? Inicia sesión
                </div>


            </form>

        </main>
    );
}