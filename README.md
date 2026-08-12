# CareerGraph — Graph-Powered Career Discovery Platform

> **Wexa AI — Candidate Take-Home Assignment: Build a Graph Database Application**

CareerGraph is a graph-powered career discovery platform that helps developers understand how their existing technical skills connect to career opportunities, required skills, companies, and learning resources.

Instead of treating skills and careers as isolated records, CareerGraph models the relationships between them using **CognoDB**, a managed graph database compatible with the official Neo4j JavaScript driver and openCypher.

---

## 🚀 Live Demo

**Hosted Application:**  
[Add your deployed frontend URL here]

# 1. Problem Statement

Choosing a career path is often difficult because developers need to answer several connected questions:

- Which careers match my current skills?
- What skills are required for a particular role?
- Which skills am I missing?
- What skills are related to the skills I already know?
- Which companies offer opportunities for a particular career?
- What courses can help me close my skill gaps?
- What path can I take from my current skills to a target career?

Traditional applications often represent these as separate database tables.

CareerGraph approaches the problem as a **connected graph**.

A developer has skills.

Skills are required for careers.

Careers are available at companies.

Skills are related to other skills.

Skills are taught by courses.

This creates a connected career knowledge graph that can be explored using graph traversals.

---

# 2. Why a Graph Database?

The core problem in CareerGraph is about **relationships**, making a graph database a natural fit.

A relational implementation could contain tables such as:

- Developers
- Skills
- Careers
- Companies
- Courses
- DeveloperSkills
- CareerSkills
- CareerCompanies
- SkillRelationships
- SkillCourses

However, queries involving multiple relationships would require several joins.

For example:

> "A developer knows React. Which careers can they reach through related skills, and what skills should they learn next?"

This requires traversing multiple relationships:

```text
Developer
   ↓
HAS_SKILL
   ↓
Skill
   ↓
RELATED_TO
   ↓
Skill
   ↓
REQUIRED_FOR
   ↓
Career
