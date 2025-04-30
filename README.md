# Virtual-Internships-Frontend_Engineer-Test
Take-home Assignment: Frontend Engineer Intern - Documentation File by Vu Hoang
I. Project Overview:
- The Mentorship Matching Platform is a web-based application built for the purpose of connecting mentors and mentees. It allows users to register, set up profiles, search for matches based on roles, skills, and interests, and manage mentorship connections. This project was developed as part of a frontend internship take-home assignment.
- Frontend Technologies used:
  HTML
  CSS3
  Vanilla JavaScript (ES6+)
  Mock API (MockAPI.io)
- Pages Included
  + Registration/Login Page
  + Secure form validation and error messaging.
  + Mock authentication based on API response.
- Profile Page
  + View and edit personal profile details.
  + Add/remove skills and interests.
  + Update bio and avatar.
  + Delete profile functionality.
- User Discovery Page
  + Filter users by role, skills, and interests.
  + View profile cards and full user profiles.
  + Send, undo, and accept/decline mentorship requests.
- Connections Page
+ Accept or Deny Invitation to Connect
+ Manage accepted connections.
+ Unmatch existing connections.
II. Development Approach:
- Component Isolation: Functional classes were used to encapsulate each page's logic (e.g., Login, Profile, Discovery).
- Mock API Integration: https://mockapi.io was used to simulate backend behavior, enabling full user CRUD operations and connection/request logic.
- Responsive Design: CSS Grid and Flexbox ensured mobile responsiveness without external frameworks.
- Routing Simulation: Navigation is handled using window location changes between static HTML pages.
III. Key Features:
- Client-side form validation
- CRUD operations with mock API
- Pagination and filtering search
- Responsive design
- Seamless navigation and state syncing
IV. Challenges:
- Time Constraint: This assignment coincided with my exam week, making time management difficult. Despite this, I completed the assignment on time with working UI and client-side validation. With more time, I would have integrated backend technologies such as Django and used Cloudinary for image uploads.
- Vanilla JavaScript Complexity: Handling dynamic user inputs (e.g., delete and update actions) without libraries was challenging and required careful planning and debugging.
- Deployment Issues with Vercel: Environment variable usage in vanilla JS projects is limited on Vercel, which added complexity when managing API configurations.
V. Deployment:
- Platform: Vercel
- API Management: Environment variable API used in config.js
- Live URL: https://virtual-internships-frontend-engineer-test.vercel.app/
VI. Additional Notes:
- All user inputs are validated to prevent blank fields and invalid formats.
- Duplicate email and request handling is implemented to prevent spamming users.
- Edge cases like profile deletion and invalid session redirects are managed properly.

