import { StoryMissionData } from './StoryMission';

export const storyMissions: StoryMissionData[] = [
  {
    id: 'ransomware-outbreak',
    title: 'Operation Dark Cipher',
    category: 'Incident Response',
    difficulty: 'Intermediate',
    duration: '25-35 min',
    description: 'A ransomware attack has hit a major healthcare organization. Lead the incident response, make critical decisions, and learn how choices impact real organizations.',
    backgroundStory: 'MedCare Health Systems, a hospital network serving 500,000 patients, has detected unusual activity on their network. Employees are reporting files with strange extensions and ransom notes appearing on screens. The clock is ticking, and every decision matters.',
    points: 300,
    roles: {
      analyst: {
        description: 'Investigate the attack vectors, analyze the malware, and trace the threat actors.',
        focus: 'Forensic Analysis'
      },
      attacker: {
        description: 'Understand how the ransomware operators planned and executed the attack.',
        focus: 'Attack Methodology'
      },
      defender: {
        description: 'Lead the containment, eradication, and recovery efforts.',
        focus: 'Incident Response'
      }
    },
    startScene: 'discovery',
    scenes: {
      discovery: {
        id: 'discovery',
        title: 'The Discovery',
        narration: 'Monday, 6:47 AM. Your phone buzzes with an urgent alert from the Security Operations Center. Multiple endpoints across the East Wing medical records department are showing signs of file encryption. The hospital\'s CISO has called an emergency meeting. As you enter the war room, the tension is palpable. The CFO mentions that the attackers are demanding $5 million in Bitcoin, threatening to leak patient data if not paid within 72 hours.',
        decisionPoint: {
          id: 'initial-response',
          situation: 'The CEO asks for your immediate recommendation. How should we respond?',
          context: 'The hospital cannot afford extended downtime - critical patient care systems are at risk.',
          options: [
            {
              id: 'isolate',
              text: 'Immediately isolate affected systems and begin forensic investigation',
              consequence: 'Good call! Isolation prevents further spread while preserving evidence.',
              impact: { detection: 30, dataLoss: -10, businessImpact: 20 },
              nextScene: 'investigation',
              isOptimal: true
            },
            {
              id: 'negotiate',
              text: 'Open communication with attackers to buy time while we assess the situation',
              consequence: 'Risky move. Engaging attackers could encourage them, but it does buy time.',
              impact: { detection: 10, dataLoss: 10, businessImpact: 10 },
              nextScene: 'negotiation'
            },
            {
              id: 'shutdown',
              text: 'Initiate complete network shutdown to stop the attack',
              consequence: 'This stops the spread but causes massive disruption to patient care.',
              impact: { detection: 20, dataLoss: -20, businessImpact: 50 },
              nextScene: 'shutdown'
            }
          ]
        }
      },
      investigation: {
        id: 'investigation',
        title: 'The Investigation',
        narration: 'Your team isolates the affected systems and begins analysis. The SOC analyst discovers that the initial infection came through a phishing email sent to a radiology technician three weeks ago. The attackers have been living in the network, mapping systems and exfiltrating data before deploying the ransomware. You find evidence of lateral movement using compromised admin credentials.',
        decisionPoint: {
          id: 'investigation-path',
          situation: 'With limited time, what should the team prioritize?',
          context: 'You have 3 analysts available and multiple leads to follow.',
          options: [
            {
              id: 'creds',
              text: 'Focus on identifying all compromised credentials and forcing resets',
              consequence: 'Smart priority. This cuts off attacker access but may alert them.',
              impact: { detection: 20, dataLoss: -15, businessImpact: 10 },
              nextScene: 'credential-reset',
              isOptimal: true
            },
            {
              id: 'backup',
              text: 'Verify backup integrity and prepare recovery procedures',
              consequence: 'Important for recovery, but doesn\'t address the active threat.',
              impact: { detection: 5, dataLoss: 5, businessImpact: -20 },
              nextScene: 'backup-check'
            },
            {
              id: 'track',
              text: 'Track the data exfiltration to understand what was stolen',
              consequence: 'Valuable intel for disclosure requirements, but time-consuming.',
              impact: { detection: 15, dataLoss: 10, businessImpact: 5 },
              nextScene: 'exfil-analysis'
            }
          ]
        }
      },
      negotiation: {
        id: 'negotiation',
        title: 'Dangerous Dialogue',
        narration: 'You establish contact with the threat actors through their dark web portal. They respond quickly, clearly monitoring their operation. They provide a "sample" decryption of a few files to prove they have the keys. During the conversation, they mention knowing about the hospital\'s cyber insurance policy - suggesting they\'ve done extensive reconnaissance.',
        decisionPoint: {
          id: 'negotiation-decision',
          situation: 'The attackers are getting impatient. What\'s your next move?',
          context: 'Legal counsel advises that payment could violate sanctions if the group is on OFAC lists.',
          options: [
            {
              id: 'stall',
              text: 'Continue negotiating while secretly preparing systems for recovery',
              consequence: 'Good strategy if your backups are intact. Buys crucial time.',
              impact: { detection: 10, dataLoss: 5, businessImpact: 0 },
              nextScene: 'backup-check',
              isOptimal: true
            },
            {
              id: 'pay',
              text: 'Recommend paying the ransom to minimize patient care disruption',
              consequence: 'The decryption key works, but you\'ve now funded criminal operations.',
              impact: { detection: -10, dataLoss: -30, businessImpact: -20 },
              nextScene: 'aftermath-paid'
            }
          ]
        }
      },
      shutdown: {
        id: 'shutdown',
        title: 'Lights Out',
        narration: 'The complete network shutdown stops the ransomware from spreading further, but the impact is immediate and severe. Emergency room systems go offline, surgeries are delayed, and the hospital has to divert ambulances to other facilities. The local news picks up the story within hours. While your security team works around the clock, the hospital faces mounting pressure.',
        decisionPoint: {
          id: 'recovery-approach',
          situation: 'With the network down, how do you prioritize recovery?',
          context: 'Life-critical systems must come back first, but those are also the most targeted.',
          options: [
            {
              id: 'critical-first',
              text: 'Restore life-critical systems first with enhanced monitoring',
              consequence: 'Right priority. Patient care must come first, but watch for reinfection.',
              impact: { detection: 25, dataLoss: 0, businessImpact: -30 },
              nextScene: 'recovery',
              isOptimal: true
            },
            {
              id: 'clean-build',
              text: 'Rebuild all systems from scratch before bringing anything online',
              consequence: 'Most secure approach but could take weeks. More patients may suffer.',
              impact: { detection: 30, dataLoss: -40, businessImpact: 60 },
              nextScene: 'slow-recovery'
            }
          ]
        }
      },
      'credential-reset': {
        id: 'credential-reset',
        title: 'Cutting Access',
        narration: 'Your team executes a coordinated credential reset across all administrative accounts. The SIEM immediately shows the attackers attempting to use old credentials - confirming they\'re still in the network. You\'ve cut off their primary access method. The ransomware deployment appears to have stopped. Now you need to clean up.',
        decisionPoint: {
          id: 'cleanup',
          situation: 'The immediate threat is contained. What\'s next?',
          context: 'Some encrypted systems contain critical patient data.',
          options: [
            {
              id: 'restore',
              text: 'Begin restoring from last known good backups with verification',
              consequence: 'Backups from 24 hours ago are clean. Most data recovered successfully.',
              impact: { detection: 10, dataLoss: -25, businessImpact: -15 },
              nextScene: 'recovery',
              isOptimal: true
            },
            {
              id: 'preserve',
              text: 'Preserve all systems for law enforcement forensics first',
              consequence: 'Good for prosecution but extends downtime significantly.',
              impact: { detection: 15, dataLoss: 10, businessImpact: 20 },
              nextScene: 'forensics'
            }
          ]
        }
      },
      'backup-check': {
        id: 'backup-check',
        title: 'The Last Line of Defense',
        narration: 'Your backup administrator delivers mixed news: the daily backups from the past 5 days are compromised - the attackers deleted the accessible backups. However, the off-site tape backups from 2 weeks ago are intact. You can recover most data, but 2 weeks of patient records will need to be recreated manually from paper records.',
        decisionPoint: {
          id: 'backup-decision',
          situation: 'How do you proceed with recovery?',
          context: 'The 2-week data gap affects thousands of patient records.',
          options: [
            {
              id: 'proceed',
              text: 'Proceed with off-site backup restoration and manual data recovery',
              consequence: 'Time-consuming but clean. Staff will work overtime to rebuild records.',
              impact: { detection: 5, dataLoss: 20, businessImpact: 10 },
              nextScene: 'recovery',
              isOptimal: true
            },
            {
              id: 'hybrid',
              text: 'Try to recover what you can from compromised backups after scanning',
              consequence: 'Risk of reinfection, but could reduce data loss. Dangerous gamble.',
              impact: { detection: -15, dataLoss: 0, businessImpact: 5 },
              nextScene: 'reinfection'
            }
          ]
        }
      },
      'exfil-analysis': {
        id: 'exfil-analysis',
        title: 'Following the Trail',
        narration: 'Network forensics reveals the attackers exfiltrated approximately 340GB of data over the past two weeks. The stolen data includes: patient medical records (PHI), insurance claims and financial data, employee information including SSNs, and research data from clinical trials. This will require breach notification to over 200,000 individuals.',
        decisionPoint: {
          id: 'disclosure',
          situation: 'Legal is pressuring for a decision on public disclosure.',
          context: 'HIPAA requires notification, but timing matters for patient trust.',
          options: [
            {
              id: 'immediate',
              text: 'Prepare immediate disclosure to affected individuals and HHS',
              consequence: 'Transparent approach. Patients appreciate honesty, but stock drops 15%.',
              impact: { detection: 5, dataLoss: 0, businessImpact: 15 },
              nextScene: 'recovery'
            },
            {
              id: 'investigate-first',
              text: 'Delay disclosure until full scope is understood (within legal limits)',
              consequence: 'Legally acceptable. More complete disclosure but some criticize the delay.',
              impact: { detection: 5, dataLoss: 5, businessImpact: 10 },
              nextScene: 'recovery',
              isOptimal: true
            }
          ]
        }
      },
      forensics: {
        id: 'forensics',
        title: 'Evidence First',
        narration: 'FBI Cyber Division arrives to collect evidence. They image all affected systems and identify the ransomware variant as LockBit 3.0, operated by a known Russian-speaking group. The investigation reveals the attackers spent 18 days in the network before detonating the ransomware. The evidence will support potential future prosecution, but the hospital remains partially offline.',
        decisionPoint: {
          id: 'post-forensics',
          situation: 'FBI work is complete. How do you rebuild?',
          context: 'The board is anxious about continued downtime.',
          options: [
            {
              id: 'accelerate',
              text: 'Accelerate recovery with all available resources',
              consequence: 'Systems restored in 72 hours. Some minor issues missed in the rush.',
              impact: { detection: 0, dataLoss: 5, businessImpact: -20 },
              nextScene: 'aftermath'
            },
            {
              id: 'methodical',
              text: 'Maintain methodical approach with security verification at each step',
              consequence: 'Slower but cleaner. No reinfection and lessons properly documented.',
              impact: { detection: 10, dataLoss: 0, businessImpact: 0 },
              nextScene: 'aftermath',
              isOptimal: true
            }
          ]
        }
      },
      reinfection: {
        id: 'reinfection',
        title: 'History Repeats',
        narration: '48 hours after beginning recovery, your nightmare scenario unfolds. The ransomware reactivates from a hidden loader in the "cleaned" backup. Systems that took days to recover are encrypted again. The attackers mock your efforts in a new ransom note, demanding double the original amount. Staff morale plummets.',
        decisionPoint: {
          id: 'second-chance',
          situation: 'You have to start over. What\'s the approach this time?',
          context: 'The board is furious. Your job may be on the line.',
          options: [
            {
              id: 'clean-only',
              text: 'Use only verified clean off-site backups and rebuild from scratch',
              consequence: 'The only safe path forward. Lessons learned the hard way.',
              impact: { detection: 15, dataLoss: 30, businessImpact: 40 },
              nextScene: 'recovery',
              isOptimal: true
            }
          ]
        }
      },
      'slow-recovery': {
        id: 'slow-recovery',
        title: 'The Long Road',
        narration: 'The complete rebuild takes 3 weeks. During this time, the hospital operates on paper records and manual processes. Several patients are transferred to other facilities. The financial impact exceeds $20 million. However, when systems finally come back online, they\'re hardened with new security controls. The attack surface is dramatically reduced.',
        isEnding: true
      },
      'aftermath-paid': {
        id: 'aftermath-paid',
        title: 'The Price of Convenience',
        narration: 'The decryption keys work, and systems are restored within 48 hours. But the aftermath haunts the organization. Cyber insurance premiums triple. The attack group targets you again 6 months later, knowing you\'ll pay. Patient trust never fully recovers. Internal reports reveal the attackers still had backdoors even after decryption.',
        isEnding: true
      },
      recovery: {
        id: 'recovery',
        title: 'Light at the End',
        narration: 'After days of intense work, critical systems are back online. The ER is accepting patients again. The incident response team is exhausted but proud. The CISO presents a post-incident security roadmap to the board, including EDR deployment, network segmentation, and enhanced backup procedures. The hard lessons are being converted into lasting improvements.',
        isEnding: true
      },
      aftermath: {
        id: 'aftermath',
        title: 'Lessons in Digital Resilience',
        narration: 'Three months later, MedCare Health Systems has transformed its security posture. The incident led to a complete security overhaul: 24/7 SOC monitoring, zero-trust architecture, and regular tabletop exercises. While the attack cost millions, it may have prevented a far worse future breach. The CISO\'s presentation at a healthcare security conference helps other organizations learn from MedCare\'s experience.',
        isEnding: true
      }
    },
    incidentSummary: {
      attackTimeline: [
        'Day 0: Phishing email delivered to radiology technician',
        'Day 1-3: Initial access established, reconnaissance begins',
        'Day 4-10: Lateral movement, privilege escalation to domain admin',
        'Day 11-18: Data exfiltration of 340GB of sensitive data',
        'Day 19: Ransomware deployed across 847 endpoints',
        'Day 19: Ransom demand of $5M in Bitcoin issued',
        'Day 19-26: Incident response and recovery operations'
      ],
      rootCause: 'The initial compromise occurred through a spear-phishing email containing a malicious macro-enabled document. The employee had not received recent security awareness training. Once inside, attackers exploited weak network segmentation and a single domain admin account with no MFA, allowing rapid lateral movement.',
      mitigation: [
        'Isolated all affected network segments',
        'Reset all privileged credentials',
        'Deployed EDR on all endpoints',
        'Restored critical systems from verified backups',
        'Engaged law enforcement and forensic investigators'
      ],
      prevention: [
        'Implement phishing-resistant MFA for all accounts',
        'Deploy network segmentation and zero-trust architecture',
        'Enhance email security with sandboxing and link analysis',
        'Maintain immutable off-site backups with regular testing',
        'Conduct regular security awareness training and phishing simulations',
        'Establish 24/7 security monitoring with rapid response capability'
      ],
      lessonsLearned: 'This incident demonstrated that ransomware attacks are multi-week operations, not single events. The 18-day dwell time before ransomware deployment shows the importance of proactive threat hunting. Organizations must assume breach and focus on detection, containment, and recovery capabilities alongside prevention.'
    }
  }
];
