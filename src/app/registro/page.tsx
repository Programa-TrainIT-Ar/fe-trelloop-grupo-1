"use client";


import { useState } from "react";
import Image from 'next/image';
import Link from "next/link";
import user from '@/assets/user.png';



export default function Registro() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [mostrar, setMostrar] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            alert("Todos los campos son obligatorios");
            return;
        }
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            alert("Ingresa un correo válido");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            alert("las contraseñas no coinciden");
            return;
        }
        console.log("datos enviados:", formData);

        try {
            const response = await fetch("http://localhost:5000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: formData.firstName + " " + formData.lastName,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert("error:" + (errorData.message || "no se pudo registrar el usuario"));
                return;
            }

            alert("Registration successful!");
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
            });

        } catch (error) {
            alert("Network error or server not reachable.");
            console.error(error);
        }
    };



    return (
        <main className="min-h-screen flex items-start pt-16 text-white">
            <div className="w-full max-w-7xl mx-auto grid grid-cols-2 gap-4 px-8">

                <div className=" flex items-center justify-center">
                    <Image src={user} alt="Logo TrainIT" width={180} />
                </div>

                <div className="flex flex-col justify-center">
                    <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-white">Nombres<span style={{ color: "var(--global-color-primary-500)" }} >*</span></label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName} onChange={handleChange}
                                className="mt-1 p-3 bg-[#313131] block w-full  rounded-xl border border-stone-400 sm:text-sm font-light"
                                placeholder="Escribe tus nombres"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="text-sm font-medium text-white">Apellidos<span style={{ color: "var(--global-color-primary-500)" }} >*</span></label>
                            <input type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName} onChange={handleChange}
                                className="mt-1 p-3 bg-[#313131] block w-full border border-stone-400 rounded-xl sm:text-sm font-light"
                                placeholder="Ecribe tus apellidos"
                                required />

                        </div>

                        <div className="col-span-2">
                            <label htmlFor="email" className="text-sm font-medium text-white">Correo electrónico<span style={{ color: "var(--global-color-primary-500)" }} >*</span></label>
                            <input type="email"
                                id="email"
                                name="email"
                                value={formData.email} onChange={handleChange}
                                className="mt-1 p-3 bg-[#313131] block w-full rounded-xl border border-stone-400 sm:text-sm font-light"
                                placeholder="Escribe tu correo electrónico"
                                required />
                        </div>

                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-white">Contraseña<span style={{ color: "var(--global-color-primary-500)" }} >*</span></label>
                            <div className="relative">
                                <input type={mostrar ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password} onChange={handleChange}
                                    className="mt-1 p-3 pr-10 bg-[#313131] block w-full rounded-xl border border-stone-400 sm:text-sm font-light"
                                    placeholder="Escribe tu contraseña"
                                    required />
                                <button type="button" onClick={() => setMostrar(!mostrar)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <svg className="size-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-white">Confirmación de contraseña<span style={{ color: "var(--global-color-primary-500)" }} >*</span></label>
                            <div className="relative">
                                <input type={mostrar ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword} onChange={handleChange}
                                    className="mt-1 p-3 pr-10 bg-[#313131] block w-full rounded-xl border border-stone-400 sm:text-sm font-light"
                                    placeholder="Escribe tu confirmación"
                                    required />
                                <button type="button" onClick={() => setMostrar(!mostrar)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white">
                                    <svg className="size-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>

                                </button>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <button
                                type="submit"
                                className="w-full px-6 py-2 rounded-xl text-white my-4"
                                style={{ backgroundColor: "var(--global-color-primary-500)" }}
                            >
                                REGISTRARME
                            </button>
                            <div className="text-center">
                                <p className="text-sm font-light">Al registrarme, acepto las <Link href="/registro" style={{ color: "var(--global-color-secondary-500)" }}>Condiciones del servicio </Link>, de Trainit y su <Link href="/registro" style={{ color: "var(--global-color-secondary-500)" }}>Política de privacidad</Link>.</p>
                                <p className="text-sm mt-6 font-light">¿Ya tienes cuenta? <Link href="/registro" style={{ color: "var(--global-color-secondary-500)" }}>Inicia sesión</Link></p>
                            </div>
                        </div>
                    </form>
                </div>


            </div>


        </main >
    );
}
