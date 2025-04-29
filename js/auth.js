class Auth {
  constructor() {
    document.querySelector("body").style.display = "none";
    const auth = localStorage.getItem("auth");
    this.validateAuth(auth);
  }

  validateAuth(auth) {
    if (auth != "1") {
      window.location.replace("index.html");
    } else {
      localStorage.setItem("auth", 0);
    }
  }

  logOut() {
    localStorage.removeItem("auth");
    window.location.replace("index.html");
  }
}
