# 🧠 CRM Workflow Developer Guide – Web Development Agency

This guide outlines the optimal CRM structure and flow for a full-service web development agency. It covers lead management, project handling, departmental task boards, communication, and recurring services.

---

## 📌 Module Overview

- **Leads Module**: Shared lead pool, no assignments, accessible by all sellers.
- **Sales Module**: Captures sold services, prices, and payment details.
- **Projects Module**: Each sold service auto-generates a project.
- **Project Assignment**: Project Management Lead assigns Project Managers.
- **Task Boards Module**: PMs break down projects into departmental cards (Design, Dev, SEO).
- **Department Boards**: Task Kanbans with comments, uploads, deadlines.
- **Communication Tools**: Integrated with Dialpad (calls) and Gmail (email).
- **Recurring Services**: For retainers like SEO, SMM, Hosting.
- **Reporting & Admin**: Centralized performance monitoring and access control.

---

## 🧩 Full Workflow (Step-by-Step)

### 1. 🚀 Lead Management

- **Source**: Manual entry, web form, Zapier import
- **Visible to**: All sellers
- **Actions by Seller**:
  - Call/Email lead (via CRM using Dialpad/Gmail)
  - Log remarks and set follow-up
  - Update status: `New`, `Contacted`, `Follow-Up`, `Interested`, `Not Interested`, `Lost`
- **If Interested**:
  - Fill **Sales Form**
  - Enter services sold, prices, payment, contract upload
  - Mark lead as `Converted`

---

### 2. 🧾 Sales → Auto Project Generation

- For every service sold (e.g., Website, Logo, SEO):
  - A new project is created automatically:
    - `Project Name = {Client} – {Service}`
    - Status = `Unassigned`
    - Linked to sale + client
- Triggers alert to **Project Management Lead**

---

### 3. 👨‍💼 Project Assignment

- **PM Lead** sees all `Unassigned` projects
- Assigns each to a **Project Manager**
- Updates project status to `In Progress`
- PM is notified with full sales + client context

---

### 4. 📋 Project Management by PM

- PM accesses **My Projects**
- Opens project → views:
  - Sale details, timeline, brand
- Creates **task boards per department**:
  - Design Board
  - Development Board
  - SEO Board (if applicable)

- Each board uses:
  - Columns: `To Do`, `In Progress`, `Review`, `Complete`
  - Cards: Task name, desc, due date, assignee, attachments, comments

---

### 5. 🧑‍🎨 Department Work Execution

- Designers/Developers/SEO team members see only assigned cards
- Team members:
  - Update task status
  - Upload work
  - Add comments
- PM reviews → sends to client for feedback
- Approved → move to next stage

---

### 6. 🔁 Upselling & Recurring Services

- Once project is delivered:
  - Upseller contacts client
  - Offers services like:
    - SEO
    - SMM
    - Maintenance
    - Hosting

- If client agrees:
  - Upseller fills new **Sales Form**
  - Process loops back (auto-project generation)

- For recurring services:
  - Linked to recurring billing
  - Monthly task generation
  - Status dashboard (Active, Paused, Cancelled)

---

---

### 8. 📊 Reporting & Admin

- **Admin Dashboard**:
  - Total leads, sales, and conversion %
  - Active projects by status/service
  - Department performance
  - Upsell conversion tracking
  - Recurring revenue chart

- **User Roles**:
  - Seller
  - Upsell PM Lead
  - Project Manager
  - Designer / Developer / SEO
  - Admin

- **Permissions**:
  - Role-based view/edit logic
  - Multi-brand support (email, phone identity)

---

## 🧱 Required Screens

1. Login / Brand Selector  
2. Lead Pool + Lead Detail View  
3. Sales Form (New Sale Entry)  
4. Unassigned Projects (PM Lead)  
5. My Projects (Project Manager)  
6. Project Detail View  
7. Departmental Task Boards (Design, Dev, SEO)  
8. Task Detail View  
9. Client Profile + Timeline   
11. Recurring Services Tracker  
12. Admin Dashboards + Reports  

---

## 📌 Implementation Notes

- Each project board can reuse components with dynamic boardType: `design`, `development`, `seo`
- Real-time notifications via WebSockets or Pusher (e.g., new task assigned)
- Use OAuth2 for Gmail + Dialpad APIs
- Multi-brand logic must be enforced for emails & numbers at all levels
- Recurring service logic includes billing cycle, renewal alerts, and task spawning

