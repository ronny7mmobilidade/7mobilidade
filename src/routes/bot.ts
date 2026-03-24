import { Router, Request, Response } from 'express';
import { conversationService } from '../services/conversation.js';
import { devMobilityService } from '../services/devmobility.js';

const router = Router();

/**
 * POST /api/bot/message
 * Processa mensagem do usuário
 */
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { userID, message } = req.body;

    if (!userID || !message) {
      return res.status(400).json({ error: 'userID e message são obrigatórios' });
    }

    let conversation = conversationService.getConversation(userID);

    if (!conversation) {
      conversation = conversationService.startConversation(userID);
    }

    const validation = conversationService.validateInput(conversation, message);

    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error,
        botMessage: conversationService.getNextBotMessage(conversation),
      });
    }

    switch (conversation.state) {
      case 'waiting_name':
        conversation = conversationService.updateConversation(userID, { name: message.trim() });
        conversationService.nextState(userID);
        break;

      case 'waiting_phone':
        conversation = conversationService.updateConversation(userID, { phone: message.trim() });
        conversationService.nextState(userID);
        break;

      case 'waiting_origin':
        conversation = conversationService.updateConversation(userID, { origin: message.trim() });
        conversationService.nextState(userID);
        break;

      case 'waiting_destination':
        conversation = conversationService.updateConversation(userID, { destination: message.trim() });

        try {
          const calcResponse = await devMobilityService.calcularValoresViagem({
            enderecoOrigem: conversation.origin!,
            listaDestinoCidade: [{ endereco: conversation.destination! }],
          });

          const servicoValor = calcResponse.retornoCalculoValores?.listaServicoValor?.[0];
          if (servicoValor) {
            conversation = conversationService.updateConversation(userID, {
              estimatedPrice: servicoValor.valor,
            });
          }
        } catch (error) {
          console.error('Erro ao calcular valores:', error);
        }

        conversationService.nextState(userID);
        break;

      case 'waiting_confirmation':
        const isConfirmed = message.toLowerCase().startsWith('s');

        if (isConfirmed) {
          try {
            const rideResponse = await devMobilityService.criarSolicitacaoViagem({
              nomePassageiro: conversation.name!,
              telefonePrincipal: conversation.phone!,
              enderecoOrigem: conversation.origin!,
              enderecoDestino: conversation.destination!,
            });

            conversation = conversationService.updateConversation(userID, {
              rideID: rideResponse.solicitacaoID,
              state: 'completed',
            });
          } catch (error) {
            console.error('Erro ao criar solicitação:', error);
            return res.status(500).json({
              error: `Erro ao criar solicitação: ${error instanceof Error ? error.message : String(error)}`,
              botMessage: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
            });
          }
        } else {
          conversationService.cancelConversation(userID);
          conversation = conversationService.getConversation(userID)!;
        }
        break;
    }

    const botMessage = conversationService.getNextBotMessage(conversation);

    res.json({
      success: true,
      conversation: {
        userID: conversation.userID,
        state: conversation.state,
        rideID: conversation.rideID,
      },
      botMessage,
    });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/bot/conversation/:userID
 * Obtém estado atual da conversa
 */
router.get('/conversation/:userID', (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const conversation = conversationService.getConversation(userID);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    res.json({ success: true, conversation });
  } catch (error) {
    console.error('Erro ao obter conversa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/bot/status/:userID
 * Consulta status da corrida
 */
router.get('/status/:userID', async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const conversation = conversationService.getConversation(userID);

    if (!conversation || !conversation.rideID) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    const status = await devMobilityService.consultarStatusSolicitacao(conversation.rideID);

    res.json({ success: true, status });
  } catch (error) {
    console.error('Erro ao consultar status:', error);
    res.status(500).json({
      error: `Erro ao consultar status: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
});

/**
 * GET /api/bot/test-credentials
 * Testa as credenciais da API DevMobility
 */
router.get('/test-credentials', async (req: Request, res: Response) => {
  try {
    const testResponse = await devMobilityService.calcularValoresViagem({
      enderecoOrigem: 'Rua Teste, 123 - São Paulo',
      listaDestinoCidade: [{ endereco: 'Avenida Teste, 456 - São Paulo' }],
    });

    res.json({
      success: true,
      message: 'Credenciais válidas!',
      response: testResponse,
    });
  } catch (error) {
    console.error('Erro ao testar credenciais:', error);
    res.status(500).json({
      success: false,
      error: `Erro ao testar credenciais: ${error instanceof Error ? error.message : String(error)}`,
      hint: 'Verifique as variáveis de ambiente: DEVMOBILITY_USERNAME, DEVMOBILITY_PASSWORD, DEVMOBILITY_BASE_URL',
    });
  }
});

/**
 * POST /api/bot/cancel/:userID
 * Cancela solicitação
 */
router.post('/cancel/:userID', async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const conversation = conversationService.getConversation(userID);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    if (conversation.rideID) {
      try {
        await devMobilityService.cancelarSolicitacao(conversation.rideID);
      } catch (error) {
        console.error('Erro ao cancelar solicitação:', error);
      }
    }

    conversationService.cancelConversation(userID);

    res.json({ success: true, message: 'Solicitação cancelada' });
  } catch (error) {
    console.error('Erro ao cancelar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
