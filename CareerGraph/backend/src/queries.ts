export const queries = {
  skills: `
    MATCH (s:Skill)
    RETURN s ORDER BY s.name
  `,
  skill: `
    MATCH (s:Skill {name: $name})
    RETURN s
  `,
  related: `
    MATCH (s:Skill {name: $name})-[r:RELATED_TO]-(x:Skill)
    RETURN x, r
    ORDER BY x.name
  `,
  skillCareers: `
    MATCH (s:Skill {name: $name})-[r:REQUIRED_FOR]->(j:JobRole)
    RETURN j, r
    ORDER BY j.title
  `,
  careers: `
    MATCH (j:JobRole)
    OPTIONAL MATCH (j)<-[:REQUIRED_FOR]-(s:Skill)
    RETURN j, collect(s) AS skills
    ORDER BY j.title
  `,
  career: `
    MATCH (j:JobRole {id: $id})
    OPTIONAL MATCH (j)<-[r:REQUIRED_FOR]-(s:Skill)
    OPTIONAL MATCH (j)-[a:AVAILABLE_AT]->(c:Company)
    RETURN j, collect(DISTINCT {skill:s, relation:r}) AS skills,
           collect(DISTINCT {company:c, relation:a}) AS companies
  `,
  developers: `MATCH (d:Developer) RETURN d ORDER BY d.name`,
  matches: `
    MATCH (d:Developer {id:$id}), (j:JobRole {id:$careerId})
    OPTIONAL MATCH (j)<-[:REQUIRED_FOR]-(required:Skill)
    OPTIONAL MATCH (d)-[:HAS_SKILL]->(owned:Skill)
    WITH d,j,collect(DISTINCT required) AS req,collect(DISTINCT owned) AS own
    RETURN d,j,req,own
  `,
  graphCareer: `
    MATCH (j:JobRole {id:$id})
    OPTIONAL MATCH p=(j)<-[:REQUIRED_FOR]-(s:Skill)
    WITH collect(p) AS paths
    UNWIND paths AS p
    UNWIND nodes(p) AS n
    WITH collect(DISTINCT n) AS ns, paths
    UNWIND paths AS p2
    UNWIND relationships(p2) AS r
    RETURN ns AS nodes, collect(DISTINCT r) AS relationships
  `,
  multiHop: `
    MATCH (d:Developer {id:$id})-[:HAS_SKILL]->(s1:Skill)
          -[:RELATED_TO]->(s2:Skill)-[:REQUIRED_FOR]->(j:JobRole)
    RETURN DISTINCT j, collect(DISTINCT s1) AS currentSkills,
           collect(DISTINCT s2) AS bridgingSkills
    ORDER BY j.title
  `
};
