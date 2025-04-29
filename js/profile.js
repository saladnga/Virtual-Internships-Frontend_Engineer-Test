const localUser = JSON.parse(localStorage.getItem("user"));
if (!localUser) {
  window.location.href = "../index.html";
}

let skillsArray = [];
let interestsArray = [];

function removeSkill(index) {
  skillsArray.splice(index, 1);
  renderSkills();
}

function removeInterest(index) {
  interestsArray.splice(index, 1);
  renderInterests();
}

function renderSkills() {
  const container = document.getElementById("skills-container");
  container.innerHTML = skillsArray.length
    ? skillsArray
        .map(
          (skill, index) => `
      <span class="skill-badge">${skill}
        <button type="button" onclick="removeSkill(${index})" style="border:none;background:none;color:red;cursor:pointer;">❌</button>
      </span>`
        )
        .join("")
    : "<p style='color:#0a2d33;'>No skills listed</p>";
}

function renderInterests() {
  const container = document.getElementById("interests-container");
  container.innerHTML = interestsArray.length
    ? interestsArray
        .map(
          (interest, index) => `
      <span class="skill-badge">${interest}
        <button type="button" onclick="removeInterest(${index})" style="border:none;background:none;color:red;cursor:pointer;">❌</button>
      </span>`
        )
        .join("")
    : "<p style='color:#0a2d33;'>No interests listed</p>";
}

function displayProfile(user) {
  const profileInfo = document.getElementById("profile-info");

  const fullBio = user.bio || "Not set";
  const truncatedBio =
    fullBio.length > 100 ? fullBio.slice(0, 100) + "..." : fullBio;
  const isTruncated = fullBio.length > 100;

  profileInfo.innerHTML = `
    <img src="${
      user.avatar
    }" alt="User Avatar" width="100" height="100" style="border-radius: 20;" />
    <p><strong>Name:</strong> ${user.name || "Not set"}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Role:</strong> ${user.role || "Not set"}</p>
    <p><strong>Skills:</strong> ${
      user.skills?.join(", ") || "No skills listed"
    }</p>
    <p><strong>Interests:</strong> ${
      user.interests?.join(", ") || "No interests listed"
    }</p>
    <p><strong>Short Bio:</strong></br>
      <span id="bio-text">${truncatedBio}</span>
      ${
        isTruncated
          ? `<span id="toggle-bio" class="readmore-text"> Read More</span>`
          : ""
      }
    </p>
  `;

  if (isTruncated) {
    const toggleBio = document.getElementById("toggle-bio");
    const bioText = document.getElementById("bio-text");
    let expanded = false;

    toggleBio.addEventListener("click", () => {
      expanded = !expanded;
      bioText.textContent = expanded ? fullBio : truncatedBio;
      toggleBio.textContent = expanded ? " Read Less" : " Read More";
    });
  }
}

function prefillEditForm(user) {
  document.getElementById("edit-name").value = user.name || "";
  document.getElementById("edit-role").value = user.role || "";
  document.getElementById("edit-bio").value = user.bio || "";
  document.getElementById("edit-avatar").value = user.avatar || "";

  skillsArray = user.skills || [];
  interestsArray = user.interests || [];

  renderSkills();
  renderInterests();
}

document.addEventListener("DOMContentLoaded", () => {
  const errorMessage = document.getElementById("general-error");

  displayProfile(localUser);
  prefillEditForm(localUser);

  // 🆕 Burger Menu Toggle
  const burger = document.getElementById("burger-menu");
  const navLinks = document.querySelector(".navigation");

  burger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // 🛠 Fix: Navigation buttons logic
  const discoveryButton = document.getElementById("discovery-button");
  const profileButton = document.getElementById("profile-button");
  const connectionsButton = document.getElementById("connections-button");
  const logoutButton = document.getElementById("logout-button");

  discoveryButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "../html/discovery.html"; // ✅ correct path
  });

  profileButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "../html/profile.html"; // ✅ correct path
  });

  connectionsButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "../html/mentor-dashboard.html"; // ✅ correct path
  });

  logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    window.location.href = "../index.html"; // ✅ go to login page
  });
  displayProfile(localUser);
  prefillEditForm(localUser);

  document.getElementById("add-skill-button").addEventListener("click", () => {
    const skill = document.getElementById("skill-input").value.trim();
    if (skill && !skillsArray.includes(skill)) {
      skillsArray.push(skill);
      renderSkills();
      document.getElementById("skill-input").value = "";
    }
  });

  document
    .getElementById("add-interest-button")
    .addEventListener("click", () => {
      const interest = document.getElementById("interest-input").value.trim();
      if (interest && !interestsArray.includes(interest)) {
        interestsArray.push(interest);
        renderInterests();
        document.getElementById("interest-input").value = "";
      }
    });

  document
    .getElementById("edit-profile-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      errorMessage.textContent = "";
      errorMessage.style.color = "red"; // default red if any error

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

      // 🛡 Full Password Validation
      if (currentPassword || newPassword || repeatPassword) {
        if (!currentPassword) {
          errorMessage.textContent = "Please enter your current password.";
          return;
        }
        if (!newPassword) {
          errorMessage.textContent = "Please enter a new password.";
          return;
        }
        if (!repeatPassword) {
          errorMessage.textContent = "Please repeat your new password.";
          return;
        }
        if (currentPassword !== localUser.password) {
          errorMessage.textContent = "Current password is incorrect.";
          return;
        }
        if (newPassword.length < 8) {
          errorMessage.textContent =
            "New password must be at least 8 characters.";
          return;
        }
        if (newPassword !== repeatPassword) {
          errorMessage.textContent = "New passwords do not match.";
          return;
        }
      }

      const updatedUser = {
        name,
        role,
        bio,
        avatar,
        skills: skillsArray,
        interests: interestsArray,
      };

      if (newPassword) {
        updatedUser.password = newPassword;
      }

      fetch(
        `https://680e2ef6c47cb8074d92559d.mockapi.io/mentor/api/users/${localUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          localStorage.setItem("user", JSON.stringify(data));
          displayProfile(data);
          prefillEditForm(data);
          errorMessage.style.color = "green";
          errorMessage.textContent = "Profile updated successfully!";
        })
        .catch((err) => {
          console.error("Update error:", err);
          errorMessage.style.color = "red";
          errorMessage.textContent = "Failed to update profile. Try again.";
        });
    });
});
