import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Trash2, Upload, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TrainingDataItem {
  id: string;
  question: string;
  answer: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const TrainingData: React.FC = () => {
  const [trainingData, setTrainingData] = useState<TrainingDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTrainingData();
  }, []);

  const loadTrainingData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agent_training_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrainingData(data || []);
    } catch (error) {
      console.error('Error loading training data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de treinamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitTrainingData = async () => {
    if (!question.trim() || !answer.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha pergunta e resposta.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('agent_training_data')
        .insert({
          user_id: user.id,
          question: question.trim(),
          answer: answer.trim(),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Dados de treinamento adicionados com sucesso.",
      });

      setQuestion('');
      setAnswer('');
      setShowForm(false);
      loadTrainingData();
    } catch (error) {
      console.error('Error submitting training data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar os dados de treinamento.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTrainingData = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item de treinamento?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('agent_training_data')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTrainingData(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Item de treinamento excluído com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting training data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o item de treinamento.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      approved: { label: 'Aprovado', variant: 'default' as const },
      rejected: { label: 'Rejeitado', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center text-slate-400">
            Carregando dados de treinamento...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Dados de Treinamento
          </CardTitle>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </CardHeader>
        
        {showForm && (
          <CardContent className="border-t border-slate-700 pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="question" className="text-slate-300">Pergunta</Label>
                <Textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Digite a pergunta que o usuário pode fazer..."
                  className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="answer" className="text-slate-300">Resposta</Label>
                <Textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Digite a resposta que a IA deve dar..."
                  className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={submitTrainingData}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {trainingData.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum dado de treinamento encontrado.</p>
                <p className="text-sm">Adicione perguntas e respostas para treinar sua IA!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {trainingData.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-white">Pergunta</h4>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-slate-300 bg-slate-700/50 p-3 rounded">
                            {item.question}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-white mb-2">Resposta</h4>
                          <p className="text-slate-300 bg-slate-700/50 p-3 rounded">
                            {item.answer}
                          </p>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Criado em {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTrainingData(item.id)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
