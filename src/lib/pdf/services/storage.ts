import { SavedProposal, ProposalVersion, ProposalData, PDFError, PDFErrorType } from '../types/index'
import { v4 as uuidv4 } from 'uuid'

/**
 * Interface for proposal storage operations
 * This will be implemented using IndexedDB for PDF blobs and localStorage for metadata
 */
export interface ProposalStorage {
  /**
   * Save a proposal to storage
   * @param proposal The proposal to save
   * @returns Promise resolving to the proposal ID
   */
  save(proposal: SavedProposal): Promise<string>

  /**
   * Load a proposal from storage
   * @param id The proposal ID
   * @returns Promise resolving to the proposal or null if not found
   */
  load(id: string): Promise<SavedProposal | null>

  /**
   * List all saved proposals
   * @returns Promise resolving to array of proposals
   */
  list(): Promise<SavedProposal[]>

  /**
   * Delete a proposal from storage
   * @param id The proposal ID
   * @returns Promise resolving to true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>

  /**
   * Search proposals by query
   * @param query Search query (client name, project name, etc.)
   * @returns Promise resolving to matching proposals
   */
  search(query: string): Promise<SavedProposal[]>
}

/**
 * IndexedDB implementation of ProposalStorage
 * Uses IndexedDB for storing PDF blobs and proposal data
 */
export class IndexedDBProposalStorage implements ProposalStorage {
  private dbName = 'ProposalStorage'
  private dbVersion = 1
  private storeName = 'proposals'
  private db: IDBDatabase | null = null

  /**
   * Initialize the IndexedDB database
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          
          // Create indexes for searching
          store.createIndex('clientName', 'clientName', { unique: false })
          store.createIndex('projectName', 'projectName', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('updatedAt', 'updatedAt', { unique: false })
        }
      }
    })
  }

  /**
   * Generate a unique ID for proposals
   */
  private generateId(): string {
    return uuidv4()
  }

  /**
   * Save a proposal to IndexedDB with versioning support
   */
  async save(proposal: SavedProposal): Promise<string> {
    try {
      const db = await this.initDB()
      
      // Generate ID if not provided
      if (!proposal.id) {
        proposal.id = this.generateId()
      }

      // Set timestamps
      const now = new Date()
      const isNewProposal = !proposal.createdAt
      
      if (isNewProposal) {
        proposal.createdAt = now
        proposal.version = 1
        proposal.versionHistory = []
      } else {
        // This is an update - create a new version
        const existingProposal = await this.load(proposal.id)
        if (existingProposal) {
          // Save current version to history
          const currentVersion: ProposalVersion = {
            version: existingProposal.version,
            createdAt: existingProposal.updatedAt,
            changes: [], // Will be populated by caller
            pdfBlob: existingProposal.pdfBlob,
            proposalData: existingProposal.proposalData,
            clientData: existingProposal.clientData
          }

          proposal.versionHistory = existingProposal.versionHistory || []
          proposal.versionHistory.push(currentVersion)
          proposal.version = existingProposal.version + 1
          proposal.createdAt = existingProposal.createdAt // Keep original creation date
        }
      }
      
      proposal.updatedAt = now

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.put(proposal)

        request.onsuccess = () => {
          resolve(proposal.id)
        }

        request.onerror = () => {
          reject(new Error('Failed to save proposal to IndexedDB'))
        }
      })
    } catch (error) {
      throw new Error(`Storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Load a proposal from IndexedDB
   */
  async load(id: string): Promise<SavedProposal | null> {
    try {
      const db = await this.initDB()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly')
        const store = transaction.objectStore(this.storeName)
        const request = store.get(id)

        request.onsuccess = () => {
          const result = request.result
          if (result) {
            // Convert date strings back to Date objects
            result.createdAt = new Date(result.createdAt)
            result.updatedAt = new Date(result.updatedAt)
            result.proposalData.generatedAt = new Date(result.proposalData.generatedAt)
          }
          resolve(result || null)
        }

        request.onerror = () => {
          reject(new Error('Failed to load proposal from IndexedDB'))
        }
      })
    } catch (error) {
      throw new Error(`Load failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * List all proposals from IndexedDB
   */
  async list(): Promise<SavedProposal[]> {
    try {
      const db = await this.initDB()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly')
        const store = transaction.objectStore(this.storeName)
        const request = store.getAll()

        request.onsuccess = () => {
          const results = request.result || []
          // Convert date strings back to Date objects
          const proposals = results.map(proposal => ({
            ...proposal,
            createdAt: new Date(proposal.createdAt),
            updatedAt: new Date(proposal.updatedAt),
            proposalData: {
              ...proposal.proposalData,
              generatedAt: new Date(proposal.proposalData.generatedAt)
            }
          }))
          
          // Sort by creation date (newest first)
          proposals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          resolve(proposals)
        }

        request.onerror = () => {
          reject(new Error('Failed to list proposals from IndexedDB'))
        }
      })
    } catch (error) {
      throw new Error(`List failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete a proposal from IndexedDB
   */
  async delete(id: string): Promise<boolean> {
    try {
      const db = await this.initDB()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        
        // First check if the proposal exists
        const getRequest = store.get(id)
        
        getRequest.onsuccess = () => {
          if (!getRequest.result) {
            resolve(false) // Proposal not found
            return
          }

          // Delete the proposal
          const deleteRequest = store.delete(id)
          
          deleteRequest.onsuccess = () => {
            resolve(true)
          }

          deleteRequest.onerror = () => {
            reject(new Error('Failed to delete proposal from IndexedDB'))
          }
        }

        getRequest.onerror = () => {
          reject(new Error('Failed to check proposal existence in IndexedDB'))
        }
      })
    } catch (error) {
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Search proposals by query string
   */
  async search(query: string): Promise<SavedProposal[]> {
    try {
      const allProposals = await this.list()
      
      if (!query.trim()) {
        return allProposals
      }

      const searchTerm = query.toLowerCase().trim()
      
      return allProposals.filter(proposal => 
        proposal.clientName.toLowerCase().includes(searchTerm) ||
        proposal.projectName.toLowerCase().includes(searchTerm) ||
        proposal.clientData.companyName.toLowerCase().includes(searchTerm) ||
        proposal.clientData.contactName.toLowerCase().includes(searchTerm)
      )
    } catch (error) {
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get version history for a proposal
   */
  async getVersionHistory(proposalId: string): Promise<ProposalVersion[]> {
    try {
      const proposal = await this.load(proposalId)
      return proposal?.versionHistory || []
    } catch (error) {
      throw new Error(`Failed to get version history: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Save a proposal with version changes description
   */
  async saveWithChanges(proposal: SavedProposal, changes: string[]): Promise<string> {
    try {
      const db = await this.initDB()
      
      // Generate ID if not provided
      if (!proposal.id) {
        proposal.id = this.generateId()
      }

      // Set timestamps
      const now = new Date()
      const isNewProposal = !proposal.createdAt
      
      if (isNewProposal) {
        proposal.createdAt = now
        proposal.version = 1
        proposal.versionHistory = []
      } else {
        // This is an update - create a new version
        const existingProposal = await this.load(proposal.id)
        if (existingProposal) {
          // Save current version to history with changes
          const currentVersion: ProposalVersion = {
            version: existingProposal.version,
            createdAt: existingProposal.updatedAt,
            changes: changes,
            pdfBlob: existingProposal.pdfBlob,
            proposalData: existingProposal.proposalData,
            clientData: existingProposal.clientData
          }

          proposal.versionHistory = existingProposal.versionHistory || []
          proposal.versionHistory.push(currentVersion)
          proposal.version = existingProposal.version + 1
          proposal.createdAt = existingProposal.createdAt // Keep original creation date
        }
      }
      
      proposal.updatedAt = now

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.put(proposal)

        request.onsuccess = () => {
          resolve(proposal.id)
        }

        request.onerror = () => {
          reject(new Error('Failed to save proposal to IndexedDB'))
        }
      })
    } catch (error) {
      throw new Error(`Storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Compare two proposal versions and return differences
   */
  compareVersions(version1: ProposalData, version2: ProposalData): string[] {
    const differences: string[] = []

    // Compare totals
    if (version1.totalMonthly !== version2.totalMonthly) {
      differences.push(`Valor mensal alterado de R$ ${version1.totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para R$ ${version2.totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    }

    if (version1.totalAnnual !== version2.totalAnnual) {
      differences.push(`Valor anual alterado de R$ ${version1.totalAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para R$ ${version2.totalAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    }

    if (version1.contractPeriod !== version2.contractPeriod) {
      differences.push(`Prazo do contrato alterado de ${version1.contractPeriod} para ${version2.contractPeriod} meses`)
    }

    // Compare equipment count
    if (version1.equipments.length !== version2.equipments.length) {
      differences.push(`Quantidade de equipamentos alterada de ${version1.equipments.length} para ${version2.equipments.length}`)
    }

    // Compare individual equipments (simplified)
    const v1EquipmentIds = new Set(version1.equipments.map(e => e.id))
    const v2EquipmentIds = new Set(version2.equipments.map(e => e.id))

    // Find added equipments
    version2.equipments.forEach(equipment => {
      if (!v1EquipmentIds.has(equipment.id)) {
        differences.push(`Equipamento adicionado: ${equipment.brand} ${equipment.model}`)
      }
    })

    // Find removed equipments
    version1.equipments.forEach(equipment => {
      if (!v2EquipmentIds.has(equipment.id)) {
        differences.push(`Equipamento removido: ${equipment.brand} ${equipment.model}`)
      }
    })

    // Find modified equipments
    version2.equipments.forEach(newEquipment => {
      const oldEquipment = version1.equipments.find(e => e.id === newEquipment.id)
      if (oldEquipment) {
        if (oldEquipment.monthlyVolume !== newEquipment.monthlyVolume) {
          differences.push(`Volume mensal do ${newEquipment.brand} ${newEquipment.model} alterado de ${oldEquipment.monthlyVolume.toLocaleString()} para ${newEquipment.monthlyVolume.toLocaleString()} páginas`)
        }
        if (oldEquipment.monthlyCost !== newEquipment.monthlyCost) {
          differences.push(`Custo mensal do ${newEquipment.brand} ${newEquipment.model} alterado de R$ ${oldEquipment.monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para R$ ${newEquipment.monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        }
      }
    })

    return differences
  }

  /**
   * Clear all proposals (for testing/development)
   */
  async clear(): Promise<void> {
    try {
      const db = await this.initDB()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.clear()

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = () => {
          reject(new Error('Failed to clear proposals from IndexedDB'))
        }
      })
    } catch (error) {
      throw new Error(`Clear failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Export a singleton instance
export const proposalStorage = new IndexedDBProposalStorage()