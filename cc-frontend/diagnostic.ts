import supabase from './config/supabaseClient';

async function checkKenneth() {
  console.log('--- Checking for Kenneth Lance Apolinar ---');
  
  // 1. Check Accounts
  const { data: accounts, error: accountError } = await supabase
    .from('Account')
    .select('account_no, first_name, last_name, user_id')
    .or('first_name.ilike.%Kenneth%,last_name.ilike.%Kenneth%');
    
  if (accountError) console.error('Account Error:', accountError);
  else console.log('Accounts found:', accounts);

  // 2. Check Athletes
  const { data: athletes, error: athleteError } = await supabase
    .from('Athlete')
    .select('athlete_no, first_name, last_name, account_no')
    .or('first_name.ilike.%Kenneth%,last_name.ilike.%Kenneth%');

  if (athleteError) console.error('Athlete Error:', athleteError);
  else console.log('Athletes found:', athletes);
}

checkKenneth();
