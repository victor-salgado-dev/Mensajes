// frontend/src/components/GroupChatWindow.jsx
// NEU (Phase 4): eigenständige Chat-Ansicht für Gruppen, bewusst getrennt von
// ChatWindow.jsx (1:1). So bleibt der bestehende, geprüfte 1:1-Chat-Code
// komplett unangetastet — hier wird nichts wiederverwendet, was das Risiko
// für die bestehende Funktionalität erhöhen könnte.
import React, { useEffect, useRef } from 'react';
import { FiArrowLeft, FiInfo, FiUsers, FiEdit2, FiTrash2, FiStar, FiShare2, FiMapPin } from 'react-icons/fi';
import MessageInput from './MessageInput';
import Avatar from './Avatar';
import './ChatWindow.css'; // Wiederverwendung von Layout/Bubble/Menü-Styles (keine Duplizierung von CSS)
import './GroupChatWindow.css'; // nur die gruppenspezifischen Ergänzungen

const GroupChatWindow = ({
  currentUser,
  group,
  messages,
  onSendMessage,
  onlineMemberCount,
  onBackToList,
  onOpenInfo,
  onEditMessage,
  onDeleteMessage,
  onPinMessage,
  onUnpinMessage,
  onForwardMessage,
  favoriteIds,
  onToggleFavorite,
}) => {
  const messageListRef = useRef(null);

  const scrollToBottom = () => {
    if (messageListRef.current) {
      const lastMessage = messageListRef.current.lastElementChild;
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom(), 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSendMessage = (content) => {
    if (group && content) {
      onSendMessage({ groupId: group.id, content });
    }
  };

  if (!group) return null;

  return (
    <div className="chat-window">
      <div className="chat-header">
        {onBackToList && (
          <button type="button" className="chat-back-btn" onClick={onBackToList} aria-label="Zurück zur Benutzerliste">
            <FiArrowLeft />
          </button>
        )}
        <Avatar name={group.name} emoji={group.avatarEmoji} size="md" />
        <div className="chat-header-info">
          <h3>{group.name}</h3>
          <p className="chat-partner-presence">
            <FiUsers className="group-member-count-icon" />
            {group.memberCount} {group.memberCount === 1 ? 'Mitglied' : 'Mitglieder'}
            {typeof onlineMemberCount === 'number' && onlineMemberCount > 0 && ` · ${onlineMemberCount} online`}
          </p>
        </div>
        <div className="chat-menu-wrapper">
          <button type="button" className="chat-menu-btn" onClick={onOpenInfo} aria-label="Gruppeninfo" title="Gruppeninfo">
            <FiInfo />
          </button>
        </div>
      </div>

      <div ref={messageListRef} className="message-list">
        {messages.length === 0 && (
          <p className="message-list-empty">
            <i>Noch keine Nachrichten in dieser Gruppe. Sende die erste!</i>
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender.id === currentUser.id;
          const isFavorite = favoriteIds?.has(`group:${msg.id}`);
          const isDeleted = !msg.content;
          return (
            <div
              key={msg.id || `temp-${msg.sender.id}-${(msg.content || '').substring(0, 5)}-${Date.now()}`}
              className={`message ${isOwn ? 'message-own' : 'message-received'}`}
            >
              {!isOwn && <div className="group-message-sender">{msg.sender.username}</div>}
              {msg.forwardedFromUsername && <div className="message-forwarded">Reenviado de {msg.forwardedFromUsername}</div>}
              <div className={`message-content ${isDeleted ? 'message-deleted' : ''}`}>{msg.content || 'Mensaje eliminado'}</div>
              {msg.editedAt && !isDeleted && <div className="message-edited">Editado</div>}
              <div className="message-time">
                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Senden...'}
              </div>
              {!isDeleted && msg.id && <div className="message-actions">
                {isOwn && onEditMessage && <button type="button" title="Editar mensaje" aria-label="Editar mensaje" onClick={() => { const content = window.prompt('Editar mensaje', msg.content); if (content?.trim()) onEditMessage(msg.id, content); }}><FiEdit2 /></button>}
                {isOwn && onDeleteMessage && <button type="button" title="Eliminar mensaje" aria-label="Eliminar mensaje" onClick={() => { if (window.confirm('Eliminar este mensaje?')) onDeleteMessage(msg.id); }}><FiTrash2 /></button>}
                {onPinMessage && <button type="button" title={msg.pinnedAt ? 'Desfijar mensaje' : 'Fijar mensaje'} aria-label={msg.pinnedAt ? 'Desfijar mensaje' : 'Fijar mensaje'} onClick={() => (msg.pinnedAt ? onUnpinMessage?.(group.id, msg.id) : onPinMessage(group.id, msg.id))}><FiMapPin /></button>}
                {onToggleFavorite && <button type="button" title={isFavorite ? 'Quitar de guardados' : 'Guardar mensaje'} aria-label={isFavorite ? 'Quitar de guardados' : 'Guardar mensaje'} className={isFavorite ? 'is-favorite' : ''} onClick={() => onToggleFavorite('group', msg.id, Boolean(isFavorite))}><FiStar /></button>}
                {onForwardMessage && <button type="button" title="Reenviar mensaje" aria-label="Reenviar mensaje" onClick={() => onForwardMessage({ content: msg.content, forwardedFromUsername: msg.forwardedFromUsername || msg.sender.username })}><FiShare2 /></button>}
              </div>}
            </div>
          );
        })}
      </div>

      <MessageInput onSendMessage={handleSendMessage} disabled={false} />
    </div>
  );
};

export default GroupChatWindow;
