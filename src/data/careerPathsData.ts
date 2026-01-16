import { Terminal, Bug, Database, Lock, Server, Award, LucideIcon } from "lucide-react";

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface Lab {
  id: string;
  title: string;
  description: string;
  type: "hands-on" | "ctf" | "simulation";
  estimatedTime: string;
  points: number;
  link?: string;
}

export interface CareerPathData {
  level: number;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  skills: string[];
  icon: LucideIcon;
  color: string;
  courses: Course[];
  labs: Lab[];
}

export const careerPaths: CareerPathData[] = [
  {
    level: 1,
    slug: "script-kiddie",
    title: "Script Kiddie",
    description: "Learn the basics of cybersecurity, understand common terms, and run your first tools",
    longDescription: "Start your cybersecurity journey by mastering the fundamentals. Learn essential Linux commands, understand how networks communicate, and grasp core security concepts that will form the foundation of your career.",
    skills: ["Basic Linux Commands", "Networking Fundamentals", "Security Concepts"],
    icon: Terminal,
    color: "from-slate-500 to-slate-400",
    courses: [
      {
        id: "linux-basics",
        title: "Linux Command Line Essentials",
        description: "Master the terminal with essential Linux commands for security professionals",
        duration: "4 hours",
        lessons: 12,
        difficulty: "Beginner"
      },
      {
        id: "networking-101",
        title: "Networking Fundamentals",
        description: "Understand TCP/IP, DNS, HTTP, and how data travels across networks",
        duration: "6 hours",
        lessons: 15,
        difficulty: "Beginner"
      },
      {
        id: "security-concepts",
        title: "Introduction to Cybersecurity",
        description: "Learn the CIA triad, threat landscape, and security terminology",
        duration: "3 hours",
        lessons: 8,
        difficulty: "Beginner"
      }
    ],
    labs: [
      {
        id: "terminal-basics",
        title: "Terminal Navigation Challenge",
        description: "Navigate the Linux filesystem and find hidden flags",
        type: "hands-on",
        estimatedTime: "30 min",
        points: 50,
        link: "/terminal"
      },
      {
        id: "network-scanner",
        title: "Your First Network Scan",
        description: "Use basic tools to discover devices on a network",
        type: "simulation",
        estimatedTime: "45 min",
        points: 75
      },
      {
        id: "packet-capture",
        title: "Packet Analysis Basics",
        description: "Capture and analyze network traffic to understand protocols",
        type: "hands-on",
        estimatedTime: "1 hour",
        points: 100
      }
    ]
  },
  {
    level: 2,
    slug: "security-enthusiast",
    title: "Security Enthusiast",
    description: "Dive deeper into vulnerabilities, learn how attacks work, and practice on CTF challenges",
    longDescription: "Build upon your foundations by exploring how real-world attacks work. Learn about common web vulnerabilities, understand the OWASP Top 10, and develop scripting skills to automate your security tasks.",
    skills: ["Web Vulnerabilities", "OWASP Top 10", "Basic Scripting"],
    icon: Bug,
    color: "from-blue-500 to-blue-400",
    courses: [
      {
        id: "owasp-top10",
        title: "OWASP Top 10 Deep Dive",
        description: "Understand the most critical web application security risks",
        duration: "8 hours",
        lessons: 20,
        difficulty: "Intermediate"
      },
      {
        id: "python-security",
        title: "Python for Security",
        description: "Write scripts to automate security tasks and build custom tools",
        duration: "10 hours",
        lessons: 25,
        difficulty: "Intermediate"
      },
      {
        id: "web-attacks",
        title: "Web Attack Fundamentals",
        description: "Learn XSS, CSRF, and other common web vulnerabilities",
        duration: "6 hours",
        lessons: 18,
        difficulty: "Intermediate"
      }
    ],
    labs: [
      {
        id: "sql-injection",
        title: "SQL Injection Playground",
        description: "Practice exploiting SQL injection vulnerabilities safely",
        type: "hands-on",
        estimatedTime: "1 hour",
        points: 150,
        link: "/sql-game"
      },
      {
        id: "xss-challenge",
        title: "XSS Hunter Challenge",
        description: "Find and exploit cross-site scripting vulnerabilities",
        type: "ctf",
        estimatedTime: "1.5 hours",
        points: 200
      },
      {
        id: "crypto-basics",
        title: "Cryptography Puzzles",
        description: "Break classic ciphers and understand encryption fundamentals",
        type: "ctf",
        estimatedTime: "2 hours",
        points: 175,
        link: "/crypto-puzzles"
      }
    ]
  },
  {
    level: 3,
    slug: "junior-pentester",
    title: "Junior Pentester",
    description: "Start conducting real assessments, write reports, and use professional tools",
    longDescription: "Transition from learning to doing. Master industry-standard tools like Burp Suite and Nmap, learn reconnaissance techniques, and start conducting proper vulnerability assessments with professional reporting.",
    skills: ["Burp Suite", "Nmap & Recon", "Vulnerability Assessment"],
    icon: Database,
    color: "from-purple-500 to-purple-400",
    courses: [
      {
        id: "burp-suite",
        title: "Burp Suite Mastery",
        description: "Become proficient with the industry's leading web testing tool",
        duration: "12 hours",
        lessons: 30,
        difficulty: "Intermediate"
      },
      {
        id: "reconnaissance",
        title: "Advanced Reconnaissance",
        description: "Discover targets, map attack surfaces, and gather intelligence",
        duration: "8 hours",
        lessons: 22,
        difficulty: "Intermediate"
      },
      {
        id: "vuln-assessment",
        title: "Vulnerability Assessment & Reporting",
        description: "Conduct assessments and write professional pentest reports",
        duration: "6 hours",
        lessons: 15,
        difficulty: "Intermediate"
      }
    ],
    labs: [
      {
        id: "full-web-pentest",
        title: "Complete Web App Pentest",
        description: "Conduct a full assessment on a vulnerable web application",
        type: "simulation",
        estimatedTime: "3 hours",
        points: 300
      },
      {
        id: "osint-challenge",
        title: "OSINT Investigation",
        description: "Gather intelligence using open-source techniques",
        type: "ctf",
        estimatedTime: "2 hours",
        points: 250
      },
      {
        id: "report-writing",
        title: "Professional Report Lab",
        description: "Document findings and create a professional pentest report",
        type: "hands-on",
        estimatedTime: "1.5 hours",
        points: 200
      }
    ]
  },
  {
    level: 4,
    slug: "penetration-tester",
    title: "Penetration Tester",
    description: "Perform comprehensive security assessments, exploit complex vulnerabilities",
    longDescription: "You're now a skilled pentester. Master exploit development, tackle Active Directory environments, and perform comprehensive web application penetration testing on complex targets.",
    skills: ["Exploit Development", "Active Directory", "Web App Pentesting"],
    icon: Lock,
    color: "from-orange-500 to-orange-400",
    courses: [
      {
        id: "exploit-dev",
        title: "Exploit Development Fundamentals",
        description: "Learn to develop exploits for buffer overflows and more",
        duration: "15 hours",
        lessons: 35,
        difficulty: "Advanced"
      },
      {
        id: "active-directory",
        title: "Active Directory Attacks",
        description: "Master AD enumeration, privilege escalation, and lateral movement",
        duration: "12 hours",
        lessons: 28,
        difficulty: "Advanced"
      },
      {
        id: "advanced-webapp",
        title: "Advanced Web App Pentesting",
        description: "Tackle authentication bypasses, business logic flaws, and more",
        duration: "10 hours",
        lessons: 25,
        difficulty: "Advanced"
      }
    ],
    labs: [
      {
        id: "ad-attack-chain",
        title: "AD Attack Chain Simulation",
        description: "Execute a full Active Directory attack chain from initial access to domain admin",
        type: "simulation",
        estimatedTime: "4 hours",
        points: 500
      },
      {
        id: "buffer-overflow",
        title: "Buffer Overflow Exploitation",
        description: "Develop and execute buffer overflow exploits",
        type: "hands-on",
        estimatedTime: "3 hours",
        points: 400
      },
      {
        id: "auth-bypass",
        title: "Authentication Bypass Challenge",
        description: "Find and exploit authentication vulnerabilities",
        type: "ctf",
        estimatedTime: "2 hours",
        points: 350
      }
    ]
  },
  {
    level: 5,
    slug: "senior-pentester",
    title: "Senior Pentester",
    description: "Lead security engagements, mentor juniors, and tackle advanced targets",
    longDescription: "Lead offensive security operations. Master red team tactics, social engineering campaigns, and advanced exploitation techniques. Mentor junior team members and tackle the most challenging targets.",
    skills: ["Red Team Ops", "Social Engineering", "Advanced Exploitation"],
    icon: Server,
    color: "from-red-500 to-red-400",
    courses: [
      {
        id: "red-team-ops",
        title: "Red Team Operations",
        description: "Plan and execute full-scale red team engagements",
        duration: "20 hours",
        lessons: 40,
        difficulty: "Advanced"
      },
      {
        id: "social-engineering",
        title: "Social Engineering Mastery",
        description: "Master phishing, pretexting, and physical security assessments",
        duration: "8 hours",
        lessons: 20,
        difficulty: "Advanced"
      },
      {
        id: "evasion-techniques",
        title: "Evasion & Anti-Detection",
        description: "Bypass security controls, EDR, and maintain persistence",
        duration: "12 hours",
        lessons: 28,
        difficulty: "Expert"
      }
    ],
    labs: [
      {
        id: "red-team-sim",
        title: "Full Red Team Simulation",
        description: "Execute a complete red team operation from recon to exfiltration",
        type: "simulation",
        estimatedTime: "6 hours",
        points: 750
      },
      {
        id: "phishing-campaign",
        title: "Phishing Campaign Lab",
        description: "Design and execute a realistic phishing campaign",
        type: "hands-on",
        estimatedTime: "3 hours",
        points: 500
      },
      {
        id: "edr-bypass",
        title: "EDR Evasion Challenge",
        description: "Bypass modern endpoint detection and response solutions",
        type: "ctf",
        estimatedTime: "4 hours",
        points: 600
      }
    ]
  },
  {
    level: 6,
    slug: "elite-hacker",
    title: "Elite Hacker",
    description: "Master-level expertise, research 0-days, contribute to the security community",
    longDescription: "You've reached the pinnacle. Research zero-day vulnerabilities, analyze sophisticated malware, and design security architectures. Contribute to the global security community and shape the future of cybersecurity.",
    skills: ["0-Day Research", "Malware Analysis", "Security Architecture"],
    icon: Award,
    color: "from-primary to-primary/70",
    courses: [
      {
        id: "zero-day-research",
        title: "Zero-Day Vulnerability Research",
        description: "Discover and responsibly disclose new vulnerabilities",
        duration: "25 hours",
        lessons: 45,
        difficulty: "Expert"
      },
      {
        id: "malware-analysis",
        title: "Advanced Malware Analysis",
        description: "Reverse engineer sophisticated malware and understand APT tactics",
        duration: "20 hours",
        lessons: 38,
        difficulty: "Expert"
      },
      {
        id: "security-architecture",
        title: "Security Architecture Design",
        description: "Design and implement enterprise security architectures",
        duration: "15 hours",
        lessons: 30,
        difficulty: "Expert"
      }
    ],
    labs: [
      {
        id: "vuln-research",
        title: "Vulnerability Research Lab",
        description: "Find real vulnerabilities in intentionally vulnerable software",
        type: "hands-on",
        estimatedTime: "8 hours",
        points: 1000
      },
      {
        id: "malware-reverse",
        title: "Malware Reverse Engineering",
        description: "Analyze a real-world malware sample",
        type: "hands-on",
        estimatedTime: "6 hours",
        points: 850
      },
      {
        id: "sherlock-investigation",
        title: "Sherlock DFIR Investigation",
        description: "Investigate a complex security incident using digital forensics",
        type: "simulation",
        estimatedTime: "5 hours",
        points: 900,
        link: "/sherlock-course"
      }
    ]
  }
];

export const getCareerPathBySlug = (slug: string): CareerPathData | undefined => {
  return careerPaths.find(path => path.slug === slug);
};

export const getCareerPathByLevel = (level: number): CareerPathData | undefined => {
  return careerPaths.find(path => path.level === level);
};
