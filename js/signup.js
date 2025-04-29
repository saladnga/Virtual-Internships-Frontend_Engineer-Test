class Signup {
  constructor(form, fields) {
    this.form = form;
    this.fields = fields;
    this.validateOnSubmit();
    this.validateOnInput();
  }

  validateOnSubmit() {
    let self = this;

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      let error = 0;

      self.fields.forEach((fieldName) => {
        const input = document.querySelector(`#${fieldName}`);
        if (self.validateFields(input) == false) {
          error++;
        }
      });

      if (error == 0) {
        const firstname = document
          .querySelector("#firstname-input")
          .value.trim();
        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value.trim();
        const generalError = document.getElementById("general-error");
        generalError.innerText = "";

        fetch("https://680e2ef6c47cb8074d92559d.mockapi.io/mentor/api/users")
          .then((response) => response.json())
          .then((users) => {
            const existingUser = users.find((user) => user.email === email);

            if (existingUser) {
              generalError.innerText =
                "This email is already registered. Please use another one.";
              throw new Error("Duplicate email.");
            }

            const newUser = {
              name: firstname,
              email: email,
              password: password,
              avatar:
                "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
              role: "",
              bio: "",
              skills: [],
              requests: [],
            };

            return fetch(
              "https://680e2ef6c47cb8074d92559d.mockapi.io/mentor/api/users",
              {
                method: "POST",
                body: JSON.stringify(newUser),
                headers: {
                  "Content-Type": "application/json; charset=UTF-8",
                },
              }
            );
          })
          .then((response) => {
            if (!response || !response.ok) {
              throw new Error("Failed to create user.");
            }
            return response.json();
          })
          .then((data) => {
            if (data) {
              window.location.href = "../index.html";
            }
          })
          .catch((error) => {
            console.error("Error during signup:", error);
            if (error.message !== "Duplicate email.") {
              generalError.innerText =
                "Something went wrong. Please try again later.";
            }
          });
      }
    });
  }

  validateOnInput() {
    let self = this;
    this.fields.forEach((fieldName) => {
      const input = document.querySelector(`#${fieldName}`);
      if (input) {
        input.addEventListener("input", () => {
          self.validateFields(input);
        });
      }
    });
  }

  validateFields(field) {
    const fieldName =
      field.getAttribute("placeholder") || field.name || "Field";

    if (field.value.trim() === "") {
      this.setStatus(field, `${fieldName} cannot be empty`, "error");
      return false;
    } else {
      if (field.type == "email") {
        if (!this.validateEmailFormat(field.value)) {
          this.setStatus(
            field,
            `${fieldName} is not valid email format`,
            "error"
          );
          return false;
        }
      } else if (field.id === "repeat-password-input") {
        const originalPassword = document
          .querySelector("#password")
          .value.trim();
        if (field.value !== originalPassword) {
          this.setStatus(field, "Passwords do not match", "error");
          return false;
        }
      } else if (field.type == "password") {
        if (field.value.length < 8) {
          this.setStatus(
            field,
            `${fieldName} must be at least 8 characters`,
            "error"
          );
          return false;
        }
      }

      this.setStatus(field, null, "success");
      return true;
    }
  }

  setStatus(field, message, status) {
    const wrapper = field.closest(".input-wrapper");
    const errorMessage = wrapper.querySelector(".error-message");

    if (status === "success") {
      if (errorMessage) {
        errorMessage.innerText = "";
      }
      field.classList.remove("input-error");
    }

    if (status === "error") {
      if (errorMessage) {
        errorMessage.innerText = message;
      }
      field.classList.add("input-error");
    }
  }

  validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Initialize
const form = document.querySelector(".signup-form");
if (form) {
  const fields = [
    "firstname-input",
    "email",
    "password",
    "repeat-password-input",
  ];
  const validation = new Signup(form, fields);
}
