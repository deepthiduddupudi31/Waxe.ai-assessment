import React, { useEffect, useState } from "react";

import {
  BriefcaseBusiness,
  GitBranch,
  GraduationCap,
  Network,
  Search,
  Target,
  Code2,
  RefreshCw,
} from "lucide-react";

const API = "http://localhost:3000";

async function get(path: string) {
  const response = await fetch(`${API}${path}`);

  let json: any;

  try {
    json = await response.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!response.ok) {
    throw new Error(json?.error?.message || json?.message || "Request failed");
  }

  return json?.data ?? json;
}

type Skill = {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  description?: string;
};

type Career = {
  id: string;
  title: string;
  category: string;
  experienceLevel: string;
  description: string;
  skills?: Skill[];
};

type Developer = {
  id: string;
  name: string;
  email: string;
  experienceYears: number;
  location: string;
};

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [selected, setSelected] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [skillsData, careersData] = await Promise.all([
        get("/api/skills"),
        get("/api/careers"),
      ]);

      setSkills(Array.isArray(skillsData) ? skillsData : []);
      setCareers(Array.isArray(careersData) ? careersData : []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unable to connect to CareerGraph API");
    } finally {
      setLoading(false);
    }
  }

  const nav = [
    ["dashboard", "Dashboard", Target],
    ["skills", "Skills", Code2],
    ["careers", "Careers", BriefcaseBusiness],
    ["path", "Career Path", GitBranch],
  ];

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <Network />
          <span>CareerGraph</span>
        </div>

        <p className="tag">Discover where your skills can take you.</p>

        {nav.map(([id, label, Icon]: any) => (
          <button
            key={id}
            className={tab === id ? "nav active" : "nav"}
            onClick={() => setTab(id)}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}

        <div className="side-note">
          <GraduationCap />

          <b>Graph-powered</b>

          <span>Explore relationships instead of isolated rows.</span>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <span className="eyebrow">CAREER DISCOVERY PLATFORM</span>

            <h1>
              {tab === "dashboard"
                ? "Discover where your skills can take you."
                : tab === "skills"
                ? "Explore skills"
                : tab === "careers"
                ? "Explore careers"
                : "Build your career path"}
            </h1>
          </div>

          <div className="status">
            <span className={error ? "dot bad" : "dot"} />

            {error ? "Database unavailable" : "Graph connected"}
          </div>
        </header>

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            Loading your career graph...
          </div>
        ) : error ? (
          <div className="error">
            <h2>CareerGraph is temporarily unavailable</h2>

            <p>{error}</p>

            <button onClick={loadData}>
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        ) : tab === "dashboard" ? (
          <Dashboard skills={skills} careers={careers} setTab={setTab} />
        ) : tab === "skills" ? (
          <Skills skills={skills} />
        ) : tab === "careers" ? (
          <Careers careers={careers} setSelected={setSelected} />
        ) : (
          <Path skills={skills} careers={careers} />
        )}

        {selected && (
          <CareerModal career={selected} close={() => setSelected(null)} />
        )}
      </main>
    </div>
  );
}

function Dashboard({
  skills,
  careers,
  setTab,
}: {
  skills: Skill[];
  careers: Career[];
  setTab: (tab: string) => void;
}) {
  return (
    <>
      <section className="hero">
        <div>
          <span className="pill">COGNODB • GRAPH DATABASE</span>

          <h2>
            Turn your skills into a <em>career map.</em>
          </h2>

          <p>
            Find roles that match what you know, discover missing skills, and
            understand the relationships that connect your next opportunity.
          </p>

          <button className="primary" onClick={() => setTab("path")}>
            Build my career path →
          </button>
        </div>

        <div className="hero-graph">
          <div className="orb">◈</div>

          <span>Skill</span>
          <span>Career</span>
          <span>Company</span>
        </div>
      </section>

      <div className="stats">
        <Stat n={`${skills.length}+`} l="Skills" />

        <Stat n={careers.length} l="Career paths" />

        <Stat n="5" l="Companies" />

        <Stat n="7" l="Learning resources" />
      </div>

      <h3>Popular skills</h3>

      <div className="grid">
        {skills.slice(0, 8).map((skill) => (
          <div className="card" key={skill.id}>
            <div className="icon">
              <Code2 size={19} />
            </div>

            <b>{skill.name}</b>

            <small>
              {skill.category} · {skill.difficulty}
            </small>
          </div>
        ))}
      </div>
    </>
  );
}

function Stat({ n, l }: { n: string | number; l: string }) {
  return (
    <div className="stat">
      <b>{n}</b>
      <span>{l}</span>
    </div>
  );
}

function Skills({ skills }: { skills: Skill[] }) {
  const [q, setQ] = useState("");

  const list = skills.filter((skill) =>
    skill.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <div className="search">
        <Search size={18} />

        <input
          placeholder="Search skills..."
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
      </div>

      {!list.length ? (
        <Empty text="No skills found." />
      ) : (
        <div className="grid">
          {list.map((skill) => (
            <div className="card skill" key={skill.id}>
              <div className="icon">
                <Code2 size={19} />
              </div>

              <b>{skill.name}</b>

              <small>
                {skill.description ||
                  `${skill.name} is a useful professional technology.`}
              </small>

              <span className="badge">{skill.difficulty}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Careers({
  careers,
  setSelected,
}: {
  careers: Career[];
  setSelected: (career: Career) => void;
}) {
  return (
    <div className="grid">
      {careers.map((career) => (
        <button
          key={career.id}
          className="career card"
          onClick={() => setSelected(career)}
        >
          <div className="icon">
            <BriefcaseBusiness size={19} />
          </div>

          <b>{career.title}</b>

          <small>
            {career.category} · {career.experienceLevel}
          </small>

          <span>{career.skills?.length || 0} required skills →</span>
        </button>
      ))}
    </div>
  );
}

function Path({ skills, careers }: { skills: Skill[]; careers: Career[] }) {
  const [chosen, setChosen] = useState<string[]>(
    skills.slice(0, 3).map((skill) => skill.id)
  );

  const [career, setCareer] = useState(
    careers.find((item) => item.id === "fullstack")?.id || careers[0]?.id || ""
  );

  const selectedCareer = careers.find((item) => item.id === career);

  const req = selectedCareer?.skills || [];

  const matched = req.filter((skill) => chosen.includes(skill.id));

  const percentage = req.length
    ? Math.round((matched.length / req.length) * 100)
    : 0;

  return (
    <div className="path">
      <div className="panel">
        <h2>Build your path</h2>

        <p>Select your current skills and a target career.</p>

        <label>Target career</label>

        <select
          value={career}
          onChange={(event) => setCareer(event.target.value)}
        >
          {careers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>

        <label>Your skills</label>

        <div className="chips">
          {skills.slice(0, 14).map((skill) => {
            const isSelected = chosen.includes(skill.id);

            return (
              <button
                key={skill.id}
                className={isSelected ? "chip selected" : "chip"}
                onClick={() => {
                  setChosen(
                    isSelected
                      ? chosen.filter((id) => id !== skill.id)
                      : [...chosen, skill.id]
                  );
                }}
              >
                {skill.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="result">
        <div className="score">
          <div>
            <span>CAREER READINESS</span>

            <strong>{percentage}%</strong>
          </div>

          <div className="progress">
            <i
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>

        <h3>Matched skills</h3>

        {matched.length ? (
          matched.map((skill) => (
            <div className="row yes" key={skill.id}>
              ✓ {skill.name}
            </div>
          ))
        ) : (
          <p>No matching skills yet.</p>
        )}

        <h3>Skill gaps</h3>

        {req
          .filter((skill) => !chosen.includes(skill.id))
          .map((skill) => (
            <div className="row" key={skill.id}>
              ○ {skill.name}
              <small>Recommended next skill</small>
            </div>
          ))}

        {!req.length && (
          <Empty text="No requirements loaded for this career." />
        )}
      </div>
    </div>
  );
}

function CareerModal({ career, close }: { career: Career; close: () => void }) {
  return (
    <div className="modal">
      <div className="modalbox">
        <button className="close" onClick={close}>
          ×
        </button>

        <span className="pill">CAREER ROLE</span>

        <h2>{career.title}</h2>

        <p>{career.description}</p>

        <h3>Graph-connected skills</h3>

        <div className="chips">
          {(career.skills || []).map((skill) => (
            <span className="chip selected" key={skill.id}>
              {skill.name}
            </span>
          ))}
        </div>

        <div className="notice">
          This career is connected in CognoDB to required skills, companies and
          learning resources.
        </div>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <Search />

      <h3>{text}</h3>

      <p>Try another search or refresh the graph.</p>
    </div>
  );
}
