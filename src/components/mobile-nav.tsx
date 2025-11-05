"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu } from "lucide-react"

interface MobileNavProps {
  onNavigate: (module: string) => void
}

export function MobileNav({ onNavigate }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  const handleNavigation = (module: string) => {
    onNavigate(module)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-primary-900 border-primary-700/50">
        <div className="flex flex-col space-y-4 mt-8">
          <Button
            variant="ghost"
            className="justify-start text-lg font-medium text-primary-300 hover:text-white hover:bg-primary-800/60 hover:border-accent-cyan/30 transition-all duration-300"
            onClick={() => handleNavigation("sales")}
          >
            Vendas
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-lg font-medium text-primary-300 hover:text-white hover:bg-primary-800/60 hover:border-accent-cyan/30 transition-all duration-300"
            onClick={() => handleNavigation("rental")}
          >
            Locação
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-lg font-medium text-primary-300 hover:text-white hover:bg-primary-800/60 hover:border-accent-cyan/30 transition-all duration-300"
            onClick={() => handleNavigation("services")}
          >
            Serviços
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-lg font-medium text-primary-300 hover:text-white hover:bg-primary-800/60 hover:border-accent-cyan/30 transition-all duration-300"
            onClick={() => handleNavigation("proposals")}
          >
            Propostas
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-lg font-medium text-primary-300 hover:text-white hover:bg-primary-800/60 hover:border-accent-cyan/30 transition-all duration-300"
            onClick={() => handleNavigation("admin")}
          >
            Admin
          </Button>
          <div className="flex items-center justify-between pt-4 border-t border-primary-700/50">
            <span className="text-sm font-medium text-primary-200">Tema</span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}