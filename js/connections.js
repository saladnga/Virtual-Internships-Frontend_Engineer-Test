import { API } from "../config.js";
let currentUser = null;
let allUsers = [];

class ConnectionManager {
  constructor() {
    this.init();
  }

  init() {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser) {
      alert("You must be logged in!");
      window.location.href = "../index.html";
      return;
    }

    // Refresh user data from API
    fetch(`${API}/${savedUser.id}`)
      .then((res) => res.json())
      .then((freshUser) => {
        currentUser = freshUser;
        localStorage.setItem("user", JSON.stringify(freshUser));
        // Load all user after authentication
        this.fetchAllUsers();
      })
      .catch(() => {
        window.location.href = "../index.html";
      });

    this.attachNavEvents();
  }

  // Set up navigation bar events
  attachNavEvents() {
    const discoveryButton = document.getElementById("discovery-button");
    const profileButton = document.getElementById("profile-button");
    const connectionsButton = document.getElementById("connections-button");
    const logoutButton = document.getElementById("logout-button");
    const burger = document.getElementById("burger-menu");
    const nav = document.getElementById("nav-links");

    burger.addEventListener("click", () => {
      nav.classList.toggle("active");
    });

    discoveryButton?.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "../html/discovery.html";
    });

    profileButton?.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "../html/profile.html";
    });

    connectionsButton?.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "../html/connections.html";
    });

    logoutButton?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      window.location.href = "../index.html";
    });
  }

  fetchAllUsers() {
    fetch(API)
      .then((res) => res.json())
      .then((users) => {
        allUsers = users;
        this.displayRequests();
        this.displayConnections();
      });
  }

  // Display pending requests
  displayRequests() {
    const pendingDiv = document.getElementById("pending-requests");
    pendingDiv.innerHTML = "";

    if (!currentUser.requests || currentUser.requests.length === 0) {
      pendingDiv.innerHTML = "<p>No pending requests.</p>";
      return;
    }

    const pendingUsers = allUsers.filter((user) =>
      currentUser.requests.includes(user.id)
    );

    pendingUsers.forEach((user) => {
      const card = document.createElement("div");
      card.className = "member-card";

      card.innerHTML = `
        <img src="${user.avatar}" alt="Avatar" width="100" height="100" />
        <h3>${user.name || "No Name"}</h3>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role || "No Role"}</p>
        <button onclick="manager.acceptRequest('${user.id}')">Accept</button>
        <button onclick="manager.declineRequest('${user.id}')">Decline</button>
      `;

      pendingDiv.appendChild(card);
    });
  }

  // Display connections
  displayConnections() {
    const connectionsDiv = document.getElementById("connections-list");
    connectionsDiv.innerHTML = "";

    if (!currentUser.connections || currentUser.connections.length === 0) {
      connectionsDiv.innerHTML = "<p>You have no connections yet.</p>";
      return;
    }

    const myConnections = allUsers.filter((user) =>
      currentUser.connections.includes(user.id)
    );

    // Render each connection as a card
    myConnections.forEach((user) => {
      const card = document.createElement("div");
      card.className = "member-card";

      card.innerHTML = `
        <img src="${user.avatar}" alt="Avatar" width="100" height="100" />
        <h3>${user.name || "No Name"}</h3>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role || "No Role"}</p>
        <p><strong>Skills:</strong> ${
          user.skills && user.skills.length
            ? user.skills.join(", ")
            : "No skills listed"
        }</p>
        <button onclick="manager.unmatchConnection('${
          user.id
        }')">Unmatch</button>
      `;

      connectionsDiv.appendChild(card);
    });
  }

  acceptRequest(senderId) {
    if (!confirm("Accept this mentorship request?")) return;

    // Update current user's connections and remove requests
    const updatedMyConnections = currentUser.connections
      ? [...currentUser.connections, senderId]
      : [senderId];
    const updatedRequests = currentUser.requests.filter(
      (id) => id !== senderId
    );

    // Update user's information
    fetch(`${API}/${currentUser.id}`, {
      method: "PUT",
      body: JSON.stringify({
        connections: updatedMyConnections,
        requests: updatedRequests,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((updatedUser) => {
        currentUser = updatedUser;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return fetch(`${API}/${senderId}`);
      })
      .then((res) => res.json())
      .then((senderUser) => {
        // Update sender's connections and remove requests
        const updatedSenderConnections = senderUser.connections
          ? [...senderUser.connections, currentUser.id]
          : [currentUser.id];
        const updatedSenderRequests = senderUser.requests
          ? senderUser.requests.filter((id) => id !== currentUser.id)
          : [];

        return fetch(`${API}/${senderId}`, {
          method: "PUT",
          body: JSON.stringify({
            connections: updatedSenderConnections,
            requests: updatedSenderRequests,
          }),
          headers: { "Content-Type": "application/json" },
        });
      })
      .then(() => this.fetchAllUsers())
      .catch(() => alert("Something went wrong. Please try again."));
  }

  // Decline a mentorship request
  declineRequest(senderId) {
    if (!confirm("Decline this mentorship request?")) return;

    const updatedRequests = currentUser.requests.filter(
      (id) => id !== senderId
    );

    fetch(`${API}/${currentUser.id}`, {
      method: "PUT",
      body: JSON.stringify({ requests: updatedRequests }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((updatedUser) => {
        currentUser = updatedUser;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        this.fetchAllUsers();
      })
      .catch((error) => {
        console.error("Error declining:", error);
        alert("Something went wrong. Please try again.");
      });
  }

  // Unmatch a connection
  unmatchConnection(targetId) {
    if (!confirm("Are you sure you want to unmatch this connection?")) return;

    const updatedMyConnections = currentUser.connections.filter(
      (id) => id !== targetId
    );

    fetch(`${API}/${currentUser.id}`, {
      method: "PUT",
      body: JSON.stringify({ connections: updatedMyConnections }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((updatedUser) => {
        currentUser = updatedUser;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return fetch(`${API}/${targetId}`);
      })
      .then((res) => res.json())
      .then((targetUser) => {
        const updatedTargetConnections = targetUser.connections
          ? targetUser.connections.filter((id) => id !== currentUser.id)
          : [];

        return fetch(`${API}/${targetId}`, {
          method: "PUT",
          body: JSON.stringify({ connections: updatedTargetConnections }),
          headers: { "Content-Type": "application/json" },
        });
      })
      .then(() => this.fetchAllUsers())
      .catch((error) => {
        console.error("Error unmatching:", error);
        alert("Error occurred. Please try again.");
      });
  }
}

window.manager = new ConnectionManager();
