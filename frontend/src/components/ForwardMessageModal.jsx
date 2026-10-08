import React from 'react';
import { FiArrowRight, FiUsers, FiX } from 'react-icons/fi';
import './Phase5Modals.css';

const ForwardMessageModal = ({ isOpen, onClose, conversations, onSelectDestination }) => {
  if (!isOpen) return null;

  return (
    <div className="phase5-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="phase5-modal" role="dialog" aria-modal="true" aria-labelledby="forward-title">
        <header className="phase5-header">
          <div>
            <h2 id="forward-title">Reenviar mensaje</h2>
            <p>Elige una conversacion o un grupo.</p>
          </div>
          <button type="button" className="phase5-icon-button" onClick={onClose} aria-label="Cerrar"><FiX /></button>
        </header>
        <div className="phase5-list">
          {conversations.length === 0 ? (
            <p className="phase5-empty">No hay conversaciones disponibles.</p>
          ) : conversations.map((conversation) => (
            <button
              type="button"
              className="phase5-row"
              key={`${conversation.isGroup ? 'group' : 'user'}-${conversation.id}`}
              onClick={() => onSelectDestination({ ...conversation, username: conversation.username })}
            >
              <span className="phase5-row-icon">{conversation.isGroup ? <FiUsers /> : <FiArrowRight />}</span>
              <span className="phase5-row-copy">
                <strong>{conversation.username}</strong>
                <small>{conversation.isGroup ? 'Grupo' : 'Contacto'}</small>
              </span>
              <FiArrowRight />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ForwardMessageModal;