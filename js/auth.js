class Auth {
  // Hide content until auth is validated
  constructor() {
    document.querySelector("body").style.display = "none";
    const auth = localStorage.getItem("auth");
    this.validateAuth(auth);
  }
  // If not, redirect to login page
  validateAuth(auth) {
    if (auth != "1") {
      window.location.replace("index.html");
    } else {
      // Show content if validated
      localStorage.setItem("auth", 0);
    }
  }

  logOut() {
    // Remove auth from local storage
    localStorage.removeItem("auth");
    window.location.replace("index.html");
  }
}
