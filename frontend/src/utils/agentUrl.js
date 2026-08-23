export function getAgentConfig(sandboxId) {
  const host = window.location.hostname;

  if (host.includes('localhost') || host === '127.0.0.1') {
    return {
      // In local dev, Vite proxies /agent/{sandboxId} and /socket.io-agent
      listFilesUrl: `/agent/${sandboxId}/list-files`,
      readFilesUrl: (filePath) => `/agent/${sandboxId}/read-files?files=${encodeURIComponent(filePath)}`,
      spawnUrl: `/agent/${sandboxId}/spawn?sandboxId=${sandboxId}`,
      socketUrl: '/',
      socketOptions: {
        path: '/socket.io-agent',
        query: { sandboxId },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        
      }
    };
  }

  // Production: connect directly to the wildcard agent subdomain over HTTPS
  const rootDomain = host.replace(/^www\./, '');
  const agentOrigin = `https://${sandboxId}.agent.${rootDomain}`;

  return {
    listFilesUrl: `${agentOrigin}/list-files`,
    readFilesUrl: (filePath) => `${agentOrigin}/read-files?files=${encodeURIComponent(filePath)}`,
    spawnUrl: `${agentOrigin}/spawn`,
    socketUrl: agentOrigin,
    socketOptions: {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    }
  };
}
