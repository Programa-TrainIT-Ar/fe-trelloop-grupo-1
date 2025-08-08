"use client";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FaLock, FaGlobe, FaPlus, FaTag, FaCamera, FaUser, FaTimes } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useAuthStore } from "@/store/auth";
import Swal from "sweetalert2";

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

  const isFormValid = boardName.trim() !== "" && description.trim() !== "" && imageFile !== null;

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleAddMember = async () => {
    if (!newMember.trim()) return;

    if (userEmail && newMember.trim().toLowerCase() === userEmail.toLowerCase()) {
      await Swal.fire("Aviso", "⚠️ No puedes agregarte a ti mismo como miembro", "warning");
      return;
    }

    if (!accessToken) {
      await Swal.fire("Error", "No estás autenticado. Inicia sesión para continuar", "error");
      return;
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API}/board/users/search?q=${encodeURIComponent(newMember)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error(`Error buscando usuario (status ${res.status})`);
      const data = await res.json();

      if (data.count === 0) {
        await Swal.fire("Sin resultados", "❌ No se encontró usuario con ese correo", "error");
        return;
      }

      const user: User | undefined = data.users.find(
        (u: User) => u.email.toLowerCase() === newMember.trim().toLowerCase()
      );

      if (!user) {
        await Swal.fire("Error", "❌ No se encontró usuario exacto con ese correo", "error");
        return;
      }

      if (members.some((m) => m.id === user.id)) {
        await Swal.fire("Aviso", "⚠️ Este miembro ya está agregado", "warning");
        return;
      }

      setMembers((prev) => [...prev, user]);
      setNewMember("");
    } catch (err) {
      console.error("💥 Error al buscar usuario:", err);
      await Swal.fire("Error", "❌ Error al buscar usuario", "error");
    }
  };

  const handleRemoveMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    if (!accessToken) {
      await Swal.fire("Error", "No estás autenticado. Inicia sesión para continuar", "error");
      return;
    }

    try {
      const searchRes = await fetch(
        `${process.env.NEXT_PUBLIC_API}/tag/by-name/${encodeURIComponent(newTag)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      let tagData: { id: number; name: string } | null = null;

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

        if (!createRes.ok) throw new Error("Error creando etiqueta");
        tagData = await createRes.json();
      }

      if (!tagData) return;

      if (tags.some((t) => t.id === tagData.id)) {
        await Swal.fire("Aviso", "⚠️ Esta etiqueta ya está agregada", "warning");
        return;
      }

      setTags((prev) => [...prev, tagData]);
      setNewTag("");
    } catch (err) {
      console.error("❌ Error en etiquetas:", err);
      await Swal.fire("Error", "❌ Error al agregar etiqueta", "error");
    }
  };

  const handleRemoveTag = (id: number) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateBoard = async () => {
    if (!isFormValid) return;

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

      await Swal.fire("Éxito", "Tablero creado con éxito", "success");
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      console.error("❌ Error al crear el tablero:", err);
      await Swal.fire("Error", errorMessage, "error");
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
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm placeholder-white/40 outline-none"
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
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm placeholder-white/40 outline-none resize-none"
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
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddMember())}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 pr-11 text-sm placeholder-white/40 outline-none"
            />
            <button
              type="button"
              onClick={handleAddMember}
              className="absolute right-2 top-1/2 -translate-y-1/2"
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
                  <FaUser className="text-white/70" />
                  <span>{member.first_name} {member.last_name}</span>
                  <button
                    className="ml-1 text-red-400 hover:text-red-300"
                    onClick={() => handleRemoveMember(member.id)}
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
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 pr-11 text-sm placeholder-white/40 outline-none"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <FaPlus className="h-4 w-4" />
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-sm flex items-center gap-2"
                >
                  <FaTag className="text-white/60" />
                  {t.name}
                  <button
                    onClick={() => handleRemoveTag(t.id)}
                    className="text-red-400 hover:text-red-300"
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
            />
            <div>
              <span className="flex items-center gap-2 text-sm font-medium">
                <FaLock /> Privado
              </span>
              <span className="text-xs text-gray-400">(Solo tú y miembros invitados pueden verlo)</span>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
            />
            <div>
              <span className="flex items-center gap-2 text-sm font-medium">
                <FaGlobe /> Público
              </span>
              <span className="text-xs text-gray-400">(Cualquier miembro del equipo puede acceder)</span>
            </div>
          </label>
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-4 pt-6">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="border border-white/15 rounded-lg py-3 text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!isFormValid}
            onClick={handleCreateBoard}
            className={`bg-purple-600 rounded-lg py-3 text-sm ${!isFormValid ? "opacity-50" : ""}`}
          >
            Crear tablero
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardSettings;
