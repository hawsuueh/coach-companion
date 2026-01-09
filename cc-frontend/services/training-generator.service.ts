import supabase from '@/config/supabaseClient';
import { randomForestPredict } from './ml/randomForest';

type GenerateTrainingInput = {
  coachNo: number;
  trainingName: string;
  date: string;
  time: string;
  duration: number;
  athleteNos: number[];
  selectedEquipments: string[];
};

export async function generateTrainingService(input: GenerateTrainingInput) {
  console.group('🏀 GENERATE TRAINING');

  /* ================================
     1. CREATE TRAINING METADATA
  ================================ */
  console.group('📘 Training Metadata');

  const { data: training, error: trainingError } = await supabase
    .from('training')
    .insert({
      name: input.trainingName,
      date: input.date,
      time: input.time,
      duration: input.duration,
      coach_no: input.coachNo
    })
    .select()
    .single();

  if (trainingError) throw trainingError;

  console.log('Training created:', training.training_id);
  console.groupEnd();

  /* ================================
     2. LOOP ATHLETES
  ================================ */
  for (const athleteNo of input.athleteNos) {
    console.group(`👤 Athlete ${athleteNo}`);

    /* -------------------------------
       Fetch bodypart analysis
    ------------------------------- */
    const { data: analysis } = await supabase
      .from('bodypart_analysis')
      .select('bodypart_focus_scores')
      .eq('athlete_no', athleteNo)
      .order('bodypart_analysis_id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!analysis) {
      console.warn('No analysis found, skipping athlete');
      console.groupEnd();
      continue;
    }

    /* -------------------------------
       ML Prediction
    ------------------------------- */
    const prediction = randomForestPredict(analysis.bodypart_focus_scores);

    /* -------------------------------
       Select exercises
    ------------------------------- */
    const { data: exercises } = await supabase
      .from('exercise')
      .select('exercise_id')
      .eq('bodypart', prediction.focusBodyPart)
      .limit(5);

    console.log(
      `Exercises selected for ${prediction.focusBodyPart}:`,
      exercises?.length ?? 0
    );

    /* -------------------------------
       Create athlete_training
    ------------------------------- */
    const { data: athleteTraining } = await supabase
      .from('athlete_training')
      .insert({
        training_id: training.training_id,
        athlete_no: athleteNo
      })
      .select()
      .single();

    console.log('Athlete training ID:', athleteTraining.athlete_training_id);

    /* -------------------------------
       Tracking (assigned)
    ------------------------------- */
    await supabase.from('athlete_training_tracking').insert({
      athlete_training_id: athleteTraining.athlete_training_id,
      status: 'assigned'
    });

    /* -------------------------------
       Assign exercises
    ------------------------------- */
    for (const ex of exercises ?? []) {
      const { data: ate } = await supabase
        .from('athlete_training_exercise')
        .insert({
          athlete_training_id: athleteTraining.athlete_training_id,
          exercise_id: ex.exercise_id
        })
        .select()
        .single();

      await supabase.from('athlete_training_exercise_tracking').insert({
        athlete_training_exercise_id: ate.athlete_training_exercise_id,
        status: 'assigned'
      });
    }

    console.groupEnd();
  }

  console.groupEnd();
  return training;
}
