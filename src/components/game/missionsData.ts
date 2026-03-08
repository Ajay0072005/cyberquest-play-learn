import { MissionId } from "./GameTypes";

export interface MissionData {
  id: MissionId;
  title: string;
  description: string;
  objective: string;
  location: string;
  xpReward: number;
  puzzle: PuzzleData;
}

export interface PuzzleData {
  type: "phishing" | "network" | "password" | "malware" | "final";
  question: string;
  context: string;
  options: { label: string; correct: boolean; feedback: string }[];
}

export const missions: MissionData[] = [
  {
    id: "phishing",
    title: "Mission 1: Phishing Investigation",
    description: "An employee reported a suspicious email. Investigate the office terminal to analyze it.",
    objective: "Enter the Office Building and analyze the suspicious email",
    location: "Office Building",
    xpReward: 100,
    puzzle: {
      type: "phishing",
      question: "Which indicator confirms this is a phishing email?",
      context: `FROM: security@g00gle-support.com\nTO: employee@company.com\nSUBJECT: URGENT: Your account will be suspended!\n\nDear User,\n\nYour Google account has been compromised. Click the link below immediately to verify your identity or your account will be permanently deleted within 24 hours.\n\nhttps://g00gle-security-verify.suspicious-site.com/login\n\nGoogle Security Team`,
      options: [
        { label: "The sender domain 'g00gle-support.com' uses zero instead of 'o'", correct: true, feedback: "Correct! Attackers often use lookalike domains with character substitution." },
        { label: "The email mentions Google", correct: false, feedback: "Mentioning a real company name alone isn't an indicator — phishing emails impersonate real brands." },
        { label: "The email has a subject line", correct: false, feedback: "All emails have subject lines. Look for urgency tactics and suspicious domains." },
        { label: "The email is addressed to an employee", correct: false, feedback: "Being addressed to an employee is normal. Focus on the sender and link URLs." },
      ],
    },
  },
  {
    id: "network",
    title: "Mission 2: Network Intrusion",
    description: "Unusual traffic detected on the network. Inspect the server room logs.",
    objective: "Enter the Server Room and identify the suspicious connection",
    location: "Server Room",
    xpReward: 150,
    puzzle: {
      type: "network",
      question: "Which IP address is the attacker's command & control server?",
      context: `=== NETWORK LOG ===\n[14:01:03] 192.168.1.10 -> 8.8.8.8 (DNS query, normal)\n[14:01:05] 192.168.1.25 -> 104.26.10.5 (HTTPS, company website)\n[14:01:08] 192.168.1.42 -> 185.220.101.34 (TCP:4444, 500MB outbound)\n[14:01:09] 192.168.1.15 -> 172.217.14.110 (HTTPS, Google)\n[14:01:12] 192.168.1.42 -> 185.220.101.34 (TCP:4444, encrypted payload)`,
      options: [
        { label: "8.8.8.8 — DNS server", correct: false, feedback: "This is Google's public DNS server — completely normal traffic." },
        { label: "185.220.101.34 — Unknown, port 4444", correct: true, feedback: "Correct! Port 4444 is commonly used by Metasploit/reverse shells, and the large data exfiltration is suspicious." },
        { label: "104.26.10.5 — Company website", correct: false, feedback: "This is normal HTTPS traffic to the company website." },
        { label: "172.217.14.110 — Google", correct: false, feedback: "This is a legitimate Google IP address with normal HTTPS traffic." },
      ],
    },
  },
  {
    id: "password",
    title: "Mission 3: Password Security",
    description: "The digital vault's password policy needs upgrading. Test password strength.",
    objective: "Enter the Digital Vault and solve the password puzzle",
    location: "Digital Vault",
    xpReward: 125,
    puzzle: {
      type: "password",
      question: "Which password is the MOST secure?",
      context: `=== PASSWORD AUDIT REPORT ===\nThe following passwords were found in the system.\nIdentify which one meets enterprise security standards:\n\n• Minimum 12 characters\n• Mix of uppercase, lowercase, numbers, symbols\n• No dictionary words or common patterns`,
      options: [
        { label: "Password123!", correct: false, feedback: "This uses a common dictionary word with predictable substitutions — easily cracked." },
        { label: "Kj#9xL!mQ2$vNp", correct: true, feedback: "Correct! This is a strong random password with good length and character variety." },
        { label: "qwerty2024", correct: false, feedback: "This combines a keyboard pattern with a year — one of the most commonly cracked passwords." },
        { label: "admin@company", correct: false, feedback: "This contains predictable words and is a common default credential pattern." },
      ],
    },
  },
  {
    id: "malware",
    title: "Mission 4: Malware Lab",
    description: "Infected machines detected. Analyze the processes to find the malware.",
    objective: "Enter the Malware Lab and identify the malicious process",
    location: "Malware Lab",
    xpReward: 175,
    puzzle: {
      type: "malware",
      question: "Which process is the malware?",
      context: `=== TASK MANAGER — INFECTED MACHINE ===\nPID    NAME                CPU    MEM     STATUS\n1024   explorer.exe        2%     45MB    Running\n2048   chrome.exe          15%    320MB   Running\n3072   svchost.exe         1%     28MB    Running\n4096   svch0st.exe         89%    890MB   Running\n5120   notepad.exe         0%     12MB    Running`,
      options: [
        { label: "explorer.exe (PID 1024)", correct: false, feedback: "This is the legitimate Windows Explorer process with normal resource usage." },
        { label: "chrome.exe (PID 2048)", correct: false, feedback: "Chrome is a legitimate browser — its memory usage is normal." },
        { label: "svch0st.exe (PID 4096)", correct: true, feedback: "Correct! Notice 'svch0st' uses a zero instead of 'o'. It's impersonating svchost.exe with abnormal CPU/memory usage." },
        { label: "svchost.exe (PID 3072)", correct: false, feedback: "This is the legitimate Windows service host with normal resource usage." },
      ],
    },
  },
  {
    id: "final",
    title: "Final Mission: Hacker Hideout",
    description: "You've tracked the attacker to their hideout. Shut down their C2 server.",
    objective: "Enter the Hacker Hideout and shut down the command server",
    location: "Hacker Hideout",
    xpReward: 250,
    puzzle: {
      type: "final",
      question: "What command safely shuts down the C2 server and preserves evidence?",
      context: `=== HACKER C2 SERVER TERMINAL ===\nYou've gained access to the attacker's command & control server.\nActive connections: 47 compromised machines\nData exfiltration in progress...\n\nYou need to stop the server while preserving forensic evidence.`,
      options: [
        { label: "rm -rf / (Delete everything)", correct: false, feedback: "This destroys all evidence! Never delete data during an active investigation." },
        { label: "shutdown -h now (Immediate shutdown)", correct: false, feedback: "A hard shutdown may corrupt volatile memory evidence needed for forensics." },
        { label: "iptables -A INPUT -j DROP && dd if=/dev/sda of=evidence.img", correct: true, feedback: "Correct! Block all connections first to stop exfiltration, then create a forensic disk image." },
        { label: "Unplug the network cable", correct: false, feedback: "Physical disconnection is crude and may trigger anti-forensics scripts on the server." },
      ],
    },
  },
];
