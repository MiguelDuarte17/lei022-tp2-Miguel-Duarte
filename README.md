# TP2 - Comunicação Aplicacional com WebSockets

## Identificação

- Estudante: Miguel Duarte
- Número de estudante: 240000645
- Versão Node.js utilizada: v24.21.0
- Unidade curricular: Laboratório de Desenvolvimento de Software
- Trabalho: TP2 — Comunicação aplicacional alternativa e orientada a eventos
- Tecnologia escolhida: WebSockets

## Versão do Node.js

Versão utilizada: **v24.21.0**, conforme a configuração indicada para o projeto.

A versão instalada pode ser confirmada através do comando:
node --version

## Instalação

A implementação utiliza **Node.js**, **Express** e a biblioteca **ws** para a comunicação WebSocket. O módulo `http` já faz parte do Node.js.

Na pasta `backend`, executar:
cd backend
npm install

Principais dependências:
- `express` — disponibiliza os endpoints da API REST;
- `ws` — permite criar o servidor WebSocket e gerir as ligações com os clientes.

O comando `npm install` instala as dependências definidas no `package.json`.

## Execução

Para iniciar o servidor, estando na pasta `backend`:
node server.js

Após a execução, ficam disponíveis:
- API REST: `http://localhost:3000`
- WebSocket: `ws://localhost:3000/ws`

A aplicação apresenta no terminal:
- API a executar em http://localhost:3000
- WebSocket a executar em ws://localhost:3000/ws

O servidor HTTP é partilhado entre a API REST e os WebSockets, utilizando a mesma porta `3000`.

---

# Recursos

A API mantém os dois recursos do TP1:

- `items` — recurso principal do primeiro trabalho;
- `salas` — recurso adicional utilizado na implementação WebSocket do TP2.

## Domínio do recurso `salas`

O recurso `salas` representa salas de um edifício ou instituição. Cada sala possui os seguintes campos:

- `id` — identificador numérico atribuído automaticamente pelo servidor;
- `nome` — identificação da sala;
- `capacidade` — número inteiro maior que zero;
- `estado` — situação atual da sala.

### Regras do recurso `salas`

O campo `estado` só pode assumir um dos seguintes valores:

- `disponivel`
- `ocupada`
- `manutencao`

Na criação através do REST, o nome, a capacidade e o estado são obrigatórios. Não é permitida a criação de duas salas com o mesmo nome, ignorando maiúsculas e minúsculas: nesse caso, o servidor responde com **409 Conflict**.

No TP2, os WebSockets permitem atualizar **o estado de uma sala já existente**, mantendo o seu ID, nome e capacidade.

---

# Tecnologia utilizada — WebSockets

## Objetivo da implementação

A tecnologia escolhida foi **WebSockets**, para permitir a atualização do estado das salas em tempo real.

No TP1, a comunicação era realizada através de pedidos HTTP, seguindo o modelo pedido/resposta. No TP2, o cliente estabelece uma ligação WebSocket com o servidor e essa ligação permanece aberta para a troca de mensagens nos dois sentidos.

A funcionalidade implementada segue o seguinte processo:

1. É criada uma sala através de `POST /api/salas`.
2. Dois ou mais clientes estabelecem ligação a `ws://localhost:3000/ws`.
3. Um cliente envia um evento `AtualizarEstadoSala`, com o ID da sala e o novo estado.
4. O servidor valida a mensagem e procura a sala no array `salas`.
5. Se a mensagem for válida, o servidor altera o estado da sala e envia `AtualizacaoConfirmada` ao cliente que realizou a operação.
6. Os restantes clientes WebSocket ligados recebem automaticamente o evento `EstadoSalaAtualizado`.
7. A alteração também pode ser consultada através do endpoint REST `GET /api/salas/:id`.

## Formato das mensagens WebSocket

Todas as mensagens da aplicação WebSocket utilizam **JSON**. O campo `tipo` identifica o evento.

### Ligação estabelecida

Quando um cliente se liga, o servidor envia:

{
  "tipo": "LigacaoEstabelecida",
  "mensagem": "Ligação WebSocket estabelecida com sucesso"
}

### Pedido de atualização do estado

Exemplo de mensagem enviada pelo cliente:

{
  "tipo": "AtualizarEstadoSala",
  "salaId": 1,
  "estado": "ocupada"
}

- `tipo` — evento solicitado (`AtualizarEstadoSala`);
- `salaId` — ID inteiro positivo de uma sala existente;
- `estado` — novo estado da sala, dentro dos valores permitidos.

### Confirmação ao cliente que realizou a alteração

{
  "tipo": "AtualizacaoConfirmada",
  "sala": {
    "id": 1,
    "nome": "Sala A",
    "capacidade": 30,
    "estado": "ocupada"
  }
}

### Notificação aos restantes clientes

{
  "tipo": "EstadoSalaAtualizado",
  "sala": {
    "id": 1,
    "nome": "Sala A",
    "capacidade": 30,
    "estado": "ocupada"
  }
}

A confirmação é enviada ao cliente que pediu a atualização; a notificação é enviada aos **outros clientes** que estejam ligados no momento da alteração.

## Validação e tratamento das ligações

O servidor verifica se a mensagem recebida contém JSON válido e se representa um objeto JSON. Também valida o tipo de evento, o `salaId`, o `estado` e a existência da sala.

Quando alguma validação falha, envia uma mensagem do tipo `Erro` ao cliente que fez o pedido, sem alterar o estado da sala.

O servidor também regista no terminal quando um cliente estabelece ou fecha uma ligação e possui tratamento para erros de ligação WebSocket.

---

# Testes

Os testes foram realizados através do **Postman**, utilizando pedidos HTTP para criar e consultar salas e ligações WebSocket para alterar o estado e receber notificações.

Foram preparados cinco testes, com as respetivas capturas de execução apresentadas abaixo.

## Teste 1 — Criação da Sala A através de REST

Foi enviado um pedido **POST** para `http://localhost:3000/api/salas` com o seguinte corpo JSON:

{
  "nome": "Sala A",
  "capacidade": 30,
  "estado": "disponivel"
}

**Resultado obtido:** `201 Created`. A sala foi criada com o ID `1`, capacidade `30` e estado inicial `disponivel`. Este teste prepara o recurso que será utilizado nas mensagens WebSocket seguintes.

![Teste 1 — Criação da Sala A com resposta HTTP 201](tests/Criação%20da%20Sala%20A.png)

## Teste 2 — Cliente A atualiza o estado da sala e recebe confirmação

O Cliente A estabeleceu ligação a `ws://localhost:3000/ws` e enviou a seguinte mensagem:

{
  "tipo": "AtualizarEstadoSala",
  "salaId": 1,
  "estado": "ocupada"
}

**Resultado obtido:** o servidor devolveu ao Cliente A uma mensagem `AtualizacaoConfirmada`, com os dados da Sala A e o novo estado `ocupada`. A captura também mostra a mensagem inicial `LigacaoEstabelecida`.

![Teste 2 — Cliente A envia atualização e recebe confirmação](tests/Cliente%20A%20envia%20a%20alteração%20do%20estado%20da%20sala%20e%20recebe%20a%20confirmação.png)

## Teste 3 — Cliente B recebe automaticamente a notificação

O Cliente B já se encontrava ligado ao mesmo servidor WebSocket, sem enviar um pedido de atualização.

**Resultado obtido:** o Cliente B recebeu automaticamente o evento `EstadoSalaAtualizado`, informando que a Sala A passou para o estado `ocupada`. Assim, foi demonstrada a comunicação em tempo real entre o servidor e outro cliente ligado.

![Teste 3 — Cliente B recebe notificação automática](tests/Cliente%20B%20recebe%20a%20notificação%20automaticamente.png)

## Teste 4 — Cliente C envia um estado inválido

O Cliente C tentou atualizar a Sala A com um estado que não faz parte dos valores permitidos:

{
  "tipo": "AtualizarEstadoSala",
  "salaId": 1,
  "estado": "avariada"
}

**Resultado obtido:** o servidor devolveu uma mensagem `Erro`, com o detalhe `O estado deve ser disponivel, ocupada ou manutencao`. A alteração inválida não foi aplicada; a sala manteve o estado `ocupada`.

![Teste 4 — Cliente C recebe mensagem de erro por estado inválido](tests/Cliente%20C%20envia%20um%20estado%20inválido%20e%20recebe%20uma%20mensagem%20de%20erro.png)

## Teste 5 — Verificação da atualização através de REST

Foi enviado um pedido **GET** para `http://localhost:3000/api/salas/1`.

**Resultado obtido:** `200 OK`. A resposta apresenta a Sala A com o estado `ocupada`, confirmando que a alteração realizada pelo Cliente A através do WebSocket também pode ser consultada através da API REST.

![Teste 5 — GET confirma o estado atualizado da Sala A](tests/Verificação%20da%20atualização%20feita%20pelo%20Cliente%20A%20na%20Sala%20A%20%28ID%201%29.png)

### Resumo dos testes

Os cinco testes permitiram demonstrar a criação de uma sala, a comunicação WebSocket entre clientes e servidor, a notificação automática de outro cliente, o tratamento de um estado inválido e a integração com a API REST.

Para repetir os testes, iniciar o servidor e executá-los pela ordem indicada. Como os dados são guardados em memória, ao reiniciar o servidor o array de salas volta a estar vazio e o primeiro ID atribuído será novamente `1`.

---

# Comparação com REST e justificação técnica

## Padrão de comunicação

Na **API REST**, o cliente envia um pedido HTTP e aguarda a resposta do servidor. Este modelo é adequado para operações como criar ou consultar os dados de uma sala.

Nos **WebSockets**, é estabelecida uma ligação persistente e bidirecional. Tanto o cliente como o servidor podem enviar mensagens através dessa ligação. Isto permite que o servidor avise os clientes quando o estado de uma sala é atualizado.

## Adequação ao projeto

A escolha dos WebSockets foi motivada pela necessidade de **comunicar alterações de estado das salas em tempo real**. Se apenas fosse utilizada a API REST, os clientes teriam de fazer novos pedidos GET para saber se o estado de uma sala tinha sido alterado.

Os WebSockets complementam a API REST: o REST é utilizado para criar e consultar salas, enquanto o WebSocket é utilizado para alterar o estado e notificar os clientes ligados.

## Vantagem

A principal vantagem é a **notificação automática das alterações**, sem necessidade de os restantes clientes efetuarem pedidos repetidos para procurar atualizações.

## Desvantagem e complexidade

A implementação exige uma maior gestão das ligações, incluindo o estabelecimento da ligação, o fecho, a identificação dos clientes ligados, a validação das mensagens e o tratamento de erros. Ao contrário das respostas REST, os erros do WebSocket não são apresentados como códigos de estado HTTP por cada mensagem.

## Limitações

- Os dados são guardados apenas em memória e perdem-se quando o servidor é reiniciado.
- As notificações `EstadoSalaAtualizado` são enviadas apenas aos clientes WebSocket que estejam ligados no momento da alteração.
- Uma sala criada através de `POST /api/salas` não origina, nesta implementação, uma notificação WebSocket automática. A notificação acontece quando o estado é alterado através do evento `AtualizarEstadoSala`.

---

# Formato dos erros

## Erros da API REST

A API REST utiliza, nos erros tratados explicitamente, o tipo de conteúdo `application/problem+json`, com campos como `status`, `title` e `detail`.

Exemplo de erro REST ao criar uma sala com estado inválido:

{
  "status": 400,
  "title": "Pedido inválido",
  "detail": "O estado deve ser disponivel, ocupada ou manutencao"
}

Os códigos utilizados incluem `400 Bad Request`, `404 Not Found`, `409 Conflict` e `500 Internal Server Error`.

## Erros nas mensagens WebSocket

Os WebSockets utilizam um formato de erro próprio, enviado através da ligação:

{
  "tipo": "Erro",
  "detalhe": "O estado deve ser disponivel, ocupada ou manutencao"
}

O WebSocket não devolve um código HTTP `400` para cada mensagem inválida. Neste caso, a falha é comunicada através do evento `Erro`.

Além dos estados inválidos, o servidor trata JSON malformado, mensagens que não sejam objetos JSON, tipos de evento desconhecidos, IDs inválidos e salas inexistentes.

---

# Utilização de IA

Foi utilizada IA generativa através do **ChatGPT** como ferramenta de apoio ao desenvolvimento e à documentação do Trabalho Prático.

## Finalidade

A IA foi utilizada para esclarecer dúvidas sobre a comunicação WebSocket, a biblioteca `ws`, as validações e a organização da demonstração.

## Parte do projeto

A utilização de IA incidiu principalmente sobre:

- compreensão e revisão da lógica de ligação e receção de mensagens WebSocket;
- validação dos campos `tipo`, `salaId` e `estado`;
- compreensão da confirmação enviada ao cliente que altera a sala e das notificações enviadas aos restantes clientes;
- organização dos testes realizados no Postman;
- revisão do README.

## Validação realizada

A implementação foi verificada com testes locais no Postman, incluindo um caso de sucesso, uma notificação automática, um erro de validação e a confirmação da alteração através da API REST. As capturas incluídas neste README documentam os resultados observados.