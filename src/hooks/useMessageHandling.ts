import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const useMessageHandling = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const loadMessages = async () => {
    if (!conversationId) return;
    try {
      console.log('Carregando mensagens para conversa:', conversationId);
      const { data, error } = await supabase
        .from('agent_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        throw error;
      }
      console.log('Mensagens carregadas:', data);
      
      // Filter out 'system' messages and only keep 'user' and 'assistant' for frontend
      const filteredMessages = (data || [])
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          created_at: msg.created_at
        }));
      
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens.",
        variant: "destructive"
      });
    }
  };

  const sendToWebhook = async (message: string, conversationId: string) => {
    console.log('Enviando mensagem para webhook:', message);
    try {
      const webhookUrl = 'https://webhook-automatios-rsmtk.abbadigital.com.br/webhook/agente-copy-rs';
      const url = new URL(webhookUrl);
      url.searchParams.append('message', message);
      url.searchParams.append('timestamp', new Date().toISOString());
      url.searchParams.append('conversationId', conversationId);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Resposta do webhook - Status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
        console.log('Resposta do webhook - Data (JSON):', data);
      } catch (jsonError) {
        data = await response.text();
        console.log('Resposta do webhook - Data (Text):', data);
      }
      return data;
    } catch (error) {
      console.error('Error sending to webhook:', error);
      throw error;
    }
  };

  const sendMessage = async (
    messageContent: string, 
    currentConversationId: string | null,
    onConversationChange: (id: string) => void
  ) => {
    if (!messageContent.trim()) return null;
    setLoading(true);

    try {
      let activeConversationId = currentConversationId;
      if (!activeConversationId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        console.log('Criando nova conversa automaticamente...');
        const { data, error } = await supabase
          .from('agent_conversations')
          .insert({
            user_id: user.id,
            title: messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : '')
          })
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar conversa:', error);
          throw error;
        }
        console.log('Conversa criada automaticamente:', data);
        activeConversationId = data.id;
        onConversationChange(activeConversationId);
      }

      const newUserMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: messageContent,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newUserMessage]);

      try {
        console.log('Salvando mensagem do usuário...');
        const { error: userMsgError } = await supabase
          .from('agent_messages')
          .insert({
            conversation_id: activeConversationId,
            role: 'user',
            content: messageContent
          });
        if (userMsgError) {
          console.error('Erro ao salvar mensagem do usuário:', userMsgError);
        } else {
          console.log('Mensagem do usuário salva com sucesso');
        }
      } catch (dbError) {
        console.warn('Could not save user message to database:', dbError);
      }

      try {
        const webhookResponse = await sendToWebhook(messageContent, activeConversationId);
        console.log('Resposta completa do webhook:', webhookResponse);

        let aiResponseContent = 'Olá! Sou seu assistente Copy Chief. Como posso ajudá-lo hoje?';
        if (typeof webhookResponse === 'string') {
          aiResponseContent = webhookResponse;
        } else if (webhookResponse && typeof webhookResponse === 'object') {
          if (webhookResponse.resposta) {
            aiResponseContent = webhookResponse.resposta;
          } else if (webhookResponse.response) {
            aiResponseContent = webhookResponse.response;
          } else if (webhookResponse.message) {
            aiResponseContent = webhookResponse.message;
          } else if (webhookResponse.answer) {
            aiResponseContent = webhookResponse.answer;
          } else {
            const firstStringValue = Object.values(webhookResponse).find(value => typeof value === 'string');
            if (firstStringValue) {
              aiResponseContent = firstStringValue as string;
            }
          }
        }
        console.log('Conteúdo extraído da resposta:', aiResponseContent);

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponseContent,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiResponse]);

        try {
          console.log('Salvando resposta da IA...');
          const { error: aiMsgError } = await supabase
            .from('agent_messages')
            .insert({
              conversation_id: activeConversationId,
              role: 'assistant',
              content: aiResponse.content
            });
          if (aiMsgError) {
            console.error('Erro ao salvar resposta da IA:', aiMsgError);
          } else {
            console.log('Resposta da IA salva com sucesso');
          }
        } catch (dbError) {
          console.warn('Could not save AI response to database:', dbError);
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);

        const fallbackResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Desculpe, houve um problema de conexão com o servidor. Tente novamente em alguns instantes.',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, fallbackResponse]);

        try {
          await supabase
            .from('agent_messages')
            .insert({
              conversation_id: activeConversationId,
              role: 'assistant',
              content: fallbackResponse.content
            });
        } catch (dbError) {
          console.warn('Could not save fallback response to database:', dbError);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    sendMessage
  };
};
