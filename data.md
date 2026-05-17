# Prompt — Gemini CLI · Seed de Dados Realistas BurgerCost

## Tarefa

Gere um arquivo `seed.js` com dados realistas e completos para popular o sistema BurgerCost de uma hamburgueria brasileira de médio porte chamada **"Burger da Esquina"**, operando em Belo Horizonte, MG.

---

## Entregável

Um único arquivo `seed.js` que exporta um objeto `SEED_DATA` com três chaves: `insumos`, `produtos` e `negocio`.

O arquivo deve poder ser colado diretamente dentro do bloco `<script>` do `index.html`, substituindo qualquer seed existente.

Formato final:

```javascript
const SEED_DATA = {
  insumos: [ /* array */ ],
  produtos: [ /* array */ ],
  negocio: { /* objeto */ }
};
```

---

## Regras de geração

### Realismo obrigatório
- Todos os preços de insumos devem refletir valores de mercado brasileiro em 2024/2025
- Pesos e quantidades devem ser realistas para uma hamburgueria (não use 1g de carne)
- Nomes de insumos como um fornecedor real nomearia (ex: "Blend bovino 80/20" não "carne")

### IDs
Gere IDs como strings únicas simples: `"ins_001"`, `"ins_002"` para insumos e `"prod_001"` para produtos.

---

## Seção 1 — Insumos (mínimo 25 itens)

Cubra obrigatoriamente estas categorias com os itens listados:

### Proteínas (mínimo 5)
- Blend bovino 80/20 (compra em kg)
- Frango grelhado filé (compra em kg)
- Bacon fatiado defumado (compra em kg)
- Linguiça calabresa (compra em kg)
- Ovo caipira (compra por unidade, caixa com 30)

### Pães (mínimo 3)
- Pão brioche artesanal (compra por unidade, pacote com 12)
- Pão australiano (compra por unidade, pacote com 12)
- Pão de hambúrguer tradicional (compra por unidade, pacote com 16)

### Queijos e laticínios (mínimo 4)
- Queijo cheddar fatiado (compra em kg)
- Queijo prato fatiado (compra em kg)
- Queijo gorgonzola (compra em kg)
- Cream cheese (compra em kg)

### Vegetais e folhas (mínimo 5)
- Alface americana (compra em kg)
- Tomate italiano (compra em kg)
- Cebola roxa (compra em kg)
- Rúcula (compra em kg)
- Pepino em conserva (compra em kg, pote)

### Molhos e condimentos (mínimo 5)
- Maionese defumada artesanal (compra em kg)
- Ketchup tradicional (compra em litro)
- Mostarda dijon (compra em kg)
- Molho barbecue (compra em litro)
- Aioli de alho negro (compra em kg)

### Embalagens (mínimo 3)
- Caixa kraft para burger (compra por unidade, pacote com 100)
- Papel manteiga impresso (compra por unidade, pacote com 500)
- Saco delivery kraft (compra por unidade, pacote com 100)

### Schema de cada insumo:
```javascript
{
  id: "ins_001",
  nome: "Blend bovino 80/20",
  categoria: "proteina",           // proteina | pao | queijo | vegetal | molho | embalagem | outros
  unidadeCompra: "kg",             // kg | g | L | ml | un | cx | pct
  unidadeBase: "g",                // unidade mínima usada nas fichas técnicas
  precoCompra: 95.00,              // R$ pelo lote comprado
  quantidadeCompra: 5,             // quantidade do lote (em unidadeCompra)
  rendimento: 92,                  // % aproveitável (desconta perda no preparo)
  fornecedor: "Frigorífico Mineiro",
  obs: "",
  // NÃO inclua custoUnitarioBase — o app calcula
}
```

---

## Seção 2 — Produtos (mínimo 10 itens)

Crie um cardápio realista e variado. Cubra obrigatoriamente estas categorias:

### Smash burgers (3 produtos)
- Smash Clássico (blend duplo, cheddar, maionese defumada, pão brioche)
- Smash Bacon (blend duplo, bacon, cheddar, barbecue, cebola roxa)
- Smash Veggie (blend de grão-de-bico OU cogumelo — use um insumo genérico, obs explicando)

### Artesanais (3 produtos)
- O Clássico da Esquina (blend simples, queijo prato, rúcula, aioli, pão australiano)
- Frango Crocante (frango empanado, cream cheese, alface, tomate, pão brioche)
- Gorgonzola & Pera (blend, gorgonzola, geleia de pera — use molho genérico, obs explicando)

### Acompanhamentos (2 produtos)
- Fritas rústicas (batata, óleo, sal — insumos genéricos)
- Onion rings (cebola empanada)

### Combos (2 produtos)
- Combo Smash Clássico (smash clássico + fritas + bebida — anote na obs que é combo)
- Combo da Casa (O Clássico + fritas + bebida)

### Schema de cada produto:
```javascript
{
  id: "prod_001",
  nome: "Smash Clássico",
  categoria: "smash",              // smash | artesanal | tradicional | combo | veggie | acompanhamento | bebida
  descricao: "Dois smashes crocantes, cheddar americano, maionese defumada artesanal",
  precoPraticado: 32.00,           // preço que o restaurante cobra hoje
  ingredientes: [
    {
      insumoId: "ins_001",
      nomeInsumo: "Blend bovino 80/20",
      quantidade: 180,             // quantidade usada neste produto
      unidade: "g"                 // sempre na unidadeBase do insumo
    },
    // ... demais ingredientes
  ]
  // NÃO inclua custos calculados — o app calcula
}
```

**Regras para os ingredientes:**
- Quantidades realistas (um burger padrão usa 150–180g de carne, não 500g)
- Todo ingrediente referenciado deve ter um `insumoId` que existe na lista de insumos
- Inclua embalagem em todo produto (caixa kraft ou papel manteiga)
- Combos devem listar os ingredientes dos itens que os compõem (não referência ao produto filho)

---

## Seção 3 — Negócio

```javascript
negocio: {
  nomeEstabelecimento: "Burger da Esquina",
  tipo: "lanchonete",
  custos: {
    aluguel: 4500,
    energia: 900,
    agua_gas: 650,
    internet: 180,
    salarios: 6800,
    prolabore: 3000,
    sistema: 150,
    marketing: 400,
    manutencao: 300,
    contabilidade: 350,
    embalagens_gerais: 280,
    outros: 200
  },
  vendasDia: 45,
  diasMes: 26,
  margemMeta: 35,
  regimeTributario: "simples",
  taxaImpostos: 6,
  taxaMaquininha: 2.5
}
```

Mantenha esses valores exatos — são calibrados para o negócio fazer sentido financeiro.

---

## Validações que você deve fazer antes de entregar

- [ ] Todo `insumoId` nos ingredientes dos produtos existe no array de insumos
- [ ] Nenhum campo numérico é string (precoCompra deve ser `95.00` não `"95.00"`)
- [ ] Nenhum array de ingredientes está vazio
- [ ] Rendimento está entre 50 e 100 para todos os insumos
- [ ] IDs são únicos — nenhum `ins_001` duplicado
- [ ] O arquivo é JavaScript válido (sem vírgulas sobrando, sem chaves faltando)

---

## Output esperado

Apenas o arquivo `seed.js` — sem explicações, sem markdown, sem comentários além dos que estiverem dentro do código. O arquivo começa com `const SEED_DATA = {` e termina com `};`.