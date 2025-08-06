'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaPlus, FaTag, FaTimes, FaSearch } from 'react-icons/fa';
import PrioritySelector from '@/components/card/PrioritySelector';
import PriorityBadge from '@/components/card/PriorityBagde';

function CreateCardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const boardId = searchParams.get('boardId');

  const [token, setToken] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lead, setLead] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');


  const [priorityInput, setPriorityInput] = useState('');
  const [priority, setPriority] = useState<'Baja' | 'Media' | 'Alta' | ''>('');
  const [showSuggestions, setShowSuggestions] = useState(false);


  useEffect(() => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        const storedToken = authData?.state?.accessToken;
        if (storedToken) {
          setToken(storedToken);
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error al obtener token:', error);
      router.push('/login');
    }
  }, [router]);

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

  const handleCreateCard = async () => {
    if (!token || !boardId || !title.trim()) return;

    const cardData = {
      title,
      description,
      tags,
      priority,
      boardId
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/board/createCard`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      });

      if (!res.ok) throw new Error('Error al crear la tarjeta');

      alert('✅ Tarjeta creada exitosamente');
      router.push('/dashboard');
    } catch (err: any) {
      alert('❌ Error al crear tarjeta: ' + err.message);
    }
  };

  if (!token) {
    return <p className="p-4">Cargando...</p>;
  }

  if (!boardId) {
    return <p className="p-4">Error: ID del tablero no encontrado</p>;
  }

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl text-left font-bold text-white">Crear Nueva Tarjeta</h1>
          <p className="text-gray-400">Tablero ID: {boardId}</p>
        </div>

        <div>
          <label htmlFor="title" className="block font-medium mb-2 text-sm">
            Título de la tarjeta *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[41px]"
            placeholder="Escribe el título de la tarjeta..."
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block font-medium mb-2 text-sm">
            Descripción
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[127px]"
            placeholder="Escribe aquí ..."
          />
        </div>

        <div>
          <label htmlFor="lead" className="block font-medium mb-2 text-sm">
            Responsables
          </label>
          <div className="relative">
            <input
              id="lead"
              type="text"
              value={lead}
              onChange={(e) => setLead(e.target.value)}
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
        <div>
          <div>
            <label className="block font-medium mb-2 text-sm">Prioridad</label>
            <PrioritySelector value={priority} onChange={setPriority} />
            {priority && <PriorityBadge label={priority} />}
          </div>


          <div>
            <label htmlFor="tags" className="block font-medium mb-2 mt-5 text-sm">
              Etiquetas
            </label>
            <div className="relative">
              <input
                id="tags"
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="mt-2 p-3 pr-10 bg-[#313131] block w-full rounded-xl border-2 border-[#3C3C3CB2] text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500"
                placeholder="Agregar etiqueta..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
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
                  <FaTimes
                    className="cursor-pointer hover:text-red-400 transition"
                    onClick={() => handleRemoveTag(i)}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-state-default font-light border border-state-default rounded-lg px-16 py-2 text-sm hover:bg-background-medium transition"
            >
              Cancelar edición
            </button>
            <button
              onClick={handleCreateCard}
              disabled={!title.trim()}
              className="bg-state-default font-light text-white rounded-lg px-16 py-2 text-sm hover:bg-state-hover transition"
            >
              Crear Tarjeta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCardPage;