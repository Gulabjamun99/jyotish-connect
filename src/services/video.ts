import Peer, { MediaConnection } from 'peerjs';

let peer: Peer | null = null;
let currentCall: MediaConnection | null = null;

/**
 * Initialize PeerJS peer connection
 * @param userId - Unique user ID for this peer
 * @returns Promise resolving to peer ID
 */
export function initializePeer(userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // If peer exists and has the right ID, reuse it
        if (peer && !peer.destroyed) {
            if (peer.id === userId && peer.open) {
                console.log('✅ Reusing existing Peer with ID:', peer.id);
                return resolve(peer.id);
            }
            // If it's a different ID or disconnected, destroy it first
            peer.destroy();
        }

        console.log(`⏳ Creating new Peer with ID: ${userId}`);
        // Create new peer with deterministic user ID
        peer = new Peer(userId, {
            // Using free public PeerJS server
            host: '0.peerjs.com',
            port: 443,
            path: '/',
            secure: true,
            debug: 2
        });
        peer!.on('open', (id) => {
            console.log('✅ Peer initialized with ID:', id);
            resolve(id);
        });

        peer!.on('error', (err) => {
            console.error('❌ Peer error:', err);
            reject(err);
        });

        peer!.on('disconnected', () => {
            console.warn('⚠️ Peer disconnected, attempting reconnect...');
            peer?.reconnect();
        });
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
            reject(new Error('Call timeout - peer did not answer'));
        }, 30000); // 30 second timeout

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
