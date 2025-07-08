import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FirstAdminSetupProps {
  onAdminCreated: () => void;
}

export const FirstAdminSetup: React.FC<FirstAdminSetupProps> = ({ onAdminCreated }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro", 
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting to call create-admin function...');
      
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function invocation error:', error);
        throw new Error(`Function error: ${error.message || 'Unknown error'}`);
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      // Handle successful response
      let successMessage = "Conta de administrador criada com sucesso! Faça login para continuar.";
      
      if (data?.recovered) {
        if (data.recoveredCount > 0) {
          successMessage = data.message || `${data.recoveredCount} conta(s) de administrador recuperada(s) com sucesso! Faça login para continuar.`;
        } else {
          successMessage = "Tentativa de recuperação concluída. Verifique os logs para mais detalhes.";
        }
      }

      toast({
        title: "Sucesso!",
        description: successMessage,
      });

      onAdminCreated();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      
      // Provide more detailed error information
      let errorMessage = "Erro ao criar conta de administrador";
      
      if (error.message?.includes('Failed to send a request')) {
        errorMessage = "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
      } else if (error.message?.includes('Function error')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverOrphans = async () => {
    setRecovering(true);
    
    try {
      console.log('Attempting to recover orphaned users...');
      
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: {
          email: 'recovery@system.com', // Dummy data for recovery
          password: 'recovery123',
          fullName: 'Recovery User'
        }
      });

      console.log('Recovery response:', { data, error });

      if (error) {
        throw new Error(`Recovery error: ${error.message || 'Unknown error'}`);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Recuperação Concluída!",
        description: data?.message || "Tentativa de recuperação de usuários órfãos executada.",
      });

      // Always try to refresh admin status after recovery
      setTimeout(() => {
        onAdminCreated();
      }, 1000);
      
    } catch (error: any) {
      console.error('Error during recovery:', error);
      
      toast({
        title: "Erro na Recuperação",
        description: error.message || "Erro ao tentar recuperar usuários órfãos",
        variant: "destructive"
      });
    } finally {
      setRecovering(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Configuração Inicial</CardTitle>
        <CardDescription className="text-center">
          Crie a primeira conta de administrador do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || recovering}
          >
            {loading ? "Processando..." : "Criar/Recuperar Conta de Administrador"}
          </Button>
        </form>
        
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center mb-2">
            Se você já possui uma conta mas não consegue acessar:
          </p>
          <Button 
            type="button"
            variant="outline"
            className="w-full" 
            disabled={loading || recovering}
            onClick={handleRecoverOrphans}
          >
            {recovering ? "Recuperando..." : "Recuperar Usuários Órfãos"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};