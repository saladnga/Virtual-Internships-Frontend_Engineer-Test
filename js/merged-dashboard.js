const API = "https://680e2ef6c47cb8074d92559d.mockapi.io/mentor/api/users";
let currentUser = null;
let allUsers = [];

document.addEventListener("DOMContentLoaded", () => {
  const savedUser = JSON.parse(localStorage.getItem("user"));

  if (!savedUser) {
    alert("You must be logged in!");
    window.location.href = "../index.html";
    return;
  }

  fetch(`${API}/${savedUser.id}`)
    .then((res) => res.json())
    .then((freshUser) => {
      currentUser = freshUser;
      localStorage.setItem("user", JSON.stringify(freshUser));
      fetchAllUsers();
    })
    .catch((error) => {
      console.error("Error loading user:", error);
      alert("Session expired, please log in again.");
      window.location.href = "../index.html";
    });

  const logoutButton = document.getElementById("logout-button");
  logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    window.location.href = "../index.html";
  });
});

function fetchAllUsers() {
  fetch(API)
    .then((res) => res.json())
    .then((users) => {
      allUsers = users;
      displayRequests();
      displayConnections();
    })
    .catch((error) => console.error("Error fetching users:", error));
}

function displayRequests() {
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
      <button onclick="acceptRequest('${user.id}')">Accept</button>
      <button onclick="declineRequest('${user.id}')">Decline</button>
    `;

    pendingDiv.appendChild(card);
  });
}

function displayConnections() {
  const connectionsDiv = document.getElementById("connections-list");
  connectionsDiv.innerHTML = "";

  if (!currentUser.connections || currentUser.connections.length === 0) {
    connectionsDiv.innerHTML = "<p>You have no connections yet.</p>";
    return;
  }

  const myConnections = allUsers.filter((user) =>
    currentUser.connections.includes(user.id)
  );

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
      <button onclick="unmatchConnection('${user.id}')">Unmatch</button>
    `;

    connectionsDiv.appendChild(card);
  });
}

function acceptRequest(senderId) {
  if (!confirm("Accept this mentorship request?")) return;

  const updatedMyConnections = currentUser.connections
    ? [...currentUser.connections, senderId]
    : [senderId];

  const updatedRequests = currentUser.requests.filter((id) => id !== senderId);

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
    .then(() => {
      alert("Accepted successfully!");
      fetchAllUsers();
    })
    .catch((error) => {
      console.error("Error accepting:", error);
      alert("Something went wrong. Please try again.");
    });
}

function declineRequest(senderId) {
  if (!confirm("Decline this mentorship request?")) return;

  const updatedRequests = currentUser.requests.filter((id) => id !== senderId);

  fetch(`${API}/${currentUser.id}`, {
    method: "PUT",
    body: JSON.stringify({ requests: updatedRequests }),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((updatedUser) => {
      currentUser = updatedUser;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("Declined successfully!");
      fetchAllUsers();
    })
    .catch((error) => {
      console.error("Error declining:", error);
      alert("Something went wrong. Please try again.");
    });
}

function unmatchConnection(targetId) {
  if (!confirm("Are you sure you want to unmatch this connection?")) {
    return;
  }

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
    .then(() => {
      alert("Unmatched successfully!");
      fetchAllUsers();
    })
    .catch((error) => {
      console.error("Error unmatching:", error);
      alert("Error occurred. Please try again.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const discoveryButton = document.getElementById("discovery-button");
  const profileButton = document.getElementById("profile-button");
  const connectionsButton = document.getElementById("connections-button");
  const logoutButton = document.getElementById("logout-button");

  if (discoveryButton) {
    discoveryButton.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "../html/discovery.html";
    });
  }

  if (profileButton) {
    profileButton.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "../html/profile.html";
    });
  }

  if (connectionsButton) {
    connectionsButton.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "../html/mentor-dashboard.html";
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("user");
      localStorage.removeItem("auth");
      window.location.href = "../index.html";
    });
  }
});
