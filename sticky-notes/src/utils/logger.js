// Centralized Logger for Sticky Notes Application
// Provides structured logging with different levels and environments

class Logger {
  constructor() {
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4
    };

    // Set log level based on environment
    this.currentLevel = this.getLogLevel();
    
    // Enable colors in development
    this.colors = {
      ERROR: '#ff4757',
      WARN: '#ffa502',
      INFO: '#3498db',
      DEBUG: '#9b59b6',
      TRACE: '#95a5a6'
    };
  }

  getLogLevel() {
    const env = import.meta.env?.MODE || process.env?.NODE_ENV || 'development';
    
    switch (env) {
      case 'production':
        return this.levels.ERROR;
      case 'test':
        return this.levels.WARN;
      default:
        return this.levels.DEBUG;
    }
  }

  shouldLog(level) {
    return level <= this.currentLevel;
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const levelName = Object.keys(this.levels)[level];
    
    let formatted = `[${timestamp}] [${levelName}] ${message}`;
    
    if (data) {
      if (typeof data === 'object') {
        formatted += '\n' + JSON.stringify(data, null, 2);
      } else {
        formatted += ` ${data}`;
      }
    }
    
    return formatted;
  }

  log(level, message, data = null) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, data);
    const levelName = Object.keys(this.levels)[level];
    
    // Console styling for development
    if (import.meta.env?.MODE !== 'production') {
      const style = `color: ${this.colors[levelName]}; font-weight: bold;`;
      console.log(`%c${formattedMessage}`, style);
    } else {
      console.log(formattedMessage);
    }

    // Store critical errors for potential error reporting
    if (level === this.levels.ERROR) {
      this.storeError(message, data);
    }
  }

  error(message, data = null) {
    this.log(this.levels.ERROR, message, data);
  }

  warn(message, data = null) {
    this.log(this.levels.WARN, message, data);
  }

  info(message, data = null) {
    this.log(this.levels.INFO, message, data);
  }

  debug(message, data = null) {
    this.log(this.levels.DEBUG, message, data);
  }

  trace(message, data = null) {
    this.log(this.levels.TRACE, message, data);
  }

  // Store errors for potential error reporting
  storeError(message, data) {
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push({
        timestamp: new Date().toISOString(),
        message,
        data,
        url: window.location.href,
        userAgent: navigator.userAgent
      });
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      console.warn('Failed to store error:', e);
    }
  }

  // Get stored errors
  getErrors() {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch (e) {
      return [];
    }
  }

  // Clear stored errors
  clearErrors() {
    localStorage.removeItem('app_errors');
  }

  // Performance logging
  time(label) {
    if (this.shouldLog(this.levels.DEBUG)) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (this.shouldLog(this.levels.DEBUG)) {
      console.timeEnd(label);
      this.debug(`Performance: ${label} completed`);
    }
  }

  // API request logging
  logRequest(method, url, data = null) {
    this.debug(`API Request: ${method} ${url}`, data);
  }

  logResponse(method, url, status, responseTime = null) {
    const message = `API Response: ${method} ${url} - Status: ${status}`;
    this.debug(message, responseTime ? { responseTime: `${responseTime}ms` } : null);
  }

  // User action logging
  logUserAction(action, details = null) {
    this.info(`User Action: ${action}`, details);
  }

  // Component lifecycle logging
  logComponentMount(componentName, props = null) {
    this.debug(`Component mounted: ${componentName}`, props);
  }

  logComponentUnmount(componentName) {
    this.debug(`Component unmounted: ${componentName}`);
  }

  logComponentUpdate(componentName, changes = null) {
    this.trace(`Component updated: ${componentName}`, changes);
  }

  // Security logging
  logSecurityEvent(event, details = null) {
    this.warn(`Security Event: ${event}`, details);
  }

  // AI Agent specific logging
  logAIRequest(prompt, model = 'gemini-2.0-flash') {
    this.debug(`AI Request: ${model}`, { promptLength: prompt.length });
  }

  logAIResponse(response, responseTime = null) {
    this.debug('AI Response received', { 
      responseLength: response.length,
      responseTime: responseTime ? `${responseTime}ms` : null
    });
  }

  logAIError(error, prompt = null) {
    this.error('AI Agent Error', { 
      error: error.message,
      prompt: prompt ? prompt.substring(0, 100) + '...' : null
    });
  }

  // Note operations logging
  logNoteOperation(operation, noteId = null, details = null) {
    this.info(`Note ${operation}`, { noteId, ...details });
  }

  logDataScan(results) {
    this.info('Data scan completed', { 
      totalNotes: results.totalNotes,
      oldNotes: results.oldNotes?.length || 0,
      scanTime: results.scanTime
    });
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
