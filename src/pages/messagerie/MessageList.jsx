import MessageItem from './MessageItem';

export default function MessageList({ messages, type, onMessageClick, emptyIcon, emptyText }) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <span className="text-4xl">{emptyIcon}</span>
        </div>
        <p className="text-lg font-semibold text-gray-700 mb-2">
          {emptyText}
        </p>
        <p className="text-sm text-gray-500">
          {type === 'recus' 
            ? 'Vos messages apparaîtront ici' 
            : 'Commencez une conversation'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((message, index) => (
        <div key={message.id_message}>
          <MessageItem
            message={message}
            type={type}
            onClick={() => onMessageClick(message)}
          />
          
          {/* 🎨 SÉPARATEUR ÉLÉGANT (sauf dernier élément) */}
          {index < messages.length - 1 && (
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2" />
          )}
        </div>
      ))}
    </div>
  );
}