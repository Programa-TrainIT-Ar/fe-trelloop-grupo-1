'use client';
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FaLock, FaGlobe, FaPlus, FaTag, FaSearch, FaTimes, FaCamera } from "react-icons/fa";
import Swal from "sweetalert2";
import React from 'react';
import { useSearchParams } from 'next/dist/client/components/navigation';

const EditBoardPage: React.FC = () => {
  const searchParams = useSearchParams();
  const boardId = searchParams?.get("id");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>(["etiqueta"]);
  const [newTag, setNewTag] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!boardId) return;

    const fetchBoard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}getBoard/${boardId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setTitle(data.name || "");
          setDescription(data.description || "");
          setVisibility(data.is_public ? "public" : "private");
          setTags(data.tags || []);
          if (data.image_url) {
            setImagePreview(data.image_url);
          }
        } else {
          Swal.fire("Error", data.error || "No se pudo cargar el tablero", "error");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Error al conectar con el servidor", "error");
      } 
    };

    fetchBoard();
  }, [boardId]);


  const updateBoard = async () => {
    const formData = new FormData();
    formData.append("name", title);
    formData.append("description", description);
    formData.append("isPublic", visibility === "public" ? "true" : "false");
    if (imageFile) {
      formData.append("image", imageFile);
    }

   formData.append("tags", JSON.stringify(tags));

   try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/updateBoard/${boardId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire("Éxito", "Tablero actualizado correctamente", "success");
      } else {
        Swal.fire("Error", data.error || "No se pudo actualizar el tablero", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Ocurrió un error al actualizar", "error");
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (

    <div className="min-h-screen bg-[#1c1c1c] text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
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
        <div>
          <label htmlFor="boardName" className="block font-medium mb-2 text-sm">
            Nombre de tablero
          </label>
          <input
            id="boardName"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[41px]"
            placeholder="Escribe aquí"
            required
          />
        </div>



        <div>
          <label htmlFor="description" className="block font-medium mb-2 text-sm">
            Descripción
          </label>
          <textarea
            id="description"
            className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[127px]"
            placeholder="Escribe aquí"
            required
          />

        </div>
        {/* Miembros */}
        <div>
          <label htmlFor="members" className="block font-medium mb-2 text-sm">
            Miembros{' '}

          </label>
          <div className="relative">
            <input
              id="members"
              type="text"
              placeholder="Buscar por nombre o @usuario..."
              className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[41px]"
            />
            <button
              type='button'
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <FaSearch style={{ fontSize: "20px" }} />
            </button>
          </div>
        </div>

        {/* Etiquetas */}
        <div>
          <label htmlFor="tags" className="block font-medium mb-2 text-sm">
            Etiquetas{' '}

          </label>
          <div className="relative">
            <input
              id="tags"
              type="text"
              className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[41px]"
              placeholder="Escribe un nombre de etiqueta para crearla..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <FaPlus style={{ fontSize: "20px" }} />

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
                <FaTimes className="cursor-pointer' hover:text-red-400 transition"
                  onClick={() => handleRemoveTag(i)} />
              </span>
            ))}
          </div>
        </div>

        {/* Visibilidad */}
        <div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
                className="mt-1 h-[18px] w-[18px] appearance-none rounded-full border border-gray-400 checked:bg-[var(--global-color-primary-600)]"
                style={{ accentColor: 'var(--global-color-primary-600)' }}
              />
              <div className="flex items-start gap-2">
                <FaLock className="text-white mt-1" />

                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-white">Privado</span>
                  <span className="text-xs text-gray-400">
                    (Solo tú y los miembros invitados pueden verlo.)
                  </span>
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
                className="mt-1 h-[18px] w-[18px] appearance-none rounded-full border border-gray-400 checked:bg-[var(--global-color-primary-600)]"
                style={{ accentColor: 'var(--global-color-primary-600)' }}
              />
              <div className="flex items-start gap-2">

                <FaGlobe className="text-white mt-1" />
                <div className="flex flex-col leading-tight">
                  <span>Público</span>

                  <span className="text-xs text-gray-400">
                    (Cualquier miembro del equipo puede acceder.)
                  </span>
                </div>
              </div>
            </label>
          </div>
        </div>


        {/*Botones de cancelar y guardar*/}

        <div className='pt-6 flex gap-2'>
          <button
            type='button'
            className='text-state-default font-light border border-state-default rounded-lg px-16 py-2 text-sm hover:bg-background-medium transition'>
            Cancelar edición
          </button>
          <button
            type='button'
            className='bg-state-default font-light text-white rounded-lg px-16 py-2 text-sm hover:bg-state-hover transition'>
            Actualizar tablero
          </button>
        </div>
      </div >
    </div >


  );
};


export default EditBoardPage;


