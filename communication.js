const SERVER = "http://twserver.alunos.dcc.fc.up.pt:8008/";

async function register(username, password) {
  let url = SERVER + "register";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    });

    if (response.ok) {
      const json = await response.json();
      return !("error" in json);
    }
  } catch (error) {
    return false;
  }
}

async function clickRegister() {
  let username = document.getElementById("username-input").value;
  let password = document.getElementById("password-input").value;
  let canRegister = await registerClient(username, password);

  if (canRegister) {
    console.log("Registration successful");
  } else {
    console.log("Registration failed");
  }
}

document
  .getElementById("login-button")
  .addEventListener("click", clickRegister);
