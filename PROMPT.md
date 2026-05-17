# Prompt — Gemini CLI · BurgerCost App


---

## Tarefa

Construa o aplicativo **FoodCost** completo conforme especificado no PRD.

---

## Entregável

Um único arquivo `index.html` que rode diretamente no browser sem nenhum servidor, sem dependências externas de backend, sem npm, sem build step. Tudo — HTML, CSS e JavaScript — dentro de um arquivo só.

---

## Stack obrigatória

- HTML5 semântico
- CSS puro com variáveis CSS (`:root { --var }`)
- JavaScript vanilla ES6+ (sem frameworks, sem jQuery)
- Persistência via `localStorage` conforme schema do PRD
- Nenhuma chamada a API externa

---

## Arquitetura interna obrigatória

### Roteamento SPA
Implemente roteamento por hash (`window.location.hash`) com as rotas definidas na seção 13 do PRD. Cada rota renderiza um componente via `innerHTML` na `<div id="app">`.

### Módulos JS (blocos `<script>` separados por responsabilidade)
1. `STATE` — objeto global com os dados em memória + funções `load()` e `save()` pro localStorage
2. `CALC` — todas as funções matemáticas da seção 7 do PRD (puras, sem side effects)
3. `ROUTER` — mapeia hash → função render
4. `PAGES` — uma função por página: `renderDashboard()`, `renderInsumos()`, `renderProdutos()`, `renderNegocio()`
5. `COMPONENTS` — funções reutilizáveis: `renderCard()`, `renderTable()`, `renderForm()`

### Seed de dados
Ao iniciar, se `localStorage` estiver vazio, popule com os dados seed da seção 9 do PRD.

---

## Design

### Identidade visual
- Tema dark (fundo escuro, não preto puro — algo como `#1a1a1a` ou `#111`)
- Cor de destaque: laranja / âmbar (`#f59e0b` ou similar) — referência à brasa, ao hambúrguer
- Tipografia: importe do Google Fonts — `Syne` para headings, `DM Sans` para corpo
- Sidebar fixa à esquerda, 220px de largura, com ícones + labels

### Cards e tabelas
- Cards com fundo ligeiramente mais claro que o fundo (`#252525` sobre `#1a1a1a`)
- Bordas sutis (`1px solid rgba(255,255,255,0.07)`)
- Border-radius generoso (12px nos cards, 8px nos inputs)
- Tabelas com linhas alternadas (`zebra striping`) e hover highlight

### Status de margem (obrigatório em todo lugar que exibir margem)
- 🟢 Verde — margem ≥ meta configurada
- 🟡 Amarelo — margem entre 0% e a meta
- 🔴 Vermelho — custo maior que o preço praticado
- Implemente como badges coloridos, não apenas ícones

### Formulários
- Inputs com label flutuante ou label acima
- Feedback em tempo real — nunca espere o submit pra calcular
- Botão primário na cor de destaque
- Botão cancelar/secundário com borda, sem fill

### Micro-interações
- Transição suave ao trocar de página (`opacity` + `translateY` pequeno)
- Hover nos cards da listagem de produtos
- Loading state no seed (mesmo que seja instantâneo — 300ms de delay fake pra dar feedback)

---

## Regras de implementação

1. **Calcule tudo em tempo real.** Qualquer input com `addEventListener('input')` deve atualizar os totais imediatamente — nunca dependa de um botão "calcular".

2. **Nunca salve dados inválidos.** Valide antes do `save()`: nome obrigatório, valores numéricos positivos, produto precisa ter ao menos 1 ingrediente.

3. **Ficha técnica de produto** — o campo de busca de insumos deve filtrar o array `STATE.insumos` em tempo real e mostrar um dropdown. Ao selecionar, preenche nome + unidade automaticamente. O usuário só digita a quantidade.

4. **Custo operacional rateado** — toda vez que um produto é exibido com custo/preço, some `STATE.negocio.custoOpUnitario` ao custo de ingredientes. Se `negocio` não estiver configurado, exiba aviso "Configure os custos operacionais".

5. **Preço sugerido** usa a fórmula de markup divisor:
   ```
   preco_sugerido = custo_total / (1 - margem_meta/100)
   ```
   Não use markup multiplicador (é errado para precificação por margem).

6. **Exportar JSON** — botão na página Negócio que faz download de `{ insumos, produtos, negocio }` como arquivo `.json`.

7. **Importar JSON** — input `type="file"` que lê o JSON, valida a estrutura mínima e sobrescreve o localStorage.

8. **Dashboard** — a tabela de produtos deve ser calculada dinamicamente ao renderizar, nunca armazene `precoSugerido` ou `margemReal` no localStorage — calcule sempre na hora de exibir.

9. **Responsividade mínima** — sidebar colapsa para ícones em telas < 768px (não precisa ser mobile-first, mas não pode quebrar).

10. **Nenhum `alert()` ou `confirm()` nativo.** Implemente notificações como um toast no canto da tela e modais de confirmação com HTML/CSS.

---

## Ordem de implementação sugerida

1. Estrutura HTML base (sidebar + `<div id="app">`) + variáveis CSS + fontes
2. Módulo STATE com load/save/seed
3. Módulo CALC com todas as funções matemáticas
4. ROUTER básico funcionando (troca de página)
5. Página Negócio (configurações) — base de tudo
6. Página Insumos (CRUD completo)
7. Página Produtos (CRUD + ficha técnica + simulação em tempo real)
8. Dashboard (lê tudo e exibe consolidado)
9. CSS refinamento final + micro-interações
10. Teste de ponta a ponta com o seed

---

## Critérios de aceite (valide antes de entregar)

- [ ] Abre no browser sem erros no console
- [ ] Seed carrega na primeira abertura com insumos e produto de exemplo
- [ ] Consigo cadastrar um novo insumo e ele aparece na lista imediatamente
- [ ] Consigo criar um produto selecionando insumos e o custo calcula em tempo real
- [ ] Preço sugerido muda quando altero a meta de margem na página Negócio
- [ ] Dashboard mostra status correto (verde/amarelo/vermelho) para cada produto
- [ ] Dados persistem após F5
- [ ] Exportar e importar JSON funcionam
- [ ] Nenhum produto exibe custo zerado ou NaN