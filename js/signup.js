import { API } from "../config.js";

class Signup {
  constructor(form, fields) {
    this.form = form;
    this.fields = fields;

    // Preload inputs
    this.inputs = {};
    fields.forEach((field) => {
      this.inputs[field] = document.querySelector(`#${field}`);
    });

    this.handleSubmit();
    this.attachLiveValidation();
  }

  // Handle form submission logic
  handleSubmit() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Validate all fields
      const allValid = this.fields.every((field) =>
        this.validateField(this.inputs[field])
      );
      if (!allValid) return;

      // Extract values
      const yourname = this.inputs["name"].value.trim();
      const email = this.inputs["email"].value.trim();
      const password = this.inputs["password"].value.trim();
      const generalError = document.getElementById("general-error");
      if (generalError) generalError.textContent = "";

      // Check if the email is already registered
      fetch(API)
        .then((res) => res.json())
        .then((users) => {
          const existingUser = users.find((user) => user.email === email);

          if (existingUser) {
            if (generalError)
              generalError.textContent =
                "This email is already registered. Please use another one.";
            throw new Error("Duplicate email.");
          }

          // Prepare the new user object
          const newUser = {
            name: yourname,
            email: email,
            password: password,
            avatar:
              "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
            role: "",
            bio: "",
            skills: [],
            requests: [],
          };

          // Send the new user data to the API
          return fetch(API, {
            method: "POST",
            body: JSON.stringify(newUser),
            headers: {
              "Content-Type": "application/json; charset=UTF-8",
            },
          });
        })

        // Handle the response
        .then((res) => {
          if (!res || !res.ok) {
            throw new Error("Failed to create user.");
          }
          return res.json();
        })

        // Redirect to the login page
        .then((data) => {
          if (data) {
            window.location.href = "../index.html";
          }
        })

        // Handle errors
        .catch((err) => {
          console.error("Error during signup:", err);

          if (generalError && err.message !== "Duplicate email.") {
            generalError.textContent =
              "Something went wrong. Please try again later.";
          }
        });
    });
  }

  // Attach live validation to each field
  attachLiveValidation() {
    this.fields.forEach((fieldName) => {
      const input = this.inputs[fieldName];
      if (!input) return;

      input.addEventListener("input", () => {
        this.validateField(input);
      });
    });
  }

  // Validate each field
  validateField(field) {
    const fieldName =
      field.getAttribute("placeholder") || field.name || "Field";
    const value = field.value.trim();

    if (!value) {
      this.updateStatus(field, `${fieldName} cannot be empty`, "error");
      return false;
    }

    // Check if the email is valid by regex
    if (field.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.updateStatus(
          field,
          `${fieldName} is not valid email format`,
          "error"
        );
        return false;
      }
    }

    // Check if the password and repeat password match
    if (field.id === "repeat-password-input") {
      const originalPassword = this.inputs["password"].value.trim();
      if (value !== originalPassword) {
        this.updateStatus(field, "Passwords do not match", "error");
        return false;
      }
    }

    // Check if the password is at least 8 characters long
    if (field.type === "password" && value.length < 8) {
      this.updateStatus(
        field,
        `${fieldName} must be at least 8 characters`,
        "error"
      );
      return false;
    }

    this.updateStatus(field, null, "success");
    return true;
  }

  // Update the status of the field
  updateStatus(field, message, status) {
    const wrapper = field.closest(".input-wrapper");
    const errorMessage = wrapper?.querySelector(".error-message");

    if (status === "success") {
      if (errorMessage) errorMessage.textContent = "";
      field.classList.remove("input-error");
    }

    if (status === "error") {
      if (errorMessage) errorMessage.textContent = message;
      field.classList.add("input-error");
    }
  }
}

// Only initialize when form is present
const form = document.querySelector(".signup-form");
if (form) {
  const fields = ["name", "email", "password", "repeat-password-input"];
  new Signup(form, fields);
}
