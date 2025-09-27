"use client";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FaLock, FaGlobe, FaPlus, FaTag, FaCamera, FaUser, FaTimes } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useAuthStore } from "@/store/auth";
import { useBoardStore } from "@/store/boards";
import Swal from "sweetalert2";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

const alertError = async (msg: string) =>
  Swal.fire({
    icon: "error",
    text: msg,
    background: "rgb(26, 26, 26)",
    iconColor: "#6A5FFF",
    color: "#FFFFFF",
    confirmButtonColor: "#6A5FFF",
    confirmButtonText: "Cerrar",
    customClass: {
      popup: "swal2-dark",
      confirmButton: "swal2-confirm",
    },
  });

export const BoardSettings = () => {
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [newTag, setNewTag] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");

  const accessToken = useAuthStore((s) => s.accessToken);
  const userEmail = useAuthStore((s) => s.user?.email);
  const { boards } = useBoardStore();

  const [boardName, setBoardName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [members, setMembers] = useState<User[]>([]);
  const [newMember, setNewMember] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);

  const router = useRouter();

  const isFormValid =
    boardName.trim() !== "" &&
    description.trim() !== "" ;
    

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleAddMember = async () => {
    const value = newMember.trim();
    console.log('🔍 Valor completo del input:', value);
    console.log('🔍 Longitud del valor:', value.length);
    if (!value) return;

    if (userEmail && value.toLowerCase() === userEmail.toLowerCase()) {
      await alertError("No puedes agregarte a ti mismo como miembro");
      return;
    }
    if (!accessToken) {
      await alertError("No estás autenticado. Inicia sesión para continuar.");
      return;
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API}/board/users/search?q=${encodeURIComponent(
        value
      )}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`Búsqueda falló (status ${res.status})`);

      const data = await res.json();

      if (data.count === 0) {
        await alertError("No se encontró usuario con ese correo.");
        return;
      }

      // por ahora añadimos por correo exacto (tu regla)
      const user: User | undefined = data.users.find(
        (u: User) => u.email.toLowerCase() === value.toLowerCase()
      );
      if (!user) {
        await alertError("No se encontró usuario exacto con ese correo.");
        return;
      }
      if (members.some((m) => m.id === user.id)) {
        await alertError("Ese miembro ya está agregado.");
        return;
      }

      setMembers((prev) => [...prev, user]);
      setNewMember("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al buscar usuario";
      await alertError(msg);
    }
  };

  const handleRemoveMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddTag = async () => {
    const value = newTag.trim();
    if (!value) return;

    if (!accessToken) {
      await alertError("No estás autenticado. Inicia sesión para continuar.");
      return;
    }

    try {
      // 1) Buscar si existe
      const searchRes = await fetch(
        `${process.env.NEXT_PUBLIC_API}/tag/by-name/${encodeURIComponent(value)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      let tagData: { id: number; name: string } | null = null;

      if (searchRes.ok) {
        const resJson = await searchRes.json();
        tagData = resJson.tag;
      } else {
        // 2) Crear si no existe
        const createRes = await fetch(`${process.env.NEXT_PUBLIC_API}/tag`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: value }),
        });
        if (!createRes.ok) throw new Error("Error al crear la etiqueta");
        const resJson = await createRes.json();
        tagData = resJson.tag;
      }

      if (!tagData) return;
      if (tags.some((t) => t.id === tagData!.id)) {
        await alertError("Esa etiqueta ya está agregada.");
        return;
      }

      setTags((prev) => [...prev, tagData!]);
      setNewTag("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al agregar etiqueta";
      await alertError(msg);
    }
  };

  const handleRemoveTag = (id: number) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateBoard = async () => {
    if (!isFormValid || isCreating) return;

    // Prevenir múltiples requests en menos de 2 segundos
    const now = Date.now();
    if (now - lastRequestTime < 2000) {
      await alertError("Por favor espera un momento antes de crear otro tablero.");
      return;
    }
    setLastRequestTime(now);

    if (!accessToken) {
      await alertError("No hay token disponible. Inicia sesión primero.");
      return;
    }

    setIsCreating(true);

    // Verificar nombres duplicados usando el store de boards
    if (boards && boards.length > 0) {
      const existingNames = boards.map((board: any) => {
        const name = board.name || board.title || board.boardName;
        return name?.toLowerCase();
      }).filter(Boolean);
      
      if (existingNames.includes(boardName.trim().toLowerCase())) {
        await alertError("Ya existe un tablero con ese nombre. Por favor, elige otro nombre.");
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", boardName.trim());

    const safeDescription = validateDescription(description);
  
    formData.append("description", safeDescription);
    formData.append("isPublic", visibility === "public" ? "true" : "false");
    if (imageFile) formData.append("image", imageFile);

    // NO agregar miembros aquí - los agregaremos después
    
    // Eliminar duplicados de tags
    const uniqueTagIds = [...new Set(tags.map(t => t.id))];
    uniqueTagIds.forEach((tagId) => formData.append("tag_ids", tagId.toString()));

    try {
      // 1. Crear el tablero sin miembros
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/board/createBoard`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 409 || errorText.includes('nombre') || errorText.includes('name')) {
          throw new Error("Ya existe un tablero con ese nombre. Por favor, elige otro nombre.");
        }
        throw new Error(`Error al crear el tablero: ${res.status} - ${errorText}`);
      }

      const boardData = await res.json();
      const boardId = boardData.board?.id || boardData.id;
      
      if (!boardId) {
        throw new Error("No se pudo obtener el ID del tablero creado");
      }

      // 2. Agregar miembros uno por uno para disparar notificaciones
      if (members.length > 0) {
        for (const member of members) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_API}/board/addMember/${boardId}`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ member_id: member.id }),
            });
          } catch (memberErr) {
            console.warn(`Error al agregar miembro ${member.email}:`, memberErr);
          }
        }
      }

      await Swal.fire({
        icon: "success",
        text: `Tablero "${boardName}" creado con éxito`,
        background: "rgb(26, 26, 26)",
        iconColor: "#6A5FFF",
        color: "#FFFFFF",
        confirmButtonColor: "#6A5FFF",
        confirmButtonText: "Cerrar",
        customClass: {
          popup: "swal2-dark",
          confirmButton: "swal2-confirm",
        },
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear el tablero";
      await alertError(msg);
    } finally {
      setIsCreating(false);
    }
  };
  
  const validateDescription = (desc: string) => {
  
    const raw = desc;

  
  return raw.slice(0, 200);
};

  return (
    // Sin bg para heredar el gris del layout
    <div className="min-h-screen text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Imagen */}
        <div>
          <label className="block font-medium mb-2 text-sm">Imagen del tablero</label>
          <div className="relative w-32 h-32 bg-neutral-800 rounded flex items-center justify-center cursor-pointer overflow-hidden border border-white/10">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
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
          <label className="block font-medium mb-2 text-sm">Nombre de tablero *</label>
          <input
            type="text"
            placeholder="Escribe aquí..."
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm placeholder-white/40 outline-none focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/30 transition"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block font-medium mb-2 text-sm">Descripción</label>
          <textarea
            rows={4}
            placeholder="Escribe aquí..."
            value={description}
            onChange={(e) => setDescription(validateDescription(e.target.value))}
            
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm placeholder-white/40 outline-none resize-none focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/30 transition"
          />
          <p>{description.length}/200</p>
        </div>

        {/* Miembros */}
        <div>
          <label className="block font-medium mb-2 text-sm">Miembros</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por correo..."
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddMember();
                }
              }}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 pr-11 text-sm placeholder-white/40 outline-none focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/30 transition"
            />
            <button
              type="button"
              onClick={handleAddMember}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-lg px-2 py-1 text-white/60 hover:text-white/90 hover:bg-white/5 transition"
              title="Agregar miembro"
            >
              <FaMagnifyingGlass className="h-5 w-5" />
            </button>
          </div>

          {members.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {members.map((member) => (
                <span
                  key={member.id}
                  className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <FaUser className="text-white/70 text-sm" />
                  </span>

                  <span className="leading-tight">
                    <span className="block text-sm">
                      {member.first_name} {member.last_name}
                    </span>
                    <span className="block text-[11px] text-white/50">{member.email}</span>
                  </span>

                  <button
                    className="ml-1 inline-flex items-center justify-center rounded-full p-1 text-red-400 hover:bg-red-400/10 hover:text-red-300 transition"
                    onClick={() => handleRemoveMember(member.id)}
                    title="Quitar"
                  >
                    <FaTimes />
                  </button>
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
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 pr-11 text-sm placeholder-white/40 outline-none focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/30 transition"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-lg px-2 py-1 text-white/60 hover:text-white/90 hover:bg-white/5 transition"
              title="Agregar etiqueta"
            >
              <FaPlus className="h-4 w-4" />
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-sm inline-flex items-center gap-2"
                >
                  <FaTag className="text-white/60" />
                  {t.name}
                  <button
                    onClick={() => handleRemoveTag(t.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full px-1 text-xs"
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
              <span className="text-xs text-gray-400">(Solo tú y miembros invitados pueden verlo.)</span>
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
              <span className="text-xs text-gray-400">(Cualquier miembro del equipo puede acceder.)</span>
            </div>
          </label>
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-4 pt-6">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full text-white/80 font-light border border-white/15 rounded-lg py-3 text-sm hover:bg-white/5 transition"
          >
            Cancelar creación
          </button>
          <button
            type="button"
            disabled={!isFormValid || isCreating}
            onClick={handleCreateBoard}
            className={`w-full bg-purple-600 font-light text-white rounded-lg py-3 text-sm hover:bg-purple-700 transition ${!isFormValid || isCreating ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {isCreating ? "Creando..." : "Crear tablero"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardSettings;
