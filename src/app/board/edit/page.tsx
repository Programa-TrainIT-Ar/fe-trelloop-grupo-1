'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaCamera, FaLock, FaGlobe, FaPlus, FaTag, FaTimes, FaSearch } from 'react-icons/fa';
import { getBoardById, updateBoardById } from '@/services/boardService';

interface Member {
  id: number;
  username: string;
  email: string;
}

function EditBoardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const boardId = searchParams.get('id');

  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener token desde auth-storage
    let storedToken = null;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        storedToken = authData?.state?.accessToken;
      }
    } catch (error) {
      console.error('Error al parsear auth-storage:', error);
    }
    
    // Si no hay token, redirigir al login
    if (!storedToken) {
      router.push('/login');
      return;
    }
    
    // Si no hay boardId, detener la carga
    if (!boardId) {
      setLoading(false);
      return;
    }

    setToken(storedToken);

    // Cargar datos del tablero
    getBoardById(boardId, storedToken)
      .then((data) => {
        console.log("Datos del tablero recibidos:", data);
        
        // Asignar valores usando los nombres correctos de los campos
        setName(data?.name || '');
        setDescription(data?.description || '');
        setTags(data?.tags || []);
        setVisibility(data?.isPublic ? 'public' : 'private');
        setImagePreview(data?.image || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar el tablero:', err);
        setLoading(false);
      });
  }, [boardId, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!token || !boardId) return;

    const data = {
      name,
      description,
      isPublic: visibility === 'public',
      tags
    };

    try {
      await updateBoardById(boardId, data, token);
      alert('✅ Tablero actualizado');
      router.push('/board');
    } catch (err: any) {
      alert('❌ Error al actualizar: ' + err.message);
    }
  };

  if (loading) {
    return <p className="p-4">Cargando...</p>;
  }
  
  if (!token) {
    return (
      <div className="p-4">
        <p>Error: No se encontró token de autenticación</p>
        <p>Revisa la consola para más detalles</p>
      </div>
    );
  }
  
  if (!boardId) {
    return <p className="p-4">Error: ID del tablero no encontrado</p>;
  }
  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Título de la página */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            Edición de tablero | {name || 'Cargando...'}
          </h1>
        </div>
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

        {/* Nombre del tablero */}
        <div>
          <label htmlFor="boardName" className="block font-medium mb-2 text-sm">
            Nombre de tablero
          </label>
          <input
            id="boardName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[41px]"
            placeholder="Escribe aquí"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block font-medium mb-2 text-sm">
            Descripción
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[127px]"
            placeholder="Escribe aquí"
            required
          />
        </div>

        {/* Miembros */}
        <div>
          <label htmlFor="members" className="block font-medium mb-2 text-sm">
            Miembros
          </label>
          <div className="relative">
            <input
              id="members"
              type="text"
              placeholder="Buscar por nombre o @usuario..."
              className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[41px]"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <FaSearch style={{ fontSize: "20px" }} />
            </button>
          </div>
        </div>

        {/* Etiquetas */}
        <div>
          <label htmlFor="tags" className="block font-medium mb-2 text-sm">
            Etiquetas
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
                <FaTimes 
                  className="cursor-pointer hover:text-red-400 transition"
                  onClick={() => handleRemoveTag(i)} 
                />
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

        {/* Botones de cancelar y guardar */}
        <div className="pt-6 flex gap-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-state-default font-light border border-state-default rounded-lg px-16 py-2 text-sm hover:bg-background-medium transition"
          >
            Cancelar edición
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-state-default font-light text-white rounded-lg px-16 py-2 text-sm hover:bg-state-hover transition"
          >
            Actualizar tablero
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditBoardPage;