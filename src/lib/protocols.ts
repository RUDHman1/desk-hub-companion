import { MicrobreakProtocol } from '@/types/database';

export const MICROBREAK_PROTOCOLS: MicrobreakProtocol[] = [
  {
    id: 'cornell-20-8-2',
    name: 'Cornell 20-8-2 Ergonomic Routine',
    subtitle: 'The gold standard occupational sit-stand-move ratio',
    category: 'ergonomic',
    durationSeconds: 120, // 2 minutes active movement phase
    difficulty: 'Gentle',
    targetMuscles: ['Postural chain', 'Gluteal complex', 'Calf pump'],
    physiologicalRationale:
      'Developed by Dr. Alan Hedge at Cornell University. Spending 20 minutes sitting, 8 minutes standing, and 2 minutes moving prevents both the circulatory stagnation of prolonged sitting and the static muscular fatigue of unbroken standing.',
    metabolicImpact:
      'Restores skeletal muscle lipoprotein lipase (LPL) activity by 38%, which otherwise plunges by up to 90% after 60 minutes of uninterrupted sedentariness.',
    cognitiveBenefit:
      'Re-oxygenates the prefrontal cortex via increased carotid artery blood flow velocity, attenuating afternoon executive fatigue.',
    instructions: [
      {
        step: 1,
        title: 'Transition from Standing to Mobility',
        description: 'Step away from your desk. Roll your shoulders backward in wide circular motions 5 times.',
        durationSec: 25,
      },
      {
        step: 2,
        title: 'Arm Reach & Spinal Elongation',
        description: 'Interlace fingers, press palms toward the ceiling, inhale deeply and gently lean left then right.',
        durationSec: 35,
      },
      {
        step: 3,
        title: 'Brisk Pace March or Hallway Lap',
        description: 'Take a light brisk walk down the hallway or march lightly on the spot to activate venous leg pumps.',
        durationSec: 60,
      },
    ],
  },
  {
    id: 'trapezius-lat-relief',
    name: 'Upper Trapezius & Latissimus Release',
    subtitle: 'Relieve upper cross syndrome and mouse shoulder',
    category: 'posture',
    durationSeconds: 90,
    difficulty: 'Gentle',
    targetMuscles: ['Upper Trapezius', 'Levator Scapulae', 'Latissimus Dorsi', 'Pectoralis Major'],
    physiologicalRationale:
      'Continuous keyboard and mouse interaction forces the scapulae into sustained protraction and upward rotation, creating ischemic trigger points in the trapezius and levator scapulae.',
    metabolicImpact:
      'Flushes localized lactic acid and pro-inflammatory cytokines accumulated in tonic postural fibers.',
    cognitiveBenefit:
      'Relieves tension-type cervicogenic headache risk, improving working memory capacity and perceptual clarity.',
    instructions: [
      {
        step: 1,
        title: 'Ear-to-Shoulder Lateral Neck Stretch',
        description: 'Drop right ear to right shoulder, lightly anchor opposite hand under chair. Hold 20s, switch sides.',
        durationSec: 40,
      },
      {
        step: 2,
        title: 'Overhead Doorframe / Desk Latissimus Lengthening',
        description: 'Place palms on desk edge or doorframe, hinge at hips, push chest toward floor to lengthen lats.',
        durationSec: 30,
      },
      {
        step: 3,
        title: 'Scapular Squeeze & Retraction',
        description: 'Pinch shoulder blades together as if holding a pencil between them. Inhale and open chest wide.',
        durationSec: 20,
      },
    ],
  },
  {
    id: 'chair-squats-soleus',
    name: 'Soleus & Quadriceps Metabolic Activation',
    subtitle: 'Maximize non-exercise activity thermogenesis (NEAT)',
    category: 'active_bout',
    durationSeconds: 120,
    difficulty: 'Moderate',
    targetMuscles: ['Soleus', 'Gastrocnemius', 'Quadriceps', 'Gluteus Maximus'],
    physiologicalRationale:
      'The soleus muscle possesses a high proportion of slow-twitch oxidative fibers that consume systemic glucose and free fatty acids with minimal glycogen depletion when activated with rhythmic contractions.',
    metabolicImpact:
      'Lowers postprandial glycemic excursions by up to 52% and dramatically boosts systemic triglyceride clearance.',
    cognitiveBenefit:
      'Stimulates brain-derived neurotrophic factor (BDNF) release, enhancing synaptic neuroplasticity and focus.',
    instructions: [
      {
        step: 1,
        title: 'Controlled Chair Squats',
        description: 'Stand with feet shoulder-width. Lower hips until barely touching chair seat, then drive through heels to stand. Perform 10 smooth reps.',
        durationSec: 50,
      },
      {
        step: 2,
        title: 'Standing Soleus Calf Presses',
        description: 'Place hands lightly on desk for balance. Rise onto the balls of your feet, pause 1s at apex, slowly descend.',
        durationSec: 40,
      },
      {
        step: 3,
        title: 'Hip Flexor Lunge Stretch',
        description: 'Step one foot back into a shallow split stance, tuck pelvis forward to lengthen tight hip flexors.',
        durationSec: 30,
      },
    ],
  },
  {
    id: 'hip-flexor-piriformis',
    name: 'Pelvic Unwinding & Hip Flexor Reset',
    subtitle: 'Decompress lumbar discs & liberate tightened psoas',
    category: 'posture',
    durationSeconds: 100,
    difficulty: 'Gentle',
    targetMuscles: ['Iliopsoas', 'Piriformis', 'Erector Spinae', 'Rectus Femoris'],
    physiologicalRationale:
      'Prolonged seated 90-degree hip flexion puts the iliopsoas into passive shortening while de-activating gluteal stabilizers, leading to anterior pelvic tilt and excessive shear force on L4-S1 spinal discs.',
    metabolicImpact:
      'Reduces pelvic vascular compression, restoring femoral vein blood flow velocity.',
    cognitiveBenefit:
      'Reduces chronic low back pain signal noise to the central nervous system, reducing distraction and cognitive drag.',
    instructions: [
      {
        step: 1,
        title: 'Seated Figure-4 Piriformis Stretch',
        description: 'Cross right ankle over left knee. Keep spine straight, hinge gently forward from hips. Hold 25s, switch.',
        durationSec: 50,
      },
      {
        step: 2,
        title: 'Standing Glute Clench & Posterior Pelvic Tilt',
        description: 'Stand tall, squeeze glutes firmly, draw belly button in, tuck tailbone under to release lumbar lordosis.',
        durationSec: 25,
      },
      {
        step: 3,
        title: 'Standing Hamstring Sweep',
        description: 'Extend heel forward, sweep hands downward toward toes while keeping spine long. Alternate legs.',
        durationSec: 25,
      },
    ],
  },
  {
    id: 'art-soft-fascination',
    name: 'Attention Restoration (ART) Soft Fascination',
    subtitle: 'Cognitive recovery based on Kaplan’s restorative environments',
    category: 'cognitive',
    durationSeconds: 120,
    difficulty: 'Gentle',
    targetMuscles: ['Ciliary muscles', 'Ocular recti', 'Vagus nerve'],
    physiologicalRationale:
      'Directed Attention Fatigue (DAF) occurs when inhibitory cognitive control mechanisms in the prefrontal cortex are overworked. Soft fascination—involving gentle ambient sensory stimuli—allows voluntary attention mechanisms to rest and recharge.',
    metabolicImpact:
      'Shifts autonomic tone from sympathetic dominance (fight-or-flight) to parasympathetic vagal stimulation, reducing cortisol.',
    cognitiveBenefit:
      'Restores depleted working memory, error detection accuracy, and lateral problem-solving ingenuity.',
    instructions: [
      {
        step: 1,
        title: 'The 20-20-20 Optometric Rule',
        description: 'Direct your gaze away from all digital screens toward an object at least 20 feet away for 20 seconds. Blink slowly 5 times.',
        durationSec: 30,
      },
      {
        step: 2,
        title: 'Soft Fascination Peripheral Expansion',
        description: 'Soften your gaze. Expand your awareness to the visual periphery without moving your eyes—notice light, shadows, or plants.',
        durationSec: 45,
      },
      {
        step: 3,
        title: '4-7-8 Parasympathetic Vagal Sigh',
        description: 'Inhale silently through nose for 4s, hold breath for 7s, exhale completely through mouth with a soft whoosh for 8s.',
        durationSec: 45,
      },
    ],
  },
];
