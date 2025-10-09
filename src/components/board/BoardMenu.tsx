'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { FaPen, FaTrash } from 'react-icons/fa';
import { deleteBoardById } from '@/services/boardService';
import { useBoardStore } from '@/store/boards/store';
import '../../styles/globals.css';
import '../../styles/delModal.css'


interface BoardMenuProps {
  creatorId: string;
  currentUserId: string;
  boardId: number;  
}

const BoardMenu: React.FC<BoardMenuProps> = ({ creatorId, currentUserId, boardId }) => {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const removeBoard = useBoardStore(state => state.removeBoard);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleEdit = () => {
       router.push(`/dashboard/board/edit?id=${boardId}`);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      html: `
        <div class="modal-content-custom">
          <img class="modal-icon" src="https://cdn-icons-png.flaticon.com/512/595/595067.png" alt="Warning" />
          <p class="modal-text">
            ¿Estás seguro de que quieres proceder con esta acción?<br/>No será reversible.
          </p>
        </div>
      `,
      background: "#222222",
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "mi-modal",
        confirmButton: "btn-confirm",
        cancelButton: "btn-cancel",
      },
    });

    if (result.isConfirmed) {
      try {
        // Obtener token
        const authStorage = localStorage.getItem('auth-storage');
        if (!authStorage) {
          throw new Error('No se encontró token de autenticación');
        }
        
        const authData = JSON.parse(authStorage);
        const token = authData?.state?.accessToken;
        
        if (!token) {
          throw new Error('Token no válido');
        }

        // Eliminar tablero
        await deleteBoardById(Number(boardId), token);
        
        // Eliminar del store para actualizar UI inmediatamente
        removeBoard(boardId);
        
        await Swal.fire({
          title: '¡Eliminado!',
          text: 'El tablero ha sido eliminado correctamente',
          icon: 'success',
          background: '#222',
          color: '#fff',
          showConfirmButton: true,
          confirmButtonText: 'Aceptar',
          customClass: {
            confirmButton: 'btn-cancel',
            popup: 'mi-modal',
          },
        });
        
        // Redirigir al dashboard
        router.push('/dashboard');
        
      } catch (error: any) {
        await Swal.fire({
          title: 'Error',
          text: error.message || 'No se pudo eliminar el tablero',
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
    }
  };

  if (creatorId !== currentUserId) return null;

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="text-white text-lg hover:opacity-80"
      >
        <i className="fa-solid fa-ellipsis-vertical"></i>
      </button>

      {showMenu && (
        <div className="absolute left-0 top-[36px] w-56 rounded-xl bg-zinc-900 text-white shadow-lg z-[99999] p-4">
          <button
            onClick={handleEdit}
            className="flex items-center gap-3 w-full text-left text-base py-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <FaPen className="text-white text-lg" />
            <span>Editar tablero</span>
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-3 w-full text-left text-base py-2 hover:bg-zinc-800 rounded-lg transition-colors mt-1"
          >
            <FaTrash className="text-white text-lg" />
            <span>Eliminar tablero</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BoardMenu;

