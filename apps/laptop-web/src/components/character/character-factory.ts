import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ALL_SPECIALISTS, SpecialistDefinition, BenchId } from '@dharmaraksha/tribunal-definitions';
import { CharacterAppearance, CharacterArchetype, BONE_NAMES, BoneName } from './types.js';

export interface SkinnedCharacterResult {
  rootGroup: THREE.Group;
  skeleton: THREE.Skeleton;
  bonesMap: Map<BoneName, THREE.Bone>;
}

export class CharacterFactory {
  private static appearanceCache: Map<string, CharacterAppearance> = new Map();

  /**
   * Generates a deterministic appearance for any specialist ID (A01 - E10).
   */
  public static getSpecialistAppearance(specialistId: string): CharacterAppearance {
    if (this.appearanceCache.has(specialistId)) {
      return this.appearanceCache.get(specialistId)!;
    }

    const spec = ALL_SPECIALISTS.find((s) => s.id === specialistId);
    const isChair = spec?.isChair ?? false;
    const benchId = spec?.benchId ?? 'A';

    // Deterministic pseudo-random seed based on specialist ID string
    const charCodeSum = specialistId.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

    const skinTones = ['#e0ac69', '#c68642', '#8d5524', '#f1c27d', '#b07946'];
    const suitColors = ['#1e293b', '#0f172a', '#334155', '#1e1e24', '#27272a'];
    const hairColors = ['#09090b', '#18181b', '#27272a', '#44403c', '#52525b'];
    const hairStyles: Array<'short' | 'parted' | 'bun' | 'cropped'> = ['short', 'parted', 'bun', 'cropped'];

    const archetype: CharacterArchetype = isChair
      ? 'chair_senior'
      : charCodeSum % 2 === 0
        ? 'male_professional'
        : 'female_professional';

    const appearance: CharacterAppearance = {
      id: specialistId,
      archetype,
      name: spec?.name ?? `Specialist ${specialistId}`,
      benchId,
      skinTone: skinTones[charCodeSum % skinTones.length]!,
      suitColor: suitColors[(charCodeSum + 1) % suitColors.length]!,
      accentColor: isChair ? '#fbbf24' : spec?.appearance.primaryColor ?? '#38bdf8',
      hairColor: hairColors[charCodeSum % hairColors.length]!,
      hairStyle: hairStyles[charCodeSum % hairStyles.length]!,
      isChair,
      hasGlasses: charCodeSum % 3 === 0,
      activeProp: isChair ? 'packet' : charCodeSum % 2 === 0 ? 'folio' : 'pen'
    };

    this.appearanceCache.set(specialistId, appearance);
    return appearance;
  }

  /**
   * Messenger Courier appearance definition.
   */
  public static getMessengerAppearance(): CharacterAppearance {
    return {
      id: 'courier-messenger',
      archetype: 'messenger_courier',
      name: 'Deterministic Messenger',
      skinTone: '#c68642',
      suitColor: '#0369a1',
      accentColor: '#38bdf8',
      hairColor: '#18181b',
      hairStyle: 'cropped',
      isChair: false,
      hasGlasses: false,
      activeProp: 'satchel'
    };
  }

  /**
   * AI Presiding Reviewer appearance definition.
   */
  public static getPresidingReviewerAppearance(): CharacterAppearance {
    return {
      id: 'presiding-reviewer',
      archetype: 'chair_senior',
      name: 'AI Presiding Reviewer',
      skinTone: '#e0ac69',
      suitColor: '#0b0f19',
      accentColor: '#ca8a04',
      hairColor: '#71717a',
      hairStyle: 'parted',
      isChair: true,
      hasGlasses: true,
      activeProp: 'folio'
    };
  }

  /**
   * Constructs the standard 20-bone biped skeleton hierarchy.
   */
  public static createStandardSkeleton(isSeated: boolean = true): {
    skeleton: THREE.Skeleton;
    rootBone: THREE.Bone;
    bonesMap: Map<BoneName, THREE.Bone>;
  } {
    const bonesMap = new Map<BoneName, THREE.Bone>();

    // Instantiate all 20 bones
    BONE_NAMES.forEach((name) => {
      const b = new THREE.Bone();
      b.name = name;
      bonesMap.set(name, b);
    });

    const get = (name: BoneName) => bonesMap.get(name)!;

    // Build hierarchy
    const root = get('Root');
    const hips = get('Hips');
    const spine = get('Spine');
    const chest = get('Chest');
    const neck = get('Neck');
    const head = get('Head');

    const lShoulder = get('LeftShoulder');
    const lArm = get('LeftArm');
    const lForeArm = get('LeftForeArm');
    const lHand = get('LeftHand');

    const rShoulder = get('RightShoulder');
    const rArm = get('RightArm');
    const rForeArm = get('RightForeArm');
    const rHand = get('RightHand');

    const lUpLeg = get('LeftUpLeg');
    const lLeg = get('LeftLeg');
    const lFoot = get('LeftFoot');

    const rUpLeg = get('RightUpLeg');
    const rLeg = get('RightLeg');
    const rFoot = get('RightFoot');

    // Hierarchy linkages
    root.add(hips);
    hips.add(spine);
    spine.add(chest);
    chest.add(neck);
    neck.add(head);

    chest.add(lShoulder);
    lShoulder.add(lArm);
    lArm.add(lForeArm);
    lForeArm.add(lHand);

    chest.add(rShoulder);
    rShoulder.add(rArm);
    rArm.add(rForeArm);
    rForeArm.add(rHand);

    hips.add(lUpLeg);
    lUpLeg.add(lLeg);
    lLeg.add(lFoot);

    hips.add(rUpLeg);
    rUpLeg.add(rLeg);
    rLeg.add(rFoot);

    // Initial bone resting positions (Seated vs Upright)
    if (isSeated) {
      hips.position.set(0, 0.44, 0); // Seated on chair at 0.44m
      spine.position.set(0, 0.22, 0);
      chest.position.set(0, 0.20, 0);
      neck.position.set(0, 0.16, 0);
      head.position.set(0, 0.14, 0);

      lShoulder.position.set(0.18, 0.12, 0);
      lArm.position.set(0.14, -0.16, 0);
      lForeArm.position.set(0, -0.18, 0);
      lHand.position.set(0, -0.12, 0);

      rShoulder.position.set(-0.18, 0.12, 0);
      rArm.position.set(-0.14, -0.16, 0);
      rForeArm.position.set(0, -0.18, 0);
      rHand.position.set(0, -0.12, 0);

      // Thighs 90 degrees forward for seated posture
      lUpLeg.position.set(0.12, -0.05, 0);
      lUpLeg.rotation.x = Math.PI / 2;
      lLeg.position.set(0, -0.22, 0.22);
      lLeg.rotation.x = -Math.PI / 2;
      lFoot.position.set(0, -0.22, 0);

      rUpLeg.position.set(-0.12, -0.05, 0);
      rUpLeg.rotation.x = Math.PI / 2;
      rLeg.position.set(0, -0.22, 0.22);
      rLeg.rotation.x = -Math.PI / 2;
      rFoot.position.set(0, -0.22, 0);
    } else {
      // Upright courier stance
      hips.position.set(0, 0.88, 0);
      spine.position.set(0, 0.22, 0);
      chest.position.set(0, 0.20, 0);
      neck.position.set(0, 0.16, 0);
      head.position.set(0, 0.14, 0);

      lShoulder.position.set(0.18, 0.12, 0);
      lArm.position.set(0.14, -0.16, 0);
      lForeArm.position.set(0, -0.18, 0);
      lHand.position.set(0, -0.12, 0);

      rShoulder.position.set(-0.18, 0.12, 0);
      rArm.position.set(-0.14, -0.16, 0);
      rForeArm.position.set(0, -0.18, 0);
      rHand.position.set(0, -0.12, 0);

      lUpLeg.position.set(0.12, -0.05, 0);
      lLeg.position.set(0, -0.38, 0);
      lFoot.position.set(0, -0.42, 0);

      rUpLeg.position.set(-0.12, -0.05, 0);
      rLeg.position.set(0, -0.38, 0);
      rFoot.position.set(0, -0.42, 0);
    }

    const bonesArray = BONE_NAMES.map((name) => bonesMap.get(name)!);
    const skeleton = new THREE.Skeleton(bonesArray);

    return { skeleton, rootBone: root, bonesMap };
  }

  /**
   * Builds an optimized skinned humanoid mesh group for a given appearance.
   */
  public static createSkinnedCharacter(
    appearance: CharacterAppearance,
    isSeated: boolean = true
  ): SkinnedCharacterResult {
    const rootGroup = new THREE.Group();
    rootGroup.name = `character-${appearance.id}`;

    const { skeleton, rootBone, bonesMap } = this.createStandardSkeleton(isSeated);
    rootGroup.add(rootBone);

    // ─── Torso / Suit Jacket Mesh ───────────────────────────────────────────
    const chestBone = bonesMap.get('Chest')!;
    const torsoGeo = new THREE.BoxGeometry(0.36, 0.42, 0.22);
    const suitMat = new THREE.MeshStandardMaterial({
      color: appearance.suitColor,
      roughness: 0.6,
      metalness: 0.2
    });
    const torsoMesh = new THREE.Mesh(torsoGeo, suitMat);
    torsoMesh.position.set(0, 0, 0);
    chestBone.add(torsoMesh);

    // Bench Accent Tie / Lapel ribbon
    const tieGeo = new THREE.BoxGeometry(0.08, 0.24, 0.02);
    const accentMat = new THREE.MeshStandardMaterial({
      color: appearance.accentColor,
      emissive: appearance.accentColor,
      emissiveIntensity: 0.3,
      roughness: 0.4
    });
    const tieMesh = new THREE.Mesh(tieGeo, accentMat);
    tieMesh.position.set(0, -0.04, 0.12);
    chestBone.add(tieMesh);

    // Chair Gold Insignia (for Bench Chairs)
    if (appearance.isChair) {
      const crownGeo = new THREE.ConeGeometry(0.04, 0.06, 5);
      const goldMat = new THREE.MeshStandardMaterial({
        color: '#fbbf24',
        emissive: '#d97706',
        emissiveIntensity: 0.6,
        metalness: 0.8
      });
      const crownMesh = new THREE.Mesh(crownGeo, goldMat);
      crownMesh.position.set(0.12, 0.14, 0.12);
      crownMesh.rotation.z = -0.3;
      chestBone.add(crownMesh);
    }

    // ─── Head, Face, Hair & Glasses ─────────────────────────────────────────
    const headBone = bonesMap.get('Head')!;
    const skinMat = new THREE.MeshStandardMaterial({
      color: appearance.skinTone,
      roughness: 0.7,
      metalness: 0.1
    });

    // Head base
    const headGeo = new THREE.BoxGeometry(0.18, 0.20, 0.18);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.set(0, 0.08, 0);
    headBone.add(headMesh);

    // Hair mesh
    const hairGeo = new THREE.BoxGeometry(0.20, 0.08, 0.20);
    const hairMat = new THREE.MeshStandardMaterial({
      color: appearance.hairColor,
      roughness: 0.8
    });
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 0.18, 0);
    headBone.add(hairMesh);

    if (appearance.hasGlasses) {
      const glassesGeo = new THREE.BoxGeometry(0.16, 0.04, 0.02);
      const glassesMat = new THREE.MeshStandardMaterial({
        color: '#ca8a04',
        metalness: 0.9,
        roughness: 0.2
      });
      const glassesMesh = new THREE.Mesh(glassesGeo, glassesMat);
      glassesMesh.position.set(0, 0.08, 0.10);
      headBone.add(glassesMesh);
    }

    // ─── Arms & Hands ───────────────────────────────────────────────────────
    const armGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.24, 12);
    const handGeo = new THREE.BoxGeometry(0.06, 0.08, 0.04);

    // Left Arm
    const lForeArm = bonesMap.get('LeftForeArm')!;
    const lArmMesh = new THREE.Mesh(armGeo, suitMat);
    lArmMesh.position.set(0, -0.10, 0);
    lForeArm.add(lArmMesh);

    const lHand = bonesMap.get('LeftHand')!;
    const lHandMesh = new THREE.Mesh(handGeo, skinMat);
    lHandMesh.position.set(0, -0.04, 0);
    lHand.add(lHandMesh);

    // Right Arm
    const rForeArm = bonesMap.get('RightForeArm')!;
    const rArmMesh = new THREE.Mesh(armGeo, suitMat);
    rArmMesh.position.set(0, -0.10, 0);
    rForeArm.add(rArmMesh);

    const rHand = bonesMap.get('RightHand')!;
    const rHandMesh = new THREE.Mesh(handGeo, skinMat);
    rHandMesh.position.set(0, -0.04, 0);
    rHand.add(rHandMesh);

    // ─── Legs & Shoes ───────────────────────────────────────────────────────
    const pantsMat = new THREE.MeshStandardMaterial({
      color: appearance.suitColor,
      roughness: 0.7
    });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: '#09090b',
      roughness: 0.4,
      metalness: 0.5
    });

    const legGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.32, 12);
    const footGeo = new THREE.BoxGeometry(0.08, 0.06, 0.16);

    const lLeg = bonesMap.get('LeftLeg')!;
    const lLegMesh = new THREE.Mesh(legGeo, pantsMat);
    lLegMesh.position.set(0, -0.14, 0);
    lLeg.add(lLegMesh);

    const lFoot = bonesMap.get('LeftFoot')!;
    const lFootMesh = new THREE.Mesh(footGeo, shoeMat);
    lFootMesh.position.set(0, -0.02, 0.04);
    lFoot.add(lFootMesh);

    const rLeg = bonesMap.get('RightLeg')!;
    const rLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rLegMesh.position.set(0, -0.14, 0);
    rLeg.add(rLegMesh);

    const rFoot = bonesMap.get('RightFoot')!;
    const rFootMesh = new THREE.Mesh(footGeo, shoeMat);
    rFootMesh.position.set(0, -0.02, 0.04);
    rFoot.add(rFootMesh);

    // ─── Desk Props (Pen / Folio / Packet / Satchel) ─────────────────────────
    if (appearance.activeProp === 'pen') {
      const penGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.12, 8);
      const penMat = new THREE.MeshStandardMaterial({ color: '#ca8a04', metalness: 0.8 });
      const penMesh = new THREE.Mesh(penGeo, penMat);
      penMesh.position.set(0, -0.04, 0.02);
      penMesh.rotation.x = Math.PI / 3;
      rHand.add(penMesh);
    } else if (appearance.activeProp === 'packet') {
      const packetGeo = new THREE.BoxGeometry(0.22, 0.02, 0.16);
      const packetMat = new THREE.MeshStandardMaterial({ color: '#ca8a04', roughness: 0.3 });
      const packetMesh = new THREE.Mesh(packetGeo, packetMat);
      packetMesh.position.set(0, -0.08, 0.12);
      rHand.add(packetMesh);
    } else if (appearance.activeProp === 'satchel') {
      const satchelGeo = new THREE.BoxGeometry(0.14, 0.20, 0.08);
      const satchelMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.6 });
      const satchelMesh = new THREE.Mesh(satchelGeo, satchelMat);
      satchelMesh.position.set(0.18, -0.10, 0);
      chestBone.add(satchelMesh);
    }

    return { rootGroup, skeleton, bonesMap };
  }

  /**
   * Safely clones a character group and its skeleton using Three.js SkeletonUtils.
   * This guarantees that every cloned specialist has an unshared skeleton instance,
   * enabling independent animations without cross-talk or frozen limbs.
   */
  public static cloneCharacter(sourceGroup: THREE.Group): THREE.Group {
    return SkeletonUtils.clone(sourceGroup) as THREE.Group;
  }
}
