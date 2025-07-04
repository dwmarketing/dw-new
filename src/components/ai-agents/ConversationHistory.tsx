import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Archive, Trash2, Clock, Eye, EyeOff, Pen, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface Conversation {
  id: string;
  title: string;
  status: 'active' | 'archived' | 'closed';
  created_at: string;
  updated_at: string;
  message_count?: number;
}

interface ConversationHistoryProps {
  onSelectConversation: (id: string) => void;
  refreshTrigger?: number;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  onSelectConversation,
  refreshTrigger = 0
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    conversationId: string;
    conversationTitle: string;
  }>({
    isOpen: false,
    conversationId: '',
    conversationTitle: ''
  });
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const conversationsEndRef = useRef<HTMLDivElement>(null);

  // Função para scroll automático suave
  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
          scrollElement.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }
    });
  }, []);

  useEffect(() => {
    loadConversations();
  }, [refreshTrigger]);

  // Scroll automático quando conversas são carregadas ou filtradas
  useEffect(() => {
    if (!loading && conversations.length > 0) {
      scrollToTop();
    }
  }, [conversations, showArchived, loading, scrollToTop]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log('Carregando conversas...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado');
        return;
      }

      console.log('Usuário autenticado:', user.id);

      const { data, error } = await supabase
        .from('agent_conversations')
        .select(`
          id,
          title,
          status,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar conversas:', error);
        throw error;
      }

      console.log('Conversas carregadas:', data);

      // Get message counts for each conversation
      const conversationsWithCounts = await Promise.all(
        (data || []).map(async (conv) => {
          try {
            const { count } = await supabase
              .from('agent_messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id);

            return {
              ...conv,
              message_count: count || 0
            };
          } catch (error) {
            console.warn('Erro ao contar mensagens para conversa', conv.id, ':', error);
            return {
              ...conv,
              message_count: 0
            };
          }
        })
      );

      setConversations(conversationsWithCounts);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleArchive = async (conversationId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'archived' : 'active';
      
      const { error } = await supabase
        .from('agent_conversations')
        .update({ status: newStatus })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, status: newStatus as 'active' | 'archived' | 'closed' }
            : conv
        )
      );

      toast({
        title: "Sucesso",
        description: `Conversa ${newStatus === 'archived' ? 'arquivada' : 'desarquivada'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error toggling archive:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da conversa.",
        variant: "destructive",
      });
    }
  };

  const handleEditTitle = (conversationId: string, currentTitle: string) => {
    setEditingId(conversationId);
    setEditTitleValue(currentTitle);
  };

  const handleSaveTitle = async (conversationId: string) => {
    if (!editTitleValue.trim()) return;

    try {
      const { error } = await supabase
        .from('agent_conversations')
        .update({ title: editTitleValue.trim() })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, title: editTitleValue.trim() }
            : conv
        )
      );

      setEditingId(null);
      setEditTitleValue('');
      
      toast({
        title: "Sucesso",
        description: "Título da conversa atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Error updating title:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o título da conversa.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitleValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, conversationId: string) => {
    if (e.key === 'Enter') {
      handleSaveTitle(conversationId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const openDeleteDialog = (conversationId: string, conversationTitle: string) => {
    setDeleteDialog({
      isOpen: true,
      conversationId,
      conversationTitle
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      conversationId: '',
      conversationTitle: ''
    });
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('agent_conversations')
        .delete()
        .eq('id', deleteDialog.conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(conv => conv.id !== deleteDialog.conversationId));
      
      toast({
        title: "Sucesso",
        description: "Conversa excluída com sucesso.",
      });
      
      closeDeleteDialog();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conversa.",
        variant: "destructive",
      });
    }
  };

  const filteredConversations = conversations.filter(conv => 
    showArchived ? conv.status === 'archived' : conv.status === 'active'
  );

  if (loading) {
    return (
      <Card className="bg-neutral-950 border-neutral-800 h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-neutral-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400 mx-auto mb-3"></div>
            <p className="text-sm">Carregando conversas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-neutral-950 border-neutral-800 h-full flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0 bg-neutral-900/50 border-b border-neutral-800 p-4">
          <div className="space-y-3">
            <CardTitle className="text-white flex items-center gap-2 text-lg font-semibold">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Histórico de Conversas
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className={`w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all duration-200 ${
                showArchived ? 'bg-neutral-800 text-white' : ''
              }`}
            >
              {showArchived ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  <span className="text-sm">Ocultar Arquivadas</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  <span className="text-sm">Mostrar Arquivadas</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4">
              {filteredConversations.length === 0 ? (
                <div className="text-center text-neutral-400 py-12">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">
                    {showArchived 
                      ? "Nenhuma conversa arquivada" 
                      : "Nenhuma conversa encontrada"
                    }
                  </h3>
                  {!showArchived && (
                    <p className="text-sm text-neutral-500">
                      Inicie um chat para começar!
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="group relative bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 hover:bg-neutral-800/50 hover:border-neutral-700 transition-all duration-200 cursor-pointer"
                      onClick={() => editingId !== conversation.id && onSelectConversation(conversation.id)}
                    >
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge 
                          variant={conversation.status === 'active' ? 'default' : 'secondary'}
                          className={`text-xs px-2 py-1 ${
                            conversation.status === 'active' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : 'bg-neutral-700 text-neutral-300 border-neutral-600'
                          }`}
                        >
                          {conversation.status === 'active' ? 'Ativa' : 'Arquivada'}
                        </Badge>
                      </div>

                      {/* Title Section */}
                      <div className="mb-3 pr-16">
                        {editingId === conversation.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editTitleValue}
                              onChange={(e) => setEditTitleValue(e.target.value)}
                              onKeyDown={(e) => handleKeyPress(e, conversation.id)}
                              className="bg-neutral-800 border-neutral-600 text-white text-sm focus:border-blue-500"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex gap-1">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveTitle(conversation.id);
                                }}
                                size="sm"
                                variant="ghost"
                                className="text-green-400 hover:text-green-300 hover:bg-green-500/20 h-8 w-8 p-0"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEdit();
                                }}
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-8 w-8 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <h3 className="font-medium text-white text-sm leading-5 line-clamp-2 hover:text-blue-400 transition-colors duration-200 flex-1">
                              {conversation.title}
                            </h3>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTitle(conversation.id, conversation.title);
                              }}
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white hover:bg-neutral-700 h-6 w-6 p-0 transition-all duration-200"
                              title="Editar título"
                            >
                              <Pen className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Metadata Section */}
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{conversation.message_count} {conversation.message_count === 1 ? 'mensagem' : 'mensagens'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(conversation.updated_at), 'dd/MM/yy HH:mm', { locale: ptBR })}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {editingId !== conversation.id && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleArchive(conversation.id, conversation.status);
                            }}
                            className="text-neutral-400 hover:text-blue-400 hover:bg-blue-500/20 h-8 px-3 text-xs transition-all duration-200"
                            title={conversation.status === 'active' ? 'Arquivar' : 'Desarquivar'}
                          >
                            <Archive className="w-3 h-3 mr-1" />
                            {conversation.status === 'active' ? 'Arquivar' : 'Desarquivar'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(conversation.id, conversation.title);
                            }}
                            className="text-neutral-400 hover:text-red-400 hover:bg-red-500/20 h-8 px-3 text-xs transition-all duration-200"
                            title="Excluir"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={conversationsEndRef} className="h-1" />
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        conversationTitle={deleteDialog.conversationTitle}
      />
    </>
  );
};
