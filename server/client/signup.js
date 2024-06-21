const themes = [
    {
        background: "#1A1A2E",
        color: "#FFFFFF",
        primaryColor: "#0F3460"
    },
    {
        background: "#461220",
        color: "#FFFFFF",
        primaryColor: "#E94560"
    },
    {
        background: "#192A51",
        color: "#FFFFFF",
        primaryColor: "#967AA1"
    },
    {
        background: "#F7B267",
        color: "#000000",
        primaryColor: "#F4845F"
    },
    {
        background: "#F25F5C",
        color: "#000000",
        primaryColor: "#642B36"
    },
    {
        background: "#231F20",
        color: "#FFF",
        primaryColor: "#BB4430"
    }
];

const setTheme = (theme) => {
    const root = document.querySelector(":root");
    root.style.setProperty("--background", theme.background);
    root.style.setProperty("--color", theme.color);
    root.style.setProperty("--primary-color", theme.primaryColor);
    root.style.setProperty("--glass-color", theme.glassColor);
};

const displayThemeButtons = () => {
    const btnContainer = document.querySelector(".theme-btn-container");
    themes.forEach((theme) => {
        const div = document.createElement("div");
        div.className = "theme-btn";
        div.style.cssText = `background: ${theme.background}; width: 25px; height: 25px`;
        btnContainer.appendChild(div);
        div.addEventListener("click", () => setTheme(theme));
    });
};

displayThemeButtons();

// -----------------------------------------------------------------
// let url = "http://localhost:3000"
let url = "http://54.242.179.63"



document.getElementById('signUpForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const errormsg = document.getElementById('errormsg');
    errormsg.innerHTML = '';

    const signUpData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value
    };

    this.reset();
    // or
    //event.target.reset();
    postSignUpData(signUpData);
});


function postSignUpData(data) {
    axios.post(`user/signup`, data).then((res) => {
        console.log(res)
        alert(res.data.message)
        window.location.href = 'login';
    }).catch((err) => {
        console.log(err)
        const errormsg = document.getElementById('errormsg')
        errormsg.innerHTML = err.response.data

    })
}