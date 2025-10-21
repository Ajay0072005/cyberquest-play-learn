import { useState, useEffect, useRef } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/context/GameContext';
import { useToast } from '@/hooks/use-toast';
import { Terminal as TerminalIcon, Award } from 'lucide-react';

interface TerminalLine {
  text: string;
  type: 'command' | 'output' | 'error' | 'success';
}

const Terminal = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: 'Welcome to CyberQuest Terminal Challenge!', type: 'success' },
    { text: 'Your mission: Navigate the system and find the hidden flag.', type: 'output' },
    { text: 'Available commands: ls, cd, cat, pwd, help, clear', type: 'output' },
    { text: '', type: 'output' },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentPath, setCurrentPath] = useState('/home/hacker');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [foundFlags, setFoundFlags] = useState<Set<string>>(new Set());
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addPoints } = useGame();
  const { toast } = useToast();

  const fileSystem: Record<string, any> = {
    '/home/hacker': {
      type: 'directory',
      files: {
        'readme.txt': {
          type: 'file',
          content: 'Welcome to the CyberQuest Terminal! Start exploring to find hidden flags.\nTip: Try checking the /var/log directory for interesting files.',
        },
        '.hidden': {
          type: 'file',
          content: 'Congratulations! You found a hidden file!\nFlag: FLAG{hidden_files_r_cool}\nPoints: 50',
          flag: 'FLAG{hidden_files_r_cool}',
          points: 50,
        },
        'notes.txt': {
          type: 'file',
          content: 'Remember to check the /etc/passwd file for user information.',
        },
      },
    },
    '/var': {
      type: 'directory',
      files: {
        'log': {
          type: 'directory',
          files: {
            'access.log': {
              type: 'file',
              content: '192.168.1.100 - [20/Jan/2025] "GET /admin HTTP/1.1" 200\n192.168.1.101 - [20/Jan/2025] "POST /login HTTP/1.1" 401\n192.168.1.102 - [20/Jan/2025] "GET /flag.txt HTTP/1.1" 200\nHint: Check /tmp for suspicious files.',
            },
            'error.log': {
              type: 'file',
              content: 'Error: Unauthorized access attempt detected.\nError: Failed login for user: admin\nNote: Security key stored in /root/.secret\n\nFlag: FLAG{log_analysis_master}\nPoints: 60',
              flag: 'FLAG{log_analysis_master}',
              points: 60,
            },
          },
        },
      },
    },
    '/etc': {
      type: 'directory',
      files: {
        'passwd': {
          type: 'file',
          content: 'root:x:0:0:root:/root:/bin/bash\nhacker:x:1000:1000:CyberQuest User:/home/hacker:/bin/bash\nadmin:x:1001:1001:Admin:/home/admin:/bin/bash\nFlag: FLAG{system_files_exposed}\nPoints: 75',
          flag: 'FLAG{system_files_exposed}',
          points: 75,
        },
        'hosts': {
          type: 'file',
          content: '127.0.0.1 localhost\n10.0.0.1 internal-server\n192.168.1.50 suspicious-host',
        },
      },
    },
    '/tmp': {
      type: 'directory',
      files: {
        'backup.tar.gz': {
          type: 'file',
          content: 'Compressed backup file. Contains sensitive data.\nFlag: FLAG{backups_are_treasure}\nPoints: 100',
          flag: 'FLAG{backups_are_treasure}',
          points: 100,
        },
      },
    },
    '/root': {
      type: 'directory',
      files: {
        '.secret': {
          type: 'file',
          content: 'TOP SECRET: Master Key\nBase64: Q3liZXJRdWVzdDIwMjU=\nFlag: FLAG{root_access_granted}\nPoints: 150',
          flag: 'FLAG{root_access_granted}',
          points: 150,
        },
      },
    },
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getDirectoryContents = (path: string) => {
    if (!fileSystem[path]) return null;
    return fileSystem[path].files || {};
  };

  const getFileContent = (path: string, filename: string) => {
    const dir = fileSystem[path];
    if (!dir || !dir.files || !dir.files[filename]) return null;
    return dir.files[filename];
  };

  const executeCommand = (command: string) => {
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    setLines(prev => [...prev, { text: `${currentPath} $ ${command}`, type: 'command' }]);

    switch (cmd) {
      case 'help':
        setLines(prev => [
          ...prev,
          { text: 'Available commands:', type: 'output' },
          { text: '  ls [path]       - List directory contents', type: 'output' },
          { text: '  cd <path>       - Change directory', type: 'output' },
          { text: '  cat <file>      - Display file contents', type: 'output' },
          { text: '  pwd             - Print working directory', type: 'output' },
          { text: '  clear           - Clear terminal', type: 'output' },
          { text: '  help            - Show this help message', type: 'output' },
          { text: '', type: 'output' },
        ]);
        break;

      case 'clear':
        setLines([]);
        break;

      case 'pwd':
        setLines(prev => [...prev, { text: currentPath, type: 'output' }, { text: '', type: 'output' }]);
        break;

      case 'ls':
        const lsPath = args[0] || currentPath;
        const contents = getDirectoryContents(lsPath);
        if (contents) {
          const fileList = Object.keys(contents).sort((a, b) => {
            const aIsDir = contents[a].type === 'directory';
            const bIsDir = contents[b].type === 'directory';
            if (aIsDir && !bIsDir) return -1;
            if (!aIsDir && bIsDir) return 1;
            return a.localeCompare(b);
          });
          
          if (fileList.length === 0) {
            setLines(prev => [...prev, { text: 'Directory is empty', type: 'output' }, { text: '', type: 'output' }]);
          } else {
            const displayLines = fileList.map(file => {
              const isDir = contents[file].type === 'directory';
              const color = isDir ? '\x1b[34m' : '\x1b[0m';
              const suffix = isDir ? '/' : '';
              return file.startsWith('.') 
                ? `${file}${suffix}` 
                : `${file}${suffix}`;
            });
            setLines(prev => [...prev, ...displayLines.map(line => ({ text: line, type: 'output' as const })), { text: '', type: 'output' }]);
          }
        } else {
          setLines(prev => [...prev, { text: `ls: cannot access '${lsPath}': No such directory`, type: 'error' }, { text: '', type: 'output' }]);
        }
        break;

      case 'cd':
        if (!args[0]) {
          setCurrentPath('/home/hacker');
        } else if (args[0] === '..') {
          // Go up one directory
          const pathParts = currentPath.split('/').filter(p => p);
          if (pathParts.length > 0) {
            pathParts.pop();
            const newPath = '/' + pathParts.join('/');
            setCurrentPath(newPath || '/');
          }
        } else {
          const newPath = args[0].startsWith('/') ? args[0] : `${currentPath}/${args[0]}`;
          if (fileSystem[newPath]) {
            setCurrentPath(newPath);
          } else {
            setLines(prev => [...prev, { text: `cd: ${args[0]}: No such directory`, type: 'error' }, { text: '', type: 'output' }]);
          }
        }
        break;

      case 'cat':
        if (!args[0]) {
          setLines(prev => [...prev, { text: 'cat: missing file operand', type: 'error' }, { text: '', type: 'output' }]);
        } else {
          const file = getFileContent(currentPath, args[0]);
          if (file && file.type === 'file') {
            const contentLines = file.content.split('\n');
            setLines(prev => [...prev, ...contentLines.map((line: string) => ({ text: line, type: 'output' as const })), { text: '', type: 'output' }]);
            
            // Check for flags
            if (file.flag && !foundFlags.has(file.flag)) {
              setFoundFlags(prev => new Set([...prev, file.flag]));
              addPoints(file.points);
              toast({
                title: "🎉 Flag Captured!",
                description: `You found ${file.flag} and earned ${file.points} points!`,
              });
              setLines(prev => [...prev, { text: `✓ Flag captured: ${file.flag} (+${file.points} points)`, type: 'success' }, { text: '', type: 'output' }]);
            }
          } else if (file && file.type === 'directory') {
            setLines(prev => [...prev, { text: `cat: ${args[0]}: Is a directory`, type: 'error' }, { text: '', type: 'output' }]);
          } else {
            setLines(prev => [...prev, { text: `cat: ${args[0]}: No such file`, type: 'error' }, { text: '', type: 'output' }]);
          }
        }
        break;

      default:
        if (command.trim()) {
          setLines(prev => [...prev, { text: `Command not found: ${cmd}. Type 'help' for available commands.`, type: 'error' }, { text: '', type: 'output' }]);
        }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    setCommandHistory(prev => [...prev, currentInput]);
    setHistoryIndex(-1);
    executeCommand(currentInput);
    setCurrentInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const totalFlags = 5;
  const progress = (foundFlags.size / totalFlags) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-cyber font-bold mb-4 cyber-glow flex items-center justify-center gap-3">
              <TerminalIcon className="h-10 w-10" />
              Terminal Challenge
            </h1>
            <p className="text-xl text-muted-foreground">
              Master Linux commands and find hidden flags
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="cyber-bg border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Flags Found</span>
                    <span className="font-bold">{foundFlags.size}/{totalFlags}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-bg border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Current Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-sm text-primary font-mono">{currentPath}</code>
              </CardContent>
            </Card>

            <Card className="cyber-bg border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Captured Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {Array.from(foundFlags).map((flag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      ✓
                    </Badge>
                  ))}
                  {Array.from({ length: totalFlags - foundFlags.size }).map((_, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs opacity-30">
                      ?
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="cyber-bg border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg font-mono">root@cyberquest:~#</CardTitle>
              <CardDescription>
                Type 'help' to see available commands. Find all hidden flags to complete the challenge!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="bg-black/90 rounded-lg p-4 font-mono text-sm min-h-[500px] max-h-[500px] overflow-y-auto"
                onClick={() => inputRef.current?.focus()}
              >
                {lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`${
                      line.type === 'command' 
                        ? 'text-cyan-400' 
                        : line.type === 'error' 
                        ? 'text-red-400' 
                        : line.type === 'success'
                        ? 'text-green-400'
                        : 'text-gray-300'
                    } whitespace-pre-wrap`}
                  >
                    {line.text}
                  </div>
                ))}
                
                <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
                  <span className="text-green-400">{currentPath} $</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none text-white caret-white"
                    autoFocus
                    spellCheck={false}
                  />
                </form>
                <div ref={terminalEndRef} />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-bg border-primary/30 mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Mission Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className={foundFlags.has('FLAG{hidden_files_r_cool}') ? 'line-through opacity-50' : ''}>
                  ✓ Find the hidden file in the home directory
                </li>
                <li className={foundFlags.has('FLAG{log_analysis_master}') ? 'line-through opacity-50' : ''}>
                  ✓ Analyze system log files for clues
                </li>
                <li className={foundFlags.has('FLAG{system_files_exposed}') ? 'line-through opacity-50' : ''}>
                  ✓ Examine system configuration files
                </li>
                <li className={foundFlags.has('FLAG{backups_are_treasure}') ? 'line-through opacity-50' : ''}>
                  ✓ Locate the backup file
                </li>
                <li className={foundFlags.has('FLAG{root_access_granted}') ? 'line-through opacity-50' : ''}>
                  ✓ Access the root directory
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Terminal;