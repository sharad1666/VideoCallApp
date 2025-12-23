class PeerService {
  constructor() {
    this.peer = null;
  }

  getPeer() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
        ],
      });
    }
    return this.peer;
  }

  async createOffer() {
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(offer) {
    await this.peer.setRemoteDescription(offer);
    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(answer);
    return answer;
  }

  async setAnswer(answer) {
    await this.peer.setRemoteDescription(answer);
  }

  close() {
    this.peer?.close();
    this.peer = null;
  }
}

export default new PeerService();
