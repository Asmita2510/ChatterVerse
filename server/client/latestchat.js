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
let allAdmins =[] //changes
let createdAt

let token;

const logoutButton = document.getElementById("logoutBtn");
logoutButton.addEventListener("click", logout);

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

const socket = io(window.location.origin);
socket.on('connect', () => {
    console.log(`You connected with id: ${socket.id}`)
})

document.getElementById('send-btn').addEventListener('click', function (event) {
    // event.preventDefault();
    const messageData = {
        message: document.getElementById('messageInput').value,
    };
    document.getElementById('messageInput').value = ''
    sendMessage(messageData);
});

document.getElementById('messageInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        console.log('this is caled')
        event.preventDefault(); // Prevent default form submission

        const messageData = {
            message: document.getElementById('messageInput').value,
        };
        document.getElementById('messageInput').value = '';
        sendMessage(messageData);
    }
});

function sendMessage(data) {
    axios.post(`message/add-message?groupId=${groupId}`, data, { headers: { "Authorization": token } }).then((res) => {
        console.log(res)
        socket.emit('send-message', { data, groupId });
        getMessages()
    }).catch((err) => {
        console.log(err)
    })
}

socket.on('new-message', () => {
    getMessages();
});

socket.on('media-added', () => {
    getMessages();
});

let selectedFiles = [];




const addMediaButton = document.getElementById('add-media');
const addMediaInput = document.getElementById('add-media-input');
const fileDialog = document.getElementById('file-dialog');
const fileDialogClose = document.getElementById('file-dialog-close');
const fileDialogSelect = document.getElementById('file-dialog-select');
const fileList = document.getElementById('file-list');
const doneBtn = document.getElementById('file-dialog-send')
if (selectedFiles.length === 0)
    doneBtn.disabled = true

// Function to check and handle file size limit
function handleFileSize(file) {
    const fileSize = file.size / 1024 / 1024; // Convert to MB
    if (fileSize > 20) {
        alert('File size exceeds limit (20MB max). Please choose a smaller file.');
        return false; // Prevent upload if file is too large
    }
    return true; // Allow upload
}

addMediaButton.addEventListener('click', () => {
    console.log('add clicked')
    fileDialog.style.display = 'block'; // Show the dialog box
});

fileDialogClose.addEventListener('click', () => {
    fileDialog.style.display = 'none'; // Hide the dialog box
    fileList.innerHTML = ''
});

//chaanges
function isImageFile(file) {
    return file.type.startsWith('image/');
}
//changes

fileDialogSelect.addEventListener('click', () => {
    addMediaInput.click();
    const files = addMediaInput.files;

    for (const file of files) {
        if (!handleFileSize(file)) {

            continue;
        }
        //changes
        if (isImageFile(file)) { // Check if the file is an image
            // selectedFiles.push(file);
            // renderFile(file);
        }
    } //changes


});

function renderFile(file) {
    doneBtn.disabled = false
    const fileDiv = document.createElement('div');
    fileDiv.classList.add('file-item'); // Apply a class for styling

    fileDiv.textContent = file.name;

    const removeButton = document.createElement('button');
    removeButton.textContent = '×'; // Cross button content
    removeButton.addEventListener('click', () => {
        // Remove the file from the selectedFiles array
        const index = selectedFiles.indexOf(file);
        selectedFiles.splice(index, 1);

        // Remove the file's div element from the dialog
        fileDiv.remove();
    });

    fileDiv.appendChild(removeButton);

    // const fileList = document.getElementById('file-list'); // Assuming a container for files
    fileList.appendChild(fileDiv);
}


// Add event listener to handle file selection (optional)
addMediaInput.addEventListener('change', (event) => {
    const files = event.target.files;
    for (const file of files) {
        if (!handleFileSize(file)) {
            // File size exceeded limit, handle accordingly (e.g., remove from selection)
            return;
        }
        if (isImageFile(file)) { // Check if the file is an image
            selectedFiles.push(file);
            renderFile(file);
        } else {
            alert('Please select only image files.');
        }
        console.log(selectedFiles)

    }
});

doneBtn.addEventListener('click', () => {
    console.log('files to be added', selectedFiles)
    console.log('group id', groupId)
    fileList.innerHTML = ''
    fileDialog.style.display = 'none';


    selectedFiles.forEach((file) => {
        const formData = new FormData();
        formData.append('image', file);
        axios.post(`message/add-media?groupId=${groupId}`, formData, { headers: { "Authorization": token, "Content-Type": "multipart/form-data" } }).then((res) => {
            console.log(res)
            socket.emit('add-media', { selectedFiles, groupId });
            selectedFiles.splice(0)
            getMessages();
        }).catch((err) => {
            console.log(err)
        })

    });




    //todo- send these files to backend along with the group id and send token as authorization headers so backend can get the userid as well
    //    - call getMessages function
    //    - render it 

})

//todo- send these files to backend along with the group id and send token as authorization headers so backend can get the userid as well
//    - call getMessages function
//    - render it 


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

            if (message.name !== initial) {
                if (message.name === username) {
                    chatUser.className = 'chat-msg owner';
                } else {
                    chatUser.className = 'chat-msg';
                }

                chatContext.className = 'chat-msg-content';

                if (message.isText === '1') {
                    const chatText = document.createElement('div');
                    chatText.className = 'chat-msg-text';
                    chatText.innerHTML = message.message;
                    chatContext.appendChild(chatText);
                } else if (message.isText === '0') {
                    const chatImg = document.createElement('img');
                    chatImg.className = 'chat-msg-image';                    
                    chatImg.src = `/images/${message.message}`;
                    chatContext.appendChild(chatImg);
                    chatImg.addEventListener('click', function() {
                        toggleFullScreen(this);
                      });
                }

                chatUser.appendChild(chatContext);
                chatArea.appendChild(chatUser);

                lastChatMsg = chatContext; // Set the last chat context for the user
                lastUserChatDiv = chatUser; // Set the last chat user div
            } else {
                if (message.isText === '1') {
                    const newChatText = document.createElement('div');
                    newChatText.className = 'chat-msg-text';
                    newChatText.innerHTML = message.message;
                    lastChatMsg.appendChild(newChatText);
                  
                } else if (message.isText === '0') {
                    const newChatImg = document.createElement('img');
                    newChatImg.className = 'chat-msg-image';
                    newChatImg.src = `/images/${message.message}`;
                    lastChatMsg.appendChild(newChatImg);
                    newChatImg.addEventListener('click', function() {
                        toggleFullScreen(this);
                      });
                }
            }

            // If the current message is the last message or the next message belongs to a different user
            if (index === data.length - 1 || data[index + 1].name !== message.name) {
                // Append a new div to chatUser
                const newChatDiv = document.createElement('div');
                newChatDiv.className = 'chat-msg-profile';
                // Adjust class name as needed
                const lastUserName = document.createElement('div');
                lastUserName.className = 'chat-msg-date';
                lastUserName.innerHTML = message.name;

                newChatDiv.appendChild(lastUserName);
                lastUserChatDiv.appendChild(newChatDiv);
            }

            initial = message.name; // Update the initial name for comparison
        }
    });
}

document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement) {
      // Remove any fullscreen styles or classes
      // You may need to adjust this part based on your styling
      newChatImg.style.width = '';
      newChatImg.style.height = '';
    }
  });

function toggleFullScreen(element) {
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(err => {
        console.error('Failed to enable fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
  

function toggleCreateGroupForm() {
    const createGroupFormContainer = document.getElementById('createGroupFormContainer');
    createGroupFormContainer.classList.toggle('hidden');
}

const createGroupForm = document.getElementById("createGroupForm");
const overlay = document.getElementById("overlay");
const overlayClose = document.getElementById('form-dialog-close')
const createGroupButton = document.getElementById("createGroupButton");

createGroupForm.addEventListener("click", function () {

    overlay.style.display = "block";
});

overlayClose.addEventListener('click', () => {
    overlay.style.display = 'none'; // Hide the dialog box
});

createGroupButton.addEventListener("click", function () {
    console.log('Group created');
    const groupName = document.getElementById('groupName').value;
    overlay.style.display = "none";
    createGroup(groupName)

});

function createGroup(groupName) {
    console.log('Inside create group')
    axios.post(`group/create`, { groupName }, { headers: { "Authorization": token } })
        .then((res) => {
            console.log(res.data);
            // Refresh group list
            document.getElementById('groupName').value = '';
            getGroups();
            // Hide the form
            // toggleCreateGroupForm();
            // Clear input field

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
            const allMembers = document.getElementById('detail-all-members')
            allMembers.innerHTML = ''

            let allUsers = group.userName
            groupId = group.id
            groupName = group.groupName
            admin = group.adminName
            allAdmins=group.allAdmins //changes
            createdAt = (group.createdAt)

            allUsers.forEach((user) => {
                console.log(user.id)
                const thisUserDiv = document.createElement('div')
                thisUserDiv.className = 'user-container';
                thisUserDiv.id = user.id

                const currentUser = document.createElement('div')
                const removeUser = document.createElement('buttton')
                const makeAdmin = document.createElement('buttton')
                // if ((admin === username && user.name !== admin)||(allAdmins.includes(username) && !allAdmins.includes(user.name))) {

                    console.log('added remove')
                    removeUser.className = 'detail-button remove'
                    if(user.name===username) 
                    removeUser.textContent = 'Leave'
                    else{
                    removeUser.textContent = 'Remove'}
                    removeUser.addEventListener('click', () => {
                        // Handle remove user functionality
                        removeUserFromGroup(user.id); // Pass the user ID
                        
                    });
                    makeAdmin.className = 'detail-button remove'
                    makeAdmin.textContent = 'Make Admin'
                    makeAdmin.addEventListener('click', () => {
                        makeUserAdmin(user.id)
                        
                    })


                // }


                currentUser.innerHTML = user.name
                if (user.name === admin || group.allAdmins.includes(user.name))
                    currentUser.className = 'participant admin'

                else
                    currentUser.className = 'participant';

                thisUserDiv.appendChild(currentUser)
                if (user.name === username && user.name !== admin) {
                    thisUserDiv.appendChild(removeUser)
                }
                if (group.adminName === username || group.allAdmins.includes(username)) {
                  
                    if(user.name!==admin)
                    thisUserDiv.appendChild(removeUser)
                    // console.log(allAdmins.includes(user.name))
                    // console.log(user.name===admin)
                    if(!allAdmins.includes(user.name)&&user.name!==admin){
                        console.log('we dont need to add makeadmin btn')
                        thisUserDiv.appendChild(makeAdmin)
                    }
                   
                }

                allMembers.appendChild(thisUserDiv)
            })


            if (admin === username || allAdmins.includes(username)) {
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

const addButton = document.getElementById("add-participants-btn");
addButton.addEventListener("click", addParticipants);

function addParticipants() {
    console.log(groupId, 'this is the selected groupid')
    console.log('Add participants')
    document.getElementById('searchUser').style.display = 'block';
    document.getElementById('colour-change').style.display = 'none';
    document.getElementById('all-members').style.display = 'none';

    // const usersArr=[]
    const displayUsersDiv = document.getElementById('display-users')
    displayUsersDiv.innerHTML = ''
    document.getElementById('done').style.display = 'block';
    document.getElementById('display-users').style.display = 'block';

    // document.getElementById('searchUser').addEventListener('input', async (event) => {
    //     const searchValue = event.target.value.trim();
    //     console.log(searchValue)
    //     try {
    //         const response = await axios.get(`${url}/user/findUser`, {
    //             params: { searchQuery: searchValue }
    //         });


    //         const users = response.data;
    //         // Handle the response and display matching users
    //         console.log(users);
    //         const userDiv = document.createElement('div')
    //         userDiv.id=users.id
    //         userDiv.innerHTML = `
    //         <span >${users.name}</span>
    //         <button class="add-button" onclick="addUserToGroup(${users.id})">Add</button>
    //         `;

    //         displayUsersDiv.appendChild(userDiv)
    //         document.getElementById('searchUser').value = ''


    //         // document.getElementById('searchUser').style.display = 'none';
    //         // Do something with the matching users
    //     } catch (error) {
    //         console.error('User does not exist:', error);
    //         // Handle error
    //     }
    // })

    let timeoutId;

    document.getElementById('searchUser').addEventListener('input', async (event) => {
        const searchValue = event.target.value.trim();
        console.log(searchValue);

        // Clear any existing timeout
        clearTimeout(timeoutId);

        // Set a new timeout to delay the execution of the search request
        timeoutId = setTimeout(async () => {
            try {
                const response = await axios.get(`user/findUser`, {
                    params: { searchQuery: searchValue }
                });

                const users = response.data;
                // Handle the response and display matching users
                console.log(users);
                const userDiv = document.createElement('div')
                userDiv.id = users.id
                userDiv.innerHTML = `
                <span >${users.name}</span>
                <button class="add-button" >Add</button>
                `;

                const addButton = userDiv.querySelector('.add-button');
                addButton.addEventListener('click', () => {
                    addUserToGroup(users.id);
                });

                displayUsersDiv.appendChild(userDiv);
                document.getElementById('searchUser').value = '';

                // Do something with the matching users
            } catch (error) {
                console.error('User does not exist:', error);
                // Handle error
            }
        }, 500); // Adjust the delay as needed (e.g., 500 milliseconds)
    });
}

async function addUserToGroup(userId) {
    console.log(userId, 'user id')
    console.log(groupId, 'gorup id')

    try {
        const response = await axios.post(`group/addUser`, {
            groupId: groupId,
            userId: userId
        });

        // Handle the response (e.g., display a success message)
        console.log(response.data);
        const userDiv = document.getElementById(userId)
        userDiv.parentNode.removeChild(userDiv);
    }
    catch (error) {
        console.error('Error adding user to group:', error.response.data.error);
        // Handle error
        const userDiv = document.getElementById(userId)
        userDiv.className = 'errorMsg shake'
        userDiv.innerHTML = error.response.data.error;
        setTimeout(() => {
            userDiv.parentNode.removeChild(userDiv) // Clear the inner HTML
        }, 2000);
    }

}

const adduserButton = document.getElementById("add-users");
adduserButton.addEventListener("click", AddUsers);
function AddUsers() {
    document.getElementById('searchUser').style.display = 'none';
    document.getElementById('done').style.display = 'none';
    document.getElementById('colour-change').style.display = 'block';
    document.getElementById('all-members').style.display = 'block';
    document.getElementById('display-users').style.display = 'none';
    getGroups();


}

async function removeUserFromGroup(id) {

    try {
        // Send a DELETE request to your backend API endpoint
        const response = await axios.delete(`group/removeUser`, {
            data: { groupId, id }, // Pass the group ID and user ID in the request body
            headers: { "Authorization": token } // Add authorization headers if required
        });


        document.getElementById(id).remove()
        // Handle the response
        console.log(response.data); // Log success message or handle as needed
        //here we can make a getGroups call again
        getGroups();
    } catch (error) {
        console.error('Error removing user from group:', error);
        // Handle error
    }
}

async function makeUserAdmin(id) {
    try {
        console.log('User with id ', id, ' has to be made admin of the groupip ', groupId)

        const response = await axios.post('group/addAdmin', {
            data: { groupId, id }
        });
        console.log(response)
        //here we can make a getGroups call again
        getGroups();
    } catch (error) {
        console.error('Error removing user from group:', error);
        // Handle error
    }
}


window.addEventListener('DOMContentLoaded', () => {

    token = localStorage.getItem('token')
    username = localStorage.getItem('user')
    const welcome = document.getElementById('welcome')
    welcome.innerHTML = `Start Messaging,  <span class="username">${username}!</span>`
    document.getElementById("overlay").style.display = 'none';
    // checkPremium(localStorage.getItem('isPremium') === 'true')
    groupId = -1
    getLoggedInUsers()
    getMessages()
    getGroups();
    document.getElementById('searchUser').style.display = 'none';
    document.getElementById('done').style.display = 'none';
    document.getElementById('file-dialog').style.display = 'none';
});