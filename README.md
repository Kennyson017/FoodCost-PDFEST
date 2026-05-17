# FoodCost 🍔📊

O **FoodCost** é um painel de inteligência financeira e precificação voltado para hamburguerias, lanchonetes e food trucks. O sistema ajuda os donos de negócios a descobrir o custo real de cada produto do cardápio, ratear os custos operacionais (aluguel, energia, salários) e aplicar o *markup* correto para garantir a margem de lucro desejada.

Tudo isso rodando de forma ultra-rápida direto no navegador, sem necessidade de servidores complexos ou banco de dados externo, com os dados sendo salvos localmente na sua máquina.

---

## ✨ Principais Funcionalidades

*   **📈 Dashboard Inteligente:** Visão geral da rentabilidade da sua operação. O sistema aponta automaticamente quais produtos têm a melhor margem, a menor margem e emite alertas visuais se algum produto estiver dando prejuízo.
*   **⚙️ Configurações de Negócio:** Módulo para preenchimento dos custos fixos mensais, volume de vendas, meta de lucro limpo (%) e impostos. O sistema calcula automaticamente o **Custo Operacional por Unidade**.
*   **🥩 Base de Insumos (Estoque Virtual):** Cadastro de ingredientes (pão, carne, queijo, embalagens) com preço pago, rendimento (para perdas no preparo) e cálculo automático do custo fracionado (por grama, ml ou unidade base).
*   **📝 Ficha Técnica Viva (Produtos):** Crie seus lanches adicionando ingredientes da base. O custo é calculado grama a grama em tempo real. O sistema soma o custo da receita com o custo operacional do negócio e te dá o **Preço Sugerido de Venda** exato para bater sua meta de margem.
*   **💾 Persistência Offline e Backup:** A aplicação funciona sem internet. Todos os dados são salvos no `localStorage` do seu navegador. Conta com opção de **Exportar** e **Importar** arquivos JSON para backups de segurança.

---

## 🛠 Tecnologias Utilizadas

O projeto foi construído para ser o mais leve e portátil possível (Vanilla), sem dependência de processos de build (Node.js/npm) ou frameworks pesados.

*   **Frontend:** HTML5 Semântico.
*   **Estilização:** CSS3 Puro (com CSS Variables para temas e responsividade).
*   **Lógica e Interatividade:** JavaScript Moderno (ES6+ Modules), sem bibliotecas externas.
*   **Armazenamento:** `window.localStorage`.
*   **Ícones e Fontes:** Emojis nativos do sistema e Google Fonts (DM Sans & Syne).

---

## 🚀 Como Rodar o Projeto

Como o projeto utiliza **ES6 Modules** (módulos JS nativos com `import/export`), a maioria dos navegadores bloqueia a execução direta abrindo o arquivo `index.html` da pasta (protocolo `file://`) por razões de segurança (CORS).

Para usar o sistema corretamente, você precisa serví-lo através de um servidor estático local:

### Opção 1: Usando Python (Recomendado se já tem no PC)
Abra o terminal na pasta do projeto e rode:
```bash
# Para Python 3
python3 -m http.server 8000
```
Acesse no navegador: `http://localhost:8000`

### Opção 2: Usando VS Code (Extensão Live Server)
1. Abra a pasta do projeto no VS Code.
2. Instale a extensão **Live Server** (de Ritwick Dey).
3. Clique com o botão direito no `index.html` e selecione **"Open with Live Server"**.

### Opção 3: Usando Node.js (npx)
Se você tem o Node instalado, pode rodar:
```bash
npx serve .
```

*Na primeira vez que você abrir a aplicação, ela irá pré-carregar um cardápio completo da "Burger da Esquina" com mais de 30 insumos e 10 produtos de exemplo (Seed Data) para você já ver o painel funcionando na prática.*

---

## 📂 Estrutura de Diretórios

```text
/
├── index.html           # Arquivo principal que carrega a estrutura base e a div #app.
├── css/
│   ├── style.css        # Reset, tipografia, cores globais e layout da sidebar.
│   └── components.css   # Estilos reutilizáveis (botões, cards, tabelas, modais, toasts).
├── js/
│   ├── app.js           # Ponto de entrada, inicializa roteador e carrega dados.
│   ├── router.js        # Motor de roteamento Vanilla usando window.location.hash.
│   ├── state.js         # Gerenciamento do LocalStorage, import/export e trigger de cálculos.
│   ├── calc.js          # Módulo puro apenas com fórmulas financeiras de CMV e markup.
│   ├── seed.js          # Banco de dados fictício altamente realista para primeira inicialização.
│   ├── components.js    # Utilitários de UI (ex: Notificações Toast, badges de status).
│   └── pages/           # Módulos responsáveis por renderizar cada tela do sistema.
│       ├── dashboard.js 
│       ├── insumos.js   
│       ├── negocio.js   
│       └── produtos.js  
├── PRD.md               # Documento de Requisitos do Produto original.
└── PITCH.md             # Deck de apresentação B2B do projeto.
```

---

## ⚙️ Arquitetura Interna

O FoodCost segue uma arquitetura baseada em **Estado Centralizado (State)** e **Cálculos Puros**:
1. O usuário altera um dado (ex: custo do aluguel ou o valor pago na carne).
2. A tela invoca `updateAndSaveState()` no `state.js`.
3. O `state.js` varre todo o banco de dados chamando as funções matemáticas do `calc.js`. Ele recalcula o custo da grama da carne, atualiza a ficha técnica do hambúrguer que usa aquela carne, recalcula o rateio operacional e atualiza a margem do produto.
4. O novo estado recalculado é salvo no LocalStorage e a UI é re-renderizada exibindo o impacto total em tempo real na saúde do negócio.

---

## 👨‍💻 Autor / Licença

Projeto desenvolvido como solução B2B SaaS de gestão financeira enxuta para pequenos negócios do ramo de Food Service.

**Licença:** MIT
