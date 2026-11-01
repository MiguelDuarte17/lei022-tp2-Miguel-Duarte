//Representar o servidor/API pela app Express
const express = require('express');
const app = express();
const http = require('http');
const WebSocket = require('ws');

// Partilhar o mesmo servidor HTTP entre REST e WebSockets
const servidor = http.createServer(app);
const wss = new WebSocket.Server({ server: servidor, path: '/ws' });

app.use(express.json());
const PORT = 3000;


//========================================================================
// RECURSO ITEM  - OBRIGATÓRIO
//========================================================================

//------------------------------------------------------------------------
// ESTRUTURA ITEM
//------------------------------------------------------------------------

const items = [];
let proximoId = 1;


//------------------------------------------------------------------------
// GETs ITEMS
//------------------------------------------------------------------------

app.get('/api/items', (req, res) => {
    const name = req.query.name;

    if (name !== undefined) {
        const nameLimpo = name.trim();

        if (nameLimpo === '') {
            return res
                .status(400)
                .setHeader('Content-Type', 'application/problem+json')
                .json({
                    status: 400,
                    title: "Pedido inválido",
                    detail: "O parâmetro name não pode estar vazio"
                });
        }

        const resultado = items.filter(
            item => item.name.toLowerCase().includes(nameLimpo.toLowerCase())
        );

        return res.json(resultado);
    }

    res.json(items);
});
 

app.get('/api/items/:id', (req, res) => {
    const idOriginal = req.params.id;

    //apenas numeros
    if(!/^\d+$/.test(idOriginal)) {
        return res
            .status(404)
            .setHeader('Content-Type', 'application/problem+json')
            .json({ 
                status: 404,
                title: 'Não encontrado',
                detail: 'Não existe id de item com letras ou símbolos'
            });
    }

    const id = Number(idOriginal);

    //superior a 0 e inteiro
    if(!Number.isInteger(id) || id <= 0) {
        return res
            .status(400)
            .setHeader('Content-Type', 'application/problem+json')
            .json({ 
                status: 400,
                title: 'Não encontrado',
                error: 'O id deve ser um número inteiro maior que 0'
            });
    }

    const item = items.find(item => item.id === id);

    if(!item) {
        return res
            .status(404)
            .setHeader('Content-Type', 'application/problem+json')
            .json({ 
                status: 404,
                title: 'Não encontrado',
                error: `Não existe item com id ${req.params.id}`
            });
    }

    res.json(item);
});


//------------------------------------------------------------------------
// POSTs ITEMS
//------------------------------------------------------------------------

app.post('/api/items', (req, res) => {

    const { name } = req.body;

    if (name === undefined) {
        return res
            .status(400)
            .setHeader('Content-Type', 'application/problem+json')
            .json({
                status: 400,
                title: 'Pedido inválido',
                detail: 'O corpo do pedido é obrigatório'
            });
    }

    const nameLimpo = name.trim();

    if (nameLimpo === '') {
        return res
            .status(400)
            .setHeader('Content-Type', 'application/problem+json')
            .json({
                status: 400,
                title: 'Pedido inválido',
                detail: 'O nome do item não pode estar vazio'
            });
    }

    if (!isNaN(nameLimpo)) {
        return res
            .status(400)
            .setHeader('Content-Type', 'application/problem+json')
            .json({
                status: 400,
                title: 'Pedido inválido',
                detail: 'O nome do item não pode ser um número'
            });
    }

    const novoItem = {
        id: proximoId,
        name: nameLimpo
    };

    proximoId++;

    items.push(novoItem);

    res.status(201).json(novoItem);
});


//------------------------------------------------------------------------
// PUTs ITEMS
//------------------------------------------------------------------------

app.put('/api/items/:id', (req, res) => {

  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res
        .status(400)
        .setHeader('Content-Type', 'application/problem+json')
        .json({
            status: 400,
            title: "Pedido inválido",
            detail: "O id deve ser um número inteiro positivo"
        });
  }

  const index = items.findIndex(item => item.id === id);

  if (index === -1) {
    return res
        .status(404)
        .setHeader('Content-Type', 'application/problem+json')
        .json({
            status: 404,
            title: "Não encontrado",
            detail: "Não existe um item com esse id"
        });
  }

  const { name } = req.body;

  if (typeof name !== 'string' || name.trim() === '') {
    return res
        .status(400)
        .setHeader('Content-Type', 'application/problem+json')
        .json({
            status: 400,
            title: "Pedido inválido",
            detail: "O campo name é obrigatório e não pode estar vazio"
        });
  }

  items[index] = {
    ...items[index],
    name: name.trim()
  };

  res.json(items[index]);
});


//------------------------------------------------------------------------
// DELETEs ITEMS
//------------------------------------------------------------------------

app.delete('/api/items/:id', (req, res) => {

  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res
        .status(400)
        .setHeader('Content-Type', 'application/problem+json')
        .json({
            status: 400,
            title: "Pedido inválido",
            detail: "O id deve ser um número inteiro positivo"
        });
  }

  const index = items.findIndex(item => item.id === id);

  if (index === -1) {
    return res
        .status(404)
        .setHeader('Content-Type', 'application/problem+json')
        .json({
            status: 404,
            title: "Não encontrado",
            detail: "Não existe um item com esse id"
        });
  }

  items.splice(index, 1);

  res.status(204).send();
});




//========================================================================
// RECURSO SALAS - OPCIONAL
//========================================================================

//------------------------------------------------------------------------
// ESTRUTURA SALAS
//------------------------------------------------------------------------

const salas = [];
let proximoIdSala = 1;


//------------------------------------------------------------------------
// GETs SALAS
//------------------------------------------------------------------------

app.get('/api/salas', (req, res) => {
    const nome = req.query.nome;

    if (nome !== undefined) {
        const nomeLimpo = nome.trim();

        if (nomeLimpo === '') {
            return res
                .status(400)
                .setHeader('Content-Type', 'application/problem+json')
                .json({
                    status: 400,
                    title: "Pedido inválido",
                    detail: "O parâmetro nome não pode estar vazio"
                });
        }

        const resultado = salas.filter(
            sala => sala.nome.toLowerCase().includes(nomeLimpo.toLowerCase())
        );

        return res.json(resultado);
    }

    res.json(salas);
});


app.get('/api/salas/:id', (req, res) => {
    const idOriginal = req.params.id;

    // apenas numeros
    if (!/^\d+$/.test(idOriginal)) {
        return res
            .status(404)
            .setHeader('Content-Type', 'application/problem+json')
            .json({
                status: 404,
                title: 'Não encontrado',
                detail: 'Não existe id da sala com letras ou símbolos'
            });
    }

    const id = Number(idOriginal);

    // superior a 0 e inteiro
    if (!Number.isInteger(id) || id <= 0) {
        return res
            .status(400)
            .setHeader('Content-Type', 'application/problem+json')
            .json({
                status: 400,
                title: 'Pedido inválido',
                detail: 'O id deve ser um número inteiro maior que 0'
            });
    }

    const sala = salas.find(sala => sala.id === id);

    if (!sala) {
        return res
            .status(404)
            .setHeader('Content-Type', 'application/problem+json')
            .json({
                status: 404,
                title: 'Não encontrado',
                detail: `Não existe uma sala com id ${req.params.id}`
            });
    }

    res.json(sala);
});


//------------------------------------------------------------------------
// POSTs SALAS
//------------------------------------------------------------------------

app.post('/api/salas', (req, res) => {

    const { nome, capacidade, estado } = req.body;

    if (nome === undefined || capacidade === undefined || estado === undefined) {
        return res
            .status(400)
            .setHeader('Content-Type', 'application/problem+json')
            .json({
                status: 400,
                title: 'Pedido inválido',
                detail: 'O nome, a capacidade e o estado são obrigatórios'
            });
    }

    const nomeLimpo = nome.trim();

    if (nomeLimpo === '') {
        return res
            .status(400)
            .setHeader('Content-Type', 'application/problem+json')
            .json({
                status: 400,
                title: 'Pedido inválido',
                detail: 'O nome da sala não pode estar vazio'
            });
    }

    if (!isNaN(nomeLimpo)) {
        return res
            .status(400)
            .setHeader('Content-Type', 'application/problem+json')
            .json({
                status: 400,
                title: 'Pedido inválido',
                detail: 'O nome da sala não pode ser um número'
            });
    }

    if (!Number.isInteger(capacidade) || capacidade <= 0) {
        return res
            .status(400)
            .setHeader('Content-Type', 'application/problem+json')
            .json({
                status: 400,
                title: 'Pedido inválido',
                detail: 'A capacidade deve ser um número inteiro maior que 0'
            });
    }

    if (!['disponivel', 'ocupada', 'manutencao'].includes(estado)) {
        return res
            .status(400)
            .setHeader('Content-Type', 'application/problem+json')
            .json({
                status: 400,
                title: 'Pedido inválido',
                detail: 'O estado deve ser disponivel, ocupada ou manutencao'
            });
    }

    const salaExistente = salas.find(
        sala => sala.nome.toLowerCase() === nomeLimpo.toLowerCase()
    );

    if (salaExistente) {
        return res
            .status(409)
            .setHeader('Content-Type', 'application/problem+json')
            .json({
                status: 409,
                title: 'Conflito',
                detail: 'Já existe uma sala com esse nome'
            });
    }

    const novaSala = {
        id: proximoIdSala,
        nome: nomeLimpo,
        capacidade: capacidade,
        estado: estado
    };

    proximoIdSala++;

    salas.push(novaSala);

    res.status(201).json(novaSala);
});










//========================================================================
// TP2 - WEBSOCKETS - ATUALIZAÇÃO DO ESTADO DAS SALAS
//========================================================================

wss.on('connection', (ws) => {
    console.log('Cliente WebSocket ligado');

    ws.send(JSON.stringify({
        tipo: 'LigacaoEstabelecida',
        mensagem: 'Ligação WebSocket estabelecida com sucesso'
    }));

    ws.on('message', (dados) => {
        let mensagem;

        // O cliente tem de enviar uma mensagem JSON válida
        try {
            mensagem = JSON.parse(dados.toString());
        } catch (erro) {
            ws.send(JSON.stringify({
                tipo: 'Erro',
                detalhe: 'A mensagem deve conter JSON válido'
            }));
            return;
        }

        if (!mensagem || typeof mensagem !== 'object' || Array.isArray(mensagem)) {
            ws.send(JSON.stringify({
                tipo: 'Erro',
                detalhe: 'A mensagem deve ser um objeto JSON'
            }));
            return;
        }

        if (mensagem.tipo !== 'AtualizarEstadoSala') {
            ws.send(JSON.stringify({
                tipo: 'Erro',
                detalhe: 'Tipo de evento desconhecido'
            }));
            return;
        }

        const { salaId, estado } = mensagem;

        if (!Number.isInteger(salaId) || salaId <= 0) {
            ws.send(JSON.stringify({
                tipo: 'Erro',
                detalhe: 'O salaId deve ser um número inteiro maior que 0'
            }));
            return;
        }

        if (!['disponivel', 'ocupada', 'manutencao'].includes(estado)) {
            ws.send(JSON.stringify({
                tipo: 'Erro',
                detalhe: 'O estado deve ser disponivel, ocupada ou manutencao'
            }));
            return;
        }

        const sala = salas.find(sala => sala.id === salaId);

        if (!sala) {
            ws.send(JSON.stringify({
                tipo: 'Erro',
                detalhe: `Não existe uma sala com id ${salaId}`
            }));
            return;
        }

        console.log(`Mensagem válida para atualizar sala ${salaId}`);
    });
});


//------------------------------------------------------------------------
// Verificar JSON Malformado
//------------------------------------------------------------------------

app.use((err, req, res, next) => {

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res
            .status(400)
            .type('application/problem+json')
            .json({
                status: 400,
                title: 'Pedido inválido',
                detail: 'O corpo do pedido é ilegível'
            });
    }

    res
        .status(500)
        .type('application/problem+json')
        .json({
            status: 500,
            title: 'Erro interno',
            detail: 'Ocorreu um erro inesperado'
        });
});


//------------------------------------------------------------------------
// PORTA
//------------------------------------------------------------------------

servidor.listen(PORT, () => {
    console.log(`API a executar em http://localhost:${PORT}`);
    console.log(`WebSocket a executar em ws://localhost:${PORT}/ws`);
});
