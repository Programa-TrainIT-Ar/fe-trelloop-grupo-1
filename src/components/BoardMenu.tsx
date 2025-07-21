'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmModal from './ConfirmModal';

const BoardMenu: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleEdit = () => {
    router.push('/editar-tablero');
  };

  const handleDelete = () => {
    setShowModal(true);
  };

  const confirmDelete = () => {
    setShowModal(false);
    console.log("Tablero eliminado");
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setShowMenu(!showMenu)}>⋮</button>

      {showMenu && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          backgroundColor: '#222',
          color: '#fff',
          borderRadius: '8px',
          padding: '10px',
          zIndex: 1
        }}>
          <button onClick={handleEdit} style={{ display: 'block', width: '100%' }}>
            📝 Editar tablero
          </button>
          <button onClick={handleDelete} style={{ display: 'block', width: '100%', marginTop: '5px' }}>
            🗑️ Eliminar tablero
          </button>
        </div>
      )}

      {showModal && (
        <ConfirmModal
          title="¿Está seguro que quiere eliminar el tablero?"
          onConfirm={confirmDelete}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default BoardMenu;
