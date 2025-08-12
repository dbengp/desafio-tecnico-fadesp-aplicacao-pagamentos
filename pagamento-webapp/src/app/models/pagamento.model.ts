import { PagamentoStatus } from './pagamento-status.enum';
import { MetodoPagamento } from './pagamento-metodo.enum';

export interface Pagamento {
  id?: string;
  idPagamento: number;
  cpfCnpj: string;
  metodoPagamento: MetodoPagamento;
  numeroCartao?: string;
  valor: number;
  status: PagamentoStatus;
  ativo: boolean;
}

export interface NovoPagamento extends Omit<Pagamento, 'id' | 'status' | 'ativo'> {}