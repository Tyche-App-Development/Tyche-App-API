[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/rfzLx8vk)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=17378796)
# Trabalho / Assignment #2

# Objetivo

Desenvolver aplicações web colaborativas e interativas que integrem os seguintes conceitos principais:

1. **Desenvolvimento Full-Stack Web:**
   - Frontend dinâmico e responsivo (HTML, CSS, JavaScript, Svelte/Vue.js).
   - Backend com Node.js (ou Deno) e APIs RESTful.
2. **Colaboração em Tempo Real:**
   - Sincronização de dados entre utilizadores utilizando WebSockets.
3. **Gestão de Dados e Segurança:**
   - Persistência de dados com MongoDB.
   - Autenticação segura utilizando, por exemplo JWT
4. **Resolução de Problemas Reais:**
   - Aplicações práticas focadas em funcionalidades úteis e interação entre utilizadores.

Este exercício foca-se na implementação de sistemas funcionais, colaboração e boas práticas no desenvolvimento web.

# Temas

## **Sistema de Votação em Tempo Real**

### **Descrição:** 

Uma aplicação onde utilizadores autenticados podem criar e participar em sondagens, com resultados atualizados em tempo real.

### **Funcionalidades**

1. Autenticação
   - Registo e login utilizando JWT.
   - Sistema básico de permissões (admin para gerir enquetes, utilizadores para votar).
2. Gestão de Sondagens
   - Criar Sondagens com perguntas e opções de resposta.
   - Listar sondagens disponíveis (ativas e encerradas).
3. Submissão e Visualização de Votos
   - Submeter votos de forma anónima.
   - Visualizar os resultados em tempo real (gráficos simples de barras ou pizza).
4. Atualizações em Tempo Real
   - Uso de WebSockets para refletir novos votos no gráfico para todos os utilizadores conectados.

### **Tecnologias**

- **Frontend:** HTML, CSS, JavaScript, Svelte ou Vue.js para reatividade. Chart.js ou AppexCharts.js ou D3.js para os gráficos.
- **Backend:** Node.js (+ Express) ou Deno.
- **Base de Dados:** MongoDB para guardar sondagens, opções e votos.
- **Autenticação:** JWT.
- **Comunicação em Tempo Real:** WebSockets (via Socket.IO).
- **API REST:** Endpoints para autenticação, criação e listagem de enquetes, e submissão de votos.

------

## **Sistema de Chat em Tempo Real**

### **Descrição:** 

Uma aplicação de chat simples onde utilizadores autenticados podem enviar mensagens em salas públicas ou privadas, com atualizações em tempo real.

### **Funcionalidades**

1. Autenticação e Personalização
   - Registo e login utilizando JWT.
   - Recuperação de palavra-passe (opcional).
   - Pesronalização , p.ex. foto/avatar/cores (opcional)
2. Gestão de Salas
   - Criação e eliminação de salas públicas e privadas.
   - Lista de salas disponíveis para os utilizadores.
3. Mensagens em Tempo Real
   - Envio de mensagens para uma sala específica.
   - Atualizações instantâneas para todos os utilizadores conectados.
4. Persistência de Dados
   - Histórico de mensagens para cada sala, armazenado na base de dados.
5. Notificações
   - Avisos quando novos utilizadores entram ou saem de uma sala.

### **Tecnologias**

- **Frontend:** HTML, CSS, JavaScript, Svelte ou Vue.js.
- **Backend:** Node.js (Express) ou Deno.
- **Base de Dados:** MongoDB para guardar mensagens, utilizadores e salas.
- **Autenticação:** JWT.
- **Comunicação em Tempo Real:** WebSockets.
- **API REST:** Endpoints para autenticação, gestão de salas e recuperação de histórico de mensagens.

------

## **Plataforma de Leilões Online**

### **Descrição:** 

Uma plataforma onde utilizadores autenticados podem participar em leilões em tempo real, submetendo lances que são refletidos instantaneamente.

### **Funcionalidades**

1. Autenticação
   - Registo e login utilizando JWT.
   - Gestão de perfis de utilizadores.
2. Gestão de Leilões
   - Criar leilões com nome, descrição, preço inicial, e tempo limite.
   - Listar leilões ativos e encerrados.
3. Submissão de Lances
   - Validar lances (valor maior que o atual).
   - Atualizações em tempo real do lance mais alto.
   - Notificações quando o leilão termina e o vencedor é anunciado.
4. Histórico
   - Histórico de lances e leilões ganhos, visível no perfil do utilizador.

### **Tecnologias**

- **Frontend:** HTML, CSS, JavaScript, Svelte ou Vue.js.
- **Backend:** Node.js (Express) ou Deno.
- **Base de Dados:** MongoDB para armazenar utilizadores, leilões e lances.
- **Autenticação:** JWT.
- **Comunicação em Tempo Real:** WebSockets.
- **API REST:** Endpoints para autenticação, criação de leilões, submissão de lances e consulta de histórico.

------

## **Nuvem de Palavras Colaborativa**

### **Descrição:** 

Uma aplicação onde utilizadores autenticados podem adicionar palavras que formam uma nuvem colaborativa. As palavras mais frequentes são destacadas em tempo real.

### **Funcionalidades**

1. Autenticação
   - Registo e login utilizando JWT.
   - Acesso apenas como leitura para utilizadores não autenticados.
2. Gestão de Palavras
   - Submissão de palavras por utilizadores autenticados.
   - Contagem automática de frequência de palavras.
   - Filtragem de palavras ofensivas (opcional)
3. Atualizações em Tempo Real
   - A nuvem de palavras é atualizada automaticamente para todos os utilizadores conectados.
4. Personalização
   - Escolha de cores ou estilos visuais para a nuvem.

### **Tecnologias**

- **Frontend:** HTML, CSS, JavaScript, Svelte ou Vue.js.
- **Backend:** Node.js (Express) ou Deno.
- **Base de Dados:** MongoDB para guardar palavras e suas frequências.
- **Autenticação:** JWT.
- **Comunicação em Tempo Real:** WebSockets.
- **API REST:** Endpoints para autenticação, submissão de palavras e listagem da nuvem.

------

## **Ferramenta de Anotação de Imagens**

### **Descrição:** 

Uma aplicação onde utilizadores autenticados podem carregar imagens e adicionar anotações colaborativas em tempo real, como texto comentários (opcional desenhos).

### **Funcionalidades**

1. Autenticação
   - Registo e login utilizando JWT.
   - Sistema de permissões para administradores e colaboradores.
2. Gestão de Imagens
   - Upload de imagens para revisão.
   - Organização de imagens por projetos.
3. Ferramenta de Anotação
   - Adicionar pontos, formas ou texto sobre as imagens.
   - Editar ou eliminar anotações existentes.
4. Colaboração em Tempo Real
   - Atualização instantânea de anotações para todos os utilizadores conectados.
   - Indicação de quem está a editar uma anotação.
5. Exportação (opcional)
   - Exportar imagens anotadas com camadas visíveis ou ocultas.

### **Tecnologias**

- **Frontend:** HTML, CSS, JavaScript, Svelte ou Vue.js.
- **Backend:** Node.js (Express) ou Deno.
- **Base de Dados:** MongoDB para guardar imagens, anotações e projetos.
- **Autenticação:** JWT.
- **Comunicação em Tempo Real:** WebSockets.
- **API REST:** Endpoints para autenticação, gestão de imagens e submissão de anotações.

# Requisitos Globais

## Frontend

### **Frontend: HTML/CSS**

- Pode usar Frameworks ou HTML+CSS+Jacascript

### Backend

- O backend deve ser desenvolvido utilizando **Node** e **Express**.

- Não guarde dados no sistema de ficheiros; os dados persistentes devem ser armazenados numa base de dados **MongoDB**.

- nas **REST APIs**, os métodos/verbos HTTP devem ser utilizados de acordo com as suas definições. Por exemplo:

  - Utilize **GET** para obter dados. Não armazene dados através de um **GET**.
  - Utilize **DELETE** para apagar dados.
  - Não utilize parâmetros de query na URL com pedidos **POST**.

  

# Regras & Avaliação

## Grupos

max 2 Elementos por grupo

## Data de Entrega / Due Date

21 de dezembro 2024

## Repositório GitHub Classroom

1. O trabalho será lançado como um trabalho de grupo. Quando um estudante aceita um trabalho de grupo, pode criar uma nova equipa ou juntar-se a uma equipa existente.
2. Para cada trabalho de grupo, o **GitHub Classroom** cria automaticamente um repositório partilhado único para a equipa.

### README.md

No repositório GitHub deverão ser colocadas instruções de instalação e utilização, acessíveis a partir do ficheiro README.md, onde deverão constar a identificação dos elementos do grupo, do repositório GitHub.com e do endereço de publicação. 

Este ficheiro deverá conter ainda uma descrição mais detalhada do projeto (mini-relatório) realçando os seu objectivo, eventuais bibliotecas e frameworks, e quaisquer outros elementos relevantes para a sua implementação.

Deve também conter um parágrafo relevando os principais contributos de cada elemento.

### Build / Install / Configure

1. O projeto deverá ter, tanto quanto possível, um script de build e instalação.
2.  Deve fornecer instruções detalhadas sobre qusiquer configurações.

## Publicação

1. A app deverá ficar operacional no servidor render.com 

## Moodle

Cada estudante deverá entregar no moodle:

1. identificação do grupo
   - concatenacao dos primeiros nomes dos elementos do grupo por ordem alfabética seguido dos últimos dígitos dos numeros mecanográficos, pela mesma ordem.
   - Assim o grupo do Rui 28765, Ana 29876 e Ricardo 19219:
     - **anaricardorui695**

2. Link para github

3. Link para render.com

## Avaliação

Ter um trabalho funcional completamente funcional muito relevante. 

O incuprimento de funcionalidades isoladas, será menos penalizador do que o mau funcionamento ou não funcionamento global.

O trabalho terá uma componente de avaliação pelos pares (a lançar mais tarde)

### Sem avaliação

* Questões estéticas (não de usabilidade)
* Complexidade (excessiva)
* Uso de frameworks vs HTML+CSS+javascript

### Bonificação

- Suporte OAuth2
- Versão mobile
- Acessibilidade

