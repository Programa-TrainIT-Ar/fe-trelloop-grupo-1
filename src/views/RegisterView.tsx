"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import Link from "next/link";
import elipseIzquierdo from "@/assets/ellipse-1148.svg";
import elipseDerecho from "@/assets/ellipse-1147.svg";
import ilustracionUsuario from "../assets/ilustracion-usuario.svg";

import Swal from 'sweetalert2';
import "../styles/register.css";
import "../styles/globals.css";
import { registerController } from "@/controllers/registerController";


export default function RegisterView() {
    const router = useRouter();


    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });


    const [error, setError] = useState({ error: false, message: "", type: "" });
    const [mostrar, setMostrar] = useState(false);


    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev, [name]: value,
        }));
    }


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const response = await registerController(formData);
        console.log("Respuesta del controlador:", response);
        if (response.error) {
            setError({ error: true, message: response.message ?? "", type: response.type ?? "" });
            return;
        } else {
            Swal.fire({
                icon: 'success',
                text: 'Te has registrado con éxito',
                background: 'rgb(26, 26, 26)',
                iconColor: '#6A5FFF',
                color: '#FFFFFF',
                confirmButtonColor: '#6A5FFF',
                confirmButtonText: 'Cerrar',
                customClass: {
                    popup: 'swal2-dark',
                    confirmButton: 'swal2-confirm'
                },
            }).then(() => {
                router.push("/login");
            });

        }
    }

    return (
        <>
            <Image alt="elipse-izquierdo" src={elipseIzquierdo} className="elipse-izquierdo" width={0} height={0} />
            <Image alt="elipse-derecho" src={elipseDerecho} className="elipse-derecho" width={590} height={590} />

            <div className="w-full max-w-7xl mx-auto gap-4 px-8">
                <div className="flex flex-wrap justify-between">
                    <div className=" w-full md:w-5/12 flex items-center justify-center">
                        <Image src={ilustracionUsuario} alt="ilustración de usuario" width={325} height={284} />
                    </div>

                    <div className="w-full md:w-7/12 flex justify-center">
                        <form className="grid grid-cols-2 gap-4 w-[661px] mt-[80px]" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="firstName" className="label-register">
                                    Nombres<span style={{ color: "var(--global-color-primary-500)" }} >*</span>
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="mt-1 p-3 pr-10 bg-[#313131] block w-full rounded-xl border border-stone-400 text-base font-light"
                                    placeholder="Escribe tus nombres"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="label-register">
                                    Apellidos<span style={{ color: "var(--global-color-primary-500)" }} >*</span>
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="mt-1 p-3 pr-10 bg-[#313131] block w-full rounded-xl border border-stone-400 text-base font-light"
                                    placeholder="Ecribe tus apellidos"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label htmlFor="email" className="label-register">
                                    Correo electrónico<span style={{ color: "var(--global-color-primary-500)" }} >*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="mt-1 p-3 pr-10 bg-[#313131] block w-full rounded-xl border border-stone-400 text-base font-light"
                                    placeholder="Escribe tu correo electrónico"
                                    required
                                />
                                {error.type === "email" && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="password" className="label-register">
                                    Contraseña<span style={{ color: "var(--global-color-primary-500)" }} >*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={mostrar ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="mt-1 p-3 pr-10 bg-[#313131] block w-full rounded-xl border border-stone-400 text-base font-light"
                                        placeholder="Escribe tu contraseña"
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setMostrar(!mostrar)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                                    >
                                        {
                                            mostrar ? <i className="fa-solid fa-eye"></i> : <i className='fa-solid fa-eye-slash'></i>
                                        }
                                    </button>
                                </div>
                                {error.type === "password_length" && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="label-register">
                                    Confirmación de contraseña<span style={{ color: "var(--global-color-primary-500)" }} >*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={mostrar ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="mt-1 p-3 pr-10 bg-[#313131] block w-full rounded-xl border border-stone-400 text-base font-light"
                                        placeholder="Escribe tu confirmación"
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setMostrar(!mostrar)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                                    >
                                        {
                                            mostrar ? <i className="fa-solid fa-eye"></i> : <i className='fa-solid fa-eye-slash'></i>
                                        }
                                    </button>
                                </div>
                                {error.type === "password_mismatch" && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                            </div>
                            <div className="col-span-2">
                                <button
                                    type="submit"
                                    className="w-full px-6 py-2 rounded-xl text-white my-4"
                                    style={{ backgroundColor: "var(--global-color-primary-500)" }}
                                >
                                    REGISTRARME
                                </button>
                                <div className="text-register">
                                    <p className="font-light text-center text-[16px]">
                                        Al registrarme, acepto las <Link href="#" style={{ color: "var(--global-color-secondary-500)" }}>Condiciones del servicio </Link>, de Trainit y su <Link href="/registro" style={{ color: "var(--global-color-secondary-500)" }}>Política de privacidad</Link>.
                                    </p>
                                    <p className="font-light text-center text-[16px] mt-3">
                                        ¿Ya tienes cuenta? <Link href="#" style={{ color: "var(--global-color-secondary-500)" }}>Inicia sesión</Link>
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

