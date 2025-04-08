# Assignment #2

## **Objective**

Develop collaborative and interactive web applications that incorporate the following main concepts:

1. Full-Stack Web Development:
   - Dynamic and responsive frontend (HTML, CSS, JavaScript, Svelte/Vue.js).
   - Backend with Node.js (or Deno) and RESTful APIs.
2. Real-Time Collaboration:
   - Synchronization of data between users using WebSockets.
3. Data Management and Security:
   - Persistent data storage with MongoDB.
   - Secure authentication, for example using JWT.
4. Solving Real Problems:
   - Practical applications focused on useful features and user interaction.

This exercise emphasizes implementing functional systems, collaboration, and best practices in web development.

------

## **Topics**

### **Real-Time Voting System**

#### **Description:**

An application where authenticated users can create and participate in polls, with real-time updated results.

#### **Features**

- **Authentication:** Registration and login using JWT. Basic permission system (admin for managing polls, users for voting).
- **Poll Management:** Create polls with questions and response options; list available polls (active and closed).
- **Vote Submission and Visualization:** Submit votes anonymously; view results in real-time (bar or pie charts).
- **Real-Time Updates:** Use WebSockets to reflect new votes on the chart for all connected users.

#### **Technologies**

- **Frontend:** HTML, CSS, JavaScript, Svelte or Vue.js (charts with Chart.js, ApexCharts, or D3.js).
- **Backend:** Node.js (+ Express) or Deno.
- **Database:** MongoDB.
- **Authentication:** JWT.
- **Real-Time Communication:** WebSockets.
- **REST API:** Endpoints for authentication, poll creation, listing, and vote submission.

------

### **Real-Time Chat System**

#### **Description:**

A chat application where authenticated users can send messages in public or private rooms, with real-time updates.

#### **Features**

- **Authentication and Personalization:** Registration and login using JWT; optional personalization (avatar, colors).
- **Room Management:** Create and delete public and private rooms; list available rooms.
- **Real-Time Messaging:** Send messages to a specific room; instant updates for all connected users.
- **Data Persistence:** Message history for each room stored in the database.
- **Notifications:** Alerts when new users join or leave a room.

#### **Technologies**

- **Frontend:** HTML, CSS, JavaScript, Svelte, or Vue.js.
- **Backend:** Node.js (Express) or Deno.
- **Database:** MongoDB.
- **Authentication:** JWT.
- **Real-Time Communication:** WebSockets.
- **REST API:** Endpoints for authentication, room management, and message history retrieval.

------

### **Online Auction Platform**

#### **Description:**

A platform where authenticated users can participate in real-time auctions, submitting bids that are instantly reflected.

#### **Features**

- **Authentication:** Registration and login with JWT; profile management.
- **Auction Management:** Create auctions with a name, description, starting price, and time limit; list active and closed auctions.
- **Bid Submission:** Validate bids (must be higher than the current bid); real-time updates of the highest bid; notifications for the winner and auction closure.
- **History:** Bid and auction history visible on the user's profile.

#### **Technologies**

- **Frontend:** HTML, CSS, JavaScript, Svelte, or Vue.js.
- **Backend:** Node.js (Express) or Deno.
- **Database:** MongoDB.
- **Authentication:** JWT.
- **Real-Time Communication:** WebSockets.
- **REST API:** Endpoints for authentication, auction creation, bid submission, and history retrieval.

------

### **Collaborative Word Cloud**

#### **Description:**

An application where authenticated users can add words to form a collaborative word cloud, highlighting the most frequent words in real-time.

#### **Features**

- **Authentication:** Registration and login with JWT; read-only access for unauthenticated users.
- **Word Management:** Word submission by authenticated users; automatic frequency counting; optional offensive word filtering.
- **Real-Time Updates:** Dynamically update the word cloud for all connected users.
- **Personalization:** Choose colors or styles for the cloud.

#### **Technologies**

- **Frontend:** HTML, CSS, JavaScript, Svelte, or Vue.js.
- **Backend:** Node.js (Express) or Deno.
- **Database:** MongoDB.
- **Authentication:** JWT.
- **Real-Time Communication:** WebSockets.
- **REST API:** Endpoints for authentication, word submission, and cloud retrieval.

------

### **Image Annotation Tool**

#### **Description:**

An application where authenticated users can upload images and collaboratively add annotations in real time.

#### **Features**

- **Authentication:** Registration and login with JWT; permissions for admins and collaborators.
- **Image Management:** Upload images for review; organize by projects.
- **Annotation Tool:** Add points, text, or shapes; edit/remove existing annotations.
- **Real-Time Collaboration:** Instant updates of annotations for all connected users; show who is editing an annotation.
- **Export (optional):** Export annotated images with visible or hidden layers.

#### **Technologies**

- **Frontend:** HTML, CSS, JavaScript, Svelte, or Vue.js.
- **Backend:** Node.js (Express) or Deno.
- **Database:** MongoDB.
- **Authentication:** JWT.
- **Real-Time Communication:** WebSockets.
- **REST API:** Endpoints for authentication, image management, and annotation submission.

------

## **Global Requirements**

### **Frontend**

- **Frontend: HTML/CSS:** Use frameworks or plain HTML+CSS+JavaScript.

### **Backend**

- The backend must be developed using **Node** and **Express**.
- Do not store data on the filesystem; persistent data must be stored in a **MongoDB** database.

### REST APIs

, HTTP methods should follow their definitions:

- Use **GET** to retrieve data. Do not store data using a **GET** request.
- Use **DELETE** to remove data.
- Avoid using query parameters in the URL with **POST** requests.

------

## **Rules & Assessment**

### **Groups**

- Maximum 3 members per group.

### **Submission Deadline**

- December 21, 2024.

### **GitHub Classroom Repository**

1. The assignment will be launched as a group assignment. When a student accepts the group assignment, they can create a new team or join an existing team.
2. For each group assignment, **GitHub Classroom** automatically creates a single shared repository for the team.

#### **README.md**

- Include installation and usage instructions in the repository README.md file, specifying:
  - Group members.
  - GitHub repository URL and publication address.
  - A detailed project description (mini-report) with objectives, libraries/frameworks used, and any other relevant implementation details.
  - A paragraph highlighting each member’s contributions.

#### **Build / Install / Configure**

- Provide a build and installation script wherever possible.
- Include detailed configuration instructions.

### **Publication**

- The app must be deployed and operational on **render.com**.

### **Moodle Submission**

- Each group must submit:
  - Group identification (alphabetical concatenation of members’ first names followed by the last digits of their student IDs).
  - GitHub link.
  - Render.com link.

## **Assessment**

- Fully functional projects will be highly valued.
- Isolated non-functional features will be less penalized compared to general non-functionality.
