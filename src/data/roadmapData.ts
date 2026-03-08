import { LucideIcon, Shield, Globe, Search, Swords, Server, Bug, Lock, Network, FileSearch, Cpu } from "lucide-react";

export interface RoadmapCourse {
  id: string;
  title: string;
  difficulty: "Easy" | "Intermediate" | "Hard";
  type: "Path" | "Professional Certification" | "Add-on";
  link?: string;
}

export interface RoadmapStage {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  courses: RoadmapCourse[];
}

export interface CareerTrack {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  courses: RoadmapCourse[];
}

export const foundationStages: RoadmapStage[] = [
  {
    id: "cs-basics",
    title: "Computer Science Basics",
    description: "Acquire the basic computer science skills required to get started in cyber security.",
    icon: Cpu,
    courses: [
      { id: "pre-security", title: "Pre Security", difficulty: "Easy", type: "Path", link: "/path/script-kiddie" },
      { id: "pre-security-cert", title: "Pre Security (SEC0)", difficulty: "Easy", type: "Professional Certification" },
    ],
  },
  {
    id: "cyber-foundations",
    title: "Cyber Security Foundations",
    description: "Develop cyber security skills needed to enter any career in the industry.",
    icon: Shield,
    courses: [
      { id: "cyber-101", title: "Cyber Security 101", difficulty: "Easy", type: "Path", link: "/path/script-kiddie" },
      { id: "cyber-101-cert", title: "Cyber Security 101 (SEC1)", difficulty: "Intermediate", type: "Professional Certification" },
    ],
  },
  {
    id: "career-skills",
    title: "Cyber Security Career Skills",
    description: "Master the specific skills necessary for your career of interest. Not sure which career path is right for you? Take our career quiz to find out.",
    icon: Search,
    courses: [],
  },
];

export const careerTracks: CareerTrack[] = [
  {
    id: "security-analyst",
    title: "Security Analyst",
    description: "Get on the fast track to becoming a successful Security Analyst.",
    icon: FileSearch,
    color: "from-emerald-500 to-emerald-400",
    courses: [
      { id: "soc-1", title: "SOC Level 1", difficulty: "Easy", type: "Path", link: "/path/security-enthusiast" },
      { id: "sa-level1", title: "Security Analyst Level 1 (SAL1)", difficulty: "Intermediate", type: "Professional Certification" },
      { id: "soc-2", title: "SOC Level 2", difficulty: "Intermediate", type: "Path", link: "/path/junior-pentester" },
      { id: "endpoint-inv", title: "Advanced Endpoint Investigations", difficulty: "Hard", type: "Path", link: "/path/penetration-tester" },
    ],
  },
  {
    id: "penetration-tester",
    title: "Penetration Tester",
    description: "Level up and forge your path to glory as a Penetration Tester.",
    icon: Swords,
    color: "from-red-500 to-red-400",
    courses: [
      { id: "jr-pt", title: "Jr. Penetration Tester", difficulty: "Intermediate", type: "Path", link: "/path/junior-pentester" },
      { id: "jr-pt-cert", title: "Jr. Penetration Tester (PT1)", difficulty: "Intermediate", type: "Professional Certification" },
      { id: "web-fund", title: "Web Fundamentals", difficulty: "Easy", type: "Path", link: "/path/security-enthusiast" },
      { id: "web-app-pt", title: "Web Application Pentesting", difficulty: "Intermediate", type: "Path", link: "/path/penetration-tester" },
      { id: "web-red", title: "Web Application Red Teaming", difficulty: "Hard", type: "Path", link: "/path/senior-pentester" },
      { id: "red-teaming", title: "Red Teaming", difficulty: "Hard", type: "Path", link: "/path/senior-pentester" },
    ],
  },
  {
    id: "security-engineer",
    title: "Security Engineer",
    description: "Navigate your journey to becoming a world-class Security Engineer.",
    icon: Server,
    color: "from-blue-500 to-blue-400",
    courses: [
      { id: "sec-eng", title: "Security Engineer", difficulty: "Intermediate", type: "Path", link: "/path/junior-pentester" },
      { id: "devsecops", title: "DevSecOps", difficulty: "Intermediate", type: "Path", link: "/path/penetration-tester" },
      { id: "attack-aws", title: "Attacking and Defending AWS", difficulty: "Intermediate", type: "Path", link: "/path/senior-pentester" },
    ],
  },
];
