// Debug script to monitor infinite loops in authentication
// Add this to your browser console to monitor authentication flow

console.log('🔍 Starting infinite loop debugging...');

// Override console.log to track repeated messages
const originalLog = console.log;
const logCounts = new Map();
const MAX_REPEATED_LOGS = 5;

console.log = function(...args) {
  const message = args.join(' ');
  
  // Track repeated messages
  if (logCounts.has(message)) {
    const count = logCounts.get(message) + 1;
    logCounts.set(message, count);
    
    if (count > MAX_REPEATED_LOGS) {
      originalLog(`🚨 INFINITE LOOP DETECTED: "${message}" repeated ${count} times`);
      originalLog('🛑 Stopping repeated log to prevent console spam');
      return;
    }
  } else {
    logCounts.set(message, 1);
  }
  
  originalLog.apply(console, args);
};

// Monitor localStorage changes
const originalSetItem = localStorage.setItem;
const originalRemoveItem = localStorage.removeItem;

localStorage.setItem = function(key, value) {
  if (key.includes('Token') || key.includes('User')) {
    console.log(`📝 localStorage.setItem: ${key} = ${value?.substring(0, 50)}...`);
  }
  return originalSetItem.apply(this, arguments);
};

localStorage.removeItem = function(key) {
  if (key.includes('Token') || key.includes('User')) {
    console.log(`🗑️ localStorage.removeItem: ${key}`);
  }
  return originalRemoveItem.apply(this, arguments);
};

// Monitor React state updates
let stateUpdateCount = 0;
const originalSetState = React.Component.prototype.setState;

if (originalSetState) {
  React.Component.prototype.setState = function(updater, callback) {
    stateUpdateCount++;
    if (stateUpdateCount > 100) {
      console.log(`🚨 HIGH STATE UPDATE COUNT: ${stateUpdateCount} updates detected`);
    }
    return originalSetState.call(this, updater, callback);
  };
}

// Monitor navigation calls
let navigationCount = 0;
const monitorNavigation = () => {
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    navigationCount++;
    console.log(`🧭 Navigation (pushState): ${args[2]} (count: ${navigationCount})`);
    if (navigationCount > 10) {
      console.log('🚨 HIGH NAVIGATION COUNT: Possible infinite redirect loop');
    }
    return originalPushState.apply(this, args);
  };
  
  history.replaceState = function(...args) {
    navigationCount++;
    console.log(`🧭 Navigation (replaceState): ${args[2]} (count: ${navigationCount})`);
    if (navigationCount > 10) {
      console.log('🚨 HIGH NAVIGATION COUNT: Possible infinite redirect loop');
    }
    return originalReplaceState.apply(this, args);
  };
};

monitorNavigation();

// Check current authentication state
const checkAuthState = () => {
  console.log('🔍 Current Authentication State:');
  console.log('  Admin Token:', !!localStorage.getItem('adminToken'));
  console.log('  Admin User:', !!localStorage.getItem('adminUser'));
  console.log('  Regular Token:', !!localStorage.getItem('token'));
  console.log('  Regular User:', !!localStorage.getItem('user'));
  console.log('  Current URL:', window.location.pathname);
};

// Monitor useEffect calls
let useEffectCount = 0;
const monitorUseEffect = () => {
  // This is a simplified monitor - in real debugging you'd need React DevTools
  setInterval(() => {
    useEffectCount++;
    if (useEffectCount % 50 === 0) {
      console.log(`📊 useEffect monitoring: ${useEffectCount} intervals passed`);
      checkAuthState();
    }
  }, 100);
};

monitorUseEffect();

// Utility functions for manual testing
window.debugAuth = {
  checkState: checkAuthState,
  clearAllTokens: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🧹 All tokens cleared');
  },
  simulateAdminLogin: () => {
    const adminUser = {
      id: 'admin-001',
      name: 'System Administrator',
      email: 'admin@housewise.com',
      role: 'admin'
    };
    localStorage.setItem('adminToken', 'fake-admin-token-for-testing');
    localStorage.setItem('adminUser', JSON.stringify(adminUser));
    console.log('🔑 Simulated admin login');
  },
  resetCounters: () => {
    logCounts.clear();
    stateUpdateCount = 0;
    navigationCount = 0;
    console.log('🔄 Debug counters reset');
  },
  getStats: () => {
    console.log('📊 Debug Statistics:');
    console.log('  State Updates:', stateUpdateCount);
    console.log('  Navigation Count:', navigationCount);
    console.log('  Repeated Logs:', Array.from(logCounts.entries()).filter(([_, count]) => count > 1));
  }
};

console.log('✅ Infinite loop debugging initialized');
console.log('💡 Use window.debugAuth for manual testing:');
console.log('  - debugAuth.checkState() - Check current auth state');
console.log('  - debugAuth.clearAllTokens() - Clear all tokens');
console.log('  - debugAuth.simulateAdminLogin() - Simulate admin login');
console.log('  - debugAuth.resetCounters() - Reset debug counters');
console.log('  - debugAuth.getStats() - Show debug statistics');

// Initial state check
checkAuthState();
