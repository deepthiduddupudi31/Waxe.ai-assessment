import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";

import { driver, verifyDatabase } from "./db";
import { queries } from "./queries";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

function props(value: any) {
  return value?.properties ?? value;
}

async function run<T>(
  cypher: string,
  params: Record<string, unknown>,
  mapper: (record: any) => T
): Promise<T[]> {
  if (!driver) {
    throw new Error("Database is not configured");
  }

  const session = driver.session();
  console.log("db connected");

  try {
    const result = await session.run(cypher, params);

    return result.records.map(mapper);
  } finally {
    await session.close();
  }
}

app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    const connected = await verifyDatabase();
    if (connected) {
      console.log("CognoDB database connected.");
    }

    res.status(connected ? 200 : 503).json({
      success: connected,
      database: connected ? "connected" : "disconnected",
    });
  } catch (error) {
    console.error("Health check error:", error);

    res.status(503).json({
      success: false,
      database: "disconnected",
    });
  }
});

app.get("/api/skills", async (_req: Request, res: Response) => {
  try {
    const data = await run(queries.skills, {}, (record) =>
      props(record.get("s"))
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET /api/skills:", error);

    res.status(503).json({
      success: false,
      error: {
        message: "Unable to connect to CareerGraph database.",
      },
    });
  }
});

app.get("/api/skills/:name", async (req: Request, res: Response) => {
  try {
    const rows = await run(
      queries.skill,
      {
        name: req.params.name,
      },
      (record) => props(record.get("s"))
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Skill not found",
        },
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error(`GET /api/skills/${req.params.name}:`, error);

    res.status(503).json({
      success: false,
      error: {
        message: "Database unavailable",
      },
    });
  }
});

app.get("/api/skills/:name/related", async (req: Request, res: Response) => {
  try {
    const data = await run(
      queries.related,
      {
        name: req.params.name,
      },
      (record) => ({
        skill: props(record.get("x")),
        relationship: props(record.get("r")),
      })
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(`GET /api/skills/${req.params.name}/related:`, error);

    res.status(503).json({
      success: false,
      error: {
        message: "Database unavailable",
      },
    });
  }
});

app.get("/api/skills/:name/careers", async (req: Request, res: Response) => {
  try {
    const data = await run(
      queries.skillCareers,
      {
        name: req.params.name,
      },
      (record) => ({
        career: props(record.get("j")),
        relationship: props(record.get("r")),
      })
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(`GET /api/skills/${req.params.name}/careers:`, error);

    res.status(503).json({
      success: false,
      error: {
        message: "Database unavailable",
      },
    });
  }
});

app.get("/api/careers", async (_req: Request, res: Response) => {
  try {
    const data = await run(queries.careers, {}, (record) => {
      const career = props(record.get("j"));

      const skills = record.get("skills") || [];

      return {
        ...career,
        skills: skills.map((skill: any) => props(skill)),
      };
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET /api/careers:", error);

    res.status(503).json({
      success: false,
      error: {
        message: "Database unavailable",
      },
    });
  }
});

app.get("/api/careers/:id", async (req: Request, res: Response) => {
  try {
    const rows = await run(
      queries.career,
      {
        id: req.params.id,
      },
      (record) => {
        const skills = record.get("skills") || [];

        const companies = record.get("companies") || [];

        return {
          career: props(record.get("j")),

          skills: skills.map((item: any) => ({
            skill: props(item.skill),
            relation: props(item.relation),
          })),

          companies: companies.map((item: any) => ({
            company: props(item.company),
            relation: props(item.relation),
          })),
        };
      }
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Career not found",
        },
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error(`GET /api/careers/${req.params.id}:`, error);

    res.status(503).json({
      success: false,
      error: {
        message: "Database unavailable",
      },
    });
  }
});

app.get("/api/developers", async (_req: Request, res: Response) => {
  try {
    const data = await run(queries.developers, {}, (record) =>
      props(record.get("d"))
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET /api/developers:", error);

    res.status(503).json({
      success: false,
      error: {
        message: "Database unavailable",
      },
    });
  }
});

app.get("/api/developers/:id/matches", async (req: Request, res: Response) => {
  try {
    const careerId = String(req.query.careerId || "frontend");

    const rows = await run(
      queries.matches,
      {
        id: req.params.id,
        careerId,
      },
      (record) => ({
        developer: props(record.get("d")),
        career: props(record.get("j")),
        required: (record.get("req") || []).map((item: any) => props(item)),
        owned: (record.get("own") || []).map((item: any) => props(item)),
      })
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Developer or career not found",
        },
      });
    }

    const result = rows[0];

    const ownedIds = new Set(result.owned.map((skill: any) => skill.id));

    const matched = result.required.filter((skill: any) =>
      ownedIds.has(skill.id)
    );

    const missing = result.required.filter(
      (skill: any) => !ownedIds.has(skill.id)
    );

    const percentage = result.required.length
      ? Math.round((matched.length / result.required.length) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        ...result,
        matched,
        missing,
        percentage,
      },
    });
  } catch (error) {
    console.error(`GET /api/developers/${req.params.id}/matches:`, error);

    res.status(503).json({
      success: false,
      error: {
        message: "Database unavailable",
      },
    });
  }
});

app.get("/api/graph/career/:id", async (req: Request, res: Response) => {
  try {
    const rows = await run(
      queries.graphCareer,
      {
        id: req.params.id,
      },
      (record) => {
        const nodes = record.get("nodes") || [];

        const relationships = record.get("relationships") || [];

        return {
          nodes: nodes.map((node: any) => ({
            id: node.elementId,
            label: [...node.labels][0] || "Node",
            properties: props(node),
          })),

          relationships: relationships.map((relationship: any) => ({
            id: relationship.elementId,
            type: relationship.type,
            start: relationship.startNodeElementId,
            end: relationship.endNodeElementId,
            properties: props(relationship),
          })),
        };
      }
    );

    res.json({
      success: true,
      data: rows[0] || {
        nodes: [],
        relationships: [],
      },
    });
  } catch (error) {
    console.error(`GET /api/graph/career/${req.params.id}:`, error);

    res.status(503).json({
      success: false,
      error: {
        message: "Database unavailable",
      },
    });
  }
});

app.get(
  "/api/careers/:id/discovery/:developerId",
  async (req: Request, res: Response) => {
    try {
      const data = await run(
        queries.multiHop,
        {
          id: req.params.developerId,
        },
        (record) => ({
          career: props(record.get("j")),

          currentSkills: (record.get("currentSkills") || []).map((item: any) =>
            props(item)
          ),

          bridgingSkills: (record.get("bridgingSkills") || []).map(
            (item: any) => props(item)
          ),
        })
      );

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error(
        `GET /api/careers/${req.params.id}/discovery/${req.params.developerId}:`,
        error
      );

      res.status(503).json({
        success: false,
        error: {
          message: "Database unavailable",
        },
      });
    }
  }
);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: "API route not found",
    },
  });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`CareerGraph API running on http://localhost:${port}`);
});
