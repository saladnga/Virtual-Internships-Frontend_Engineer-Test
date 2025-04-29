const API = "https://680e2ef6c47cb8074d92559d.mockapi.io/mentor/api/users";
let allUsers = [];
let currentUser = null;

let currentPage = 1;
const itemsPerPage = 5; // Show 5 users per page

document.addEventListener("DOMContentLoaded", () => {
  currentUser = JSON.parse(localStorage.getItem("user"));

  if (!currentUser) {
    alert("You must be logged in to use discovery!");
    window.location.href = "login.html";
    return;
  }

  // ✅ Navbar navigation setup
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
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      window.location.href = "../index.html";
    });
  }

  // ✅ Main discovery page logic
  fetchMembers();

  document.getElementById("search-button").addEventListener("click", () => {
    currentPage = 1;
    filterMembers();
  });

  document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      filterMembers();
    }
  });

  document.getElementById("next-page").addEventListener("click", () => {
    if (currentPage * itemsPerPage < allUsers.length) {
      currentPage++;
      filterMembers();
    }
  });

  document.getElementById("skill-filter").addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      currentPage = 1;
      filterMembers();
    }
  });
});

// 📋 Fetch all users
function fetchMembers() {
  fetch(API)
    .then((response) => response.json())
    .then((users) => {
      allUsers = users.filter((user) => user.id !== currentUser.id);
      filterMembers();
    })
    .catch((error) => console.error("Error fetching members:", error));
}

// 📋 Display members
function displayMembers(users) {
  const membersList = document.getElementById("members-list");
  membersList.innerHTML = "";

  if (users.length === 0) {
    membersList.innerHTML = "<p>No members found.</p>";
    return;
  }

  const start = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = users.slice(start, start + itemsPerPage);

  paginatedUsers.forEach((user) => {
    const memberCard = document.createElement("div");
    memberCard.className = "member-card";

    let actionButton = "";

    const alreadyConnected = currentUser.connections?.includes(user.id);
    const alreadyRequested = user.requests?.includes(currentUser.id);

    if (alreadyConnected) {
      actionButton = `<button class="unmatch-btn" onclick="unmatchConnection('${user.id}')">Unmatch</button>`;
    } else if (alreadyRequested) {
      actionButton = `<button class="request-btn" disabled>Request Sent</button>`;
    } else {
      actionButton = `<button class="request-btn" onclick="sendMentorshipRequest('${user.id}')">Send Request</button>`;
    }

    memberCard.innerHTML = `
      <img src="${user.avatar}" alt="Avatar" width="100" height="100" />
      <h3>${user.name || "No Name"}</h3>
      <p><strong>Role:</strong> ${user.role || "No Role"}</p>
      <p><strong>Skills:</strong> ${
        user.skills && user.skills.length
          ? user.skills.join(", ")
          : "No skills listed"
      }</p>
      <p><strong>Bio:</strong> ${user.bio || "No bio provided"}</p>
      ${actionButton}
    `;

    membersList.appendChild(memberCard);
  });

  updatePaginationControls(users.length);
}

// 🆕 Update Prev/Next buttons
function updatePaginationControls(totalItems) {
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage * itemsPerPage >= totalItems;
}

// 📋 Filter
function filterMembers() {
  const selectedRole = document
    .getElementById("role-filter")
    .value.trim()
    .toLowerCase();
  const skillSearch = document
    .getElementById("skill-filter")
    .value.trim()
    .toLowerCase();

  const filtered = allUsers.filter((user) => {
    const roleMatch =
      selectedRole === "" || user.role?.toLowerCase() === selectedRole;
    const skillMatch =
      skillSearch === "" ||
      (user.skills &&
        user.skills.some((s) => s.toLowerCase().includes(skillSearch)));

    return roleMatch && skillMatch;
  });

  displayMembers(filtered);
}

// 📩 Send mentorship request
function sendMentorshipRequest(targetId) {
  fetch(`${API}/${targetId}`)
    .then((res) => res.json())
    .then((targetUser) => {
      if (!targetUser.requests.includes(currentUser.id)) {
        targetUser.requests.push(currentUser.id);

        return fetch(`${API}/${targetId}`, {
          method: "PUT",
          body: JSON.stringify({ requests: targetUser.requests }),
          headers: { "Content-Type": "application/json" },
        });
      } else {
        throw new Error("Already sent.");
      }
    })
    .then((res) => res.json())
    .then(() => {
      alert("Request sent!");
      fetchMembers();
    })
    .catch((err) => {
      console.error("Error sending request:", err);
      alert(err.message);
    });
}

// 📩 Unmatch connection
function unmatchConnection(targetId) {
  if (!confirm("Are you sure you want to unmatch?")) {
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
      alert("Unmatched!");
      fetchMembers();
    })
    .catch((err) => {
      console.error("Error unmatching:", err);
      alert("Error occurred. Please try again.");
    });
}
