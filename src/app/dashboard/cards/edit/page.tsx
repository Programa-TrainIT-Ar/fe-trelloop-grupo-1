'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaPlus, FaTag, FaTimes, FaSearch, FaRegTrashAlt } from 'react-icons/fa';
import PrioritySelector from '@/components/card/PrioritySelector';
import PriorityBadge from '@/components/card/PriorityBagde';
import Calendar from '@/components/ui/Calendar';
import Swal from 'sweetalert2';
import StateBadge from '@/components/card/StateBadge';
import StateSelector from '@/components/card/StateSelector';
import {getCardById, updateCardById, getCardMembers, addCardMember, removeCardMember } from '@/services/cardService';
import { searchUsers } from '@/services/userService';



function EditCardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const boardId = searchParams.get('boardId');
  const cardId = searchParams.get('cardId');

  const [token, setToken] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lead, setLead] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [state, setState] = useState<'TODO' | 'IN_PROGRESS' | 'DONE' | ''>('')

  const [priority, setPriority] = useState<'Baja' | 'Media' | 'Alta' | ''>('');
  const [members, setMembers] = useState<any[]>([]);
  const [responsable, setResponsable] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

const stateLabels: Record<string, string> = {
    'TODO': 'Por hacer',
    'IN_PROGRESS': 'En progreso',
    'DONE': 'Hecho',
  };

  const stateColors: Record<string, string> = {
    'TODO': 'bg-[#60584E]',
    'IN_PROGRESS': 'bg-[#2E90FA]',
    'DONE': 'bg-[#12B76A]',
  };


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

  useEffect(() => {
    const loadCard = async () => {
      if (!token || !cardId) return;
      
      try {
        const cardData = await getCardById(cardId, token);
        console.log('Datos completos de la tarjeta:', JSON.stringify(cardData, null, 2));
        console.log('Campos específicos:', {
          title: cardData.title,
          description: cardData.description,
          state: cardData.state,
          assignee: cardData.assignee,
          responsable_id: cardData.responsable_id,
          tags: cardData.tags,
          priority: cardData.priority,
          beginDate: cardData.beginDate,
          dueDate: cardData.dueDate
        });
        
        setTitle(cardData.title || '');
        setDescription(cardData.description || '');
        
        // Mapear estado del backend al frontend
        const stateMapping = {
          'To Do': 'TODO',
          'In Progress': 'IN_PROGRESS', 
          'Done': 'DONE'
        };
        setState(stateMapping[cardData.state] || cardData.state || 'TODO');
        
        // Cargar responsable si existe responsableId
        if (cardData.responsableId) {
          // Buscar el responsable en los miembros del tablero
          try {
            const boardRes = await fetch(`${process.env.NEXT_PUBLIC_API}/board/getBoard/${boardId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });
            if (boardRes.ok) {
              const boardData = await boardRes.json();
              const responsableData = boardData.members?.find((member: any) => member.id === cardData.responsableId);
              setResponsable(responsableData || null);
            }
          } catch (error) {
            console.error('Error al cargar responsable:', error);
          }
        }
        
        // Etiquetas: usar las del backend si existen, sino array vacío
        console.log('Etiquetas del backend:', cardData.tags);
        setTags(cardData.tags || []);
        
        // Calcular prioridad basada en fecha de vencimiento
        if (cardData.dueDate) {
          const dueDate = new Date(cardData.dueDate);
          const today = new Date();
          const diffTime = dueDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 1) {
            setPriority('Alta');
          } else if (diffDays <= 7) {
            setPriority('Media');
          } else {
            setPriority('Baja');
          }
        } else {
          setPriority('');
        }
        
        if (cardData.beginDate) setStartDate(new Date(cardData.beginDate));
        if (cardData.dueDate) setEndDate(new Date(cardData.dueDate));
      } catch (error) {
        console.error('Error al cargar tarjeta:', error);
      }
    };
    
    const loadMembers = async () => {
      if (!token || !cardId) return;
      
      try {
        const membersData = await getCardMembers(cardId, token);
        console.log('Miembros de la tarjeta:', membersData);
        setMembers(membersData || []);
      } catch (error) {
        console.error('Error al cargar miembros:', error);
      }
    };


    
    loadCard();
    loadMembers();
  }, [token, cardId]);

  // Recalcular prioridad cuando cambien las fechas
  useEffect(() => {
    if (endDate) {
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        setPriority('Alta');
      } else if (diffDays <= 7) {
        setPriority('Media');
      } else {
        setPriority('Baja');
      }
    } else {
      setPriority('');
    }
  }, [endDate]);



  const handleSearchResponsable = async () => {
    if (!searchQuery.trim() || !token) return;
    
    try {
      console.log('Buscando usuario con email:', searchQuery);
      const { searchUsersByEmail } = await import('@/services/cardService');
      const results = await searchUsersByEmail(searchQuery, token);
      console.log('Resultados de búsqueda:', results);
      setSearchResults(results || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      // Mostrar error al usuario
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo buscar el usuario. Verifica el email e intenta nuevamente.',
        icon: 'error',
        background: 'rgb(26, 26, 26)',
        color: '#fff',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleSelectResponsable = (user: any) => {
    setResponsable(user);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleAddMember = async (userId: number) => {
    if (!token || !cardId) return;
    
    try {
      await addCardMember(cardId, userId, token);
      // Recargar miembros
      const membersData = await getCardMembers(cardId, token);
      setMembers(membersData || []);
      setSearchQuery('');
      setSearchResults([]);
      setShowSearchResults(false);
    } catch (error) {
      console.error('Error al agregar miembro:', error);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!token || !cardId) return;
    
    try {
      await removeCardMember(cardId, userId, token);
      // Recargar miembros
      const membersData = await getCardMembers(cardId, token);
      setMembers(membersData || []);
    } catch (error) {
      console.error('Error al eliminar miembro:', error);
    }
  };






  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed];
      setTags(newTags);
      setNewTag('');
      console.log('Etiqueta agregada:', trimmed, 'Total etiquetas:', newTags);
    }
  };


  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleUpdateCard = async () => {
    if (!token || !boardId || !cardId || !title.trim()) return;

    const cardData = {
      title,
      description,
      boardId: parseInt(boardId),
      responsableId: responsable?.id || null,
      beginDate: startDate?.toISOString(),
      dueDate: endDate?.toISOString(),
      state: state || "TODO",
      tags: tags
    };

    try {
      await updateCardById(cardId, cardData, token);

      Swal.fire({
        icon: "success",
        text: "Tarjeta actualizada exitosamente",
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
        text: err.message || 'Error al actualizar tarjeta',
        icon: 'error',
        background: "rgb(26, 26, 26)",
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

  if (!boardId || !cardId) {
    return <p className="p-4">Error: ID del tablero o tarjeta no encontrado</p>;
  }

  return (
    <div className="min-h-screen text-white p-8">

      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl text-left text-white">Editar Tarjeta</h1>
            <p className="text-gray-400">Tablero ID: {boardId} | Tarjeta ID: {cardId}</p>
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
              setEndDate={setEndDate} />
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
                className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[127px]"
                placeholder="Escribe aquí ..."
              />
            </div>

            <div>
              <label htmlFor="responsable" className="block font-medium mb-2 text-sm">
                Responsable
              </label>
              <div className="relative">
                <input
                  id="responsable"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchResponsable();
                    }
                  }}
                  placeholder="Buscar responsable por email..."
                  className="mt-2 p-3 pr-10 bg-[#313131B3] block w-full rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-base font-light text-white placeholder:text-[#797676] focus:outline-none focus:border-purple-500 bg-[#313131] h-[41px]"
                />
                <button
                  type="button"
                  onClick={handleSearchResponsable}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FaSearch style={{ fontSize: "20px" }} />
                </button>
              </div>
              
              {/* Resultados de búsqueda */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="mt-2 bg-[#313131B3] rounded-lg max-h-40 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-700">
                      <div>
                        <span className="text-white">{user.first_name} {user.last_name}</span>
                        <span className="text-gray-400 ml-2">({user.email})</span>
                      </div>
                      <button
                        onClick={() => handleSelectResponsable(user)}
    
                        className=" text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                        style={{ backgroundColor: "#6A5FFF" }}
                      >
                        Seleccionar
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Mostrar responsable seleccionado */}
              {responsable && (
                <div className="mt-3">
                  <div className="flex items-center justify-between p-2 bg-neutral-800 rounded w-60">
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium text-white">{responsable.firstName || responsable.first_name} {responsable.lastName || responsable.last_name}</span>
                      <span className="text-xs text-gray-400" style={{backgroundColor: "#313131B3"}}>({responsable.email})</span>
                    </div>
                    <button
                      onClick={() => setResponsable(null)}
                      className="text-white hover:text-red-300 transition"
                    >
                      <FaRegTrashAlt />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <div>
                <label className="block font-medium mb-2 text-sm">Prioridad</label>
                <PrioritySelector value={priority} onChange={setPriority} />
                {priority && <PriorityBadge label={priority} />}
              </div>

              <div>
                <label className="block font-medium mb-2 mt-4 text-sm">Estado</label>
                <StateSelector value={state} onChange={setState} />
                {state && <StateBadge label={state} labelsMap={stateLabels} colorsMap={stateColors}/>}
              </div>
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
                  onClick={handleUpdateCard}
                  disabled={!title.trim()}
                  className="bg-state-default font-light text-white rounded-lg px-16 py-2 text-sm hover:bg-state-hover transition"
                >
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditCardPage;