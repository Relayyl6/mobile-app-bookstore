// dns-resolver.js
import dns from 'dns';
import { promises as dnsPromises } from 'dns';

// Use Cloudflare DNS over HTTPS (bypasses your network's DNS blocking)
const DOH_SERVER = 'https://cloudflare-dns.com/dns-query';

export async function setupDNS() {
    // Try to use Google's public DNS
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
    dns.setDefaultResultOrder('ipv4first');
}