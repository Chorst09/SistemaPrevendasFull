"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProposalData, Budget, BudgetItem } from '@/lib/types/proposals'
import { generateProposalPDF } from '@/lib/utils/pdf-generator'

interface ProposalStore {
  proposals: ProposalData[]
  currentProposal: ProposalData | null
  
  // Actions
  createProposal: (proposalData: Omit<ProposalData, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'budgets'>) => string
  updateProposal: (proposalId: string, proposalData: Partial<Omit<ProposalData, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'budgets'>>) => void
  setCurrentProposal: (proposalId: string) => void
  addBudgetToProposal: (proposalId: string, budget: Omit<Budget, 'id' | 'proposalId' | 'createdAt' | 'updatedAt'>) => void
  updateProposalStatus: (proposalId: string, status: ProposalData['status']) => void
  generateProposalPDF: (proposalId: string, action?: 'save' | 'print') => void
  getProposalById: (proposalId: string) => ProposalData | undefined
  getAllProposals: () => ProposalData[]
}

export const useProposalStore = create<ProposalStore>()(
  persist(
    (set, get) => ({
      proposals: [],
      currentProposal: null,

      createProposal: (proposalData) => {
        const id = `PROP-${Date.now()}`
        const newProposal: ProposalData = {
          ...proposalData,
          id,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
          budgets: []
        }
        
        set((state) => ({
          proposals: [...state.proposals, newProposal],
          currentProposal: newProposal
        }))
        
        return id
      },

      updateProposal: (proposalId, proposalData) => {
        set((state) => ({
          proposals: state.proposals.map(proposal =>
            proposal.id === proposalId
              ? { 
                  ...proposal, 
                  ...proposalData,
                  updatedAt: new Date()
                }
              : proposal
          ),
          currentProposal: state.currentProposal?.id === proposalId 
            ? { ...state.currentProposal, ...proposalData, updatedAt: new Date() }
            : state.currentProposal
        }))
      },

      setCurrentProposal: (proposalId) => {
        const proposal = get().proposals.find(p => p.id === proposalId)
        set({ currentProposal: proposal || null })
      },

      addBudgetToProposal: (proposalId, budgetData) => {
        const budgetId = `BUDGET-${Date.now()}`
        const newBudget: Budget = {
          ...budgetData,
          id: budgetId,
          proposalId,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        set((state) => ({
          proposals: state.proposals.map(proposal => 
            proposal.id === proposalId 
              ? { 
                  ...proposal, 
                  budgets: [...proposal.budgets, newBudget],
                  updatedAt: new Date(),
                  status: 'active' as const
                }
              : proposal
          )
        }))
      },

      updateProposalStatus: (proposalId, status) => {
        set((state) => ({
          proposals: state.proposals.map(proposal =>
            proposal.id === proposalId
              ? { ...proposal, status, updatedAt: new Date() }
              : proposal
          )
        }))
      },

      generateProposalPDF: (proposalId, action = 'save') => {
        const proposal = get().proposals.find(p => p.id === proposalId)
        if (proposal) {
          generateProposalPDF(proposal, action)
        }
      },

      getProposalById: (proposalId) => {
        return get().proposals.find(p => p.id === proposalId)
      },

      getAllProposals: () => {
        return get().proposals
      }
    }),
    {
      name: 'proposal-storage',
    }
  )
)