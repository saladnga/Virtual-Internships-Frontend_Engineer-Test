// Define the Login class
class Login {
  constructor(form, fields) {
    // Save the form element and fields
    this.form = form;
    this.fields = fields;
    this.validateonSubmit(); // Call the validateonSubmit method to set up validation when the form is submitted
    this.validateOnInput();
  }

  // Method to validate the form on submission
  validateonSubmit() {
    let self = this;

    // Listen for the form submit event
    this.form.addEventListener("submit", (e) => {
      e.preventDefault(); // Stop the form from submitting immediately

      let error = 0; // Initialize error count

      // Loop through each field and validate it
      self.fields.forEach((field) => {
        const input = document.querySelector(`#${field}`);
        if (self.validateFields(input) == false) {
          error++;
        }
      });

      // If there are no errors, proceed with the login process
      if (error == 0) {
        var data = {
          email: document.querySelector("#email").value, // change to email
          password: document.querySelector("#password").value,
        };

        // Fetch the user data from the mock API
        fetch("https://680e2ef6c47cb8074d92559d.mockapi.io/mentor/api/users")
          .then((response) => response.json())
          .then((users) => {
            // Check if the user exists in the fetched data
            const user = users.find(
              (u) => u.email === data.email && u.password === data.password
            );

            if (user) {
              // If user exists, store the user data in localStorage
              localStorage.setItem("auth", 1);
              localStorage.setItem("user", JSON.stringify(user));

              // Redirect to the profile page
              window.location.href = "html/discovery.html";
            } else {
              const generalError = document.getElementById("general-error");
              generalError.innerText = "Invalid email or password";
            }
          })
          .catch((error) => {
            alert("There was an error logging in: " + error);
          });
      }
    });
  }

  validateOnInput() {
    let self = this;

    this.fields.forEach((fieldName) => {
      const input = document.querySelector(`#${fieldName}`);

      if (input) {
        // Listen to "input" event (whenever user types)
        input.addEventListener("input", () => {
          self.validateFields(input); // Validate this field live
        });
      }
    });
  }

  // Method to validate individual fields
  validateFields(field) {
    const fieldName =
      field.getAttribute("placeholder") || field.name || "Field";

    if (field.value.trim() == "") {
      this.setStatus(field, `${fieldName} cannot be empty`, "error");
      return false;
    } else {
      if (field.type == "email") {
        if (!field.value.includes("@") || !field.value.includes(".")) {
          this.setStatus(
            field,
            `${fieldName} is not a valid email format`,
            "error"
          );
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

  // Method to set the status of a field (success or error)
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
}

// Check if the form exists in the DOM before initializing the Login class
const form = document.querySelector(".login-form");
if (form) {
  const fields = ["email", "password"];
  const validation = new Login(form, fields);
}
