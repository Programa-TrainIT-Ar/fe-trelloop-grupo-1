'use client';
import React from 'react';

interface ConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        color: '#000',
        padding: '24px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
          ¿Estás seguro de que quieres proceder con esta acción? <br />No será reversible.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6b46c1',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Eliminar
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#e2e8f0',
              color: '#1a202c',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
