# PRD — Sistema de Precificação para Hamburgueria
**Produto:** BurgerCost — Painel de Gestão de Custos e Precificação  
**Versão:** 1.0  
**Stack:** HTML · CSS · JavaScript (vanilla)  
**Persistência:** localStorage (MVP — sem backend)  
**Entregável:** Aplicação single-page, arquivo único `index.html`

---

## 1. Visão do produto

Sistema interno para dono de hamburgueria gerenciar:
1. A **base de insumos** (ingredientes com custo por unidade/grama/kg)
2. Os **produtos do cardápio** compostos por esses insumos
3. Os **custos operacionais** do negócio
4. A **precificação automática** baseada em custo real + markup definido pelo dono

O sistema responde a pergunta: **"Quanto esse burger me custa e quanto devo cobrar?"**

---

## 2. Páginas e navegação

Sidebar fixa com 4 páginas. Navegação via JS (SPA — sem reload).

```
┌─────────────────────────────────────────────────┐
│  SIDEBAR          │  CONTEÚDO PRINCIPAL          │
│                   │                              │
│  🏠 Dashboard     │  (renderizado por rota)      │
│  🥩 Insumos       │                              │
│  🍔 Produtos      │                              │
│  ⚙️  Negócio       │                              │
└─────────────────────────────────────────────────┘
```

---

## 3. Página 1 — Dashboard

**Objetivo:** Visão geral rápida do negócio.

### Cards de resumo (topo)
- Total de insumos cadastrados
- Total de produtos no cardápio
- Produto mais caro (custo de produção)
- Produto com menor margem

### Tabela: Cardápio com rentabilidade
Colunas: `Produto` · `Custo de produção` · `Preço sugerido` · `Margem (%)` · `Status`

Status colorido:
- 🟢 Saudável — margem ≥ meta do dono
- 🟡 Apertado — margem entre 0% e meta
- 🔴 Prejuízo — custo maior que preço

### Bloco: Resumo do markup aplicado
- Meta de margem configurada (vinda da página Negócio)
- Custo operacional por unidade vendida (rateio)
- Aviso se algum produto está precificado abaixo do custo

---

## 4. Página 2 — Insumos

**Objetivo:** Base de dados de todos os ingredientes e insumos com custo unitário.

### 4.1 Lista de insumos

Tabela com colunas:
| Campo | Tipo |
|---|---|
| Nome do insumo | texto |
| Categoria | select |
| Unidade de medida | select |
| Preço de compra | R$ (número) |
| Quantidade comprada | número |
| Custo por unidade base | calculado |
| Ações | editar / excluir |

**Categorias disponíveis:**
- Proteína (carne, frango, bacon)
- Pão
- Queijo / laticínio
- Vegetal / folha
- Molho / condimento
- Embalagem
- Descartável
- Outros

**Unidades de medida disponíveis:**
- kg (quilograma)
- g (grama)
- L (litro)
- ml (mililitro)
- un (unidade)
- cx (caixa)
- pct (pacote)

**Custo por unidade base (calculado automaticamente):**
- Se compra 5kg por R$ 80,00 → custo por grama = R$ 0,016/g
- Se compra 12 unidades por R$ 24,00 → custo por unidade = R$ 2,00/un
- Fórmula: `custo_unitario = preco_compra / (quantidade * fator_conversao)`

**Fator de conversão:**
- kg → g: × 1000
- L → ml: × 1000
- Demais: × 1 (já na unidade base)

### 4.2 Formulário — Cadastrar / Editar insumo

Campos:
- Nome* (text)
- Categoria* (select)
- Unidade de medida* (select)
- Preço de compra (R$)* (number)
- Quantidade por compra* (number) + unidade ao lado
- Rendimento estimado (%) — opcional, para perdas (ex: 80% = 20% de perda no preparo)
- Fornecedor (text, opcional)
- Observação (text, opcional)

Preview em tempo real: `"Custo por [unidade base]: R$ X,XX"`

Botões: `Salvar` · `Cancelar`

### 4.3 Funcionalidades da listagem
- Busca por nome
- Filtro por categoria
- Ordenação por nome / custo
- Botão "Novo insumo" fixo no topo direito
- Contador: "X insumos cadastrados"

---

## 5. Página 3 — Produtos

**Objetivo:** Criar produtos do cardápio compostos por insumos cadastrados. O sistema calcula o custo automaticamente.

### 5.1 Lista de produtos

Cards visuais (grid), cada card exibe:
- Nome do produto
- Categoria (ex: Smash · Artesanal · Combo · Sobremesa · Bebida)
- Custo de produção (R$)
- Preço sugerido (R$) — com base no markup
- Margem (%)
- Número de ingredientes
- Botões: Editar · Duplicar · Excluir

### 5.2 Formulário — Cadastrar / Editar produto

**Seção A — Dados do produto**
- Nome do produto* (text)
- Categoria* (select: Smash · Artesanal · Tradicional · Combo · Veggie · Sobremesa · Bebida · Acompanhamento)
- Descrição curta (text, opcional)

**Seção B — Composição (ficha técnica)**

Interface de montagem de ingredientes:

```
[ Buscar insumo... ▼ ]  [ Quantidade ]  [ Unidade ]  [ Custo ]  [ + Adicionar ]

─────────────────────────────────────────────────
  🥩 Blend de carne        180g      R$ 3,24   [×]
  🧀 Queijo cheddar         30g      R$ 0,48   [×]
  🍞 Pão brioche             1un     R$ 1,20   [×]
  🥬 Alface                 15g      R$ 0,09   [×]
  🫙 Maionese defumada      20g      R$ 0,34   [×]
─────────────────────────────────────────────────
  CUSTO DE INGREDIENTES                R$ 5,35
  + Custo operacional rateado          R$ 1,82
  ─────────────────────────────────────────────
  CUSTO TOTAL DE PRODUÇÃO              R$ 7,17
```

- Dropdown de busca filtra insumos já cadastrados em tempo real
- Campo quantidade + unidade de medida (herdada do insumo, editável)
- Custo calculado automaticamente ao digitar a quantidade
- Totais atualizados em tempo real

**Seção C — Precificação**

```
  Meta de margem do negócio:        35%   (vinda das configurações)
  Custo total de produção:        R$ 7,17
  ──────────────────────────────────────
  Preço mínimo viável:           R$ 9,03   (cobre custo + 0% lucro)
  Preço sugerido (com margem):   R$ 11,03  (calculado pelo markup)
  ──────────────────────────────────────
  Preço de venda praticado:    [ R$ 12,00 ]  ← editável pelo dono
  Margem real:                    40,2%   🟢
```

**Fórmula do preço sugerido:**
```
markup_divisor = 1 - (margem_meta / 100)
preco_sugerido = custo_total / markup_divisor
```

Exemplo: custo R$ 7,17, meta 35% → R$ 7,17 / 0,65 = **R$ 11,03**

**Seção D — Custo operacional rateado** (informativo, somente leitura)
- Exibe o custo operacional por unidade calculado da página Negócio
- Aviso se custo operacional não foi configurado

Botões: `Salvar produto` · `Cancelar`

### 5.3 Funcionalidades da listagem
- Busca por nome
- Filtro por categoria
- Filtro por status de margem (saudável / apertado / prejuízo)
- Botão "Novo produto" fixo
- View toggle: Cards · Tabela

---

## 6. Página 4 — Negócio (Configurações da empresa)

**Objetivo:** Cadastrar os dados operacionais e financeiros que alimentam o cálculo de markup em todos os produtos.

### 6.1 Dados da empresa
- Nome do estabelecimento (text)
- CNPJ / CPF (text, opcional)
- Tipo: `Lanchonete` · `Food truck` · `Dark kitchen` · `Restaurante` (select)

### 6.2 Custos operacionais mensais

Campos com labels descritivos:

| Item | Campo | Tipo |
|---|---|---|
| Aluguel / ponto | R$/mês | number |
| Energia elétrica | R$/mês | number |
| Água e gás | R$/mês | number |
| Internet e telefone | R$/mês | number |
| Salários e encargos | R$/mês | number |
| Pró-labore do dono | R$/mês | number |
| Sistema / software | R$/mês | number |
| Marketing | R$/mês | number |
| Manutenção / limpeza | R$/mês | number |
| Contabilidade | R$/mês | number |
| Embalagens gerais* | R$/mês | number |
| Outros fixos | R$/mês | number |

*Embalagens gerais = custo mensal estimado de sacolas, guardanapos, itens não por produto

**Total mensal calculado:** soma automática, exibido em destaque.

### 6.3 Volume de vendas estimado
- Quantidade média de produtos vendidos por dia (number)
- Dias de operação por mês (number, default 26)
- **Volume mensal calculado:** `vendas_dia × dias_mes`

### 6.4 Custo operacional por unidade
- `custo_op_unitario = total_custos_mensais / volume_mensal`
- Exibido em destaque: **"R$ X,XX por produto vendido"**
- Este valor é somado automaticamente ao custo de produção em todos os produtos

### 6.5 Meta de lucratividade
- Meta de margem de contribuição (%) — slider + input numérico, default 35%
- Tooltip explicando: "Percentual de lucro sobre o preço de venda. 35% significa que de cada R$10 vendidos, R$3,50 são lucro."

### 6.6 Impostos e taxas
- Regime tributário: `Simples Nacional` · `MEI` · `Lucro Presumido` · `Isento` (select)
- Taxa estimada de impostos (%) — preenchida automaticamente por regime, editável
- Taxa de maquininha / delivery (%) — opcional
- **Impacto no preço:** exibido como R$ adicional por unidade

### 6.7 Resumo do modelo de negócio (calculado)

Card de resumo sempre visível:
```
  Custo operacional mensal:     R$ 18.400,00
  Volume estimado / mês:            1.040 un
  Custo operacional / unidade:      R$ 17,69
  Meta de margem:                      35%
  Impostos estimados:                   6%
  ─────────────────────────────────────────
  Para cobrir tudo e lucrar 35%,
  cada produto precisa vender por no mínimo:
  
  CUSTO_PRODUCAO + R$17,69 dividido por 0,59
```

Botão: `Salvar configurações`

---

## 7. Motor de cálculo (JS puro)

Todas as funções em um módulo `calc.js` (ou bloco `<script>` isolado).

```javascript
// Custo unitário do insumo
function calcCustoUnitario(precoCompra, quantidade, unidade) {}

// Custo de um ingrediente na ficha técnica
function calcCustoIngrediente(custoUnitarioInsumo, qtdUsada, rendimento) {}

// Custo total de produção de um produto
function calcCustoProducao(ingredientes, custoOpUnitario) {}

// Preço sugerido pelo markup
function calcPrecoSugerido(custoTotal, margemMeta, impostos, taxaMaquininha) {}

// Margem real dado um preço praticado
function calcMargemReal(precoPraticado, custoTotal) {}

// Custo operacional por unidade
function calcCustoOpUnitario(totalCustosMensais, volumeMensal) {}

// Break-even (quantas vendas cobrem os fixos)
function calcBreakEven(totalCustosMensais, margemContribuicaoMedia) {}
```

---

## 8. Persistência (localStorage)

Chaves armazenadas:

| Chave | Conteúdo |
|---|---|
| `burgercost_insumos` | Array de objetos insumo |
| `burgercost_produtos` | Array de objetos produto (com ficha técnica) |
| `burgercost_negocio` | Objeto com custos operacionais e configurações |

Toda alteração (criar, editar, excluir) persiste imediatamente via `localStorage.setItem`.
Ao carregar a página, lê do localStorage e hidrata o estado da aplicação.

**Exportar / Importar dados:**
- Botão "Exportar dados" na página Negócio → baixa JSON
- Botão "Importar dados" → carrega JSON e sobrescreve localStorage

---

## 9. Dados de exemplo (seed)

Ao abrir pela primeira vez (localStorage vazio), popula automaticamente com:

**Insumos seed:**
- Blend de carne 80/20 — 5kg/R$95,00 → R$0,019/g
- Queijo cheddar — 2kg/R$38,00 → R$0,019/g
- Pão brioche — 12un/R$18,00 → R$1,50/un
- Bacon fatiado — 1kg/R$32,00 → R$0,032/g
- Alface americana — 1kg/R$8,00 → R$0,008/g
- Tomate — 1kg/R$6,00 → R$0,006/g
- Maionese defumada — 1kg/R$22,00 → R$0,022/g
- Ketchup — 1L/R$8,00 → R$0,008/ml

**Produto seed:**
- Smash Clássico: blend 150g + queijo 30g + pão 1un + alface 15g + tomate 20g + maionese 20g

**Negócio seed:**
- Custos mensais: R$ 12.000,00 (aluguel R$3.500 + funcionários R$5.000 + demais)
- Volume: 40 vendas/dia × 26 dias = 1.040/mês
- Meta de margem: 35%

---

## 10. Estrutura dos objetos (schema JS)

```javascript
// Insumo
{
  id: "uuid",
  nome: "Blend de carne 80/20",
  categoria: "proteina",
  unidadeCompra: "kg",
  unidadeBase: "g",
  precoCompra: 95.00,
  quantidadeCompra: 5,
  rendimento: 95, // % (5% de perda)
  fornecedor: "Frigorífico XYZ",
  obs: "",
  // calculado:
  custoUnitarioBase: 0.02 // R$/g
}

// Ingrediente dentro de um produto
{
  insumoId: "uuid",
  nomeInsumo: "Blend de carne 80/20",
  quantidade: 150,
  unidade: "g",
  // calculado:
  custoIngrediente: 3.00
}

// Produto
{
  id: "uuid",
  nome: "Smash Clássico",
  categoria: "smash",
  descricao: "Dois smashes, queijo, maionese defumada",
  ingredientes: [ /* array de Ingrediente */ ],
  precoPraticado: 28.00,
  // calculados:
  custoIngredientes: 6.42,
  custoOperacionalRateado: 11.54,
  custoTotalProducao: 17.96,
  precoSugerido: 27.63,
  margemReal: 35.9
}

// Negócio
{
  nomeEstabelecimento: "Burger da Esquina",
  tipo: "lanchonete",
  custos: {
    aluguel: 3500,
    energia: 800,
    agua_gas: 400,
    internet: 150,
    salarios: 5000,
    prolabore: 2000,
    // ...
  },
  totalCustosMensais: 12000,
  vendasDia: 40,
  diasMes: 26,
  volumeMensal: 1040,
  custoOpUnitario: 11.54,
  margemMeta: 35,
  regimeTributario: "simples",
  taxaImpostos: 6,
  taxaMaquininha: 2.5
}
```

---

## 11. Fora do escopo deste MVP

- Login / autenticação
- Banco de dados / backend
- Cardápio digital para cliente
- Controle de estoque (entradas/saídas)
- Controle de caixa / fluxo financeiro
- Relatórios de vendas
- Integração com delivery (iFood, Rappi)
- Responsivo mobile (desktop-first)
- Múltiplos estabelecimentos

---

## 12. Critérios de aceite

- [ ] Cadastrar insumo e ver custo por grama/unidade calculado
- [ ] Criar produto somando ingredientes e ver custo de produção em tempo real
- [ ] Preço sugerido muda quando meto de margem muda nas configurações
- [ ] Dashboard mostra quais produtos estão com margem abaixo da meta
- [ ] Dados persistem após fechar e reabrir o browser
- [ ] Exportar e importar dados em JSON funciona

---

## 13. Páginas / rotas da SPA

| Rota (hash) | Componente renderizado |
|---|---|
| `#dashboard` | Dashboard com cards e tabela geral |
| `#insumos` | Lista de insumos + formulário inline |
| `#insumos/novo` | Formulário de novo insumo |
| `#insumos/:id/editar` | Formulário de edição |
| `#produtos` | Grid de produtos |
| `#produtos/novo` | Formulário com ficha técnica |
| `#produtos/:id/editar` | Edição de produto |
| `#negocio` | Configurações do negócio |