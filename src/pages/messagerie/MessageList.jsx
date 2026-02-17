import MessageItem from './MessageItem';

export default function MessageList({ messages, type, onMessageClick, emptyIcon, emptyText }) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-3xl mb-4">{emptyIcon}</p>
        <p className="text-gray-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {messages.map((message) => (
        <MessageItem
          key={message.id_message}
          message={message}
          type={type}
          onClick={() => onMessageClick(message)}
        />
      ))}
    </div>
  );
}