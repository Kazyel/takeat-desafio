# Classificador de Intenções - Desafio Takeat

![workflow](https://github.com/kazyel/takeat-desafio/actions/workflows/actions.yml/badge.svg)

> Sistema inteligente de classificação automática de mensagens de clientes de restaurantes usando IA (Google Gemini).

## 📋 Sobre o Projeto

Este projeto é uma API REST que classifica automaticamente mensagens de clientes de restaurantes em 5 categorias diferentes, utilizando o modelo Google Gemini para análise de linguagem natural.

## ✨ Funcionalidades

- ✅ Classificação simples de mensagens individuais
- ✅ Classificação com contexto (histórico de conversa)
- ✅ Validação automática contra exemplos conhecidos
- ✅ Métricas detalhadas (acurácia, precisão, recall, F1-score)
- ✅ Score de confiança para cada classificação
- ✅ API RESTful completa e documentada
- ✅ Testes automatizados com Vitest
- ✅ CI/CD com GitHub Actions

## 🧩 Tecnologias Utilizadas

- 🔧 Node.js
- 📦 Bun
- 📝 TypeScript
- 🚀 Hono
- 🧾 Pino
- 🔒 Zod
- 🧪 Vitest
- 🎨 Biome
- 🔗 GitHub Actions
- 📊 Google Gemini

## 🚀 Como Utilizar

### Pré-requisitos

- Node.js 18.x ou superior
- Bun (ou npm/yarn)
- Chave da API do Google Gemini ([obter aqui](https://aistudio.google.com/app/api-keys))

```bash
# 1. Clone o repositório
git clone https://github.com/kazyel/takeat-desafio.git

# 2. Entre na pasta do projeto
cd takeat-desafio

# 3. Instale as dependências
bun install

# 4. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env e adicione sua GEMINI_API_KEY

# 5. Execute o servidor
bun run dev
```

O servidor estará rodando em: http://localhost:8080/api/v1

## 📚 Documentação da API

Para acessar a documentação da API completa, acesse [aqui](docs/API.md).

### Endpoint Base

```bash
http://localhost:8080/api/v1
```

### 🔍 Endpoints Disponíveis

#### 1️⃣ **GET /** - Informações da API

```bash
curl http://localhost:8080/api/v1
```

**Resposta:**

```json
{
  "name": "Classificador de Intenções - API",
  "version": "1.0.0",
  "description": "API REST para classificação automática de mensagens",
  "endpoints": { ... },
  "categories": ["PEDIDO_CARDAPIO", "STATUS_ENTREGA", ...]
}
```

---

#### 2️⃣ **POST /classify** - Classificar mensagem simples

```bash
curl -X POST http://localhost:8080/api/v1/classify \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Oi, queria saber se vocês têm pizza de calabresa"
  }'
```

**Resposta:**

```json
{
  "category": "PEDIDO_CARDAPIO",
  "confidence": 0.95,
  "reasoning": "Mensagem pergunta sobre item do cardápio"
}
```

---

#### 2️⃣ **POST /classify** - Classificar mensagem com contexto

```bash
curl -X POST http://localhost:8080/api/v1/classify \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Queria saber se vocês têm pizza de calabresa",
    "context": [
      { "role": "user", "content": "Oi, boa noite" },
      { "role": "assistant", "content": "Olá!
  }'
```

**Resposta:**

```json
{
  "category": "PEDIDO_CARDAPIO",
  "confidence": 0.95,
  "reasoning": "Mensagem pergunta sobre item do cardápio"
}
```

---

#### 4️⃣ **POST /validate** - Validar modelo contra exemplos

```bash
curl -X POST http://localhost:8080/api/v1/validate
```

**Resposta:**

```json
{
  "total": 25,
  "correct": 25,
  "accuracy": 100,
  "results": [ ... ],
}
```

---

#### 5️⃣ **GET /metrics** - Métricas detalhadas

```bash
curl http://localhost:8080/api/v1/metrics
```

**Resposta:**

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
    ...
  ]
}
```

---

#### 8️⃣ **GET /health** - Health check

```bash
curl http://localhost:8080/api/v1/health
```

## 🎨 Qualidade de Código

### Linting (Biome)

Por padrão, o projeto utiliza o linter [Biome](https://biomejs.dev/) para verificar o código.

```bash
# Verificar código
bun run lint
```

### EditorConfig

O projeto utiliza o [EditorConfig](https://editorconfig.org/) para definir padrões de formatação de código.
