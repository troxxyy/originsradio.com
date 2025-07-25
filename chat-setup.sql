-- Create chat_messages table for real-time chat functionality
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tag_name VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  is_emoji BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read messages
CREATE POLICY "Everyone can read chat messages" ON chat_messages
  FOR SELECT USING (true);

-- Create policy to allow everyone to insert messages
CREATE POLICY "Everyone can insert chat messages" ON chat_messages
  FOR INSERT WITH CHECK (true);

-- Enable real-time subscriptions for the table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages; 