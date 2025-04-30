import { API } from "../config.js";

// Displaying and interacting with a user's profile
class UserProfilePage {
  constructor() {
    this.targetId = new URLSearchParams(window.location.search).get("id");
    this.currentUser = JSON.parse(localStorage.getItem("user"));

    if (!this.currentUser) {
      alert("You must be logged in!");
      window.location.href = "../index.html";
      return;
    }

    this.init();
  }

  // Initialize the page
  init() {
    this.setupNavbar();
    this.fetchTargetUser();
  }

  // Set up the navigation bar
  setupNavbar() {
    document
      .getElementById("discovery-button")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "../html/discovery.html";
      });

    document
      .getElementById("profile-button")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "../html/profile.html";
      });

    document
      .getElementById("connections-button")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "../html/connections.html";
      });

    document.getElementById("logout-button")?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("user");
      window.location.href = "../index.html";
    });
  }

  // Fetch the target user's data
  fetchTargetUser() {
    fetch(`${API}/${this.targetId}`)
      .then((res) => res.json())
      .then((user) => this.renderProfile(user))
      .catch((err) => console.error("Failed to fetch user:", err));
  }

  // Render the user's profile
  renderProfile(user) {
    const container = document.getElementById("user-profile-container");

    // Check if the user is valid
    user.requests = Array.isArray(user.requests) ? user.requests : [];
    user.connections = Array.isArray(user.connections) ? user.connections : [];

    // Determine the action button based on the user's status
    let actionButton = "";
    const alreadyConnected = this.currentUser.connections?.includes(user.id);
    const alreadyRequested = user.requests?.includes(this.currentUser.id);

    if (alreadyConnected) {
      actionButton = `<button class="unmatch" onclick="userProfile.unmatchConnection('${user.id}')">Unmatch</button>`;
    } else if (alreadyRequested) {
      actionButton = `<button onclick="userProfile.undoRequest('${user.id}')">Undo Request</button>`;
    } else {
      actionButton = `<button onclick="userProfile.sendRequest('${user.id}')">Send Request</button>`;
    }

    // Render the user profile
    container.innerHTML = `
      <div class="member-card">
        <img src="${user.avatar}" alt="Avatar" />
        <h2>${user.name}</h2>
        <p><strong>Role:</strong> ${user.role}</p>
        <p><strong>Skills:</strong> ${user.skills?.join(", ") || "None"}</p>
        <p><strong>Interests:</strong> ${
          user.interests?.join(", ") || "None"
        }</p>
        <p><strong>Bio:</strong> ${user.bio || "No bio available"}</p>
        ${actionButton}
        <div style="margin-top: 20px;">
          <a class="nav-e btn" href="../html/discovery.html">← Back to Discovery</a>
        </div>
      </div>
    `;
  }

  // Send a connection request to the target user
  sendRequest(id) {
    fetch(`${API}/${id}`)
      .then((res) => res.json())
      .then((user) => {
        user.requests = user.requests || [];
        if (!user.requests.includes(this.currentUser.id)) {
          user.requests.push(this.currentUser.id);
          return fetch(`${API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requests: user.requests }),
          });
        }
      })
      .then(() => window.location.reload())
      .catch((err) => console.error("Error sending request:", err));
  }

  // Undo a connection request
  undoRequest(id) {
    fetch(`${API}/${id}`)
      .then((res) => res.json())
      .then((user) => {
        user.requests = user.requests.filter(
          (rid) => rid !== this.currentUser.id
        );
        return fetch(`${API}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requests: user.requests }),
        });
      })
      .then(() => window.location.reload())
      .catch((err) => console.error("Error undoing request:", err));
  }

  // Remove a connection with the target user
  unmatchConnection(id) {
    if (!confirm("Are you sure you want to unmatch?")) return;

    const updatedConnections = this.currentUser.connections.filter(
      (cid) => cid !== id
    );

    fetch(`${API}/${this.currentUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connections: updatedConnections }),
    })
      .then((res) => res.json())
      .then((updatedUser) => {
        this.currentUser = updatedUser;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        // Remove the target user from the current user's connections
        return fetch(`${API}/${id}`);
      })
      .then((res) => res.json())
      .then((targetUser) => {
        const newTargetConnections =
          targetUser.connections?.filter(
            (cid) => cid !== this.currentUser.id
          ) || [];
        return fetch(`${API}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connections: newTargetConnections }),
        });
      })
      .then(() => window.location.reload())
      .catch((err) => {
        console.error("Error unmatching:", err);
        alert("Failed to unmatch.");
      });
  }
}

window.userProfile = new UserProfilePage();
