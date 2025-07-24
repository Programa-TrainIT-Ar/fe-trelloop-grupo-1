'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { FaPen, FaTrash } from 'react-icons/fa';
import '../styles/globals.css';
import '../styles/delete-modal.css';

interface BoardMenuProps {
  creatorId: string;
  currentUserId: string;
  boardId: number;
  boardName: string;
}

const BoardMenu: React.FC<BoardMenuProps> = ({
  creatorId,
  currentUserId,
  boardId,
  boardName,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Detectar clics fuera del menú
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleEdit = () => {
    router.push('/editar-tablero');
  };

  const deleteBoardFromBackend = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        Swal.fire('Error', 'No hay token de autenticación', 'error');
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(`${baseUrl}/deleteBoard/${boardId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: '¡Eliminado!',
          icon: 'success',
          background: '#222',
          color: '#fff',
          showConfirmButton: true,
          confirmButtonText: 'Aceptar',
          customClass: {
            confirmButton: 'btn-cancel',
            popup: 'mi-modal',
          },
        }).then(() => {
          router.push('/dashboard');
        });
      } else {
        Swal.fire('Error', data.error || 'No se pudo eliminar', 'error');
      }
    } catch (error) {
      console.error('Error eliminando el tablero:', error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  };

  const handleDelete = () => {
    Swal.fire({
      html: `
        <div class="modal-content-custom">
          <img class="modal-icon" src="https://cdn-icons-png.flaticon.com/512/595/595067.png" alt="Warning" />
          <p class="modal-text">
            ¿Estás seguro de que quieres eliminar el tablero <strong style="color:#e63946">${boardName}</strong>?<br/>No será reversible.
          </p>
        </div>
      `,
      background: '#222222',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'mi-modal',
        confirmButton: 'btn-confirm',
        cancelButton: 'btn-cancel',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBoardFromBackend();
      }
    });
  };

  if (creatorId !== currentUserId) return null;

  return (
    <div ref={menuRef} className="relative inline-block text-left ml-4 mt-4">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="text-white text-lg hover:opacity-80"
      >
        ⋮
      </button>

      {showMenu && (
        <div className="absolute left-0 top-[36px] w-56 rounded-xl bg-zinc-900 text-white shadow-lg z-[9999] p-4">
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