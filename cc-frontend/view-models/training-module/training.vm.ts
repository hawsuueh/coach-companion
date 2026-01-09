// training.vm.ts
import {
  getTrainingsService,
  getTrainingDetailsService,
  getAthleteTrainingCoachService,
  getAthleteTrainingsService,
  getAthleteTrainingExerciseService,
  getAthleteTrainingService,
  getAthleteTrainingExecutionService,
  updateAthleteTrainingTrackingService,
  updateAthleteTrainingExerciseTrackingService,
  getAthletesService,
  getEquipmentsService
} from '@/services/training-module/training.service';
import { formatDate } from '@/utils/formatDate';
import { formatTime } from '@/utils/formatTime';
import { formatDuration } from '@/utils/formatDuration';

// Coach
// Get Trainings
export const getTrainingsVM = async (coachNo: string | number | null) => {
  try {
    const trainings = await getTrainingsService(coachNo);

    return trainings.map((t: any) => ({
      trainingId: t.training_id.toString(),
      coachNo: t.coach_no,
      trainingName: t.name,
      dateTime: `${formatDate(t.date)} • ${formatTime(t.time)}`,
      duration: formatDuration(t.duration),
      contactNo: t.coach?.contact_no || null
    }));
  } catch (err) {
    console.error('VM error:', err);
    return [];
  }
};

// Get Training Details
export const getTrainingDetailsVM = async (trainingId: string) => {
  const raw = await getTrainingDetailsService(trainingId);
  if (!raw) return null;

  return {
    trainingId: raw.training_id.toString(),
    name: raw.name,
    date: formatDate(raw.date),
    time: formatTime(raw.time),
    duration: raw.duration,
    athletes:
      raw.athlete_training?.map((at: any) => ({
        athleteTrainingId: at.athlete_training_id.toString(),
        athleteNo: at.athlete?.athlete_no,
        number: at.athlete?.player_no?.toString() ?? '',
        name: `${at.athlete?.first_name ?? ''} ${at.athlete?.last_name ?? ''}`,
        position: at.athlete?.position ?? '',
        gmail: at.athlete?.gmail ?? ''
      })) || []
  };
};

export const getAthleteTrainingCoachVM = async (athleteTrainingId: string) => {
  const rawCoach = await getAthleteTrainingCoachService(athleteTrainingId);
  const rawExercises =
    await getAthleteTrainingExerciseService(athleteTrainingId);

  if (!rawCoach) return null;

  // unwrap athlete and training arrays
  const athlete = Array.isArray(rawCoach.athlete)
    ? rawCoach.athlete[0]
    : rawCoach.athlete;
  const training = Array.isArray(rawCoach.training)
    ? rawCoach.training[0]
    : rawCoach.training;

  return {
    athleteTrainingId: rawCoach.athlete_training_id,
    athleteName:
      `${athlete?.first_name ?? ''} ${athlete?.middle_name ?? ''} ${athlete?.last_name ?? ''}`.trim(),
    position: athlete?.position ?? '',
    playerNo: athlete?.player_no ?? '',
    gmail: athlete?.gmail ?? '',
    trainingName: training?.name ?? '',
    date: training?.date ? formatDate(training.date) : '',
    time: training?.time ? formatTime(training.time) : '',
    duration: training?.duration ?? 0,
    exercises:
      rawExercises?.map((ate: any) => ({
        athleteTrainingExerciseId: ate.athlete_training_exercise_id.toString(),
        exerciseId: ate.exercise?.exercise_id.toString(),
        exerciseName: ate.exercise?.name ?? '',
        sets: ate.sets,
        reps: ate.reps,
        duration: ate.duration,
        subtitle: `${ate.sets} sets • ${ate.reps} reps • ${formatDuration(ate.duration / ate.sets)} duration`
      })) ?? []
  };
};

export const getAthleteTrainingExerciseVM = async (
  athleteTrainingId: string
) => {
  const raw = await getAthleteTrainingExerciseService(athleteTrainingId);
  if (!raw) return [];

  return raw.map((ate: any) => ({
    athleteTrainingExerciseId: ate.athlete_training_exercise_id.toString(),
    exerciseId: ate.exercise?.exercise_id.toString(),
    exerciseName: ate.exercise?.name ?? '',
    sets: ate.sets,
    reps: ate.reps,
    duration: ate.duration,
    subtitle: `${ate.sets} sets • ${ate.reps} reps • ${formatDuration(ate.duration / ate.sets)} duration`
  }));
};

// Athlete
export const getAthleteTrainingsVM = async (
  athleteNo: string | number | null
) => {
  const raw = await getAthleteTrainingsService(athleteNo);
  if (!raw) return [];

  return raw.map((at: any) => {
    const training = Array.isArray(at.training) ? at.training[0] : at.training;
    return {
      athleteTrainingId: at.athlete_training_id.toString(),
      trainingId: training?.training_id.toString(),
      trainingName: training?.name ?? '',
      date: training?.date ? formatDate(training.date) : '',
      time: training?.time ? formatTime(training.time) : '',
      dateTime:
        training?.date && training?.time
          ? `${formatDate(training.date)} - ${formatTime(training.time)}`
          : ''
    };
  });
};

export const getAthleteTrainingVM = async (athleteTrainingId: string) => {
  const raw = await getAthleteTrainingService(athleteTrainingId);
  if (!raw) return null;

  const training = Array.isArray(raw.training) ? raw.training[0] : raw.training;
  const tracking = Array.isArray(raw.athlete_training_tracking)
    ? raw.athlete_training_tracking[0]
    : raw.athlete_training_tracking;

  return {
    athleteTrainingId: raw.athlete_training_id,
    trainingId: raw.training_id,
    athleteTrainingTrackingId: tracking?.athlete_training_tracking_id ?? '',
    name: training?.name ?? '',
    date: training?.date ? formatDate(training.date) : '',
    time: training?.time ? formatTime(training.time) : '',
    duration: training?.duration ? training.duration : '0:00',
    status: tracking?.status ?? '',
    timeElapsed: tracking?.time_elapsed ? tracking.time_elapsed : '0:00',
    dateExecuted: tracking?.date_executed
      ? formatDate(tracking.date_executed)
      : null
  };
};

export const getAthleteTrainingExecutionVM = async (
  athleteTrainingId: string
) => {
  const raw = await getAthleteTrainingExecutionService(athleteTrainingId);
  if (!raw) return null;

  const training = Array.isArray(raw.training) ? raw.training[0] : raw.training;
  const tracking = Array.isArray(raw.tracking) ? raw.tracking[0] : raw.tracking;

  return {
    athleteTrainingId: raw.athlete_training_id,
    name: training?.name ?? '',
    date: training?.date ? formatDate(training.date) : '',
    time: training?.time ? formatTime(training.time) : '',
    duration: training?.duration ?? 0,
    status: tracking?.status ?? 'assigned',
    timeElapsed: tracking?.time_elapsed ?? 0,
    dateExecuted: tracking?.date_executed ?? null,
    exercises:
      raw.athlete_training_exercise?.map((ate: any) => {
        const exercise = Array.isArray(ate.exercise)
          ? ate.exercise[0]
          : ate.exercise;
        const exTracking = Array.isArray(ate.tracking)
          ? ate.tracking[0]
          : ate.tracking;

        return {
          athleteTrainingExerciseId:
            ate.athlete_training_exercise_id.toString(),
          exerciseId: exercise?.exercise_id.toString(),
          name: exercise?.name ?? '',
          videoUrl: exercise?.video_url ?? '',
          instructions: exercise?.instructions ?? [],
          sets: ate.sets,
          reps: ate.reps,
          duration: ate.duration,
          setsExecuted: exTracking?.sets_finished ?? null,
          repsExecuted: exTracking?.reps_finished ?? null,
          timeElapsed: exTracking?.time_elapsed ?? 0
        };
      }) ?? []
  };
};

export const finishAthleteTrainingVM = async (
  athleteTrainingId: string,
  overallTimeElapsed: number
) => {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return await updateAthleteTrainingTrackingService(athleteTrainingId, {
    status: 'done',
    timeElapsed: overallTimeElapsed,
    dateExecuted: now
  });
};

export const trackExerciseSetVM = async (
  athleteTrainingExerciseId: string,
  elapsedSeconds: number
) => {
  return await updateAthleteTrainingExerciseTrackingService(
    athleteTrainingExerciseId,
    elapsedSeconds
  );
};

export const getAthletesAndEquipmentsVM = async () => {
  const athletes = await getAthletesService();
  const equipments = await getEquipmentsService();

  const athleteDropdown = athletes.map((a: any) => ({
    label: `${a.player_no} ${a.last_name}, ${a.first_name}${a.middle_name ? ' ' + a.middle_name : ''}`,
    value: a.athlete_no.toString()
  }));

  const equipmentDropdown = equipments.map((e: any) => ({
    label: e.name,
    value: e.equipment_id.toString()
  }));

  return { athleteDropdown, equipmentDropdown };
};
