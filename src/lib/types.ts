export enum Categories {
  PedidoCardapio = "PEDIDO_CARDAPIO",
  StatusEntrega = "STATUS_ENTREGA",
  Reclamacao = "RECLAMACAO",
  Elogio = "ELOGIO",
  Outros = "OUTROS",
}

export interface Conversation {
  id: number;
  message: string;
  expected_category: Categories;
}

export type Message = {
  id: number;
  message: string;
};

export type CategoryMetrics = {
  category: Categories;
  precision: number;
  recall: number;
  f1Score: number;
  samples: number;
};

export interface ClassificationRequest {
  message: string;
}

export interface ClassificationResponse {
  category: Categories;
  confidence: number;
}

export type ValidationResult = {
  id: number;
  message: string;
  expected: Categories;
  predicted: Categories;
  confidence: number;
  correct: boolean;
};

export type ValidationResponse = {
  total: number;
  correct: number;
  accuracy: number;
  results: ValidationResult[];
};

export type MetricsResponse = {
  accuracy: number;
  totalResults: number;
  totalCorrect: number;
  categoryMetrics: CategoryMetrics[];
};
