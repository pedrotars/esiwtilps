import { Category, Expense } from '../types';

interface CategorizationResult {
  categoryId: string | null;
  confidence: number;
}

export class AICategorization {
  private static readonly API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;
  private static readonly API_URL = 'https://api.anthropic.com/v1/messages';

  static async categorizeExpense(
    description: string,
    categories: Category[],
    pastExpenses: Expense[]
  ): Promise<CategorizationResult> {
    if (!this.API_KEY) {
      console.warn('Anthropic API key not configured');
      return this.fallbackCategorization(description, categories, pastExpenses);
    }

    try {
      const prompt = this.buildPrompt(description, categories, pastExpenses);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 100,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.content[0].text.trim();
      
      return this.parseAIResponse(aiResponse, categories);
    } catch (error) {
      console.error('AI categorization failed:', error);
      return this.fallbackCategorization(description, categories, pastExpenses);
    }
  }

  private static buildPrompt(
    description: string,
    categories: Category[],
    pastExpenses: Expense[]
  ): string {
    const categoryList = categories.map(cat => `${cat.id}: ${cat.name} ${cat.icon}`).join('\n');
    
    const relevantPastExpenses = pastExpenses
      .filter(expense => 
        expense.description.toLowerCase().includes(description.toLowerCase()) ||
        description.toLowerCase().includes(expense.description.toLowerCase())
      )
      .slice(0, 5)
      .map(expense => {
        const category = categories.find(cat => cat.id === expense.categoryId);
        return `"${expense.description}" → ${category?.name || 'Unknown'}`;
      })
      .join('\n');

    return `You are an expense categorization assistant. Given an expense description, suggest the most appropriate category ID from the available categories.

Available categories:
${categoryList}

${relevantPastExpenses ? `Past similar expenses:
${relevantPastExpenses}

` : ''}Current expense description: "${description}"

Please respond with only the category ID that best matches this expense. If no category is a good match, respond with "NONE".

Examples:
- "pizza dinner" → food category ID
- "uber ride" → transportation category ID
- "netflix subscription" → entertainment category ID
- "electricity bill" → utilities category ID

Response:`;
  }

  private static parseAIResponse(response: string, categories: Category[]): CategorizationResult {
    const categoryId = response.trim();
    
    if (categoryId === 'NONE') {
      return { categoryId: null, confidence: 0.9 };
    }

    const matchedCategory = categories.find(cat => cat.id === categoryId);
    if (matchedCategory) {
      return { categoryId: matchedCategory.id, confidence: 0.85 };
    }

    return { categoryId: null, confidence: 0 };
  }

  private static fallbackCategorization(
    description: string,
    categories: Category[],
    pastExpenses: Expense[]
  ): CategorizationResult {
    const lowerDescription = description.toLowerCase();
    
    const exactMatch = pastExpenses.find(expense => 
      expense.description.toLowerCase() === lowerDescription
    );
    
    if (exactMatch) {
      return { categoryId: exactMatch.categoryId, confidence: 0.95 };
    }

    const partialMatch = pastExpenses.find(expense =>
      expense.description.toLowerCase().includes(lowerDescription) ||
      lowerDescription.includes(expense.description.toLowerCase())
    );
    
    if (partialMatch) {
      return { categoryId: partialMatch.categoryId, confidence: 0.7 };
    }

    const keywordMapping = {
      food: ['food', 'restaurant', 'pizza', 'burger', 'lunch', 'dinner', 'breakfast', 'cafe', 'coffee'],
      transportation: ['uber', 'taxi', 'bus', 'train', 'gas', 'fuel', 'parking', 'metro'],
      entertainment: ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'theater'],
      utilities: ['electricity', 'water', 'internet', 'phone', 'bill', 'utility'],
      shopping: ['shopping', 'store', 'amazon', 'clothes', 'shoes', 'mall']
    };

    for (const [categoryType, keywords] of Object.entries(keywordMapping)) {
      if (keywords.some(keyword => lowerDescription.includes(keyword))) {
        const matchedCategory = categories.find(cat => 
          cat.name.toLowerCase().includes(categoryType)
        );
        if (matchedCategory) {
          return { categoryId: matchedCategory.id, confidence: 0.6 };
        }
      }
    }

    return { categoryId: null, confidence: 0 };
  }
}