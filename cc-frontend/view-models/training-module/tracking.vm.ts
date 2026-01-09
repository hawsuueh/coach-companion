import {
  getTrainingTrackingService,
  getAthletesService,
  getAthleteTrackingService
} from '@/services/training-module';
import { formatDate } from '@/utils/formatDate';
import { formatTime } from '@/utils/formatTime';

export const getTrainingTrackingVM = async (trainingId: string) => {
  const { training, athleteTracking } =
    await getTrainingTrackingService(trainingId);

  const trainingVM = {
    trainingId: training.training_id,
    name: training.name,
    date: formatDate(training.date),
    time: formatTime(training.time),
    duration: training.duration
  };

  const athleteTrackingVM = athleteTracking.map((r: any) => {
    const athlete = r.athlete_training.athlete;
    return {
      trackingId: r.athlete_training_tracking_id,
      athleteId: athlete.athlete_no,
      number: athlete.player_no,
      name: `${athlete.last_name}, ${athlete.first_name}`,
      position: athlete.position,
      status: r.status,
      timeElapsed: r.time_elapsed,
      date: r.date
    };
  });

  return { training: trainingVM, athleteTracking: athleteTrackingVM };
};

export const getAthletesVM = async () => {
  const rows = await getAthletesService();
  return rows.map((a: any) => ({
    athleteId: a.athlete_no.toString(),
    number: a.player_no ?? '',
    name: `${a.last_name}, ${a.first_name}${a.middle_name ? ' ' + a.middle_name : ''}`,
    position: a.position,
    gmail: a.gmail,
    accountNo: a.account_no
  }));
};

export const getAthleteTrackingVM = async (athleteIdParam: string | number) => {
  const athleteId = Number(athleteIdParam);
  if (!athleteId || Number.isNaN(athleteId)) {
    return { athlete: null, trainingTracking: [] };
  }

  const athlete = await getAthleteTrackingService(athleteId);
  if (!athlete) return { athlete: null, trainingTracking: [] };

  const athleteVM = {
    athleteId: athlete.athlete_no,
    name: `${athlete.last_name}, ${athlete.first_name}${athlete.middle_name ? ' ' + athlete.middle_name : ''}`,
    position: athlete.position,
    number: athlete.player_no,
    gmail: athlete.gmail,
    accountNo: athlete.account_no
  };

  const trainingTrackingVM = athlete.athlete_training.flatMap((at: any) =>
    at.athlete_training_tracking.map((tr: any) => ({
      athleteTrainingTrackingId: tr.athlete_training_tracking_id,
      trainingId: at.training.training_id,
      name: at.training.name,
      dateTime: `${formatDate(at.training.date)} • ${formatTime(at.training.time)}`,
      status: tr.status,
      timeElapsed: tr.time_elapsed,
      dateExecuted: tr.date_executed
    }))
  );

  return { athlete: athleteVM, trainingTracking: trainingTrackingVM };
};
