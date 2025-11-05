"use client"

import { ShoppingCart, Calendar, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ModuleShortcutsProps {
  currentModule: 'sales' | 'rental' | 'services'
  onModuleChange: (module: 'sales' | 'rental' | 'services') => void
}

export function ModuleShortcuts({ currentModule, onModuleChange }: ModuleShortcutsProps) {
  const modules = [
    {
      id: 'sales' as const,
      name: 'Vendas',
      icon: ShoppingCart,
      color: 'from-teal-600 to-blue-600',
      description: 'Sistema de Vendas Inteligente'
    },
    {
      id: 'rental' as const,
      name: 'Locação',
      icon: Calendar,
      color: 'from-purple-600 to-pink-600',
      description: 'Sistema de Locação Inteligente'
    },
    {
      id: 'services' as const,
      name: 'Serviços',
      icon: Wrench,
      color: 'from-green-600 to-teal-600',
      description: 'Sistema de Serviços Inteligente'
    }
  ]

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Atalhos rápidos:</span>
          <div className="flex gap-2">
            {modules.map((module) => {
              const Icon = module.icon
              const isActive = currentModule === module.id
              
              return (
                <Button
                  key={module.id}
                  onClick={() => onModuleChange(module.id)}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={`flex items-center gap-2 ${
                    isActive 
                      ? `bg-gradient-to-r ${module.color} text-white hover:opacity-90` 
                      : "hover:bg-muted"
                  }`}
                  title={module.description}
                >
                  <Icon className="h-4 w-4" />
                  {module.name}
                </Button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}