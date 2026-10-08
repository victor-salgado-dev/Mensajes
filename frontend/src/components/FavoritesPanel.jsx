import React from 'react';
import { FiStar, FiX } from 'react-icons/fi';
import './Phase5Modals.css';

const FavoritesPanel = ({ isOpen, onClose, favorites, allMessages, groupMessages, onToggleFavorite }) => {
  if (!isOpen) return null;

  const entries = favorites.map((favorite) => {
    const source = favorite.messageType === 'group' ? groupMessages : allMessages;
    return { ...favorite, message: source.find((message) => message.id === favorite.messageId) };
  });

  return (
    <div className="phase5-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="phase5-modal" role="dialog" aria-modal="true" aria-labelledby="favorites-title">
        <header className="phase5-header">
          <div>
            <h2 id="favorites-title">Mensajes guardados</h2>
            <p>{favorites.length} {favorites.length === 1 ? 'favorito' : 'favoritos'}</p>
          </div>
          <button type="button" className="phase5-icon-button" onClick={onClose} aria-label="Cerrar"><FiX /></button>
        </header>
        <div className="phase5-list">
          {entries.length === 0 ? (
            <p className="phase5-empty">Aun no has guardado mensajes.</p>
          ) : entries.map(({ messageType, messageId, message }) => (
            <article className="phase5-favorite" key={`${messageType}:${messageId}`}>
              <span className="phase5-row-icon"><FiStar /></span>
              <div className="phase5-favorite-copy">
                <strong>{message?.sender?.username || (messageType === 'group' ? 'Grupo' : 'Contacto')}</strong>
                <p>{message?.content || 'Este mensaje ya no esta disponible.'}</p>
              </div>
              <button
                type="button"
                className="phase5-icon-button"
                onClick={() => onToggleFavorite(messageType, messageId, true)}
                aria-label="Quitar de favoritos"
                title="Quitar de favoritos"
              ><FiX /></button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FavoritesPanel;