"use client";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FaLock, FaGlobe, FaPlus, FaTag, FaCamera, FaUser, FaTimes } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useAuthStore } from "@/store/auth";

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

    // esto evita agregarse a sí mismo
    if (userEmail && newMember.trim().toLowerCase() === userEmail.toLowerCase()) {
      alert("⚠️ No puedes agregarte a ti mismo como miembro");
      return;
    }

    if (!accessToken) {
      alert("No estás autenticado. Inicia sesión para continuar.");
      return;
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API}/board/users/search?q=${encodeURIComponent(newMember)}`;
      console.log("🔍 URL de búsqueda:", url);

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error(`Error buscando usuario (status ${res.status})`);

      const data = await res.json();

      if (data.count === 0) {
        alert("❌ No se encontró usuario con ese correo");
        return;
      }

      const user: User | undefined = data.users.find(
        (u: User) => u.email.toLowerCase() === newMember.trim().toLowerCase()
      );

      if (!user) {
        alert("❌ No se encontró usuario exacto con ese correo");
        return;
      }

      if (members.some((m) => m.id === user.id)) {
        alert("⚠️ Este miembro ya está agregado");
        return;
      }

      setMembers((prev) => [...prev, user]);
      setNewMember("");
    } catch (err) {
      console.error("💥 Error al buscar usuario:", err);
      alert("❌ Error al buscar usuario");
    }
  };

  const handleRemoveMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    if (!accessToken) {
      alert("No estás autenticado. Inicia sesión para continuar.");
      return;
    }

    try {
      // 1) buscar si existe por nombre
      const searchRes = await fetch(
        `${process.env.NEXT_PUBLIC_API}/tag/by-name/${encodeURIComponent(newTag)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      let tagData: { id: number; name: string } | null = null;

      if (searchRes.ok) {
        const resJson = await searchRes.json();
        tagData = resJson.tag;
      } else {
        // 2) si no existe, crearla
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

      if (!tagData) return;

      if (tags.some((t) => t.id === tagData!.id)) {
        alert("⚠️ Esta etiqueta ya está agregada");
        return;
      }

      setTags((prev) => [...prev, tagData!]);
      setNewTag("");
    } catch (err) {
      console.error("❌ Error en etiquetas:", err);
      alert("❌ Error al agregar etiqueta");
    }
  };

  const handleRemoveTag = (id: number) => {
    setTags((prev) => prev.filter((tag) => tag.id !== id));
  };

  const handleCreateBoard = async () => {
    if (!isFormValid) return;

    if (!accessToken) {
      alert("No hay token disponible. Inicia sesión primero.");
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/board/createBoard`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Error al crear el tablero");

      const data = await res.json();
      console.log("Tablero creado:", data);
      alert("✅ Tablero creado exitosamente");
      router.push("/dashboard");
    } catch (err) {
      console.error("❌ Error al crear el tablero:", err);
      alert("❌ Error al crear el tablero");
    }
  };

  return (
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
          <label className="block font-medium mb-2 text-sm">Nombre de tablero</label>
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
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm placeholder-white/40 outline-none resize-none focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/30 transition"
          />
        </div>

        {/* Miembros */}
        <div>
          <label className="block font-medium mb-2 text-sm">Miembros</label>
          <div className="relative">
            <input
              type="email"
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
                    <span className="block text-sm">{member.first_name} {member.last_name}</span>
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
            disabled={!isFormValid}
            onClick={handleCreateBoard}
            className={`w-full bg-purple-600 font-light text-white rounded-lg py-3 text-sm hover:bg-purple-700 transition ${
              !isFormValid ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Crear tablero
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardSettings;
