import React, { useMemo, useState } from 'react';
import { FiMessageCircle, FiSearch, FiUserPlus, FiUsers, FiX } from 'react-icons/fi';
import './Phase5Modals.css';

const GlobalSearchModal = ({
  isOpen, onClose, allMessages, groupMessages, groups, usersList, contacts,
  onJumpToDirectChat, onJumpToGroup, onSendContactRequest, currentUser,
}) => {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const results = useMemo(() => {
    if (!normalizedQuery) return { messages: [], users: [] };
    const messages = [
      ...allMessages.map((message) => ({ ...message, type: 'direct' })),
      ...groupMessages.map((message) => ({ ...message, type: 'group' })),
    ].filter((message) => message.content?.toLocaleLowerCase().includes(normalizedQuery)).slice(0, 20);
    const contactIds = new Set(contacts.map((contact) => contact.id));
    const users = usersList.filter((user) => (
      !contactIds.has(user.id) && user.id !== currentUser?.id &&
      user.username?.toLocaleLowerCase().includes(normalizedQuery)
    )).slice(0, 12);
    return { messages, users };
  }, [allMessages, groupMessages, usersList, contacts, currentUser, normalizedQuery]);

  if (!isOpen) return null;

  const openMessage = (message) => {
    if (message.type === 'group') {
      onJumpToGroup(message.groupId);
      onClose();
      return;
    }
    const otherId = message.sender?.id === currentUser?.id ? message.recipient?.id : message.sender?.id;
    const otherUser = usersList.find((user) => user.id === otherId) || contacts.find((contact) => contact.id === otherId);
    if (otherUser) {
      onJumpToDirectChat(otherUser);
      onClose();
    }
  };

  return (
    <div className="phase5-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="phase5-modal phase5-search-modal" role="dialog" aria-modal="true" aria-labelledby="global-search-title">
        <header className="phase5-header">
          <div>
            <h2 id="global-search-title">Busqueda global</h2>
            <p>Mensajes, grupos y personas</p>
          </div>
          <button type="button" className="phase5-icon-button" onClick={onClose} aria-label="Cerrar"><FiX /></button>
        </header>
        <label className="phase5-search">
          <FiSearch aria-hidden="true" />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar..." aria-label="Buscar en mensajes, grupos y personas" />
        </label>
        <div className="phase5-list">
          {!normalizedQuery ? (
            <p className="phase5-empty">Escribe para buscar en mensajes y personas.</p>
          ) : (
            <>
              <h3 className="phase5-section-title">Mensajes ({results.messages.length})</h3>
              {results.messages.map((message) => (
                <button type="button" className="phase5-row" key={`${message.type}-${message.id}`} onClick={() => openMessage(message)}>
                  <span className="phase5-row-icon">{message.type === 'group' ? <FiUsers /> : <FiMessageCircle />}</span>
                  <span className="phase5-row-copy">
                    <strong>{message.type === 'group' ? groups.find((group) => group.id === message.groupId)?.name || 'Grupo' : message.sender?.username || 'Mensaje'}</strong>
                    <small>{message.content}</small>
                  </span>
                </button>
              ))}
              <h3 className="phase5-section-title">Personas ({results.users.length})</h3>
              {results.users.map((person) => (
                <div className="phase5-row" key={`person-${person.id}`}>
                  <span className="phase5-row-icon"><FiUserPlus /></span>
                  <span className="phase5-row-copy"><strong>{person.username}</strong><small>Persona</small></span>
                  <button type="button" className="phase5-action" onClick={() => onSendContactRequest(person.id)}>Agregar</button>
                </div>
              ))}
              {results.messages.length === 0 && results.users.length === 0 && <p className="phase5-empty">No se encontraron resultados.</p>}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default GlobalSearchModal;