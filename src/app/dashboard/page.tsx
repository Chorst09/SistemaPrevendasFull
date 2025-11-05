'use client';

import React from 'react';
import { SystemDashboard } from '@/components/service-desk-pricing/dashboard/SystemDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  // TODO: Get userId from authentication
  const userId = 'temp-user-id';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Projetos</span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Visão geral do sistema Service Desk Pricing
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href="/projects">
                <Button variant="outline" size="sm">
                  Ver Projetos
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="sm" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Novo Projeto</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <SystemDashboard userId={userId} />
      </div>
    </div>
  );
}