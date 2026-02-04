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
