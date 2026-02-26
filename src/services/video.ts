import Peer, { MediaConnection } from 'peerjs';

let peer: Peer | null = null;
let currentCall: MediaConnection | null = null;

/**
 * Initialize PeerJS peer connection
 * @param userId - Unique user ID for this peer
 * @returns Promise resolving to peer ID
 */
export function initializePeer(userId: string, retryCount = 0): Promise<string> {
    return new Promise((resolve, reject) => {
        if (peer && !peer.destroyed) {
            if (peer.id === userId && peer.open) {
                console.log('✅ Reusing existing Peer with ID:', peer.id);
                return resolve(peer.id);
            }
            peer.destroy();
        }

        console.log(`⏳ Creating new Peer with ID: ${userId} (Attempt ${retryCount + 1})`);
        
        // Use default server first, then fallback to a different port/config if throttled
        const useFallback = retryCount > 0;

        try {
            peer = new Peer(userId, {
                host: '0.peerjs.com',
                port: useFallback ? 9000 : 443, // Fallback port
                path: '/',
                secure: !useFallback, // 9000 on peerjs is usually ws:// not wss://
                debug: 2,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ]
                }
            });

            peer.on('open', (id) => {
                console.log('✅ Peer initialized with ID:', id);
                resolve(id);
            });

            peer.on('error', (err) => {
                console.error(`❌ Peer initialization error (type: ${err.type}):`, err);
                
                // If ID is taken, just resolve with it anyway (since we want deterministic IDs)
                if (err.type === 'unavailable-id') {
                    console.log('⚠️ ID already in use, assuming it is a page reload ghost and continuing...');
                    resolve(userId);
                    return;
                }

                if (err.type === 'peer-unavailable') {
                    console.log('⚠️ Remote peer is not connected yet. Waiting...');
                    return; // Ignore this so we don't destroy the active connection
                }

                if (retryCount < 2) {
                    console.log(`🔄 Retrying peer initialization...`);
                    peer?.destroy();
                    setTimeout(() => {
                        resolve(initializePeer(userId, retryCount + 1));
                    }, 1000);
                } else {
                    reject(err);
                }
            });

            peer.on('disconnected', () => {
                console.warn('⚠️ Peer disconnected, attempting reconnect...');
                if (peer && !peer.destroyed) {
                    peer.reconnect();
                }
            });
        } catch (e) {
            console.error("Critical PeerJS setup crash:", e);
            reject(e);
        }
    });
}

/**
 * Make outgoing call to remote peer
 * @param remotePeerId - Peer ID to call
 * @param localStream - Local media stream to send
 * @returns Promise resolving to remote media stream
 */
export async function makeCall(
    remotePeerId: string,
    localStream: MediaStream
): Promise<MediaStream> {
    if (!peer) {
        throw new Error('Peer not initialized. Call initializePeer() first.');
    }

    console.log('📞 Calling peer:', remotePeerId);

    // Make call with local stream
    const call = peer.call(remotePeerId, localStream);
    currentCall = call;

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            console.warn('Call timeout (5s) - remote peer did not answer');
            reject(new Error('Call timeout (5s) - remote peer might be offline or connecting'));
        }, 5000); // 5 second rapid-timeout for better retry loop synergy

        call.on('stream', (remoteStream) => {
            clearTimeout(timeout);
            console.log('✅ Received remote stream');
            resolve(remoteStream);
        });

        call.on('error', (err) => {
            clearTimeout(timeout);
            console.error('❌ Call error:', err);
            reject(err);
        });

        call.on('close', () => {
            console.log('📴 Call closed');
            currentCall = null;
        });
    });
}

/**
 * Answer incoming calls
 * @param localStream - Local media stream to send
 * @param onRemoteStream - Callback when remote stream received
 */
export function answerCall(
    localStream: MediaStream,
    onRemoteStream: (stream: MediaStream) => void,
    onCallClosed?: () => void
): void {
    if (!peer) {
        throw new Error('Peer not initialized. Call initializePeer() first.');
    }

    console.log('📱 Ready to answer incoming calls...');

    peer.on('call', (call) => {
        console.log('📞 Incoming call from:', call.peer);

        // Answer with local stream
        call.answer(localStream);
        currentCall = call;

        call.on('stream', (remoteStream) => {
            console.log('✅ Received remote stream from caller');
            onRemoteStream(remoteStream);
        });

        call.on('close', () => {
            console.log('📴 Incoming call closed');
            currentCall = null;
            onCallClosed?.();
        });

        call.on('error', (err) => {
            console.error('❌ Incoming call error:', err);
        });
    });
}

/**
 * Get current peer ID
 */
export function getPeerId(): string | null {
    return peer?.id || null;
}

/**
 * Check if peer is connected
 */
export function isPeerConnected(): boolean {
    return peer?.disconnected === false;
}

/**
 * Disconnect and cleanup
 */
export function disconnectPeer(): void {
    console.log('🔌 Disconnecting peer...');

    if (currentCall) {
        currentCall.close();
        currentCall = null;
    }

    if (peer) {
        peer.destroy();
        peer = null;
    }
}

/**
 * Reconnect peer if disconnected
 */
export function reconnectPeer(): void {
    if (peer && peer.disconnected) {
        console.log('🔄 Reconnecting peer...');
        peer.reconnect();
    }
}
