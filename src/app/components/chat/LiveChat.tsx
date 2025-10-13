import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, Hash, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatMessages, useCreateChatMessage, useChatSubscription } from '@/hooks/use-supabase';

interface ChatMessage {
  id: string;
  tag_name: string;
  message: string;
  created_at: string;
  is_emoji: boolean;
}

const EMOJI_REACTIONS = ['🎵', '🔥', '❤️', '🎉', '👏', '🎶', '💯', '🙌', '😍', '🤩', '🎧', '✨'];

const LiveChat: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [tagName, setTagName] = useState('');
  const [isTagNameSet, setIsTagNameSet] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Supabase hooks
  const { data: messages = [], isLoading } = useChatMessages();
  const createMessageMutation = useCreateChatMessage();

  // Load saved tag name from localStorage
  useEffect(() => {
    const savedTagName = localStorage.getItem('origins-chat-tagname');
    if (savedTagName) {
      setTagName(savedTagName);
      setIsTagNameSet(true);
    }
  }, []);

  // Real-time subscription for new messages
  useChatSubscription((newMessage) => {
    // Auto-scroll when new message arrives
    setTimeout(() => scrollToBottom(), 100);
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSetTagName = () => {
    if (tagName.trim().length >= 2) {
      setIsTagNameSet(true);
      localStorage.setItem('origins-chat-tagname', tagName.trim());
    }
  };

  const handleSendMessage = async (messageText?: string, isEmojiReaction = false) => {
    const textToSend = messageText || currentMessage.trim();
    if (textToSend && isTagNameSet && !createMessageMutation.isPending) {
      try {
        await createMessageMutation.mutateAsync({
          tagName: tagName.trim(),
          message: textToSend,
          isEmoji: isEmojiReaction
        });
        
        if (!messageText) {
          setCurrentMessage('');
        }
        setShowEmojiPicker(false);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const handleEmojiClick = (emoji: string) => {
    handleSendMessage(emoji, true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!isTagNameSet) {
        handleSetTagName();
      } else {
        handleSendMessage();
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTagColor = (tagName: string) => {
    // Generate consistent color based on tag name
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'text-blue-400', 'text-green-400', 'text-yellow-400', 'text-purple-400',
      'text-pink-400', 'text-indigo-400', 'text-red-400', 'text-orange-400'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  if (!isTagNameSet) {
    return (
      <div className="bg-black/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 w-full">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="w-6 h-6 text-white" />
          <h2 className="text-2xl font-bold text-white">Join Live Chat</h2>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 max-w-4xl">
          <div className="flex items-center gap-2">
            <User className="w-8 h-8 text-gray-400" />
            <span className="text-white">Choose your tag name to join the conversation</span>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="your_tag_name"
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 w-60"
                maxLength={20}
              />
            </div>
            <Button
              onClick={handleSetTagName}
              disabled={tagName.trim().length < 2}
              className="bg-white text-black hover:bg-gray-200"
            >
              Join Chat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 w-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-white" />
          <h2 className="text-2xl font-bold text-white">Live Chat</h2>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          {isLoading && (
            <div className="text-sm text-gray-400">Loading messages...</div>
          )}
        </div>
        <div className="text-sm text-gray-400">
          Chatting as <span className={`font-medium ${getTagColor(tagName)}`}>#{tagName}</span>
        </div>
      </div>

      <div className="grid xl:grid-cols-4 lg:grid-cols-3 gap-6">
        {/* Messages Area - Takes up 3/4 on extra large screens, 2/3 on large screens */}
        <div className="xl:col-span-3 lg:col-span-2">
          <div 
            ref={chatContainerRef}
            className="h-80 overflow-y-auto p-4 bg-gray-800/30 rounded-lg space-y-3 mb-4"
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm h-full flex items-center justify-center">
                {isLoading ? 'Loading messages...' : 'No messages yet. Start the conversation! 🎵'}
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium text-sm ${getTagColor(msg.tag_name)}`}>
                        #{msg.tag_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                    <div className={`text-white text-sm rounded-lg px-3 py-2 w-fit max-w-lg ${
                      msg.is_emoji 
                        ? 'bg-transparent text-2xl px-1 py-0' 
                        : 'bg-gray-700/50'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              maxLength={200}
              disabled={createMessageMutation.isPending}
            />
            <Button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="bg-gray-700 text-white hover:bg-gray-600 px-3"
              disabled={createMessageMutation.isPending}
            >
              <Smile className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleSendMessage()}
              disabled={!currentMessage.trim() || createMessageMutation.isPending}
              className="bg-white text-black hover:bg-gray-200 px-3"
            >
              {createMessageMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {currentMessage.length}/200 characters
            </span>
            {createMessageMutation.isPending && (
              <span className="text-xs text-blue-400">Sending...</span>
            )}
          </div>
        </div>

        {/* Emoji Reactions Panel - Takes up 1/4 on extra large screens, 1/3 on large screens */}
        <div className="xl:col-span-1 lg:col-span-1">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <Smile className="w-4 h-4" />
            Quick Reactions
          </h3>
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-2">
            {EMOJI_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                disabled={createMessageMutation.isPending}
                className="text-2xl p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors hover:scale-110 transform duration-200 disabled:opacity-50"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-gray-800/20 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">💡 Chat Tips:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Click emojis for quick reactions</li>
              <li>• Press Enter to send messages</li>
              <li>• Be respectful to other listeners</li>
              <li>• Share your music vibes! 🎵</li>
              <li>• Messages sync across all users</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChat; 