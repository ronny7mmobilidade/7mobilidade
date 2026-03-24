# 🚗 7Mobilidade WhatsApp Bot

Bot inteligente para solicitar corridas via WhatsApp, integrado com a plataforma DevMobility.

## 🚀 Quick Start

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm run dev

# Build para produção
npm run build

# Rodar em produção
npm start
```

### Teste via API

```bash
# Enviar mensagem
curl -X POST http://localhost:3000/api/bot/message \
  -H "Content-Type: application/json" \
  -d '{"userID": "user_123", "message": "João Silva"}'

# Consultar conversa
curl http://localhost:3000/api/bot/conversation/user_123

# Consultar status da corrida
curl http://localhost:3000/api/bot/status/user_123

# Health check
curl http://localhost:3000/health
```

## 📋 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/bot/message` | Processa mensagem do usuário |
| GET | `/api/bot/conversation/:userID` | Obtém estado da conversa |
| GET | `/api/bot/status/:userID` | Consulta status da corrida |
| POST | `/api/bot/cancel/:userID` | Cancela solicitação |
| GET | `/health` | Health check |

## 🔧 Configuração

Crie um arquivo `.env` com as seguintes variáveis:

```env
PORT=3000
NODE_ENV=development

DEVMOBILITY_BASE_URL=https://webapiexterna.azurewebsites.net/7mobilidade/api/external/
DEVMOBILITY_USERNAME=seu_usuario
DEVMOBILITY_PASSWORD=sua_senha

SERVICO_ITEM_ID=29
TIPO_PAGAMENTO_ID=42
CLIENTE_ID=3
```

## 💬 Fluxo de Conversa

1. **Nome** - Coleta o nome do cliente
2. **Telefone** - Coleta o número de WhatsApp
3. **Origem** - Coleta o endereço de saída
4. **Destino** - Coleta o endereço de chegada
5. **Confirmação** - Mostra resumo com valor estimado
6. **Criação** - Cria a solicitação na DevMobility

## 📦 Stack

- **Node.js** + **Express.js**
- **TypeScript**
- **Axios** para requisições HTTP
- **CORS** para requisições cross-origin

## 🚀 Deploy no Railway

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Railway fará o build e deploy automaticamente

## 📞 Suporte

Para dúvidas, consulte a documentação da [API DevMobility](https://github.com/devbasetecnologia/devmobility/wiki)

---

**Desenvolvido com ❤️ para 7Mobilidade**
