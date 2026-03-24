import axios, { AxiosInstance } from 'axios';
import { config, getAuthHeader } from '../config.js';

interface CalcularValoresRequest {
  enderecoOrigem: string;
  listaDestinoCidade: Array<{
    endereco: string;
    latitude?: string;
    longitude?: string;
  }>;
}

interface CriarSolicitacaoRequest {
  nomePassageiro: string;
  telefonePrincipal: string;
  enderecoOrigem: string;
  enderecoDestino: string;
  latitudeOrigem?: string;
  longitudeOrigem?: string;
  latitudeDestino?: string;
  longitudeDestino?: string;
  observacoes?: string;
}

class DevMobilityService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.devmobility.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
    });
  }

  async calcularValoresViagem(request: CalcularValoresRequest) {
    try {
      const payload = {
        clienteID: config.devmobility.clienteID,
        servicoItemID: config.devmobility.servicoItemID,
        tipoPagamentoID: config.devmobility.tipoPagamentoID,
        enderecoOrigem: request.enderecoOrigem,
        listaDestinoCidade: request.listaDestinoCidade,
      };

      const response = await this.client.post('CalcularValoresViagem', payload);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao calcular valores:', error.response?.data || error.message);
      throw new Error(`Erro ao calcular valores: ${error.message}`);
    }
  }

  async criarSolicitacaoViagem(request: CriarSolicitacaoRequest) {
    try {
      const payload = {
        clienteID: config.devmobility.clienteID,
        servicoItemID: config.devmobility.servicoItemID,
        tipoPagamentoID: config.devmobility.tipoPagamentoID,
        enderecoOrigem: request.enderecoOrigem,
        enderecoDestino: request.enderecoDestino,
        latitudeOrigem: request.latitudeOrigem,
        longitudeOrigem: request.longitudeOrigem,
        latitudeDestino: request.latitudeDestino,
        longitudeDestino: request.longitudeDestino,
        nomePassageiro: request.nomePassageiro,
        telefonePrincipal: request.telefonePrincipal,
        observacoes: request.observacoes,
      };

      const response = await this.client.post('CriarSolicitacaoViagem', payload);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar solicitação:', error.response?.data || error.message);
      throw new Error(`Erro ao criar solicitação: ${error.message}`);
    }
  }

  async consultarStatusSolicitacao(solicitacaoID: number) {
    try {
      const response = await this.client.get(`ConsultarStatusSolicitacao?solicitacaoID=${solicitacaoID}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao consultar status:', error.response?.data || error.message);
      throw new Error(`Erro ao consultar status: ${error.message}`);
    }
  }

  async cancelarSolicitacao(solicitacaoID: number) {
    try {
      const response = await this.client.post(`CancelarSolicitacao?solicitacaoID=${solicitacaoID}`, {});
      return response.data;
    } catch (error: any) {
      console.error('Erro ao cancelar solicitação:', error.response?.data || error.message);
      throw new Error(`Erro ao cancelar solicitação: ${error.message}`);
    }
  }
}

export const devMobilityService = new DevMobilityService();
