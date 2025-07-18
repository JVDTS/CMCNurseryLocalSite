/**
 * Anti-spam utilities for contact form protection
 */

// Rate limiting storage (in production, use Redis or database)
const submissionCounts = new Map<string, { count: number; resetTime: number }>();
const suspiciousPatterns = new Set<string>();

// Spam detection patterns
const SPAM_KEYWORDS = [
  'bitcoin', 'crypto', 'investment', 'loan', 'credit', 'casino', 'gambling',
  'viagra', 'pharmacy', 'escort', 'dating', 'hookup', 'adult', 'porn',
  'make money', 'work from home', 'get rich', 'free money', 'click here',
  'limited time', 'act now', 'congratulations', 'winner', 'lottery'
];

const URL_REGEX = /https?:\/\/[^\s]+/gi;
const PHONE_REGEX = /[\+]?[1-9][\d]{3,14}/g;

interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
  score: number; // 0-100, higher = more likely spam
}

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  nurseryLocation: string;
  message: string;
  website?: string; // Honeypot
  mathAnswer: number;
  formStartTime: number;
  ipAddress?: string;
}

/**
 * Generate a simple math challenge
 */
export function generateMathChallenge(): { question: string; answer: number } {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operations = ['+', '-'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let answer: number;
  let question: string;
  
  if (operation === '+') {
    answer = num1 + num2;
    question = `What is ${num1} + ${num2}?`;
  } else {
    // Ensure positive result for subtraction
    const larger = Math.max(num1, num2);
    const smaller = Math.min(num1, num2);
    answer = larger - smaller;
    question = `What is ${larger} - ${smaller}?`;
  }
  
  return { question, answer };
}

/**
 * Check if IP has exceeded rate limit
 */
export function checkRateLimit(ipAddress: string): boolean {
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  const maxSubmissions = 5; // Max 5 submissions per hour per IP
  
  const record = submissionCounts.get(ipAddress);
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    submissionCounts.set(ipAddress, { count: 1, resetTime: now + hourInMs });
    return true;
  }
  
  if (record.count >= maxSubmissions) {
    return false; // Rate limit exceeded
  }
  
  record.count++;
  return true;
}

/**
 * Check for honeypot field
 */
function checkHoneypot(website?: string): SpamCheckResult {
  if (website && website.length > 0) {
    return {
      isSpam: true,
      reason: 'Honeypot field filled',
      score: 100
    };
  }
  return { isSpam: false, score: 0 };
}

/**
 * Check form submission timing
 */
function checkTiming(formStartTime: number): SpamCheckResult {
  const submissionTime = Date.now() - formStartTime;
  const minTime = 3000; // Minimum 3 seconds
  const maxTime = 30 * 60 * 1000; // Maximum 30 minutes
  
  if (submissionTime < minTime) {
    return {
      isSpam: true,
      reason: 'Form submitted too quickly',
      score: 90
    };
  }
  
  if (submissionTime > maxTime) {
    return {
      isSpam: true,
      reason: 'Form submission took too long',
      score: 70
    };
  }
  
  return { isSpam: false, score: 0 };
}

/**
 * Check message content for spam patterns
 */
function checkContent(message: string, name: string, email: string): SpamCheckResult {
  let score = 0;
  const reasons: string[] = [];
  
  const lowerMessage = message.toLowerCase();
  const lowerName = name.toLowerCase();
  
  // Check for spam keywords
  const spamWordCount = SPAM_KEYWORDS.filter(keyword => 
    lowerMessage.includes(keyword) || lowerName.includes(keyword)
  ).length;
  
  if (spamWordCount > 0) {
    score += spamWordCount * 20;
    reasons.push(`Contains ${spamWordCount} spam keyword(s)`);
  }
  
  // Check for excessive URLs
  const urls = message.match(URL_REGEX) || [];
  if (urls.length > 2) {
    score += urls.length * 15;
    reasons.push(`Contains ${urls.length} URLs`);
  }
  
  // Check for excessive phone numbers
  const phones = message.match(PHONE_REGEX) || [];
  if (phones.length > 1) {
    score += phones.length * 10;
    reasons.push(`Contains ${phones.length} phone numbers`);
  }
  
  // Check for repetitive text
  const words = message.split(/\s+/);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const repetitionRatio = uniqueWords.size / words.length;
  
  if (repetitionRatio < 0.3 && words.length > 10) {
    score += 30;
    reasons.push('Highly repetitive text');
  }
  
  // Check for suspicious email patterns
  if (email.includes('+') || email.split('@')[0].length < 3) {
    score += 15;
    reasons.push('Suspicious email pattern');
  }
  
  // Check for all caps
  const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
  if (capsRatio > 0.7 && message.length > 20) {
    score += 25;
    reasons.push('Excessive capital letters');
  }
  
  return {
    isSpam: score >= 50,
    reason: reasons.join(', '),
    score: Math.min(score, 100)
  };
}

/**
 * Comprehensive spam check
 */
export function checkSpam(data: ContactFormData): SpamCheckResult {
  // Check honeypot
  const honeypotResult = checkHoneypot(data.website);
  if (honeypotResult.isSpam) return honeypotResult;
  
  // Check timing
  const timingResult = checkTiming(data.formStartTime);
  if (timingResult.isSpam) return timingResult;
  
  // Check content
  const contentResult = checkContent(data.message, data.name, data.email);
  if (contentResult.isSpam) return contentResult;
  
  // Calculate overall score
  const totalScore = timingResult.score + contentResult.score;
  
  return {
    isSpam: totalScore >= 50,
    reason: contentResult.reason,
    score: totalScore
  };
}

/**
 * Clean up old rate limit records (call periodically)
 */
export function cleanupRateLimitRecords(): void {
  const now = Date.now();
  for (const [ip, record] of submissionCounts.entries()) {
    if (now > record.resetTime) {
      submissionCounts.delete(ip);
    }
  }
}

// Clean up every hour
setInterval(cleanupRateLimitRecords, 60 * 60 * 1000);