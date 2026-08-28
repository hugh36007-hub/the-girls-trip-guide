-- thegirlstripguide.com is verified in Resend and the Girls-only worker has passed
-- live delivery verification. Enable only the Girls communications cron.

do $$
declare
  girls_job_id bigint;
begin
  select jobid into girls_job_id
  from cron.job
  where jobname = 'gtg-process-communications';

  if girls_job_id is null then
    raise exception 'gtg-process-communications cron job is missing';
  end if;

  perform cron.alter_job(girls_job_id, active := true);
end $$;
