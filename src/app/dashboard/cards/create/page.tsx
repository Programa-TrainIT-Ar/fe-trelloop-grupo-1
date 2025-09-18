'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaPlus, FaTag, FaTimes, FaRegTrashAlt } from 'react-icons/fa';
import PrioritySelector from '@/components/card/PrioritySelector';
import PriorityBadge from '@/components/card/PriorityBagde';
import Calendar from '@/components/ui/Calendar';
import Swal from 'sweetalert2';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface BoardList {
  id: number;
  name: string;
  position?: number;
}

function CreateCardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const boardId = searchParams.get('boardId');

  const [token, setToken] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [responsable, setResponsable] = useState<User | null>(null);
  const [newResponsable, setNewResponsable] = useState('');

  const [priority, setPriority] = useState<'Baja' | 'Media' | 'Alta' | ''>('');

  // 👇 listas (únicas)
  const [lists, setLists] = useState<BoardList[]>([]);
  const [listId, setListId] = useState<number | ''>('');
  const [newListName, setNewListName] = useState('');

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

  // Cargar listas del tablero
  useEffect(() => {
    if (!token || !boardId) return;

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/list/by-board/${boardId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
          console.error('Error cargando listas:', res.status, await res.text());
          return;
        }

        const data = await res.json();
        // backend responde { items: [...] }
        setLists((data.items ?? data.lists ?? data) as BoardList[]);
      } catch (e) {
        console.error('Error cargando listas:', e);
      }
    })();
  }, [token, boardId]);

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

  const handleAddResponsable = async () => {
    const trimmed = newResponsable.trim();
    if (!trimmed || !token) return;

    try {
      const { searchUsersByEmail } = await import('@/services/boardService');
      const users = await searchUsersByEmail(trimmed, token);

      if (!users || users.length === 0) {
        await Swal.fire({
          title: 'Error',
          text: 'No se encontró usuario con ese correo',
          icon: 'error',
          background: 'rgb(26, 26, 26)',
          color: '#fff'
        });
        return;
      }

      const user = users[0];
      setResponsable(user);
      setNewResponsable('');
    } catch (err: any) {
      await Swal.fire({
        title: 'Error',
        text: err.message || 'Error al buscar usuario',
        icon: 'error',
        background: 'rgb(26, 26, 26)',
        color: '#fff'
      });
    }
  };

  const handleRemoveResponsable = () => {
    setResponsable(null);
  };

  const handleCreateCard = async () => {
    if (!token || !boardId || !title.trim()) return;

    
    const payload: any = {
      title,
      description,
      boardId: parseInt(boardId),
      responsableId: responsable?.id || null,
      beginDate: startDate?.toISOString(),
      dueDate: endDate?.toISOString(),
      tags,
      priority: priority || null, 
    };

    if (listId !== '') {
      payload.listId = Number(listId);
    } else if (newListName.trim()) {
      payload.listName = newListName.trim();
    }
    

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/card/createCard`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${responseData.error || 'Error desconocido'}`);
      }

      await Swal.fire({
        icon: "success",
        text: "Tarjeta creada exitosamente",
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
      router.push(`/dashboard/boards/${boardId}`);
    } catch (err: any) {
      console.error('Error completo:', err);
      await Swal.fire({
        title: 'Error',
        text: err.message || 'Error al crear tarjeta',
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

  if (!token) {
    return <p className="p-4 text-white">Cargando...</p>;
  }

  if (!boardId) {
    return <p className="p-4">Error: ID del tablero no encontrado</p>;
  }

  return (
    <div className="min-h-screen text-white p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl text-left text-white">Crear Tarjeta</h1>
            <p className="text-gray-400">Tablero ID: {boardId}</p>
          </div>

          <button
            onClick={() => router.push(`/dashboard/boards/${boardId}`)}
            className='flex justify-center items-center rounded-full bg-[--global-color-primary-500] h-20 w-20 text-center text-white '
          >
            <FaTimes className='h-10 w-10' />
          </button>
        </div>

        <h4>Fecha de tarjeta</h4>
        <div className="flex gap-8">
          <div className="w-1/3">
            <Calendar
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </div>

          <div className="w-2/3 space-y-6">
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
                className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus;border-purple-500 bg-[#313131] h-[127px]"
                placeholder="Escribe aquí ..."
              />
            </div>

            {/* Responsable */}
            <div>
              <label htmlFor="responsable" className="block font-medium mb-2 text-sm">
                Responsable
              </label>
              <div className="relative">
                <input
                  id="responsable"
                  value={newResponsable}
                  type="text"
                  placeholder="Buscar responsable por email..."
                  className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[41px]"
                  onChange={(e) => setNewResponsable(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddResponsable();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddResponsable}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FaPlus style={{ fontSize: "20px" }} />
                </button>
              </div>
              {responsable && (
                <div className="mt-3">
                  <div className="flex items-center justify-between p-2 bg-neutral-800 rounded">
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium text-white">{responsable.first_name} {responsable.last_name}</span>
                      <span className="text-xs text-gray-400">({responsable.email})</span>
                    </div>
                    <button
                      onClick={handleRemoveResponsable}
                      className="text-white hover:text-red-300 transition"
                    >
                      <FaRegTrashAlt />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Prioridad */}
            <div>
              <label className="block font-medium mb-2 text-sm">Prioridad</label>
              <PrioritySelector value={priority} onChange={setPriority} />
              {priority && <PriorityBadge label={priority} />}
            </div>

            {/* LISTA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seleccionar lista existente */}
              <div>
                <label className="block font-medium mb-2 text-sm">Lista</label>
                <select
                  value={listId === '' ? '' : String(listId)}
                  onChange={(e) => setListId(e.target.value ? Number(e.target.value) : '')}
                  className="block w-full h-11 px-3 rounded-xl border-2 border-[#3C3C3CB2] bg-[#313131B3] text-base text-white"
                >
                  <option value="">Selecciona una lista…</option>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                {lists.length === 0 && (
                  <p className="text-sm text-gray-400 mt-2">Este tablero aún no tiene listas.</p>
                )}
              </div>

              {/* Crear nueva lista al vuelo */}
              <div>
                <label className="block font-medium mb-2 text-sm">O crea una lista nueva</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Ej: Trabajo, Estudio..."
                  className="block w-full h-11 px-3 rounded-xl border-2 border-[#3C3C3CB2] bg-[#313131B3] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500"
                />
                
              </div>
            </div>


            {/* Etiquetas (visual) */}
            <div>
              <label htmlFor="tags" className="block font-medium mb-2 mt-4 text-sm">
                Etiquetas
              </label>
              <div className="relative">
                <input
                  id="tags"
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[41px]"
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
                onClick={() => router.push(`/dashboard/boards/${boardId}`)}
                className="text-state-default font-light border border-state-default rounded-lg px-16 py-2 text-sm hover:bg-background-medium transition"
              >
                Cancelar
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
    </div>
  );
}

export default CreateCardPage;
