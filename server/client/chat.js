// let url = "http://localhost:3000"
let url = "http://54.242.179.63"
let username

let token;
function logout() {
    console.log(token)
    axios.get(`user/logout`, { headers: { "Authorization": token } }).then((res) => {
        console.log(res)
        localStorage.clear()
        alert(res.data)
        window.location.href = 'login'
    }).catch(err => console.log(err))
}

function getLoggedInUsers() {
    axios.get(`user/online`).then((res) => {
        console.log(res.data.users)
    })
}



document.getElementById('messageForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const messageData = {
        message: document.getElementById('messageInput').value,
    };
    this.reset();
    sendMessage(messageData);
});

function sendMessage(data) {
    axios.post(`message/add-message`, data, { headers: { "Authorization": token } }).then((res) => {
        console.log(res)
        getMessages()
    }).catch((err) => {
        console.log(err)
    })
}


let lastMessageId = localStorage.getItem('lastMessageId') || -1;
const MAX_MESSAGES = 1000;

function getMessages() {
    axios.get(`message/get-messages?lastmsgId=${lastMessageId}`).then((res) => {
        const messages = res.data;
        if (messages.length > 0) {

            lastMessageId = messages[messages.length - 1].id;

            localStorage.setItem('lastMessageId', lastMessageId);

            let storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
            if (storedMessages.length > 1000) {
                storedMessages.splice(0, storedMessages.length - MAX_MESSAGES)
            }
            localStorage.setItem('messages', JSON.stringify([...storedMessages, ...messages]));

            // Render messages
            renderMessages(JSON.parse(localStorage.getItem('messages')));
        }
    }).catch((err) => {
        console.log(err);
    });
}


function renderMessages(data) {
    console.log(data)

    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = ''


    data.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        if (message.name === username) {
            messageElement.classList.add('user-message');
            messageElement.innerHTML = `<span class="username">${message.name}</span><div class="user-message-content">${message.message}</div>`;
        } else {
            messageElement.classList.add('other-message');
            messageElement.innerHTML = `<span class="name">${message.name}</span><div class="message-content">${message.message}</div>`;
        }
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;

    });
}


// chat.js

function toggleCreateGroupForm() {
    const createGroupFormContainer = document.getElementById('createGroupFormContainer');
    createGroupFormContainer.classList.toggle('hidden');
}

document.getElementById('createGroupForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const groupName = document.getElementById('groupNameInput').value;
    createGroup(groupName);
});

function createGroup(groupName) {
    axios.post(`group/create`, { groupName }, { headers: { "Authorization": token } })
        .then((res) => {
            console.log(res.data);
            // Refresh group list
            getGroups();
            // Hide the form
            toggleCreateGroupForm();
            // Clear input field
            document.getElementById('groupNameInput').value = '';
        })
        .catch((err) => console.error(err));
}

function getGroups() {
    axios.get(`group/get-groups`, { headers: { "Authorization": token } })
        .then((res) => {
            const groups = res.data;
            renderGroups(groups);
        })
        .catch((err) => console.error(err));
}

function renderGroups(groups) {
    const groupList = document.getElementById('group-list');
    groupList.innerHTML = '';

    groups.forEach(group => {
        const groupItem = document.createElement('div');
        groupItem.classList.add('group-item');
        groupItem.textContent = group.groupName;
        groupItem.addEventListener('click', () => joinGroup(group.id));
        groupList.appendChild(groupItem);
    });
}
// we have to do this for the mall
// todo
// function joinGroup(groupId) {
//     axios.post(`${url}/group/join/${groupId}`, {}, { headers: { "Authorization": token } })
//         .then((res) => {
//             console.log(res.data);
//             // Handle success, if needed
//         })
//         .catch((err) => console.error(err));
// }


setInterval(getMessages, 5000);
window.addEventListener('DOMContentLoaded', () => {
    token = localStorage.getItem('token')
    username = localStorage.getItem('user')
    const welcome = document.getElementById('welcome')
    welcome.innerHTML = `Start Messaging, ${username}`
    // checkPremium(localStorage.getItem('isPremium') === 'true')
    getLoggedInUsers()
    getMessages()
    getGroups();
});