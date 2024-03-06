const axios = require('axios');
const webhookUrl = 'http://localhost:8065/hooks/5k4aggpmtjrrdbz6rb9mi8p7de';
const endpointUrl = 'http://localhost:8083/commands'; 

async function sendMessage(message) {
    try {
        await axios.post(webhookUrl, { text: message });
        console.log('Mensagem enviada com sucesso para o Mattermost:', message);
    } catch (error) {
        console.error('Erro ao enviar mensagem para o Mattermost:', error);
    }
}
async function fetchData() {
    try {
        const response = await axios.get(endpointUrl);
        return response.data; 
    } catch (error) {
        console.error('Erro ao fazer a solicitação:', error);
        throw error;
    }
}

async function handleChecklistCommand() {
    try {
        const data = await fetchData(); 
        const message = 'Aqui estão os dados do endpoint: ' + JSON.stringify(data);
        await sendMessage(message);
    } catch (error) {
        console.error('Erro ao manipular o comando "checklist":', error);
    }
}

function messageContainsChecklist(text) {
    return text.toLowerCase().includes('checklist');
}
async function monitorMessages() {
    try {
        const response = await axios.get(webhookUrl + '/posts');
        const messages = response.data.posts.map(post => post.message);

        for (const message of messages) {
            if (messageContainsChecklist(message)) {
                await handleChecklistCommand();
                break; 
            }
        }
    } catch (error) {
        console.error('Erro ao monitorar mensagens:', error);
    }
}

monitorMessages();