# LEIA E USE ANTES DE RODAR


### 1. Pré-requisitos (Ubuntu)
- Node.js >= 18 (ou 16) e npm/yarn instalados

- Git (Opcional)

### 2. Instalação

#### Abra 2 terminais

- Backend:
```
cd estoque/backend
npm install
npm run dev
# (ou `node src/server.js` se não quiser nodemon)
```

- Frontend:
```
cd estoque/frontend
npm install
npm run dev
# abre em http://localhost:5173 por padrão
```


### 3. Testar

- Acesse o frontend (por exemplo http://localhost:5173) e use as telas:

  - Adicionar peça → gera código de barras e salva
  
  - Saída → escaneie o código (scanner USB age como teclado) ou cole o código
  
  - Inventário e Movimentações → relatórios