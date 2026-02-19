# PRÓLOGOS - Análise Jurimétrica e Previsão de Decisões

Bem-vindo ao PRÓLOGOS, uma plataforma inovadora para análise jurimétrica e apoio à decisão no contexto jurídico. Utilizando inteligência artificial e processamento de dados, o PRÓLOGOS oferece ferramentas para perfilar juízes, analisar petições e prever tendências decisórias.

## 🌟 Funcionalidades Principais

*   **Análise de Perfil de Juízes:** Coleta e processa decisões de juízes para criar perfis estatísticos e comportamentais.
*   **Análise de Petições:** Avalia petições e outros documentos jurídicos com base no perfil de juízes e decisões anteriores.
*   **Previsão de Tendências Decisórias:** Oferece insights sobre a probabilidade de deferimento ou indeferimento de pedidos.
*   **Integração DataJud:** Utiliza dados públicos do sistema DataJud para enriquecer as análises.
*   **Aplicação Web:** Interface intuitiva para acesso às funcionalidades via navegador.
*   **Aplicação Desktop (Electron):** Versão autônoma para Windows, empacotando toda a funcionalidade.

## 🚀 Arquitetura

O PRÓLOGOS é construído como uma aplicação distribuída, composta por diversos serviços interconectados:

*   **Frontend (React + Vite):** A interface do usuário responsiva, desenvolvida com React e otimizada com Vite.
*   **Backend (Python FastAPI):** O coração da lógica de negócios, responsável pela gestão de dados, integração com o DataJud e orquestração de tarefas.
*   **ML Service (Python FastAPI):** Um serviço dedicado a operações de Machine Learning, como geração de embeddings de texto usando Sentence Transformers.
*   **API Gateway (Node.js Express):** Atua como um proxy reverso e single-writer para o banco de dados, protegendo o FastAPI e gerenciando requisições.
*   **Job Queue (Redis + RQ):** Utilizado para processamento assíncrono de tarefas pesadas, como a clonagem de perfis de juízes do DataJud.
*   **Banco de Dados (SQLite):** Um banco de dados leve e embarcado para persistência de dados de perfis de juízes e decisões.

## 🛠️ Configuração de Ambiente Local

Para rodar o PRÓLOGOS localmente, siga os passos abaixo:

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:

*   **Node.js** (versão 18 ou superior) e **npm**
*   **Python** (versão 3.9 ou superior) e **pip**
*   **Docker Desktop** (para Windows/macOS) ou **Docker Engine** (para Linux) e **Docker Compose**
*   **Git**

### 1. Clonar o Repositório

```bash
git clone https://github.com/jrlampa/prologos-desktop.git
cd prologos-desktop
```

### 2. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto, copiando o `.env.example` e preenchendo as variáveis necessárias:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas chaves de API e configurações locais. Variáveis críticas incluem `GROQ_API_KEY` e `DATAJUD_API_KEY`.

### 3. Instalação de Dependências

*   **Frontend:**
    ```bash
    cd frontend
    npm install
    cd ..
    ```
*   **Desktop App:**
    ```bash
    cd desktop
    npm install
    cd ..
    ```
*   **Backend & ML Service (Python):**
    As dependências Python serão instaladas automaticamente pelos contêineres Docker. No entanto, se você planeja rodar o `backend` ou `ml_service` fora do Docker (não recomendado para produção), pode instalá-las manualmente:
    ```bash
    # Para o backend
    cd backend
    pip install -r requirements.txt
    cd ..

    # Para o ML Service
    cd ml_service
    pip install -r requirements.txt
    cd ..
    ```

## ▶️ Como Rodar (Local)

### Opção 1: Aplicação Web (Frontend + Serviços Dockerizados)

Esta é a configuração recomendada para desenvolvimento local da aplicação web.

1.  **Iniciar Serviços Backend (Docker Compose):**
    Na raiz do projeto, execute:
    ```bash
    docker-compose up -d --build
    ```
    Isso iniciará os serviços `api` (Express), `fastapi` (Backend), `worker` (RQ Worker), `redis` e `ml` (ML Service).

2.  **Iniciar Frontend:**
    Em um novo terminal, navegue até o diretório `frontend` e execute:
    ```bash
    cd frontend
    npm run dev
    ```
    A aplicação frontend estará disponível em `http://localhost:5173` (ou porta similar).

### Opção 2: Aplicação Desktop (Electron)

Para desenvolver ou testar a aplicação desktop.

1.  **Certifique-se de que nenhum serviço Docker esteja rodando** que possa usar as mesmas portas. Se estiverem, execute `docker-compose down` na raiz do projeto.
2.  **Iniciar Aplicação Desktop:**
    Navegue até o diretório `desktop` e execute:
    ```bash
    cd desktop
    npm run dev
    ```
    A aplicação Electron será iniciada.

## 📦 Build & Implantação

### Frontend

Para gerar uma versão otimizada do frontend para produção:

```bash
cd frontend
npm run build
```
Os arquivos gerados estarão na pasta `frontend/dist`.

### Aplicação Desktop (Windows Installer)

Para construir um instalador para a aplicação Electron (Windows NSIS):

```bash
cd desktop
npm run build
```
O instalador será gerado na pasta `desktop/dist`.

### Imagens Docker

Para construir as imagens Docker dos serviços:

```bash
docker-compose build
```

## ✅ Testes

*   **Testes de Unidade/Integração (Frontend):**
    ```bash
    cd frontend
    npm run test
    ```
*   **Testes Manuais E2E:**
    Siga o plano de testes End-to-End fornecido para verificar a integração entre os componentes Web e Desktop.

**Nota sobre Testes:** Atualmente, os serviços de Backend (Python FastAPI) e API Gateway (Node.js Express) não possuem suítes de testes automatizados abrangentes. Isso representa uma dívida técnica e um futuro trabalho a ser abordado.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue para discutir novas funcionalidades ou melhorias, e submeta Pull Requests.

## 📄 Licença

Este projeto está licenciado sob a licença [MIT](https://opensource.org/licenses/MIT).