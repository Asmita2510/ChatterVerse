const toggleButton = document.querySelector('.dark-light');
const colors = document.querySelectorAll('.color');

colors.forEach(color => {
    color.addEventListener('click', (e) => {
        colors.forEach(c => c.classList.remove('selected'));
        const theme = color.getAttribute('data-color');
        document.body.setAttribute('data-theme', theme);
        color.classList.add('selected');
    });
});

toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// let url = "http://localhost:3000"
let url = "http://54.242.179.63"
let username
let groupId
let groupName
let admin
let createdAt

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



document.getElementById('send-btn').addEventListener('click', function (event) {
    // event.preventDefault();
    const messageData = {
        message: document.getElementById('messageInput').value,
    };
    document.getElementById('messageInput').value = ''
    sendMessage(messageData);
});

function sendMessage(data) {
    axios.post(`message/add-message?groupId=${groupId}`, data, { headers: { "Authorization": token } }).then((res) => {
        console.log(res)
        getMessages()
    }).catch((err) => {
        console.log(err)
    })
}


let lastMessageId = localStorage.getItem('lastMessageId') || -1;
const MAX_MESSAGES = 1000;

function getMessages() {
    console.log('get msgs called')
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
    const chatArea = document.getElementById('chat-area-main');
    chatArea.innerHTML = ''; // Clear previous messages
    let initial = '';
    let lastChatMsg = null;
    let lastUserChatDiv = null; // Track the last chat user div

    data.forEach((message, index) => {
        if (message.groupId === groupId) {
            const chatUser = document.createElement('div');
            const chatContext = document.createElement('div');
            const chatText = document.createElement('div');

            if (message.name !== initial) {
                if (message.name === username) {
                    chatUser.className = 'chat-msg owner';
                } else {
                    chatUser.className = 'chat-msg';
                }

                chatContext.className = 'chat-msg-content';
                chatText.className = 'chat-msg-text';
                chatText.innerHTML = message.message;

                chatContext.appendChild(chatText);
                chatUser.appendChild(chatContext);
                chatArea.appendChild(chatUser);

                lastChatMsg = chatContext; // Set the last chat context for the user
                lastUserChatDiv = chatUser; // Set the last chat user div
            } else {
                const newChatText = document.createElement('div');
                newChatText.className = 'chat-msg-text';
                newChatText.innerHTML = message.message;
                lastChatMsg.appendChild(newChatText);
            }

            // If the current message is the last message or the next message belongs to a different user
            if (index === data.length - 1 || data[index + 1].name !== message.name) {
                // Append a new div to chatUser
                const newChatDiv = document.createElement('div');
                newChatDiv.className = 'chat-msg-profile';
                // Adjust class name as needed
                const lastUserName = document.createElement('div')
                lastUserName.className = 'chat-msg-date'
                console.log(message.name)
                lastUserName.innerHTML = message.name

                newChatDiv.appendChild(lastUserName)
                lastUserChatDiv.appendChild(newChatDiv);
            }

            initial = message.name; // Update the initial name for comparison
        }
    });
}



function toggleCreateGroupForm() {
    const createGroupFormContainer = document.getElementById('createGroupFormContainer');
    createGroupFormContainer.classList.toggle('hidden');
}

// document.getElementById('createGroupForm').addEventListener('submit', function (event) {
//     event.preventDefault();
//     console.log('button')
//     const groupName = document.getElementById('groupNameInput').value;
//     createGroup(groupName);
// });
const createGroupForm = document.getElementById("createGroupForm");
const overlay = document.getElementById("overlay");
const createGroupButton = document.getElementById("createGroupButton");

createGroupForm.addEventListener("click", function () {

    overlay.style.display = "block";
});

createGroupButton.addEventListener("click", function () {
    console.log('Group created');
    const groupName = document.getElementById('groupName').value;
    createGroup(groupName)
    overlay.style.display = "none";
});

function createGroup(groupName) {
    console.log('Inside create group')
    axios.post(`group/create`, { groupName }, { headers: { "Authorization": token } })
        .then((res) => {
            console.log(res.data);
            // Refresh group list
            getGroups();
            // Hide the form
            toggleCreateGroupForm();
            // Clear input field
            document.getElementById('groupName').value = '';
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

    console.log(groups)
    const groupArea = document.getElementById('groupArea');
    groupArea.innerHTML = ''
    groups.forEach((group) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'msg';
        groupDiv.addEventListener('click', () => {

            groupId = group.id
            groupName = group.groupName
            admin = group.userName[0]
            createdAt = (group.createdAt)

            if (admin === username) {
                console.log('This user is admin')
                document.getElementById('add-participants-btn').disabled = false
            }
            else {
                console.log('This user is not  admin')
                document.getElementById('add-participants-btn').disabled = true
            }

            const date = new Date(createdAt);

            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = date.toLocaleDateString('en-US', options);
            console.log(formattedDate)


            document.getElementById('currentGroupNameId').innerHTML = groupName
            document.getElementById('currentGroupName').innerHTML = groupName
            document.getElementById('admin').innerHTML = `Created by ${admin}, ${formattedDate}`
            console.log('group selected id', groupId)
            console.log('groupName', groupName)
            console.log('amdin', admin)


            const allGroups = document.querySelectorAll('.msg.active');
            allGroups.forEach((g) => g.className = 'msg');
            let storedMessages = JSON.parse(localStorage.getItem('messages'))

            groupDiv.className = 'msg active'
            renderMessages(storedMessages)

        });

        const msgDiv = document.createElement('div');
        msgDiv.className = 'msg-detail';
        const usernamediv = document.createElement('div');
        usernamediv.className = 'msg-username';
        usernamediv.innerHTML = group.groupName;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'msg-content';

        const lastMsg = document.createElement('span');
        lastMsg.className = 'msg-message';
        lastMsg.innerHTML = 'This is the last message'; //todo

        const lastMsgDate = document.createElement('span');
        lastMsgDate.className = 'msg-date';
        lastMsgDate.innerHTML = '20m'; //todo

        contentDiv.appendChild(lastMsg);
        contentDiv.appendChild(lastMsgDate);
        msgDiv.appendChild(usernamediv);
        msgDiv.appendChild(contentDiv);
        groupDiv.appendChild(msgDiv);
        groupArea.appendChild(groupDiv);
    });

}

function addParticipants() {
    console.log(groupId, 'this is the selected groupid')
    console.log('Add participants')
    document.getElementById('searchUser').style.display = 'block';
    document.getElementById('colour-change').style.display = 'none';
    document.getElementById('all-photos').style.display = 'none';
    
    // const usersArr=[]
    const displayUsersDiv=document.getElementById('display-users')
    displayUsersDiv.innerHTML=''
    document.getElementById('done').style.display = 'block';

    document.getElementById('searchUser').addEventListener('input', async (event) => {
        const searchValue = event.target.value.trim();
        console.log(searchValue)
        try {
            const response = await axios.get(`user/findUser`, {
                params: { searchQuery: searchValue }
            });
            
    
            const users = response.data;
            // Handle the response and display matching users
            console.log(users);
            const userDiv=document.createElement('div')
            userDiv.innerHTML=`
            <span >${users.name}</span>
            <button class="add-button" onclick="addUserToGroup(${users.id})">Add</button>
            `;

            displayUsersDiv.appendChild(userDiv)
            document.getElementById('searchUser').innerHTML=''


            // document.getElementById('searchUser').style.display = 'none';
             // Do something with the matching users
        } catch (error) {
            console.error('User does not exist:', error);
            // Handle error
        }
    })    
}

async function addUserToGroup(userId){
    console.log(userId,'user id')
    console.log(groupId,'gorup id')
    try{
        const response = await axios.post(`group/addUser`, {
            groupId: groupId,
            userId: userId
        });

        // Handle the response (e.g., display a success message)
        console.log(response.data);
    }
    catch (error) {
        console.error('Error adding user to group:', error);
        // Handle error
    }
    
}
function AddUsers(){
    document.getElementById('searchUser').style.display = 'none';
    document.getElementById('done').style.display = 'none';
    document.getElementById('colour-change').style.display = 'block';
    document.getElementById('all-photos').style.display = 'block';
    document.getElementById('display-users').style.display = 'none';


}


setInterval(getMessages, 5000);
window.addEventListener('DOMContentLoaded', () => {

    token = localStorage.getItem('token')
    username = localStorage.getItem('user')
    const welcome = document.getElementById('welcome')
    welcome.innerHTML = `Start Messaging, ${username}`
    document.getElementById("overlay").style.display = 'none';
    // checkPremium(localStorage.getItem('isPremium') === 'true')
    groupId = -1
    getLoggedInUsers()
    getMessages()
    getGroups();
    document.getElementById('searchUser').style.display = 'none';
    document.getElementById('done').style.display = 'none';
});