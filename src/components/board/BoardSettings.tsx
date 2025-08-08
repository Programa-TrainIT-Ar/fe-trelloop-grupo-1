  "use client";
  import { ChangeEvent, useState } from 'react';

  import { useRouter } from "next/navigation";
  import { FaLock, FaGlobe, FaPlus, FaTag, FaCamera, FaUser,FaTimes } from "react-icons/fa";
  import { FaMagnifyingGlass } from "react-icons/fa6";
  import {useAuthStore} from "@/store/auth";
  import Swal from 'sweetalert2';

  interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  }

  export const BoardSettings = () => {
    const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
    const [newTag, setNewTag] = useState("");
    const [visibility, setVisibility] = useState<"private" | "public">("private");
    const accessToken = useAuthStore((state) => state.accessToken);
    const userEmail = useAuthStore((state) => state.user?.email); 

    const [boardName, setBoardName] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);


    const [members, setMembers] = useState<User[]>([]);
    const [newMember, setNewMember] = useState("");
    const router = useRouter();



   

   

    const isFormValid =
      boardName.trim() !== "" &&
      description.trim() !== "" &&
      imageFile !== null;

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setImageFile(file);
      setImagePreview(file ? URL.createObjectURL(file) : null);
    };

    const handleAddMember = async () => {
      if (!newMember.trim()) return;

    
      if (userEmail && newMember.trim().toLowerCase() === userEmail.toLowerCase()) {
        await Swal.fire({
          title: 'Advertencia',
          text: 'No puedes agregarte a ti mismo como miembro',
          icon: 'warning',
          background: '#222',
          color: '#fff',
          confirmButtonText: 'Aceptar',
          customClass: {
            confirmButton: 'btn-cancel',
            popup: 'mi-modal',
          },
        });
        return;
      }

      if (!accessToken) {
        await Swal.fire({
          title: 'Error',
          text: 'No estás autenticado. Inicia sesión para continuar',
          icon: 'error',
          background: '#222',
          color: '#fff',
          confirmButtonText: 'Aceptar',
          customClass: {
            confirmButton: 'btn-cancel',
            popup: 'mi-modal',
          },
        });
        return;
      }

      try {
        const url = `${process.env.NEXT_PUBLIC_API}/board/users/search?q=${encodeURIComponent(
          newMember
        )}`;
        console.log("🔍 URL de búsqueda:", url);

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error(`Error buscando usuario (status ${res.status})`);

        const data = await res.json();
        console.log("📩 Respuesta del backend:", data);

        if (data.count === 0) {
          await Swal.fire({
            title: 'Error',
            text: 'No se encontró usuario con ese correo',
            icon: 'error',
            background: '#222',
            color: '#fff',
            confirmButtonText: 'Aceptar',
            customClass: {
              confirmButton: 'btn-cancel',
              popup: 'mi-modal',
            },
          });
          return;
        }

        const user = data.users.find(
          (u: User) =>
            u.email.toLowerCase() === newMember.trim().toLowerCase()
        );

        if (!user) {
          await Swal.fire({
            title: 'Error',
            text: 'No se encontró usuario exacto con ese correo',
            icon: 'error',
            background: '#222',
            color: '#fff',
            confirmButtonText: 'Aceptar',
            customClass: {
              confirmButton: 'btn-cancel',
              popup: 'mi-modal',
            },
          });
          return;
        }

        if (members.some((m) => m.id === user.id)) {
          await Swal.fire({
            title: 'Advertencia',
            text: 'Este miembro ya está agregado',
            icon: 'warning',
            background: '#222',
            color: '#fff',
            confirmButtonText: 'Aceptar',
            customClass: {
              confirmButton: 'btn-cancel',
              popup: 'mi-modal',
            },
          });
          return;
        }

        setMembers((prev) => [...prev, user]);
        setNewMember("");
      } catch (err) {
        console.error("💥 Error al buscar usuario:", err);
        await Swal.fire({
          title: 'Error',
          text: 'Error al buscar usuario',
          icon: 'error',
          background: '#222',
          color: '#fff',
          confirmButtonText: 'Aceptar',
          customClass: {
            confirmButton: 'btn-cancel',
            popup: 'mi-modal',
          },
        });
      }
    };


    const handleRemoveMember = (id: number) => {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    };

    const handleAddTag = async () => {
      if (!newTag.trim()) return;

      try {
     
        const searchRes = await fetch(`${process.env.NEXT_PUBLIC_API}/tag/by-name/${encodeURIComponent(newTag)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        let tagData = null;

        if (searchRes.ok) {
          const resJson = await searchRes.json();
          tagData = resJson.tag;
        } else {
          const createRes = await fetch(`${process.env.NEXT_PUBLIC_API}/tag`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: newTag }),
          });

          if (!createRes.ok) throw new Error("Error al crear etiqueta");
          const resJson = await createRes.json();
          tagData = resJson.tag;
        }

        if (tags.some((t) => t.id === tagData.id)) {
          await Swal.fire({
            title: 'Advertencia',
            text: 'Esta etiqueta ya está agregada',
            icon: 'warning',
            background: '#222',
            color: '#fff',
            confirmButtonText: 'Aceptar',
            customClass: {
              confirmButton: 'btn-cancel',
              popup: 'mi-modal',
            },
          });
          return;
        }

        setTags((prev) => [...prev, tagData]);
        setNewTag("");
      } catch (err) {
        console.error("❌ Error en etiquetas:", err);
        await Swal.fire({
          title: 'Error',
          text: 'Error al agregar etiqueta',
          icon: 'error',
          background: '#222',
          color: '#fff',
          confirmButtonText: 'Aceptar',
          customClass: {
            confirmButton: 'btn-cancel',
            popup: 'mi-modal',
          },
        });
      }
    };

    const handleRemoveTag = (id: number) => {
      setTags((prev) => prev.filter((tag) => tag.id !== id));
    };


    const handleCreateBoard = async () => {
      if (!isFormValid) return;

      if (!accessToken) {
        await Swal.fire({
          title: 'Error',
          text: 'No hay token disponible. Inicia sesión primero',
          icon: 'error',
          background: '#222',
          color: '#fff',
          confirmButtonText: 'Aceptar',
          customClass: {
            confirmButton: 'btn-cancel',
            popup: 'mi-modal',
          },
        });
        return;
      }

      const formData = new FormData();
      formData.append("name", boardName);
      formData.append("description", description);
      formData.append("isPublic", visibility === "public" ? "true" : "false");
      if (imageFile) formData.append("image", imageFile);

      members.forEach((m) => formData.append("member_ids", m.id.toString()));
      tags.forEach((t) => formData.append("tag_ids", t.id.toString()));

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/board/createBoard`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            body: formData,
          }
        );

        if (!res.ok) throw new Error("Error al crear el tablero");

        const data = await res.json();
        console.log("Tablero creado:", data);
        Swal.fire({
               icon: "success",
               text: "Tablero creado con éxito",
               background: "rgb(26, 26, 26)",
               iconColor: "#6A5FFF",
               color: "#FFFFFF",
               confirmButtonColor: "#6A5FFF",
               confirmButtonText: "Cerrar",
               customClass: {
                 popup: "swal2-dark",
                 confirmButton: "swal2-confirm",
               }
             });
        router.push("/dashboard");
      } catch (err: any) {
        console.error("❌ Error al crear el tablero:", err);
        await Swal.fire({
          title: 'Error',
          text: err.message || 'Error al crear tablero',
          icon: 'error',
          background: '#222',
          color: '#fff',
          confirmButtonText: 'Aceptar',
          customClass: {
            confirmButton: 'btn-cancel',
            popup: 'mi-modal',
          },
        });
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b  text-white p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Imagen */}
          <div>
            <label className="block font-medium mb-2 text-sm">Imagen del tablero</label>
            <div className="relative w-32 h-32 bg-zinc-800 rounded flex items-center justify-center cursor-pointer overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              ) : (
                <FaCamera className="text-gray-500 text-2xl" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block font-medium mb-2 text-sm">
              Nombre de tablero
            </label>
            <input
              type="text"
              placeholder="Escribe aquí..."
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="bg-neutral-800 px-4 py-2 rounded w-full text-sm border border-gray-700"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block font-medium mb-2 text-sm">
              Descripción
            </label>
            <textarea
              rows={4}
              placeholder="Escribe aquí..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-neutral-800 px-4 py-2 rounded w-full text-sm border border-gray-700 resize-none"
            />
          </div>

          {/* Miembros */}
          <div>
            <label className="block font-medium mb-2 text-sm">Miembros</label>
            <div className="relative">
              <input
                id="miembros"
                type="text"
                placeholder="Buscar por nombre o @usuario..."
                value={newMember}
                onChange={(e) => {const value = e.target.value;
                setNewMember(value);
                
                }}

                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
                
                className="bg-neutral-800 px-4 py-2 rounded w-full text-sm border border-gray-700 pr-10"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <FaMagnifyingGlass />
              </button>
            </div>
            {members.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {members.map((member) => (
                  <span
                    key={member.id}
                    className="px-3 py-1 rounded-full border border-gray-500 text-sm flex items-center gap-2 bg-[#2a2a2a]"
                  >
                    <FaUser className="text-gray-400" />
                    {member.first_name} {member.last_name}
                    <FaTimes
                      className="cursor-pointer text-red-400 hover:text-red-500"
                      onClick={() => handleRemoveMember(member.id)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block font-medium mb-2 text-sm">Etiquetas</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Escribe un nombre de etiqueta..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}  
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <FaPlus />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((t) => (
                  <span
                    key={t.id}
                    className="px-3 py-1 rounded-full border border-gray-500 text-sm flex items-center gap-2"
                  >
                    <FaTag className="text-gray-400" />
                    {t.name}
                    <button
                      onClick={() => handleRemoveTag(t.id)}
                      className="text-red-400 hover:text-red-600 text-xs"
                      title="Eliminar etiqueta"
                    >
                      ✖
                    </button>
                  </span>
                ))}

              </div>
            )}
          </div>

          {/* Visibilidad */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === "private"}
                onChange={() => setVisibility("private")}
                className="mt-1"
              />
              <div>
                <span className="flex items-center gap-2 text-sm font-medium">
                  <FaLock /> Privado
                </span>
                <span className="text-xs text-gray-400">
                  (Solo tú y miembros invitados pueden verlo.)
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === "public"}
                onChange={() => setVisibility("public")}
                className="mt-1"
              />
              <div>
                <span className="flex items-center gap-2 text-sm font-medium">
                  <FaGlobe /> Público
                </span>
                <span className="text-xs text-gray-400">
                  (Cualquier miembro del equipo puede acceder.)
                </span>
              </div>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-2 gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full text-state-default font-light border border-state-default rounded-lg py-3 text-sm hover:bg-background-medium transition"
            >
              Cancelar creación
            </button>
            <button
              type="button"
              disabled={!isFormValid}
              onClick={handleCreateBoard}
              className={`
                w-full bg-state-default font-light text-white rounded-lg py-3 text-sm hover:bg-state-hover transition
                ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Crear tablero
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default BoardSettings;
