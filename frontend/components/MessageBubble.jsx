'use client';

export default function MessageBubble({ message, isUser }) {
  //styles based on sender
  const alignment = isUser ? 'self-end' : 'self-start';
  const bgColor = isUser ? 'bg-black text-white' : 'bg-gray-100 text-black border border-gray-200';
  const radius = isUser ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm';

  return (
    <div className={`max-w-[80%] px-5 py-3.5 mb-2 shadow-sm ${alignment} ${bgColor} ${radius}`}>
      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message}</p>
    </div>
  );
}
