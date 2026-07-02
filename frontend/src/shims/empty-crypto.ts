/**
 * Empty stand-in for node:crypto in the browser bundle.
 *
 * Without this, Vite externalizes node:crypto as a warning Proxy, and
 * @bsv/sdk's Hash.js probes `NODE_CRYPTO?.createHash` on EVERY hash — each
 * probe fires the Proxy's console.warn, turning merkle-path verification
 * into a multi-second main-thread freeze. An empty object makes the probe a
 * plain undefined property access, so the SDK falls back to its fast
 * pure-JS hashing immediately.
 */
export default {}
