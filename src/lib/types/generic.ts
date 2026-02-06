export enum Categories {
	PedidoCardapio = "PEDIDO_CARDAPIO",
	StatusEntrega = "STATUS_ENTREGA",
	Reclamacao = "RECLAMACAO",
	Elogio = "ELOGIO",
	Outros = "OUTROS",
}

export type Conversation = {
	id: number;
	message: string;
	expected_category: Categories;
};

export type Message = {
	id: number;
	message: string;
};

export type MessageContext = {
	role?: string;
	content: string;
};
