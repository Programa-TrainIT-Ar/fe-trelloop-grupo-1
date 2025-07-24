"use client";
import { ChangeEvent, useState } from 'react';
import { FaLock, FaGlobe, FaPlus, FaTag, FaSearch, FaCamera } from "react-icons/fa";

export const BoardSettings = () => {
    const [tags, setTags] = useState<string[]>(["etiqueta"]);
    const [newTag, setNewTag] = useState("");
    const [visibility, setVisibility] = useState<"private" | "public">("private");

    const [boardName, setBoardName] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleAddTag = () => {
        if (newTag.trim() !== "" && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    const isFormValid =
        boardName.trim() !== "" &&
        description.trim() !== "" &&
        imageFile !== null;

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setImageFile(file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    };

    const handleCreateBoard = async () => {
        if (!isFormValid) return;
        const formData = new FormData();
        formData.append("boardName", boardName);
        formData.append("description", description);
        formData.append("visibility", visibility);
        if (imageFile) {
            formData.append("image", imageFile);
        }
        tags.forEach((tag, i) => {
            formData.append(`tags[${i}]`, tag);
        });

        try {
            //poner la ruta corecta
            const res = await fetch("/api/boards", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Error al crear el tablero");
            // manejar respuesta, limpiar formulario, etc.
        } catch (error) {
            console.error(error);
        }
    };

   return (
    <div className="min-h-screen bg-[#1c1c1c] text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Imagen del tablero */}
        <div>
          <label className="block font-medium mb-2 text-sm">Imagen del tablero</label>
          <div className="relative w-32 h-32 bg-neutral-800 rounded flex items-center justify-center cursor-pointer overflow-hidden">
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

        {/* Nombre de tablero */}
        <div>
          <label htmlFor="boardName" className="block font-medium mb-2 text-sm">
            Nombre de tablero
          </label>
          <input
            id="boardName"
            type="text"
            placeholder="Escribe aquí..."
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            className="bg-neutral-800 px-4 py-2 rounded w-full text-sm border border-gray-700"
          />
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block font-medium mb-2 text-sm">
            Descripción
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Escribe aquí..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-neutral-800 px-4 py-2 rounded w-full text-sm border border-gray-700 resize-none"
          />
        </div>

        {/* Miembros */}
        <div>
          <label htmlFor="miembros" className="block font-medium mb-2 text-sm">Miembros</label>
          <div className="relative">
            <input
              id="miembros"
              type="text"
              placeholder="Buscar por nombre o @usuario..."
              className="bg-neutral-800 px-4 py-2 rounded w-full text-sm border border-gray-700 pr-10"
            />
            <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaSearch />
            </button>
          </div>
        </div>

        {/* Etiquetas */}
        <div>
          <label htmlFor="etiquetas" className="block font-medium mb-2 text-sm">Etiquetas</label>
          <div className="relative">
            <input
              id="etiquetas"
              type="text"
              className="bg-neutral-800 px-4 py-2 rounded w-full text-sm border border-gray-700"
              placeholder="Escribe un nombre de etiqueta para crearla..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <FaPlus />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full border border-gray-500 text-sm flex items-center gap-1"
              >
                <FaTag className="text-gray-400" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Visibilidad */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={visibility === 'private'}
              onChange={() => setVisibility('private')}
              className="mt-1"
            />
            <div className="flex flex-col">
              <span className="flex items-center gap-2 text-sm font-medium">
                <FaLock className="text-white" />
                <span>Privado</span>
              </span>
              <span className="text-xs text-gray-400">
                (Solo tú y los miembros invitados pueden verlo.)
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
              className="mt-1"
            />
            <div className="flex flex-col">
              <span className="flex items-center gap-2 text-sm font-medium">
                <FaGlobe className="text-white" />
                <span>Público</span>
              </span>
              <span className="text-xs text-gray-400">
                (Cualquier miembro del equipo puede acceder.)
              </span>
            </div>
          </label>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            className="bg-[#1f1f1f] border border-gray-500 text-white px-6 py-2 rounded text-sm hover:bg-[#2a2a2a]"
          >
            Cancelar creación
          </button>
          <button
            type="button"
            disabled={!isFormValid}
            onClick={handleCreateBoard}
            className={`
              bg-purple-600 text-white px-6 py-2 rounded text-sm
              ${!isFormValid ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"}
            `}
          >
            Crear tablero
          </button>
        </div>
      </div>
    </div>
  );
};