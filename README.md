# 🧰 IT Help Desk Management System

The IT Help Desk Management System is a scalable backend application designed to streamline IT support workflows within an organization.
Employees can raise support tickets, track their status, and communicate with IT support staff, while administrators and IT teams can manage, assign, and resolve tickets efficiently.

This system promotes transparency, accountability, and faster issue resolution through a structured ticket lifecycle and role-based access control.

# 🚀 Features
👨‍💼 Employee
1. Raise new IT support tickets with title, description, and priority.
2. Track real-time ticket status (Open, In Progress, Resolved, Closed).
3. View history of submitted tickets.

# 🧑‍💻 IT Support
1. View assigned tickets.
2. Update ticket status and resolution comments.
3. Communicate ticket progress to employees.

# 🛡️ Admin
1. Manage all tickets and users.
2. Assign tickets to IT support staff.
3. Monitor system activity and support team performance.

# 🧱 System Architecture
The project follows a modular and scalable architecture, using Node.js, Express.js, and MongoDB.

Each module (user, ticket, auth, etc.) is isolated for better maintainability and testing.

# ⚙️ Tech Stack
| Layer                | Technology                               |
| -------------------- | ---------------------------------------- |
| **Runtime**          | Node.js                                  |
| **Framework**        | Express.js                               |
| **Database**         | MongoDB (Mongoose ODM)                   |
| **Authentication**   | JWT (Access + Refresh tokens in cookies) |
| **Error Handling**   | Centralized middleware                   |
| **Environment**      | dotenv                                   |
| **Containerization** | Docker (optional)                        |

# ⚙️ Environment Variables
1. PORT=5000
2. MONGODB_URI=mongodb://localhost:27017/helpdesk
3. SECRET=your_jwt_secret
4. EXPIRES_IN=1d
5. REFRESH_SECRET=your_refresh_secret
6. REFRESH_EXPIRES_IN=7d
   
# 🧠 Installation & Setup
1. Clone the Repository:- 
    https://github.com/GovindaEkabote/CRM-Project.git
2. Install Dependencies
    npm install
3. Configure Environment
    Create a .env file with your environment variables (see above). 
4. Run the Application
    node index.js or nodemon index.js
5. Access the App
    http://localhost:5000

# 🧪 Testing
Use Postman or Thunder Client to test the APIs.
You can import the API collection provided in the /docs folder (if created).

# 🧑‍💻 Author
Govinda Ekbote
Backend Developer | Node.js | Express.js | MongoDB
1. LinkedIn - https://www.linkedin.com/in/govinda-07/
2. GitHub - https://github.com/GovindaEkabote