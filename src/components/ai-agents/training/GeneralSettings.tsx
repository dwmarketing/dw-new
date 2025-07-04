import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save } from "lucide-react";

interface AgentConfiguration {
  id: string;
  agent_name: string;
  agent_description: string;
  default_language: string;
  voice_tone: string;
}

export const GeneralSettings: React.FC = () => {
  const [config, setConfig] = useState<AgentConfiguration>({
    id: '',
    agent_name: 'Copy Chief',
    agent_description: '',
    default_language: 'pt-BR',
    voice_tone: 'formal'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('agent_configurations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const configData = {
        id: config.id || crypto.randomUUID(),
        user_id: user.id,
        agent_name: config.agent_name,
        agent_description: config.agent_description,
        default_language: config.default_language,
        voice_tone: config.voice_tone
      };

      if (config.id) {
        const { error } = await supabase
          .from('agent_configurations')
          .update(configData)
          .eq('id', config.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('agent_configurations')
          .insert(configData)
          .select()
          .single();
        
        if (error) throw error;
        if (data) {
          setConfig(data);
        }
      }

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!"
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AgentConfiguration, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card className="bg-neutral-900 border-neutral-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-neutral-700 rounded w-1/4"></div>
            <div className="h-10 bg-neutral-700 rounded"></div>
            <div className="h-4 bg-neutral-700 rounded w-1/4"></div>
            <div className="h-24 bg-neutral-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-white">Configurações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="agent_name" className="text-white">Nome do Agente</Label>
            <Input
              id="agent_name"
              value={config.agent_name}
              onChange={(e) => handleInputChange('agent_name', e.target.value)}
              className="bg-neutral-800 border-neutral-600 text-white"
              placeholder="Ex: Copy Chief"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_language" className="text-white">Idioma Padrão</Label>
            <Select
              value={config.default_language}
              onValueChange={(value) => handleInputChange('default_language', value)}
            >
              <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-600">
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="voice_tone" className="text-white">Tom de Voz</Label>
          <Select
            value={config.voice_tone}
            onValueChange={(value) => handleInputChange('voice_tone', value)}
          >
            <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-600">
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="friendly">Amigável</SelectItem>
              <SelectItem value="professional">Profissional</SelectItem>
              <SelectItem value="enthusiastic">Entusiasmado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="agent_description" className="text-white">Descrição do Agente</Label>
          <Textarea
            id="agent_description"
            value={config.agent_description}
            onChange={(e) => handleInputChange('agent_description', e.target.value)}
            className="bg-neutral-800 border-neutral-600 text-white min-h-[100px]"
            placeholder="Descreva o propósito e personalidade do seu agente..."
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={saveConfiguration}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
