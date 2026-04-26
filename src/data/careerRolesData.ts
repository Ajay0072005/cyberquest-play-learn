import { LucideIcon, Shield, Swords, Server, Eye, Bug, Cloud } from "lucide-react";

export type StageLevel = "Beginner" | "Intermediate" | "Advanced";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface RoleCourse {
  id: string;
  title: string;
  difficulty: Difficulty;
  // Optional link to an existing path page that contains this course
  pathSlug?: string;
}

export interface RoleLab {
  // 'minilab' = lives inside /labs (tracked via lab_progress lab_type=minilab)
  // 'page'    = standalone challenge route (tracked via the page itself)
  kind: "minilab" | "page";
  id: string;
  title: string;
  link?: string;
}

export interface RoleStage {
  level: StageLevel;
  summary: string;
  courses: RoleCourse[];
  labs: RoleLab[];
  miniProjects?: { title: string; description: string }[];
}

export interface CareerRole {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  badge: string;
  skills: string[];
  stages: RoleStage[];
}

// All courses below reference existing course content already in the platform
// (careerPathsData + roadmapData). No duplication of lessons.
export const careerRoles: CareerRole[] = [
  {
    slug: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    description: "Defend organizations by monitoring threats, analyzing incidents and hardening systems.",
    icon: Shield,
    color: "from-emerald-500 to-emerald-400",
    badge: "Blue Team Defender",
    skills: ["Threat Analysis", "Incident Response", "Security Monitoring", "OWASP Top 10"],
    stages: [
      {
        level: "Beginner",
        summary: "Build the foundations: networking, Linux and core security concepts.",
        courses: [
          { id: "security-concepts", title: "Introduction to Cybersecurity", difficulty: "Beginner", pathSlug: "script-kiddie" },
          { id: "networking-101", title: "Networking Fundamentals", difficulty: "Beginner", pathSlug: "script-kiddie" },
          { id: "linux-basics", title: "Linux Command Line Essentials", difficulty: "Beginner", pathSlug: "script-kiddie" },
        ],
        labs: [
          { kind: "page", id: "terminal-basics", title: "Terminal Navigation Challenge", link: "/terminal" },
          { kind: "minilab", id: "phishing-analysis", title: "Phishing Email Analysis" },
        ],
      },
      {
        level: "Intermediate",
        summary: "Learn how attacks work so you can detect and stop them.",
        courses: [
          { id: "owasp-top10", title: "OWASP Top 10 Deep Dive", difficulty: "Intermediate", pathSlug: "security-enthusiast" },
          { id: "web-attacks", title: "Web Attack Fundamentals", difficulty: "Intermediate", pathSlug: "security-enthusiast" },
        ],
        labs: [
          { kind: "minilab", id: "sql-injection-login", title: "SQL Injection: Login Bypass" },
          { kind: "minilab", id: "xss-stored", title: "Stored XSS Attack" },
          { kind: "minilab", id: "broken-auth", title: "Broken Authentication" },
        ],
        miniProjects: [
          { title: "Phishing Triage Playbook", description: "Document a step-by-step IR runbook based on the phishing lab." },
        ],
      },
      {
        level: "Advanced",
        summary: "Conduct full investigations and produce professional analysis reports.",
        courses: [
          { id: "vuln-assessment", title: "Vulnerability Assessment & Reporting", difficulty: "Intermediate", pathSlug: "junior-pentester" },
          { id: "malware-analysis", title: "Advanced Malware Analysis", difficulty: "Expert", pathSlug: "elite-hacker" },
        ],
        labs: [
          { kind: "page", id: "sherlock", title: "Sherlock DFIR Investigation", link: "/sherlock" },
        ],
        miniProjects: [
          { title: "Incident Report", description: "Write a full IR report on the Sherlock investigation." },
        ],
      },
    ],
  },
  {
    slug: "penetration-tester",
    title: "Penetration Tester",
    description: "Think like an attacker — find and exploit vulnerabilities before the bad guys do.",
    icon: Swords,
    color: "from-red-500 to-red-400",
    badge: "Offensive Operator",
    skills: ["Web Pentesting", "Recon", "Exploitation", "Burp Suite"],
    stages: [
      {
        level: "Beginner",
        summary: "Pick up the fundamentals an attacker needs.",
        courses: [
          { id: "linux-basics", title: "Linux Command Line Essentials", difficulty: "Beginner", pathSlug: "script-kiddie" },
          { id: "networking-101", title: "Networking Fundamentals", difficulty: "Beginner", pathSlug: "script-kiddie" },
        ],
        labs: [
          { kind: "page", id: "terminal-basics", title: "Terminal Challenge", link: "/terminal" },
          { kind: "page", id: "crypto", title: "Cryptography Puzzles", link: "/crypto-puzzles" },
        ],
      },
      {
        level: "Intermediate",
        summary: "Master common web vulnerabilities and tooling.",
        courses: [
          { id: "owasp-top10", title: "OWASP Top 10 Deep Dive", difficulty: "Intermediate", pathSlug: "security-enthusiast" },
          { id: "web-attacks", title: "Web Attack Fundamentals", difficulty: "Intermediate", pathSlug: "security-enthusiast" },
          { id: "burp-suite", title: "Burp Suite Mastery", difficulty: "Intermediate", pathSlug: "junior-pentester" },
          { id: "reconnaissance", title: "Advanced Reconnaissance", difficulty: "Intermediate", pathSlug: "junior-pentester" },
        ],
        labs: [
          { kind: "page", id: "sql-game", title: "SQL Injection Playground", link: "/sql-game" },
          { kind: "minilab", id: "xss-stored", title: "Stored XSS Attack" },
          { kind: "minilab", id: "csrf-attack", title: "CSRF Attack" },
          { kind: "minilab", id: "privilege-escalation", title: "IDOR / Privilege Escalation" },
        ],
      },
      {
        level: "Advanced",
        summary: "Chain exploits and operate against hardened targets.",
        courses: [
          { id: "exploit-dev", title: "Exploit Development Fundamentals", difficulty: "Advanced", pathSlug: "penetration-tester" },
          { id: "advanced-webapp", title: "Advanced Web App Pentesting", difficulty: "Advanced", pathSlug: "penetration-tester" },
          { id: "active-directory", title: "Active Directory Attacks", difficulty: "Advanced", pathSlug: "penetration-tester" },
        ],
        labs: [
          { kind: "minilab", id: "command-injection", title: "OS Command Injection" },
          { kind: "minilab", id: "ssrf-attack", title: "SSRF Attack" },
        ],
        miniProjects: [
          { title: "Full Pentest Report", description: "Combine findings from labs into a professional pentest report." },
        ],
      },
    ],
  },
  {
    slug: "security-engineer",
    title: "Security Engineer",
    description: "Design, build and harden secure systems and pipelines across the stack.",
    icon: Server,
    color: "from-blue-500 to-blue-400",
    badge: "Secure Architect",
    skills: ["Secure Coding", "DevSecOps", "Architecture", "Hardening"],
    stages: [
      {
        level: "Beginner",
        summary: "Understand how systems and networks fit together.",
        courses: [
          { id: "networking-101", title: "Networking Fundamentals", difficulty: "Beginner", pathSlug: "script-kiddie" },
          { id: "security-concepts", title: "Introduction to Cybersecurity", difficulty: "Beginner", pathSlug: "script-kiddie" },
        ],
        labs: [
          { kind: "minilab", id: "phishing-analysis", title: "Phishing Email Analysis" },
        ],
      },
      {
        level: "Intermediate",
        summary: "Learn to write and review secure code.",
        courses: [
          { id: "python-security", title: "Python for Security", difficulty: "Intermediate", pathSlug: "security-enthusiast" },
          { id: "owasp-top10", title: "OWASP Top 10 Deep Dive", difficulty: "Intermediate", pathSlug: "security-enthusiast" },
        ],
        labs: [
          { kind: "minilab", id: "broken-auth", title: "Broken Authentication" },
          { kind: "minilab", id: "csrf-attack", title: "CSRF Attack" },
          { kind: "minilab", id: "jwt-vulnerabilities", title: "JWT Vulnerabilities" },
        ],
      },
      {
        level: "Advanced",
        summary: "Architect end-to-end secure systems.",
        courses: [
          { id: "security-architecture", title: "Security Architecture Design", difficulty: "Expert", pathSlug: "elite-hacker" },
        ],
        labs: [
          { kind: "minilab", id: "path-traversal", title: "Path Traversal" },
        ],
        miniProjects: [
          { title: "Threat Model a Web App", description: "Produce a STRIDE threat model for a sample application." },
        ],
      },
    ],
  },
  {
    slug: "soc-analyst",
    title: "SOC Analyst",
    description: "Triage alerts, investigate incidents and protect the org from a Security Operations Center.",
    icon: Eye,
    color: "from-cyan-500 to-cyan-400",
    badge: "SOC Sentinel",
    skills: ["Triage", "SIEM", "Log Analysis", "Phishing Response"],
    stages: [
      {
        level: "Beginner",
        summary: "Learn the building blocks of monitoring.",
        courses: [
          { id: "linux-basics", title: "Linux Command Line Essentials", difficulty: "Beginner", pathSlug: "script-kiddie" },
          { id: "networking-101", title: "Networking Fundamentals", difficulty: "Beginner", pathSlug: "script-kiddie" },
          { id: "security-concepts", title: "Introduction to Cybersecurity", difficulty: "Beginner", pathSlug: "script-kiddie" },
        ],
        labs: [
          { kind: "page", id: "terminal-basics", title: "Terminal Challenge", link: "/terminal" },
          { kind: "minilab", id: "phishing-analysis", title: "Phishing Email Analysis" },
        ],
      },
      {
        level: "Intermediate",
        summary: "Recognize attacker techniques in real traffic and logs.",
        courses: [
          { id: "owasp-top10", title: "OWASP Top 10 Deep Dive", difficulty: "Intermediate", pathSlug: "security-enthusiast" },
          { id: "vuln-assessment", title: "Vulnerability Assessment & Reporting", difficulty: "Intermediate", pathSlug: "junior-pentester" },
        ],
        labs: [
          { kind: "minilab", id: "xss-stored", title: "Stored XSS Attack" },
          { kind: "minilab", id: "sql-injection-login", title: "SQL Injection: Login Bypass" },
          { kind: "minilab", id: "broken-auth", title: "Broken Authentication" },
        ],
      },
      {
        level: "Advanced",
        summary: "Lead investigations and run a forensic case.",
        courses: [
          { id: "reconnaissance", title: "Advanced Reconnaissance", difficulty: "Intermediate", pathSlug: "junior-pentester" },
        ],
        labs: [
          { kind: "page", id: "sherlock", title: "Sherlock DFIR Investigation", link: "/sherlock" },
        ],
        miniProjects: [
          { title: "Build a Detection Rule", description: "Design a Sigma-style detection rule for a lab you completed." },
        ],
      },
    ],
  },
  {
    slug: "malware-analyst",
    title: "Malware Analyst",
    description: "Reverse engineer malicious code and understand how modern threats operate.",
    icon: Bug,
    color: "from-purple-500 to-purple-400",
    badge: "Reverse Engineer",
    skills: ["Reverse Engineering", "Static & Dynamic Analysis", "APT Tactics"],
    stages: [
      {
        level: "Beginner",
        summary: "Get comfortable with the terminal and low-level concepts.",
        courses: [
          { id: "linux-basics", title: "Linux Command Line Essentials", difficulty: "Beginner", pathSlug: "script-kiddie" },
          { id: "security-concepts", title: "Introduction to Cybersecurity", difficulty: "Beginner", pathSlug: "script-kiddie" },
        ],
        labs: [
          { kind: "page", id: "terminal-basics", title: "Terminal Challenge", link: "/terminal" },
          { kind: "page", id: "crypto", title: "Cryptography Puzzles", link: "/crypto-puzzles" },
        ],
      },
      {
        level: "Intermediate",
        summary: "Learn scripting and how exploits are built.",
        courses: [
          { id: "python-security", title: "Python for Security", difficulty: "Intermediate", pathSlug: "security-enthusiast" },
          { id: "exploit-dev", title: "Exploit Development Fundamentals", difficulty: "Advanced", pathSlug: "penetration-tester" },
        ],
        labs: [
          { kind: "minilab", id: "command-injection", title: "OS Command Injection" },
          { kind: "minilab", id: "insecure-deserialization", title: "Insecure Deserialization" },
        ],
      },
      {
        level: "Advanced",
        summary: "Reverse and analyze sophisticated malware samples.",
        courses: [
          { id: "malware-analysis", title: "Advanced Malware Analysis", difficulty: "Expert", pathSlug: "elite-hacker" },
          { id: "zero-day-research", title: "Zero-Day Vulnerability Research", difficulty: "Expert", pathSlug: "elite-hacker" },
        ],
        labs: [
          { kind: "page", id: "sherlock", title: "Sherlock DFIR Investigation", link: "/sherlock" },
        ],
        miniProjects: [
          { title: "Sample Triage Report", description: "Write a structured triage report for a hypothetical malware sample." },
        ],
      },
    ],
  },
  {
    slug: "cloud-security-engineer",
    title: "Cloud Security Engineer",
    description: "Secure cloud workloads, identities and pipelines across AWS, Azure and GCP.",
    icon: Cloud,
    color: "from-sky-500 to-sky-400",
    badge: "Cloud Guardian",
    skills: ["IAM", "Cloud Hardening", "DevSecOps", "Container Security"],
    stages: [
      {
        level: "Beginner",
        summary: "Networking, Linux and core security concepts.",
        courses: [
          { id: "networking-101", title: "Networking Fundamentals", difficulty: "Beginner", pathSlug: "script-kiddie" },
          { id: "linux-basics", title: "Linux Command Line Essentials", difficulty: "Beginner", pathSlug: "script-kiddie" },
          { id: "security-concepts", title: "Introduction to Cybersecurity", difficulty: "Beginner", pathSlug: "script-kiddie" },
        ],
        labs: [
          { kind: "minilab", id: "phishing-analysis", title: "Phishing Email Analysis" },
        ],
      },
      {
        level: "Intermediate",
        summary: "Identity, access and common cloud-app vulnerabilities.",
        courses: [
          { id: "python-security", title: "Python for Security", difficulty: "Intermediate", pathSlug: "security-enthusiast" },
          { id: "owasp-top10", title: "OWASP Top 10 Deep Dive", difficulty: "Intermediate", pathSlug: "security-enthusiast" },
        ],
        labs: [
          { kind: "minilab", id: "broken-auth", title: "Broken Authentication" },
          { kind: "minilab", id: "jwt-vulnerabilities", title: "JWT Vulnerabilities" },
          { kind: "minilab", id: "ssrf-attack", title: "SSRF Attack" },
        ],
      },
      {
        level: "Advanced",
        summary: "Attack & defend cloud infrastructure.",
        courses: [
          { id: "security-architecture", title: "Security Architecture Design", difficulty: "Expert", pathSlug: "elite-hacker" },
        ],
        labs: [
          { kind: "minilab", id: "path-traversal", title: "Path Traversal" },
          { kind: "minilab", id: "privilege-escalation", title: "IDOR / Privilege Escalation" },
        ],
        miniProjects: [
          { title: "Cloud Hardening Checklist", description: "Build a 20-point cloud hardening checklist for a small startup." },
        ],
      },
    ],
  },
];

export const getCareerRoleBySlug = (slug: string) =>
  careerRoles.find((r) => r.slug === slug);
