# ChatMate — Real-Time Chat Application

ChatMate is a real-time messaging application built using Node.js, Express.js, MongoDB, and Socket.IO. It is designed to provide a simple platform for users to communicate through instant messaging, with authentication and support for team-based conversations.

The project focuses on learning and implementing real-time communication, backend development, database integration, authentication, and scalable Node.js application architecture.

## Features

- **Real-Time Messaging:** Send and receive messages instantly using Socket.IO.
- **User Authentication:** JWT-based authentication with cookie handling.
- **Private Conversations:** Support for one-to-one messaging.
- **Team Communication:** Structure for team-based conversations.
- **Database Integration:** Store and retrieve application data using MongoDB Atlas and Mongoose.
- **Socket Authentication:** Authenticate socket connections using middleware.
- **Server-Side Rendering:** Render application pages using EJS templates.
- **Cloud Media Integration:** Cloudinary integration for supported media uploads.
- **Scalability Exploration:** Experiment with Node.js clustering and worker processes.

## Tech Stack

### Backend
- Node.js
- Express.js
- Socket.IO
- Mongoose
- JSON Web Tokens (JWT)

### Frontend
- EJS
- HTML5
- CSS3
- Bootstrap

### Database and Storage
- MongoDB Atlas
- Cloudinary

### Development Tools
- npm
- Git and GitHub
- Nodemon

## Architecture Overview

```text
                 Client Browser
                       |
                       v
                 Express Server
                       |
              +--------+--------+
              |                 |
              v                 v
          EJS Views        REST Endpoints
              |                 |
              +--------+--------+
                       |
                       v
                 Socket.IO Server
                       |
                 Socket Events
                       |
                       v
                 MongoDB Atlas
                       |
                       v
                Persistent Data
```

The application combines HTTP requests handled by Express with persistent, bidirectional connections managed by Socket.IO.

- **Express.js** handles routes, middleware, authentication, and HTTP requests.
- **Socket.IO** handles real-time events and message delivery.
- **MongoDB Atlas** stores application data.
- **Mongoose** provides schema-based modeling and database operations.
- **EJS** renders dynamic HTML pages on the server.
- **JWT** supports authentication and identity verification.

## How Real-Time Messaging Works

1. A user opens the application and authenticates.
2. The client establishes a Socket.IO connection.
3. Socket authentication middleware validates the user's credentials.
4. The client emits a messaging event.
5. The server processes the event and handles the message according to the application's logic.
6. The message is persisted in MongoDB when the relevant database operation is implemented.
7. Socket.IO delivers the message to the appropriate connected recipient or room.
8. The recipient's interface updates without requiring a page reload.

Actual delivery and persistence behavior depends on the implemented socket handlers and database logic.

## Authentication

ChatMate uses JWT-based authentication to manage user identity.

Authentication-related components include:

- JWT creation and verification.
- Cookie-based token handling.
- Express middleware for protected routes.
- Socket.IO middleware for authenticating real-time connections.

Authentication tokens and secrets should be stored securely. Do not commit private keys, database credentials, or production environment variables to GitHub.

## Database

The application uses MongoDB Atlas as its cloud database, with Mongoose for interacting with collections through schemas and models.

Potential data entities include:

- **User:** Account and user information.
- **Chat:** Conversation and participant information.
- **Message:** Message content, sender, and conversation references.
- **Team:** Team details and membership information.

The precise schema and relationships depend on the models implemented in the repository.

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- A MongoDB Atlas account
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

Replace the placeholders with your actual GitHub repository URL and project directory.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root and configure the variables required by your application.

Example:

```env
PORT=9000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
```

Add any additional variables required by your Cloudinary configuration or other integrations.

**Important:** The variable names above are examples. Match them to the names used in your actual source code.

Ensure `.env` is included in `.gitignore` before pushing your project.

### 4. Start the Application

If your `package.json` contains a start script:

```bash
npm start
```

For development, if Nodemon is configured:

```bash
npm run dev
```

Alternatively, run the entry file directly:

```bash
node index.js
```

Use the actual entry point and scripts defined in your project.

### 5. Open the Application

If the server is configured to listen on port `9000`, open:

```text
http://localhost:9000
```

## Node.js Clustering and Scalability

The project also explores Node.js clustering to understand how a server can use multiple worker processes.

Node.js's `cluster` module allows a primary process to create worker processes that can handle incoming connections.

Topics explored include:

- Primary and worker process roles.
- Creating workers using `cluster.fork()`.
- Using `os.cpus()` to inspect available CPU cores.
- Managing server initialization across worker processes.
- Understanding Socket.IO behavior across multiple processes.
- Exploring adapters for cross-worker message broadcasting.

**Note:** Multi-process Socket.IO deployments may require a compatible adapter, and HTTP long-polling deployments may require sticky sessions. Clustering alone does not automatically share application state or socket rooms between workers.

## Challenges and Learning Outcomes

This project provides hands-on experience with:

- Building backend applications using Node.js and Express.
- Implementing real-time communication with Socket.IO.
- Understanding HTTP requests versus WebSocket-based communication.
- Managing authentication across HTTP and socket connections.
- Modeling data with MongoDB and Mongoose.
- Rendering dynamic pages using EJS.
- Integrating external services such as Cloudinary.
- Exploring worker processes and scalable server architecture.
- Using Git branches to organize development.

## Future Improvements

- Add message read receipts and delivery indicators.
- Implement typing indicators and online/offline presence.
- Improve group and team chat management.
- Add message pagination and search.
- Support secure media sharing.
- Introduce notification support.
- Add automated tests for routes and socket events.
- Implement and test a production-ready multi-worker Socket.IO architecture.
- Add deployment configuration and production logging.

## Conclusion

ChatMate is a full-stack learning project focused on real-time messaging and backend engineering. It combines Express.js, Socket.IO, MongoDB Atlas, JWT authentication, and EJS to explore how modern messaging applications handle user connections, data persistence, and communication.

It also serves as a foundation for experimenting with Node.js clustering and understanding the challenges involved in scaling real-time applications.

---

**Built with Node.js, Express.js, Socket.IO, MongoDB, and a passion for learning backend development.**
