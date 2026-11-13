import * as THREE from 'three';
import { CharacterActivity } from './types.js';

/**
 * Helper to build a quaternion track from an array of keyframe times and Euler angles (in radians).
 */
function makeQuatTrack(
  boneName: string,
  times: number[],
  eulers: [number, number, number][]
): THREE.QuaternionKeyframeTrack {
  const values: number[] = [];
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();

  eulers.forEach(([x, y, z]) => {
    e.set(x, y, z);
    q.setFromEuler(e);
    values.push(q.x, q.y, q.z, q.w);
  });

  return new THREE.QuaternionKeyframeTrack(`${boneName}.quaternion`, times, values);
}

/**
 * Helper to build a position track from keyframe times and vector coordinates.
 */
function makePosTrack(
  boneName: string,
  times: number[],
  positions: [number, number, number][]
): THREE.VectorKeyframeTrack {
  const values: number[] = [];
  positions.forEach(([x, y, z]) => values.push(x, y, z));
  return new THREE.VectorKeyframeTrack(`${boneName}.position`, times, values);
}

/**
 * ClipFactory: Generates verified Three.js AnimationClips for all 8 required activities.
 */
export class ActivityClipFactory {
  private static cachedClips: Map<CharacterActivity, THREE.AnimationClip> = new Map();

  /**
   * 1. Idle Breathing (Seated natural respiratory cycle)
   */
  public static createIdleBreathingClip(): THREE.AnimationClip {
    const duration = 3.0;
    const times = [0, 1.5, 3.0];

    // Chest respiratory expansion
    const chestPosTrack = makePosTrack('Chest', times, [
      [0, 0.20, 0],
      [0, 0.215, 0.01],
      [0, 0.20, 0]
    ]);

    // Spine subtle respiratory flex
    const spineQuatTrack = makeQuatTrack('Spine', times, [
      [0, 0, 0],
      [-0.02, 0, 0],
      [0, 0, 0]
    ]);

    // Head micro-gaze adjustments
    const headQuatTrack = makeQuatTrack('Head', times, [
      [0, 0, 0],
      [0.015, -0.02, 0],
      [0, 0, 0]
    ]);

    // Arms resting gently on chair armrests/desk
    const leftArmTrack = makeQuatTrack('LeftArm', times, [
      [0.2, 0.1, -0.1],
      [0.2, 0.1, -0.08],
      [0.2, 0.1, -0.1]
    ]);

    const rightArmTrack = makeQuatTrack('RightArm', times, [
      [0.2, -0.1, 0.1],
      [0.2, -0.1, 0.08],
      [0.2, -0.1, 0.1]
    ]);

    return new THREE.AnimationClip('idle_breathing', duration, [
      chestPosTrack,
      spineQuatTrack,
      headQuatTrack,
      leftArmTrack,
      rightArmTrack
    ]);
  }

  /**
   * 2. Attentive Listening (Upright posture, engaged gaze toward speaker/presiding reviewer)
   */
  public static createAttentiveListeningClip(): THREE.AnimationClip {
    const duration = 4.0;
    const times = [0, 1.2, 2.0, 3.0, 4.0];

    // Spine upright and alert
    const spineTrack = makeQuatTrack('Spine', times, [
      [-0.05, 0, 0],
      [-0.05, 0.02, 0],
      [-0.05, 0, 0],
      [-0.05, -0.02, 0],
      [-0.05, 0, 0]
    ]);

    // Head oriented slightly up with subtle affirmative nod at t=2.0s
    const headTrack = makeQuatTrack('Head', times, [
      [-0.1, 0, 0],
      [-0.08, 0.03, 0],
      [0.04, 0, 0], // Subtle assent nod
      [-0.1, -0.02, 0],
      [-0.1, 0, 0]
    ]);

    return new THREE.AnimationClip('attentive_listening', duration, [spineTrack, headTrack]);
  }

  /**
   * 3. Seated Reading (Head pitched down 22° examining desk folio, left hand steadying document)
   */
  public static createSeatedReadingClip(): THREE.AnimationClip {
    const duration = 4.5;
    const times = [0, 1.5, 3.0, 4.5];

    // Torso tilted forward slightly
    const spineTrack = makeQuatTrack('Spine', times, [
      [0.12, 0, 0],
      [0.14, 0.02, 0],
      [0.12, -0.02, 0],
      [0.12, 0, 0]
    ]);

    // Head pitched downward 22 degrees (0.38 rad) tracking across lines
    const headTrack = makeQuatTrack('Head', times, [
      [0.38, -0.1, 0],
      [0.40, 0, 0],
      [0.38, 0.1, 0],
      [0.38, -0.1, 0]
    ]);

    // Left hand resting on table holding document
    const leftArmTrack = makeQuatTrack('LeftArm', times, [
      [0.4, 0.2, -0.2],
      [0.42, 0.2, -0.2],
      [0.4, 0.2, -0.2],
      [0.4, 0.2, -0.2]
    ]);

    // Right hand occasionally moving to turn or point
    const rightArmTrack = makeQuatTrack('RightArm', times, [
      [0.35, -0.15, 0.15],
      [0.45, -0.2, 0.2],
      [0.38, -0.15, 0.15],
      [0.35, -0.15, 0.15]
    ]);

    return new THREE.AnimationClip('seated_reading', duration, [
      spineTrack,
      headTrack,
      leftArmTrack,
      rightArmTrack
    ]);
  }

  /**
   * 4. Checking Source (Leaning forward, inspecting statutory provision)
   */
  public static createCheckingSourceClip(): THREE.AnimationClip {
    const duration = 3.5;
    const times = [0, 1.0, 2.2, 3.5];

    // Deep forward lean
    const spineTrack = makeQuatTrack('Spine', times, [
      [0.2, 0, 0],
      [0.24, 0.04, 0],
      [0.22, 0.02, 0],
      [0.2, 0, 0]
    ]);

    // Head tilted in analytical inspection
    const headTrack = makeQuatTrack('Head', times, [
      [0.35, -0.05, 0.08],
      [0.38, 0, 0.05],
      [0.35, 0.05, 0.08],
      [0.35, -0.05, 0.08]
    ]);

    // Right arm tracing statutory lines
    const rightArmTrack = makeQuatTrack('RightArm', times, [
      [0.45, -0.3, 0.1],
      [0.55, -0.2, 0.15],
      [0.5, -0.25, 0.12],
      [0.45, -0.3, 0.1]
    ]);

    return new THREE.AnimationClip('checking_source', duration, [
      spineTrack,
      headTrack,
      rightArmTrack
    ]);
  }

  /**
   * 5. Note Taking (Right hand writing with pen prop on desk notepad)
   */
  public static createNoteTakingClip(): THREE.AnimationClip {
    const duration = 4.0;
    // Rhythmic writing strokes
    const times = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];

    const spineTrack = makeQuatTrack('Spine', times, [
      [0.15, 0.05, 0],
      [0.16, 0.05, 0],
      [0.15, 0.05, 0],
      [0.16, 0.05, 0],
      [0.15, 0.05, 0],
      [0.16, 0.05, 0],
      [0.15, 0.05, 0],
      [0.16, 0.05, 0],
      [0.15, 0.05, 0]
    ]);

    const headTrack = makeQuatTrack('Head', times, [
      [0.36, 0.08, 0],
      [0.37, 0.08, 0],
      [0.36, 0.08, 0],
      [0.37, 0.08, 0],
      [0.36, 0.08, 0],
      [0.37, 0.08, 0],
      [0.36, 0.08, 0],
      [0.37, 0.08, 0],
      [0.36, 0.08, 0]
    ]);

    // Right arm writing oscillations
    const rightArmTrack = makeQuatTrack('RightArm', times, [
      [0.45, -0.15, 0.1],
      [0.48, -0.16, 0.12],
      [0.45, -0.14, 0.1],
      [0.48, -0.16, 0.12],
      [0.45, -0.15, 0.1],
      [0.48, -0.16, 0.12],
      [0.45, -0.14, 0.1],
      [0.48, -0.16, 0.12],
      [0.45, -0.15, 0.1]
    ]);

    const rightHandTrack = makeQuatTrack('RightHand', times, [
      [0.1, 0, 0],
      [0.15, 0.05, 0],
      [0.08, -0.05, 0],
      [0.15, 0.05, 0],
      [0.1, 0, 0],
      [0.15, 0.05, 0],
      [0.08, -0.05, 0],
      [0.15, 0.05, 0],
      [0.1, 0, 0]
    ]);

    return new THREE.AnimationClip('note_taking', duration, [
      spineTrack,
      headTrack,
      rightArmTrack,
      rightHandTrack
    ]);
  }

  /**
   * 6. Discussion Gesture (Turn to table colleague, open-palm explanatory gesture)
   */
  public static createDiscussionGestureClip(): THREE.AnimationClip {
    const duration = 3.0;
    const times = [0, 0.8, 1.8, 2.5, 3.0];

    // Torso rotated 18° toward neighbor
    const spineTrack = makeQuatTrack('Spine', times, [
      [0, 0, 0],
      [0.05, 0.25, 0],
      [0.08, 0.3, 0],
      [0.05, 0.15, 0],
      [0, 0, 0]
    ]);

    // Head turned toward dialogue partner
    const headTrack = makeQuatTrack('Head', times, [
      [0, 0, 0],
      [-0.05, 0.3, 0],
      [0.02, 0.32, 0],
      [-0.02, 0.15, 0],
      [0, 0, 0]
    ]);

    // Right arm open-palm gesture
    const rightArmTrack = makeQuatTrack('RightArm', times, [
      [0.2, -0.1, 0.1],
      [0.55, -0.35, 0.25], // Arm extended outward
      [0.6, -0.4, 0.3],    // Open palm emphasis
      [0.35, -0.2, 0.15],
      [0.2, -0.1, 0.1]
    ]);

    return new THREE.AnimationClip('discussion_gesture', duration, [
      spineTrack,
      headTrack,
      rightArmTrack
    ]);
  }

  /**
   * 7. Packet Handoff (Bench Chair reaching forward offering sealed packet)
   */
  public static createPacketHandoffClip(): THREE.AnimationClip {
    const duration = 3.5;
    const times = [0, 0.8, 1.8, 2.8, 3.5];

    // Chair rising slightly and leaning forward
    const spineTrack = makeQuatTrack('Spine', times, [
      [0, 0, 0],
      [0.15, 0, 0],
      [0.25, 0, 0], // Peak extension
      [0.15, 0, 0],
      [0, 0, 0]
    ]);

    // Both arms extending forward offering packet
    const leftArmTrack = makeQuatTrack('LeftArm', times, [
      [0.2, 0.1, -0.1],
      [0.6, 0.25, -0.15],
      [0.8, 0.3, -0.15], // Peak handoff position
      [0.5, 0.2, -0.1],
      [0.2, 0.1, -0.1]
    ]);

    const rightArmTrack = makeQuatTrack('RightArm', times, [
      [0.2, -0.1, 0.1],
      [0.6, -0.25, 0.15],
      [0.8, -0.3, 0.15], // Peak handoff position
      [0.5, -0.2, 0.1],
      [0.2, -0.1, 0.1]
    ]);

    return new THREE.AnimationClip('packet_handoff', duration, [
      spineTrack,
      leftArmTrack,
      rightArmTrack
    ]);
  }

  /**
   * 8. Messenger Locomotion (Balanced upright walking stride for courier along floor path)
   */
  public static createMessengerLocomotionClip(): THREE.AnimationClip {
    const duration = 1.2;
    const times = [0, 0.3, 0.6, 0.9, 1.2];

    // Hips vertical bobbing
    const hipsPosTrack = makePosTrack('Hips', times, [
      [0, 0.88, 0],
      [0, 0.90, 0],
      [0, 0.88, 0],
      [0, 0.90, 0],
      [0, 0.88, 0]
    ]);

    // Alternating leg stride
    const leftLegTrack = makeQuatTrack('LeftUpLeg', times, [
      [0.4, 0, 0],   // Forward
      [0.1, 0, 0],
      [-0.35, 0, 0], // Backward
      [0.1, 0, 0],
      [0.4, 0, 0]
    ]);

    const rightLegTrack = makeQuatTrack('RightUpLeg', times, [
      [-0.35, 0, 0], // Backward
      [0.1, 0, 0],
      [0.4, 0, 0],   // Forward
      [0.1, 0, 0],
      [-0.35, 0, 0]
    ]);

    // Knee flexing
    const leftKneeTrack = makeQuatTrack('LeftLeg', times, [
      [0.1, 0, 0],
      [0.6, 0, 0], // Knee bend in mid-swing
      [0.1, 0, 0],
      [0.05, 0, 0],
      [0.1, 0, 0]
    ]);

    const rightKneeTrack = makeQuatTrack('RightLeg', times, [
      [0.1, 0, 0],
      [0.05, 0, 0],
      [0.1, 0, 0],
      [0.6, 0, 0], // Knee bend in mid-swing
      [0.1, 0, 0]
    ]);

    // Opposing arm swings
    const leftArmTrack = makeQuatTrack('LeftArm', times, [
      [-0.3, 0, -0.05],
      [0, 0, -0.05],
      [0.35, 0, -0.05],
      [0, 0, -0.05],
      [-0.3, 0, -0.05]
    ]);

    const rightArmTrack = makeQuatTrack('RightArm', times, [
      [0.35, 0, 0.05],
      [0, 0, 0.05],
      [-0.3, 0, 0.05],
      [0, 0, 0.05],
      [0.35, 0, 0.05]
    ]);

    return new THREE.AnimationClip('messenger_locomotion', duration, [
      hipsPosTrack,
      leftLegTrack,
      rightLegTrack,
      leftKneeTrack,
      rightKneeTrack,
      leftArmTrack,
      rightArmTrack
    ]);
  }

  /**
   * Get all 8 verified animation clips as a map.
   */
  public static getAllClips(): Map<CharacterActivity, THREE.AnimationClip> {
    if (this.cachedClips.size === 0) {
      this.cachedClips.set('idle_breathing', this.createIdleBreathingClip());
      this.cachedClips.set('attentive_listening', this.createAttentiveListeningClip());
      this.cachedClips.set('seated_reading', this.createSeatedReadingClip());
      this.cachedClips.set('checking_source', this.createCheckingSourceClip());
      this.cachedClips.set('note_taking', this.createNoteTakingClip());
      this.cachedClips.set('discussion_gesture', this.createDiscussionGestureClip());
      this.cachedClips.set('packet_handoff', this.createPacketHandoffClip());
      this.cachedClips.set('messenger_locomotion', this.createMessengerLocomotionClip());
    }
    return this.cachedClips;
  }

  /**
   * Retrieve a specific clip by activity name.
   */
  public static getClip(activity: CharacterActivity): THREE.AnimationClip {
    const clips = this.getAllClips();
    const clip = clips.get(activity);
    if (!clip) {
      throw new Error(`CLIP_NOT_FOUND: Activity clip '${activity}' is not defined.`);
    }
    return clip;
  }
}

