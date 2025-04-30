import { API } from "../config.js";

class Discovery {
  constructor() {
    // Initialize variables
    this.allUsers = [];
    this.currentUser = JSON.parse(localStorage.getItem("user"));
    this.currentPage = 1;
    this.itemsPerPage = 6;

    // Cannot access if not logged in
    if (!this.currentUser) {
      window.location.href = "../index.html";
      return;
    }

    // Personalize username and navbar events
    document.getElementById("user-name").textContent =
      this.currentUser.name || "User";
    this.setupNavbar();
    this.attachEvents();
    this.fetchMembers();
  }

  setupNavbar() {
    const navLinks = [
      { id: "discovery-button", path: "discovery.html" },
      { id: "profile-button", path: "profile.html" },
      { id: "connections-button", path: "connections.html" },
    ];

    navLinks.forEach(({ id, path }) => {
      document.getElementById(id)?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = `../html/${path}`;
      });
    });

    document.getElementById("logout-button")?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("user");
      window.location.href = "../index.html";
    });
  }

  attachEvents() {
    // Event listeners for filters and pagination
    document.getElementById("search-button").addEventListener("click", () => {
      this.currentPage = 1;
      this.filterMembers();
    });

    // Pagination logic
    document.getElementById("prev-page").addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.filterMembers();
      }
    });

    document.getElementById("next-page").addEventListener("click", () => {
      if (this.currentPage * this.itemsPerPage < this.allUsers.length) {
        this.currentPage++;
        this.filterMembers();
      }
    });

    // Trigger filter on Enter key
    ["skill-filter", "interest-filter"].forEach((id) => {
      document.getElementById(id).addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          this.currentPage = 1;
          this.filterMembers();
        }
      });
    });
  }

  fetchMembers() {
    // Load all users from API except current user
    fetch(API)
      .then((res) => res.json())
      .then((users) => {
        this.allUsers = users.filter((u) => u.id !== this.currentUser.id);
        this.filterMembers();
      })
      .catch((err) => console.error("Fetch error:", err));
  }

  filterMembers() {
    // Get filter values
    const roleFilter = document
      .getElementById("role-filter")
      .value.trim()
      .toLowerCase();
    const skillFilter = document
      .getElementById("skill-filter")
      .value.trim()
      .toLowerCase();
    const interestFilter = document
      .getElementById("interest-filter")
      .value.trim()
      .toLowerCase();

    // Filter users based on selected criteria
    const filtered = this.allUsers.filter((user) => {
      const roleMatch = !roleFilter || user.role?.toLowerCase() === roleFilter;
      const skillMatch =
        !skillFilter ||
        user.skills?.some((s) => s.toLowerCase().includes(skillFilter));
      const interestMatch =
        !interestFilter ||
        user.interests?.some((i) => i.toLowerCase().includes(interestFilter));
      return roleMatch && skillMatch && interestMatch;
    });

    this.displayMembers(filtered);
  }

  displayMembers(users) {
    const membersList = document.getElementById("members-list");
    membersList.innerHTML = "";

    if (users.length === 0) {
      membersList.innerHTML = "<p>No members found.</p>";
      return;
    }

    // Paginate
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const paginatedUsers = users.slice(start, start + this.itemsPerPage);

    paginatedUsers.forEach((user) => {
      const card = document.createElement("div");
      card.className = "member-card";

      // Decide action button based on connection status
      const alreadyConnected = this.currentUser.connections?.includes(user.id);
      const alreadyRequested = user.requests?.includes(this.currentUser.id);

      let actionButton = "";
      if (alreadyConnected) {
        actionButton = `<button class="unmatch" onclick="discovery.unmatchConnection('${user.id}')">Unmatch</button>`;
      } else if (alreadyRequested) {
        actionButton = `<button onclick="discovery.undoMentorshipRequest('${user.id}')">Undo Request</button>`;
      } else {
        actionButton = `<button onclick="discovery.sendMentorshipRequest('${user.id}')">Send Request</button>`;
      }

      // Render user card
      card.innerHTML = `
        <img src="${user.avatar}" alt="Avatar" />
        <h3>${user.name || "No Name"}</h3>
        <p><strong>Role:</strong> ${user.role || "Unknown"}</p>
        <p><strong>Skills:</strong> ${this.truncate(
          user.skills?.join(", ") || "None"
        )}</p>
        <p><strong>Interests:</strong> ${this.truncate(
          user.interests?.join(", ") || "None"
        )}</p>
        <p><strong>Bio:</strong> ${this.truncate(
          user.bio || "No bio available",
          100
        )}</p>
        ${actionButton}
        <button onclick="window.location.href='../html/user-profile.html?id=${
          user.id
        }'">View Profile</button>
      `;

      membersList.appendChild(card);
    });

    this.updatePaginationControls(users.length);
  }

  truncate(text, length = 50) {
    return text.length > length ? text.substring(0, length) + "..." : text;
  }

  updatePaginationControls(totalItems) {
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");

    prevBtn.disabled = this.currentPage === 1;
    nextBtn.disabled = this.currentPage * this.itemsPerPage >= totalItems;

    const totalPages = Math.ceil(totalItems / this.itemsPerPage);
    let pageInfo = document.getElementById("page-info");

    // Create page info element if it doesn't exist
    if (!pageInfo) {
      pageInfo = document.createElement("div");
      pageInfo.id = "page-info";
      pageInfo.style.marginTop = "10px";
      pageInfo.style.textAlign = "center";
      prevBtn.parentNode.insertAdjacentElement("afterend", pageInfo);
    }
    pageInfo.innerHTML = `Page ${this.currentPage} of ${totalPages}`;
  }

  // Add request to target user
  sendMentorshipRequest(targetId) {
    fetch(`${API}/${targetId}`)
      .then((res) => res.json())
      .then((targetUser) => {
        targetUser.requests = Array.isArray(targetUser.requests)
          ? targetUser.requests
          : [];
        if (!targetUser.requests.includes(this.currentUser.id)) {
          targetUser.requests.push(this.currentUser.id);
          return fetch(`${API}/${targetId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requests: targetUser.requests }),
          });
        }
      })
      .then(() => this.fetchMembers())
      .catch((err) => console.error("Request error:", err));
  }

  // Remove current user from target user's requests
  undoMentorshipRequest(targetId) {
    fetch(`${API}/${targetId}`)
      .then((res) => res.json())
      .then((targetUser) => {
        targetUser.requests = targetUser.requests.filter(
          (id) => id !== this.currentUser.id
        );
        return fetch(`${API}/${targetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requests: targetUser.requests }),
        });
      })
      .then(() => this.fetchMembers())
      .catch((err) => console.error("Undo request error:", err));
  }

  // Remove current user from target user's connections
  unmatchConnection(targetId) {
    if (!confirm("Are you sure you want to unmatch?")) return;

    const updatedConnections = this.currentUser.connections.filter(
      (id) => id !== targetId
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
        return fetch(`${API}/${targetId}`);
      })
      .then((res) => res.json())
      .then((targetUser) => {
        const updatedTargetConnections =
          targetUser.connections?.filter((id) => id !== this.currentUser.id) ||
          [];

        return fetch(`${API}/${targetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connections: updatedTargetConnections }),
        });
      })
      .then(() => this.fetchMembers())
      .catch((err) => console.error("Unmatch error:", err));
  }
}

window.discovery = new Discovery();
