// Initializate the Auth class to handle authentication
const auth = new Auth();

// Logout button event listener
document.querySelector(".logout").addEventListener("click", (e) => {
  auth.logOut();
});
