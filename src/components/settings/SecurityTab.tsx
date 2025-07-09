import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Key, Loader2 } from "lucide-react";
import { usePasswordUpdate } from "@/hooks/usePasswordUpdate";
import { useToast } from "@/hooks/use-toast";

export const SecurityTab: React.FC = () => {
  const { updatePassword, isLoading } = usePasswordUpdate();
  const { toast } = useToast();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos de senha.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Senha muito fraca",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a senha. Verifique sua senha atual.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança da Conta
          </CardTitle>
          <CardDescription className="text-slate-300">
            Mantenha sua conta segura gerenciando suas credenciais
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription className="text-slate-300">
            Atualize sua senha para manter sua conta segura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password" className="text-white">Senha Atual</Label>
            <Input
              id="current_password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              placeholder="Digite sua senha atual"
              className="bg-slate-600 border-slate-500 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password" className="text-white">Nova Senha</Label>
            <Input
              id="new_password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Digite sua nova senha"
              className="bg-slate-600 border-slate-500 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-white">Confirmar Nova Senha</Label>
            <Input
              id="confirm_password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirme sua nova senha"
              className="bg-slate-600 border-slate-500 text-white"
            />
          </div>

          <div className="pt-2">
            <div className="text-xs text-slate-400 mb-4">
              <p>• A senha deve ter pelo menos 6 caracteres</p>
              <p>• Use uma combinação de letras, números e símbolos</p>
              <p>• Não reutilize senhas de outras contas</p>
            </div>

            <Button 
              onClick={handleUpdatePassword}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Key className="mr-2 h-4 w-4" />
              )}
              Atualizar Senha
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};