import { generateTrainingService } from '@/services/training-generator.service';

export async function generateTrainingVM(athleteNo: number) {
  console.log('🧠 VM: Generate Training');

  const result = await generateTrainingService(athleteNo);

  console.log('✅ Training Generated:', result);

  return result;
}
