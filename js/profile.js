// Getting the user data from local storage
const localUser = JSON.parse(localStorage.getItem("user"));

if (!localUser) {
  window.location.href = "../index.html";
}

import { API } from "../config.js";

// Profile class to manage user profile
class Profile {
  constructor(user) {
    this.user = user;
    this.skillsArray = user.skills || [];
    this.interestsArray = user.interests || [];

    this.cacheDOM();
    this.attachEvents();
    this.renderProfile();
    this.prefillForm();
  }

  // Cache DOM elements
  cacheDOM() {
    this.errorMessage = document.getElementById("general-error");
    this.profileInfo = document.getElementById("profile-info");
    this.editForm = document.getElementById("edit-profile-form");
    this.skillInput = document.getElementById("skill-input");
    this.skillsContainer = document.getElementById("skills-container");
    this.interestInput = document.getElementById("interest-input");
    this.interestsContainer = document.getElementById("interests-container");
    this.deleteButton = document.getElementById("delete-profile-button");
  }

  // Attach event listeners
  attachEvents() {
    document.getElementById("burger-menu").addEventListener("click", () => {
      document.querySelector(".navigation").classList.toggle("active");
    });

    document
      .getElementById("discovery-button")
      .addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "../html/discovery.html";
      });

    document.getElementById("profile-button").addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "../html/profile.html";
    });

    document
      .getElementById("connections-button")
      .addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "../html/connections.html";
      });

    document.getElementById("logout-button").addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      window.location.href = "../index.html";
    });

    // Add event listeners for skill and interest inputs
    document
      .getElementById("add-skill-button")
      .addEventListener("click", () => {
        const skill = this.skillInput.value.trim();
        if (skill && !this.skillsArray.includes(skill)) {
          this.skillsArray.push(skill);
          this.skillInput.value = "";
          this.renderSkills();
        }
      });

    document
      .getElementById("add-interest-button")
      .addEventListener("click", () => {
        const interest = this.interestInput.value.trim();
        if (interest && !this.interestsArray.includes(interest)) {
          this.interestsArray.push(interest);
          this.interestInput.value = "";
          this.renderInterests();
        }
      });

    // Attach event listener for form submission
    this.editForm.addEventListener("submit", (e) => this.handleFormSubmit(e));

    this.deleteButton.addEventListener("click", () => this.deleteProfile());
  }

  // Render user profile information
  renderProfile() {
    const fullBio = this.user.bio || "Not set";
    const truncatedBio =
      fullBio.length > 100 ? fullBio.slice(0, 100) + "..." : fullBio;
    const isTruncated = fullBio.length > 100;

    this.profileInfo.innerHTML = `
      <img src="${
        this.user.avatar
      }" alt="User Avatar" width="100" height="100" style="border-radius: 20;" />
      <p><strong>Name:</strong> ${this.user.name || "Not set"}</p>
      <p><strong>Email:</strong> ${this.user.email}</p>
      <p><strong>Role:</strong> ${this.user.role || "Not set"}</p>
      <p><strong>Skills:</strong> ${
        this.user.skills?.join(", ") || "No skills listed"
      }</p>
      <p><strong>Interests:</strong> ${
        this.user.interests?.join(", ") || "No interests listed"
      }</p>
      <p><strong>Short Bio:</strong><br>
        <span id="bio-text">${truncatedBio}</span>
        ${
          isTruncated
            ? `<span id="toggle-bio" class="readmore-text"> Read More</span>`
            : ""
        }
      </p>
    `;

    // Add event listener for the "Read More" toggle
    if (isTruncated) {
      const toggle = document.getElementById("toggle-bio");
      const textEl = document.getElementById("bio-text");
      let expanded = false;

      toggle.addEventListener("click", () => {
        expanded = !expanded;
        textEl.textContent = expanded ? fullBio : truncatedBio;
        toggle.textContent = expanded ? " Read Less" : " Read More";
      });
    }
  }

  // Prefill the form with user data
  prefillForm() {
    document.getElementById("edit-name").value = this.user.name || "";
    document.getElementById("edit-role").value = this.user.role || "";
    document.getElementById("edit-bio").value = this.user.bio || "";
    document.getElementById("edit-avatar").value = this.user.avatar || "";

    this.renderSkills();
    this.renderInterests();
  }

  // Render skills and interests
  renderSkills() {
    this.skillsContainer.innerHTML = this.skillsArray.length
      ? this.skillsArray
          .map(
            (skill, index) => `
          <span class="skill-badge">${skill}
            <button type="button" onclick="profileInstance.removeSkill(${index})" style="border:none;background:none;color:red;cursor:pointer;">❌</button>
          </span>`
          )
          .join("")
      : "<p style='color:#0a2d33;'>No skills listed</p>";
  }

  // Render interests
  renderInterests() {
    this.interestsContainer.innerHTML = this.interestsArray.length
      ? this.interestsArray
          .map(
            (interest, index) => `
          <span class="skill-badge">${interest}
            <button type="button" onclick="profileInstance.removeInterest(${index})" style="border:none;background:none;color:red;cursor:pointer;">❌</button>
          </span>`
          )
          .join("")
      : "<p style='color:#0a2d33;'>No interests listed</p>";
  }

  // Remove skill or interest
  removeSkill(index) {
    this.skillsArray.splice(index, 1);
    this.renderSkills();
  }

  removeInterest(index) {
    this.interestsArray.splice(index, 1);
    this.renderInterests();
  }

  // Handle form submission
  handleFormSubmit(e) {
    e.preventDefault();
    this.errorMessage.textContent = "";
    this.errorMessage.style.color = "red";

    const name = document.getElementById("edit-name").value.trim();
    const role = document.getElementById("edit-role").value.trim();
    const bio = document.getElementById("edit-bio").value.trim();
    const avatar = document.getElementById("edit-avatar").value.trim();
    const currentPassword = document
      .getElementById("current-password")
      .value.trim();
    const newPassword = document.getElementById("new-password").value.trim();
    const repeatPassword = document
      .getElementById("repeat-password")
      .value.trim();

    // Password validation
    if (currentPassword || newPassword || repeatPassword) {
      if (!currentPassword)
        return (this.errorMessage.textContent =
          "Please enter your current password.");
      if (!newPassword)
        return (this.errorMessage.textContent = "Please enter a new password.");
      if (!repeatPassword)
        return (this.errorMessage.textContent =
          "Please repeat your new password.");
      if (currentPassword !== this.user.password)
        return (this.errorMessage.textContent =
          "Current password is incorrect.");
      if (newPassword.length < 8)
        return (this.errorMessage.textContent =
          "New password must be at least 8 characters.");
      if (newPassword !== repeatPassword)
        return (this.errorMessage.textContent = "New passwords do not match.");
    }

    // Construct updated user data
    const updatedUser = {
      name,
      role,
      bio,
      avatar,
      skills: this.skillsArray,
      interests: this.interestsArray,
    };
    if (newPassword) updatedUser.password = newPassword;

    // Update the Mock API with the specified ID
    fetch(`${API}/${this.user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("user", JSON.stringify(data));
        this.user = data;
        this.renderProfile();
        this.prefillForm();
        this.errorMessage.style.color = "green";
        this.errorMessage.textContent = "Profile updated successfully!";
      })
      .catch((err) => {
        console.error("Update error:", err);
        this.errorMessage.style.color = "red";
        this.errorMessage.textContent = "Failed to update profile. Try again.";
      });
  }

  // Handle user deletion
  deleteProfile() {
    const confirmDelete = confirm(
      "Are you sure you want to delete your profile? This cannot be undone."
    );
    if (!confirmDelete) return;

    fetch(`${API}/${this.user.id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed.");
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
        window.location.href = "../index.html";
      })
      .catch((err) => {
        console.error("Delete error:", err);
        this.errorMessage.style.color = "red";
        this.errorMessage.textContent =
          "Failed to delete profile. Please try again.";
      });
  }
}

// Instantiate globally for use in inline event handlers
let profileInstance;
document.addEventListener("DOMContentLoaded", () => {
  window.profileInstance = new Profile(localUser);
});
