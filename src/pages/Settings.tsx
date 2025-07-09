import React from 'react';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/settings/ProfileTab";
import { SecurityTab } from "@/components/settings/SecurityTab";
import { PreferencesTab } from "@/components/settings/PreferencesTab";

const Settings = () => {
  return (
    <SidebarInset>
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto p-3 md:p-6">
          <div className="flex flex-col space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-white" />
              <div className="flex-1">
                <h1 className="text-lg md:text-2xl font-bold text-white">Configurações</h1>
                <p className="text-slate-300 text-xs md:text-sm">Gerencie suas configurações de perfil e preferências</p>
              </div>
            </div>
            <div className="flex justify-end">
              <ThemeToggle />
            </div>
          </div>

          <Card className="bg-slate-800 border-transparent backdrop-blur-sm">
            <CardContent className="p-3 md:p-6">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                  <TabsTrigger value="profile" className="data-[state=active]:bg-slate-600">
                    Perfil
                  </TabsTrigger>
                  <TabsTrigger value="security" className="data-[state=active]:bg-slate-600">
                    Segurança
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="data-[state=active]:bg-slate-600">
                    Preferências
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <ProfileTab />
                </TabsContent>
                
                <TabsContent value="security">
                  <SecurityTab />
                </TabsContent>
                
                <TabsContent value="preferences">
                  <PreferencesTab />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  );
};

export default Settings;