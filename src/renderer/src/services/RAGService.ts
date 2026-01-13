export interface SearchResult {
  id: string
  name: string
  path: string
  score: number
  snippet?: string
  content?: string
}

export interface ActiveFile {
  name: string
  path: string
  content: string
}

export interface RAGResponse {
  augmentedMessage: string
  sources: SearchResult[]
}

export class RAGService {
  private readonly SIMILARITY_THRESHOLD = 0.05
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

  async prepareExplicitContext(
    userMessage: string,
    activeFiles: ActiveFile[]
  ): Promise<RAGResponse> {
    if (!activeFiles || activeFiles.length === 0) {
      // Fallback to implicit RAG if no explicit files
      return this.preparePromptWithContext(userMessage)
    }

    // Explicit Mode: Use these files ONLY (or prioritize them heavily)
    let contextString = ''

    // We can allow larger context for explicit files as user specifically asked for them
    const EXPLICIT_MAX_LENGTH = 12000

    for (const file of activeFiles) {
      // Use full content, but safety limit
      const content = file.content.substring(0, 8000)
      contextString += `\n=== BEGIN FILE: ${file.name} ===\n${content}\n=== END FILE ===\n`
      if (contextString.length > EXPLICIT_MAX_LENGTH) break
    }

    // Prompt Engineering for "See this file"
    const augmentedMessage = `[SYSTEM: You are a helpful AI assistant. The user has attached files. You must read them to answer.
IMPORTANT INSTRUCTIONS:
1. ANSWER IN FRENCH ONLY.
2. USE MARKDOWN FORMATTING.
3. BE EXTREMELY CONCISE. Answer directly.
4. DO NOT REPEAT THE QUESTION OR CONTEXT.
5. NO FILLER WORDS ("Voici la réponse", "Basé sur le fichier..."). Just the answer.
6. If the user asks for a list, provide a numbered list.
]

${contextString}

[USER QUESTION]:
${userMessage}`

    // Convert ActiveFile to SearchResult for UI compatibility
    const sources: SearchResult[] = activeFiles.map((f) => ({
      id: f.path,
      name: f.name,
      path: f.path,
      score: 1.0,
      content: f.content
    }))

    return {
      augmentedMessage,
      sources
    }
  }
}

export const ragService = new RAGService()
