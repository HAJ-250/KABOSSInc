import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
function loadConfig() {
    const environment = (process.env.MTN_ENVIRONMENT || 'sandbox').toLowerCase();
    const sandbox = environment === 'sandbox';
    return {
        consumerKey: process.env.MTN_CONSUMER_KEY || '',
        consumerSecret: process.env.MTN_CONSUMER_SECRET || '',
        apiUser: process.env.MTN_API_USER || '',
        apiKey: process.env.MTN_API_KEY || '',
        subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY || '',
        environment,
        targetEnv: process.env.MTN_TARGET_ENV || (sandbox ? 'sandbox' : 'mtnrwanda'),
        currency: process.env.MTN_CURRENCY || 'RWF',
        payeeNumber: process.env.MTN_MOMO_PAYEE_NUMBER || '250788882296',
        sandbox,
    };
}
const config = loadConfig();
/**
 * Base URL for the MTN MoMo Collection API.
 * Sandbox and production use different hostnames.
 */
function getBaseUrl() {
    if (config.sandbox) {
        return 'https://sandbox.momodeveloper.mtn.com';
    }
    // Production / live aggregation endpoint
    return 'https://proxy.momoapi.mtn.com';
}
/**
 * Return whether the integration is running in sandbox mode.
 * Useful for the frontend to display a "test mode" banner.
 */
export function isSandbox() {
    return config.sandbox;
}
/**
 * Generate a unique transaction reference (UUID) used for each
 * RequestToPay operation.
 */
export function generateTransactionReference(prefix = 'KAB') {
    const uuid = crypto.randomUUID().replace(/-/g, '').toUpperCase();
    return `${prefix}${Date.now()}${uuid.slice(0, 12)}`;
}
/**
 * Basic Airtime/MoMo/MSISDN validation for Rwanda numbers.
 * Accepts formats like: 250788882296, 0788882296, +250788882296
 */
export function normalizePhoneNumber(phone) {
    let p = phone.replace(/[^\d]/g, '');
    if (p.startsWith('250') && p.length === 12)
        return p;
    if (p.startsWith('0') && p.length === 10)
        return `250${p.slice(1)}`;
    if (p.length === 9)
        return `250${p}`;
    return p;
}
export function isValidMoMoNumber(phone) {
    const p = normalizePhoneNumber(phone);
    // MTN Rwanda numbers start with 25078 or 25079 (legacy 25073 is also MTN)
    return /^250(78|79|73)\d{7}$/.test(p);
}
/**
 * Obtain an OAuth2 access token from the MTN MoMo API.
 * In sandbox mode without credentials, returns a fake token.
 */
export async function getAccessToken() {
    if (config.sandbox && (!config.consumerKey || !config.consumerSecret)) {
        // Sandbox without credentials: simulate a token so the flow can be tested.
        return `sandbox-token-${crypto.randomUUID().replace(/-/g, '')}`;
    }
    const basicAuth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
    const res = await fetch(`${getBaseUrl()}/collection/token/`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        },
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`MTN getAccessToken failed (${res.status}): ${body}`);
    }
    const data = (await res.json());
    return data.access_token;
}
/**
 * Create the API user for the sandbox environment (idempotent safe).
 * Required for sandbox MoMo apps. In production this is usually provisioned
 * via the MoMo developer portal.
 */
export async function createApiUser() {
    if (config.sandbox && !config.subscriptionKey) {
        return `sandbox-api-user-${crypto.randomUUID().replace(/-/g, '')}`;
    }
    const providerCallbackHost = process.env.MTN_PROVIDER_CALLBACK_HOST || '';
    const res = await fetch(`${getBaseUrl()}/v1_0/apiuser`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        },
        body: JSON.stringify({
            providerCallbackHost,
        }),
    });
    if (!res.ok && res.status !== 409) {
        const body = await res.text();
        throw new Error(`MTN createApiUser failed (${res.status}): ${body}`);
    }
    return config.sandbox ? res.headers.get('X-Reference-Id') || '' : config.apiUser;
}
/**
 * Request a payment from a customer's MTN MoMo wallet.
 *
 * @param amount - Amount in minor units or as number (RWF has no decimals)
 * @param msisdn - Customer phone number (e.g. 250788882296)
 * @param externalReference - Unique reference for the transaction
 * @param payerMessage - Message shown to the customer
 * @param payeeNote - Note for the business
 */
export async function requestToPay(amount, msisdn, externalReference, payerMessage, payeeNote) {
    const phone = normalizePhoneNumber(msisdn);
    const token = await getAccessToken();
    const referenceId = generateTransactionReference();
    if (config.sandbox && (!config.consumerKey || !config.consumerSecret)) {
        // Sandbox simulation: pretend the RequestToPay was accepted.
        console.log('[MoMo][sandbox] RequestToPay simulated:', {
            externalReference,
            referenceId,
            amount,
            phone,
        });
        return { referenceId, status: 'PENDING' };
    }
    const res = await fetch(`${getBaseUrl()}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Reference-Id': referenceId,
            'X-Target-Environment': config.targetEnv,
            'X-Callback-Url': process.env.MTN_CALLBACK_URL || '',
            'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        },
        body: JSON.stringify({
            amount: String(amount),
            currency: config.currency,
            externalId: externalReference,
            payer: {
                partyIdType: 'MSISDN',
                partyId: phone,
            },
            payerMessage,
            payeeNote,
        }),
    });
    if (!res.ok && res.status !== 202) {
        const body = await res.text();
        throw new Error(`MTN RequestToPay failed (${res.status}): ${body}`);
    }
    return { referenceId, status: 'PENDING' };
}
/**
 * Check the status of a RequestToPay transaction.
 *
 * @param referenceId - The X-Reference-Id returned from requestToPay
 */
export async function getTransactionStatus(referenceId) {
    if (config.sandbox && (!config.consumerKey || !config.consumerSecret)) {
        // Sandbox simulation: return a success status after a short delay so the
        // frontend can demonstrate the full flow.
        return { status: 'SUCCESSFUL', financialTransactionId: `fin-${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}` };
    }
    const token = await getAccessToken();
    const res = await fetch(`${getBaseUrl()}/collection/v1_0/requesttopay/${referenceId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'X-Target-Environment': config.targetEnv,
            'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        },
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`MTN getTransactionStatus failed (${res.status}): ${body}`);
    }
    const data = (await res.json());
    return data;
}
/**
 * Map an MTN API status to our internal payment status.
 */
export function mapStatusToPaymentStatus(mtnStatus) {
    switch (mtnStatus) {
        case 'SUCCESSFUL':
            return 'SUCCESS';
        case 'FAILED':
        case 'REJECTED':
            return 'FAILED';
        case 'TIMEOUT':
            return 'FAILED';
        case 'CANCELLED':
            return 'CANCELLED';
        default:
            return 'PENDING';
    }
}
export default {
    isSandbox,
    generateTransactionReference,
    normalizePhoneNumber,
    isValidMoMoNumber,
    getAccessToken,
    createApiUser,
    requestToPay,
    getTransactionStatus,
    mapStatusToPaymentStatus,
};
//# sourceMappingURL=momoService.js.map