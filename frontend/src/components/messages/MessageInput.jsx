import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

/**
 * MessageInput Component
 * Docked multi-line composer with auto-expansion, keyboard submission,
 * debounced typing indicators, and character counter.
 */
const MessageInput = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled = false,
}) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea height to fit content up to 140px
  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [content]);

  // Handle typing indicator debouncing
  const handleInputChange = (e) => {
    const val = e.target.value;
    setContent(val);

    if (val.trim()) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTypingStart?.();
      }

      // Reset timer
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onTypingStop?.();
      }, 2000);
    } else {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTypingStop?.();
      }
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault?.();
    const trimmed = content.trim();
    if (!trimmed || isSending || disabled) return;

    // Stop typing state immediately
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop?.();
    }

    try {
      setIsSending(true);
      await onSendMessage(trimmed);
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cleanup typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (isTypingRef.current) onTypingStop?.();
    };
  }, [onTypingStop]);

  const canSend = Boolean(content.trim()) && !disabled && !isSending;

  return (
    <form
      onSubmit={handleSend}
      className="sticky bottom-0 z-20 p-3 sm:p-4 bg-white border-t border-[#E5E7EB] shrink-0"
    >
      <div className="flex items-end gap-2 bg-[#F8F9FC] border border-[#E5E7EB] rounded-2xl p-1.5 focus-within:border-[#5277D9] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#5277D9] transition-all shadow-2xs">
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a message... (Press Enter to send, Shift+Enter for newline)"
          disabled={disabled || isSending}
          maxLength={5000}
          className="flex-1 max-h-36 min-h-[38px] py-2 px-3 text-xs sm:text-sm bg-transparent resize-none border-none outline-none text-[#17233B] placeholder-[#98A2B3] leading-relaxed"
          aria-label="Message content"
        />

        <button
          type="submit"
          disabled={!canSend}
          className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center ${
            canSend
              ? 'bg-[#5277D9] hover:bg-[#4364c2] text-white shadow-xs active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title="Send message (Enter)"
          aria-label="Send message"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {content.length > 3500 && (
        <div className="text-[10px] text-right text-[#98A2B3] mt-1 pr-1 font-mono">
          {content.length} / 5000
        </div>
      )}
    </form>
  );
};

export default MessageInput;
