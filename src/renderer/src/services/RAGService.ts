export interface SearchResult {
  id: string
  name: string
  path: string
  score: number
  snippet?: string
  content?: string
}

export interface RAGResponse {
  augmentedMessage: string
  sources: SearchResult[]
}

export class RAGService {
  private readonly SIMILARITY_THRESHOLD = 0.7
  private readonly MAX_CONTEXT_LENGTH = 3000 // Characters

  async preparePromptWithContext(userMessage: string): Promise<RAGResponse> {
    try {
      // 1. Search for context
      const results: SearchResult[] = await window.api.searchSemantic(userMessage)

      // 2. Filter by threshold
      const relevantDocs = results.filter((doc) => doc.score > this.SIMILARITY_THRESHOLD)

      if (relevantDocs.length === 0) {
        return {
          augmentedMessage: userMessage,
          sources: []
        }
      }

      // 3. Construct Context String
      let contextString = ''
      let currentLength = 0

      for (const doc of relevantDocs) {
        const text = doc.snippet || doc.content || `Fichier: ${doc.name} (Contenu non accessible)`
        const entry = `\n---\nDocument: ${doc.name}\n${text}\n`

        if (currentLength + entry.length > this.MAX_CONTEXT_LENGTH) break

        contextString += entry
        currentLength += entry.length
      }

      // 4. Augment Prompt
      const augmentedMessage = `CONTEXTE:\n${contextString}\n\nQUESTION:\n${userMessage}\n\nRÉPONSES BASÉES SUR LE CONTEXTE UNIQUEMENT.`

      return {
        augmentedMessage,
        sources: relevantDocs
      }
    } catch (error) {
      console.error('RAGService Error:', error)
      // Fallback to original message on error
      return {
        augmentedMessage: userMessage,
        sources: []
      }
    }
  }
}

export const ragService = new RAGService()
