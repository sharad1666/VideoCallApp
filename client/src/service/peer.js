class PeerService {
  constructor() {
    this.peer = null;
    this.createPeer();
  }

  createPeer() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
      ],
    });
  }

  async getOffer() {
    if (!this.peer) this.createPeer();

    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer);
    return offer;
  }

  async getAnswer(offer) {
    if (!this.peer) this.createPeer();

    await this.peer.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(answer);
    return answer;
  }

  async setRemoteAnswer(answer) {
    if (!this.peer) this.createPeer();

    await this.peer.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  }

  // 🔄 Replace video track (used for screen sharing)
  replaceVideoTrack(newTrack) {
    const sender = this.peer
      ?.getSenders()
      ?.find((s) => s.track && s.track.kind === "video");

    if (sender) {
      sender.replaceTrack(newTrack);
    }
  }

  // ❌ End call & reset peer
  closePeer() {
    if (this.peer) {
      this.peer.getSenders().forEach((sender) => sender.track?.stop());
      this.peer.close();
      this.peer = null;
    }
  }
}

const peerInstance = new PeerService();
export default peerInstance;
