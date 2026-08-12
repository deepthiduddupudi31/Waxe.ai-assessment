import { driver } from "../db";

async function seed() {
  if (!driver) {
    throw new Error("Set COGNODB_URI and COGNODB_PASSWORD first.");
  }

  const skills = [
    ["javascript", "JavaScript", "Frontend", "Intermediate"],
    ["typescript", "TypeScript", "Frontend", "Intermediate"],
    ["react", "React", "Frontend", "Intermediate"],
    ["nextjs", "Next.js", "Frontend", "Advanced"],
    ["nodejs", "Node.js", "Backend", "Intermediate"],
    ["express", "Express.js", "Backend", "Intermediate"],
    ["python", "Python", "Backend", "Intermediate"],
    ["fastapi", "FastAPI", "Backend", "Intermediate"],
    ["postgresql", "PostgreSQL", "Database", "Intermediate"],
    ["mongodb", "MongoDB", "Database", "Intermediate"],
    ["docker", "Docker", "Cloud", "Intermediate"],
    ["azure", "Azure", "Cloud", "Intermediate"],
    ["aws", "AWS", "Cloud", "Intermediate"],
    ["git", "Git", "Tools", "Beginner"],
    ["graphql", "GraphQL", "Backend", "Intermediate"],
    ["rest", "REST APIs", "Backend", "Beginner"],
    ["tailwind", "Tailwind CSS", "Frontend", "Beginner"],
    ["redux", "Redux", "Frontend", "Intermediate"],
    ["testing", "Testing", "Quality", "Intermediate"],
    ["playwright", "Playwright", "Quality", "Intermediate"],
    ["system-design", "System Design", "Engineering", "Advanced"],
    ["sql", "SQL", "Database", "Intermediate"],
    ["prisma", "Prisma", "Database", "Intermediate"],
  ];

  const roles = [
    ["frontend", "Frontend Developer", "Software", "Entry/Intermediate"],
    ["react", "React Developer", "Software", "Intermediate"],
    ["nextjs", "Next.js Developer", "Software", "Intermediate"],
    ["fullstack", "Full Stack Developer", "Software", "Intermediate"],
    ["backend", "Backend Developer", "Software", "Intermediate"],
    ["node", "Node.js Developer", "Software", "Intermediate"],
    ["cloud", "Cloud Engineer", "Cloud", "Intermediate"],
    ["devops", "DevOps Engineer", "Cloud", "Intermediate"],
    ["ai-app", "AI Application Developer", "AI", "Intermediate"],
    ["software", "Software Engineer", "Software", "Intermediate"],
  ];

  const companies = [
    ["acme", "Acme Digital", "Technology", "Bengaluru"],
    ["nova", "Nova Systems", "SaaS", "Hyderabad"],
    ["orbit", "Orbit Labs", "Technology", "Pune"],
    ["vertex", "Vertex Cloud", "Cloud", "Bengaluru"],
    ["blue", "BlueStack", "FinTech", "Mumbai"],
  ];

  const courses = [
    ["c1", "Advanced React Patterns", "Frontend Masters", "react"],
    ["c2", "TypeScript in Practice", "Open Learning", "typescript"],
    ["c3", "Node.js APIs", "Open Learning", "nodejs"],
    ["c4", "Docker Fundamentals", "Cloud Academy", "docker"],
    ["c5", "PostgreSQL Essentials", "Data Academy", "postgresql"],
    ["c6", "Azure Fundamentals", "Microsoft Learn", "azure"],
    ["c7", "Testing React Apps", "Testing Academy", "testing"],
  ];

  const session = driver.session();

  try {
    // Clear existing database
    await session.run("MATCH (n) DETACH DELETE n");

    // Create Skills
    await session.run(
      `UNWIND $rows AS r
       CREATE (:Skill {
         id: r[0],
         name: r[1],
         category: r[2],
         difficulty: r[3],
         description: r[1] + ' is a useful professional technology.'
       })`,
      { rows: skills }
    );

    // Create Job Roles
    await session.run(
      `UNWIND $rows AS r
       CREATE (:JobRole {
         id: r[0],
         title: r[1],
         category: r[2],
         experienceLevel: r[3],
         description: 'A practical career path in ' + r[1]
       })`,
      { rows: roles }
    );

    // Create Companies
    await session.run(
      `UNWIND $rows AS r
       CREATE (:Company {
         id: r[0],
         name: r[1],
         industry: r[2],
         location: r[3],
         website: 'https://example.com'
       })`,
      { rows: companies }
    );

    // Create Courses
    await session.run(
      `UNWIND $rows AS r
       CREATE (:Course {
         id: r[0],
         title: r[1],
         provider: r[2],
         level: 'Intermediate',
         url: 'https://example.com',
         description: 'Learning resource for ' + r[3]
       })`,
      { rows: courses }
    );

    // Create Developers + Skills
    const devs = [
      [
        "d1",
        "Deepthi",
        "deepthi@example.com",
        1,
        "India",
        ["javascript", "typescript", "react", "git", "tailwind"],
      ],
      [
        "d2",
        "Aarav",
        "aarav@example.com",
        2,
        "India",
        ["javascript", "react", "nodejs", "express", "mongodb"],
      ],
      [
        "d3",
        "Meera",
        "meera@example.com",
        3,
        "India",
        ["python", "fastapi", "sql", "postgresql", "docker"],
      ],
    ];

    await session.run(
      `UNWIND $rows AS r
       CREATE (d:Developer {
         id: r[0],
         name: r[1],
         email: r[2],
         experienceYears: r[3],
         location: r[4],
         bio: 'Demo developer'
       })
       WITH d, r
       UNWIND r[5] AS sid
       MATCH (s:Skill {id: sid})
       CREATE (d)-[:HAS_SKILL {
         proficiency: 'working',
         yearsUsed: 1
       }]->(s)`,
      { rows: devs }
    );

    // Skill relationships
    const rel = [
      ["javascript", "typescript"],
      ["javascript", "react"],
      ["typescript", "react"],
      ["react", "nextjs"],
      ["react", "redux"],
      ["react", "testing"],
      ["nodejs", "express"],
      ["nodejs", "rest"],
      ["postgresql", "sql"],
      ["python", "fastapi"],
      ["docker", "azure"],
      ["docker", "aws"],
      ["typescript", "nextjs"],
      ["rest", "graphql"],
    ];

    await session.run(
      `UNWIND $rows AS r
       MATCH (a:Skill {id: r[0]}), (b:Skill {id: r[1]})
       MERGE (a)-[:RELATED_TO {
         strength: 0.8,
         relationshipType: 'complements'
       }]->(b)
       MERGE (b)-[:RELATED_TO {
         strength: 0.8,
         relationshipType: 'complements'
       }]->(a)`,
      { rows: rel }
    );

    // Skills required for roles
    const req: Record<string, string[]> = {
      frontend: ["javascript", "typescript", "react", "html", "css"],
      react: ["javascript", "typescript", "react", "testing"],
      nextjs: ["javascript", "typescript", "react", "nextjs"],
      fullstack: [
        "javascript",
        "typescript",
        "react",
        "nodejs",
        "express",
        "postgresql",
        "docker",
      ],
      backend: ["nodejs", "express", "rest", "sql", "docker"],
      node: ["javascript", "typescript", "nodejs", "express"],
      cloud: ["linux", "docker", "azure", "networking"],
      devops: ["git", "docker", "azure", "testing"],
      "ai-app": ["python", "fastapi", "rest", "postgresql"],
      software: ["javascript", "typescript", "git", "testing", "system-design"],
    };

    for (const [rid, sids] of Object.entries(req)) {
      for (const sid of sids) {
        await session.run(
          `MATCH (s:Skill {id: $sid}), (j:JobRole {id: $rid})
           MERGE (s)-[:REQUIRED_FOR {
             importance: 'high',
             minimumLevel: 'Intermediate'
           }]->(j)`,
          { sid, rid }
        );
      }
    }

    // Job roles available at companies
    const roleCompanies: [string, string[]][] = [
      ["frontend", ["acme", "nova"]],
      ["react", ["nova", "orbit"]],
      ["nextjs", ["acme", "vertex"]],
      ["fullstack", ["orbit", "nova"]],
      ["backend", ["nova", "blue"]],
      ["node", ["orbit"]],
      ["cloud", ["vertex"]],
      ["devops", ["vertex"]],
      ["ai-app", ["orbit"]],
      ["software", ["acme", "blue"]],
    ];

    for (const [rid, companyIds] of roleCompanies) {
      for (const cid of companyIds) {
        await session.run(
          `MATCH (j:JobRole {id: $rid}), (c:Company {id: $cid})
           MERGE (j)-[:AVAILABLE_AT {
             openings: 5,
             workMode: 'Hybrid',
             experienceRequired: '1-3 years'
           }]->(c)`,
          { rid, cid }
        );
      }
    }

    // Skills -> Courses
    const skillCourses = [
      ["c1", "react"],
      ["c2", "typescript"],
      ["c3", "nodejs"],
      ["c4", "docker"],
      ["c5", "postgresql"],
      ["c6", "azure"],
      ["c7", "testing"],
    ];

    for (const [cid, sid] of skillCourses) {
      await session.run(
        `MATCH (s:Skill {id: $sid}), (c:Course {id: $cid})
         MERGE (s)-[:TAUGHT_BY {
           relevance: 0.9,
           completionTime: '4 weeks'
         }]->(c)`,
        { sid, cid }
      );
    }

    console.log("Seed completed successfully.");
  } finally {
    await session.close();
    await driver.close();
  }
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
