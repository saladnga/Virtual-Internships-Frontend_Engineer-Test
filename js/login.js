import { API } from "../config.js";

// Login class handles user login, field validation, and submission
class Login {
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

  // Attach form submit handler
  handleSubmit() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const allValid = this.fields.every((field) =>
        this.validateField(this.inputs[field])
      );
      if (!allValid) return;

      const data = {
        email: this.inputs["email"].value.trim(),
        password: this.inputs["password"].value.trim(),
      };

      // Authenticate user and redirect
      fetch(API)
        .then((res) => res.json())
        .then((users) => {
          const user = users.find(
            (u) => u.email === data.email && u.password === data.password
          );

          if (user) {
            // Save login state and redirect
            localStorage.setItem("auth", 1);
            localStorage.setItem("user", JSON.stringify(user));
            window.location.href = "html/discovery.html";
          } else {
            // Display error if fails
            const generalError = document.getElementById("general-error");
            if (generalError)
              generalError.textContent = "Invalid email or password";
          }
        })
        .catch((err) => {
          alert("Login error: " + err);
        });
    });
  }

  // Attach live validation to fields
  attachLiveValidation() {
    this.fields.forEach((fieldName) => {
      const input = this.inputs[fieldName];
      if (!input) return;

      input.addEventListener("input", () => {
        this.validateField(input);
      });
    });
  }

  // Validate individual field
  validateField(field) {
    const fieldName =
      field.getAttribute("placeholder") || field.name || "Field";
    const value = field.value.trim();

    if (!value) {
      this.updateStatus(field, `${fieldName} cannot be empty`, "error");
      return false;
    }

    // Regex validation for email
    if (field.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.updateStatus(
          field,
          `${fieldName} is not a valid email format`,
          "error"
        );
        return false;
      }
      // Check if email is already registered and length is more than 8
    } else if (field.type === "password" && value.length < 8) {
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

  // Update field status
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
const form = document.querySelector(".login-form");
if (form) {
  const fields = ["email", "password"];
  new Login(form, fields);
}
