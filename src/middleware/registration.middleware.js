import geoip from 'geoip-lite';
import { ForbiddenException } from '../common/exceptions/error.exception.js';
import { NODE_ENV } from '../config.js';

let cachedDevPublicIp = null;
let cachedDevIpTime = 0;

const isLocalhost = (ip) => {
    if (!ip) return true;
    const cleanIp = ip.replace(/^::ffff:/, '');
    return cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost';
};

async function getDevPublicIp() {
    const now = Date.now();
    // Cache for 3s to avoid rapid repeated network calls while allowing quick VPN toggle detection
    if (cachedDevPublicIp && (now - cachedDevIpTime) < 3000) {
        return cachedDevPublicIp;
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
        clearTimeout(timeout);
        const data = await res.json();
        if (data?.ip) {
            cachedDevPublicIp = data.ip;
            cachedDevIpTime = now;
            return cachedDevPublicIp;
        }
    } catch {
        // Fallback or offline
    }
    return null;
}

export const requireEgyptRegistration = async (req, res, next) => {
    const clientIp = req.ip;
    let targetIp = clientIp;

    // In development mode only: if client IP is localhost/loopback (e.g. browser testing on localhost),
    // resolve developer's actual outbound public IP or check DEV_CLIENT_IP / x-test-country-ip for deterministic testing.
    if (NODE_ENV !== 'production') {
        if (process.env.DEV_CLIENT_IP) {
            targetIp = process.env.DEV_CLIENT_IP;
        } else if (req.headers['x-test-country-ip'] && isLocalhost(clientIp)) {
            targetIp = req.headers['x-test-country-ip'];
        } else if (isLocalhost(clientIp)) {
            const devPublicIp = await getDevPublicIp();
            if (devPublicIp) {
                targetIp = devPublicIp;
            }
        }
    }

    let countryCode = null;
    try {
        if (targetIp) {
            const geo = geoip.lookup(targetIp);
            countryCode = geo?.country;
        }
    } catch (error) {
        if (NODE_ENV !== 'production') {
            console.error("[GeoIP Registration Debug] Lookup error:", error);
        }
    }

    // Temporary development diagnostic logs (omitted in production)
    if (NODE_ENV !== 'production') {
        console.log(`[GeoIP Registration Debug] Incoming req.ip: ${clientIp}`);
        if (targetIp !== clientIp) {
            console.log(`[GeoIP Registration Debug] Local/private IP detected. Resolved public IP: ${targetIp}`);
        }
        console.log(`[GeoIP Registration Debug] GeoIP country result: ${countryCode || 'null'}`);
        if (countryCode !== 'EG') {
            console.log(`[GeoIP Registration Debug] Registration rejected: Country '${countryCode || 'unresolved'}' does not match required country 'EG'.`);
        } else {
            console.log(`[GeoIP Registration Debug] Registration allowed for country: 'EG'.`);
        }
    }

    // Fail-closed policy: only allow when country code is strictly "EG"
    if (countryCode !== "EG") {
        throw ForbiddenException("Registration is restricted to Egypt only");
    }

    next();
};

export default requireEgyptRegistration;

