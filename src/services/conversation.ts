export type ConversationState =
  | 'waiting_name'
  | 'waiting_phone'
  | 'waiting_origin'
  | 'waiting_destination'
  | 'waiting_confirmation'
  | 'completed'
  | 'cancelled';

export interface ConversationData {
  userID: string;
  state: ConversationState;
  name?: string;
  phone?: string;
  origin?: string;
  destination?: string;
  estimatedPrice?: number;
  rideID?: number;
  createdAt: Date;
  updatedAt: Date;
}

class ConversationService {
  private conversations: Map<string, ConversationData> = new Map();

  startConversation(userID: string): ConversationData {
    const conversation: ConversationData = {
      userID,
      state: 'waiting_name',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.conversations.set(userID, conversation);
    return conversation;
  }

  getConversation(userID: string): ConversationData | null {
    return this.conversations.get(userID) || null;
  }

  updateConversation(userID: string, updates: Partial<ConversationData>): ConversationData {
    const conversation = this.conversations.get(userID);

    if (!conversation) {
      throw new Error(`Conversa não encontrada para usuário ${userID}`);
    }

    const updated = {
      ...conversation,
      ...updates,
      updatedAt: new Date(),
    };

    this.conversations.set(userID, updated);
    return updated;
  }

  nextState(userID: string): ConversationState {
    const conversation = this.conversations.get(userID);

    if (!conversation) {
      throw new Error(`Conversa não encontrada para usuário ${userID}`);
    }

    const stateTransitions: Record<ConversationState, ConversationState> = {
      waiting_name: 'waiting_phone',
      waiting_phone: 'waiting_origin',
      waiting_origin: 'waiting_destination',
      waiting_destination: 'waiting_confirmation',
      waiting_confirmation: 'completed',
      completed: 'completed',
      cancelled: 'cancelled',
    };

    const nextState = stateTransitions[conversation.state];
    return this.updateConversation(userID, { state: nextState }).state;
  }

  cancelConversation(userID: string): void {
    const conversation = this.conversations.get(userID);
    if (conversation) {
      this.updateConversation(userID, { state: 'cancelled' });
    }
  }

  deleteConversation(userID: string): void {
    this.conversations.delete(userID);
  }

  getNextBotMessage(conversation: ConversationData): string {
    const messages: Record<ConversationState, string> = {
      waiting_name: 'Olá! 👋 Bem-vindo à 7Mobilidade!\n\nQual é o seu nome?',
      waiting_phone: 'Obrigado! 😊\n\nAgora, qual é o seu número de telefone/WhatsApp?',
      waiting_origin: 'Perfeito! 📍\n\nDe onde você sairá? (Digite o endereço ou local)',
      waiting_destination: 'Ótimo! 🎯\n\nPara onde você deseja ir? (Digite o endereço ou local)',
      waiting_confirmation: `Resumo da sua solicitação:\n\n👤 Nome: ${conversation.name}\n📱 Telefone: ${conversation.phone}\n📍 Origem: ${conversation.origin}\n🎯 Destino: ${conversation.destination}\n💰 Valor estimado: R$ ${conversation.estimatedPrice?.toFixed(2) || '...'}\n\nConfirma? (sim/não)`,
      completed: '✅ Sua corrida foi solicitada com sucesso!\n\nUm motorista chegará em breve. Acompanhe pelo app.',
      cancelled: '❌ Solicitação cancelada. Se precisar de algo, é só chamar!',
    };

    return messages[conversation.state] || 'Desculpe, ocorreu um erro.';
  }

  validateInput(conversation: ConversationData, input: string): { valid: boolean; error?: string } {
    const trimmedInput = input.trim();

    switch (conversation.state) {
      case 'waiting_name':
        if (trimmedInput.length < 2) {
          return { valid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
        }
        return { valid: true };

      case 'waiting_phone':
        const phoneRegex = /^[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(trimmedInput) || trimmedInput.length < 10) {
          return { valid: false, error: 'Telefone inválido. Use formato: (XX) 9XXXX-XXXX' };
        }
        return { valid: true };

      case 'waiting_origin':
      case 'waiting_destination':
        if (trimmedInput.length < 5) {
          return { valid: false, error: 'Endereço deve ter pelo menos 5 caracteres' };
        }
        return { valid: true };

      case 'waiting_confirmation':
        if (!trimmedInput.toLowerCase().startsWith('s') && !trimmedInput.toLowerCase().startsWith('n')) {
          return { valid: false, error: 'Responda com "sim" ou "não"' };
        }
        return { valid: true };

      default:
        return { valid: true };
    }
  }
}

export const conversationService = new ConversationService();
