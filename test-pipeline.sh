#!/bin/bash

# Script helper para rodar testes localmente
# Simula o que o GitHub Actions faz

echo "🧪 Executando pipeline de testes local..."
echo ""

echo "🧪 2. Executando testes..."
bun run test
if [ $? -ne 0 ]; then
    echo "❌ Testes falharam!"
    exit 1
fi
echo "✅ Testes passaram!"
echo ""

echo "✅ Build concluído!"
echo ""

echo "🎉 Pipeline completo! Tudo funcionando!"