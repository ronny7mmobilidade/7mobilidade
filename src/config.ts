import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  devmobility: {
    baseURL: process.env.DEVMOBILITY_BASE_URL || 'https://webapiexterna.azurewebsites.net/7mobilidade/api/external/',
    username: process.env.DEVMOBILITY_USERNAME || '',
    password: process.env.DEVMOBILITY_PASSWORD || '',
    servicoItemID: parseInt(process.env.SERVICO_ITEM_ID || '29'),
    tipoPagamentoID: parseInt(process.env.TIPO_PAGAMENTO_ID || '42'),
    clienteID: parseInt(process.env.CLIENTE_ID || '3'),
  },
  
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
    phoneNumberID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  }
};

export function getAuthHeader(): string {
  const credentials = `${config.devmobility.username}:${config.devmobility.password}`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
}
