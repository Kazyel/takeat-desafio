# 📘 Documentação da API - Classificador de Intenções

## Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
- [Rate Limiting](#rate-limiting)

---

## Visão Geral

**Base URL:** `http://localhost:8080/api/v1`

**Formato:** JSON

**Headers obrigatórios:**

```bash
Content-Type: application/json
```

---

## Autenticação

Esta API não requer autenticação atualmente. A chave do Gemini é configurada no servidor via variáveis de ambiente.

---

## Endpoints

### 1. Root - Informações da API

**Endpoint:** `GET /`

**Descrição:** Retorna informações sobre a API e seus endpoints disponíveis.

**Resposta:** `200 OK`

```json
{
  "name": "Classificador de Intenções - API",
  "version": "1.0.0",
  "description": "API REST para classificação automática de mensagens de clientes de restaurantes",
  "endpoints": {
    "health": "GET /health",
    "classify": "POST /classify",
    "validate": "GET /validate",
    "metrics": "GET /metrics"
  },
  "categories": [
    "PEDIDO_CARDAPIO",
    "STATUS_ENTREGA",
    "RECLAMACAO",
    "ELOGIO",
    "OUTROS"
  ],
  "documentation": "Consulte o README.md e API.md para mais informações"
}
```

---

### 2. Health Check

**Endpoint:** `GET /health`

**Descrição:** Verifica se a API está online e funcionando.

**Resposta:** `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2024-02-06T10:30:00.000Z",
  "service": "Classificador de Intenções - API",
  "version": "1.0.0"
}
```

---

### 3. Classificar Mensagem Simples

**Endpoint:** `POST /classify`

**Descrição:** Classifica uma mensagem individual sem contexto.

**Request Body:**

```json
{
  "message": "string (obrigatório)"
}
```

**Exemplo de Request:**

```json
{
  "message": "Oi, queria saber se vocês têm pizza de calabresa"
}
```

**Resposta:** `200 OK`

```json
{
  "category": "PEDIDO_CARDAPIO",
  "confidence": 0.95,
  "reasoning": "Mensagem pergunta sobre item do cardápio"
}
```

**Erros:**

- `400 Bad Request` - Campo message ausente ou vazio
- `500 Internal Server Error` - Erro ao comunicar com Gemini

---

### 4. Classificar com Contexto

**Endpoint:** `POST /classify`

**Descrição:** Classifica uma mensagem considerando o histórico da conversa.

**Request Body:**

```json
{
  "message": "Oi, boa noite",
  "context": [
    {
      "role": "user | assistant",
      "content": "string"
    }
  ]
}
```

**Exemplo de Request:**

```json
{
  "message": "Meu pedido já saiu?",
  "context": [
    { "role": "user", "content": "Oi, boa noite" },
    { "role": "assistant", "content": "Olá! Como posso ajudar?" }
  ]
}
```

**Resposta:** `200 OK`

```json
{
  "category": "STATUS_ENTREGA",
  "confidence": 0.98,
  "reasoning": "Contexto indica pergunta sobre status do pedido"
}
```

**Erros:**

- `400 Bad Request` - Array messages vazio ou com estrutura inválida
- `500 Internal Server Error` - Erro ao processar contexto

---

### 5. Validar Todos os Exemplos

**Endpoint:** `POST /validate`

**Descrição:** Valida o modelo contra todos os exemplos do arquivo `conversas-exemplo.json` e retorna resultados detalhados.

⚠️ **Atenção:** Este endpoint faz 25 chamadas à API do Gemini e pode demorar ~15+ segundos cada chamada (dependendo do modelo utilizado).

**Request Body:** Nenhum

**Resposta:** `200 OK`

```json
{
  "total": 25,
  "correct": 25,
  "accuracy": 100,
  "results": [
    {
      "id": "1",
      "message": "Oi, queria saber se vocês têm pizza de calabresa no cardápio",
      "expected": "PEDIDO_CARDAPIO",
      "predicted": "PEDIDO_CARDAPIO",
      "confidence": 0.95,
      "reasoning": "Mensagem pergunta sobre item do cardápio",
      "correct": true,
    },
    ...
  ],
}
```

---

### 7. Métricas Detalhadas

**Endpoint:** `GET /metrics`

**Descrição:** Calcula e retorna métricas detalhadas de performance do modelo (acurácia, precisão, recall, F1-score por categoria).

⚠️ **Atenção:** Este endpoint valida todos os exemplos (pode demorar ~15+ segundos cada chamada, dependendo do modelo utilizado).

**Request Body:** Nenhum

**Resposta:** `200 OK`

```json
{
  "accuracy": 100,
  "totalExamples": 25,
  "correctPredictions": 25,
  "categoryMetrics": [
    {
      "category": "PEDIDO_CARDAPIO",
      "precision": 100,
      "recall": 100,
      "f1Score": 100,
      "samples": 5
    },
    {
      "category": "STATUS_ENTREGA",
      "precision": 100,
      "recall": 100,
      "f1Score": 100,
      "samples": 5
    },
    ...
  ]
}
```

Para entender melhor como as métricas são calculadas, visite o site do [Google Developers Machine Learning](https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall?hl=pt-br).

---

## Rate Limiting

Atualmente não há limite de taxa implementado na API. No entanto, esteja ciente de que:

- A API do Gemini tem seus próprios limites
- Validações completas fazem múltiplas requisições

---

<p align="center">
  <strong>Documentação completa da API do Classificador de Intenções</strong>
</p>
