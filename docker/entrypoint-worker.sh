#!/usr/bin/env bash
# STRATIA Phase 3 — Railway worker entrypoint.
#
# Upstream Twenty's production image already runs `cron:register:all` on the
# *server* container via packages/twenty-docker/twenty/entrypoint.sh, and that
# command (see src/database/commands/cron-register-all.command.ts) already
# includes `WorkflowCronTrigger`. Cron triggers are registered into a shared
# queue and then *executed* by the worker container — so on a healthy Railway
# deploy with `DISABLE_CRON_JOBS_REGISTRATION` unset the cron is already live.
#
# This wrapper script is a belt-and-suspenders safeguard for Railway worker
# services that run the plain `twentycrm/twenty:v1.20.0` image without going
# through the server entrypoint. It:
#
#   1. Starts the Twenty worker in the background (`yarn worker:prod`)
#   2. Waits a few seconds for the worker to bind its queue connections
#   3. Re-runs `yarn command:prod cron:workflow:automated-cron-trigger` so the
#      WorkflowCronTriggerCronJob is guaranteed to be scheduled even if the
#      server entrypoint never ran or DISABLE_CRON_JOBS_REGISTRATION was true.
#   4. Waits on the worker PID so the container exits if the worker crashes.
#
# Railway usage — two options (see 03-RAILWAY-ENV.md for details):
#   (A) Pre-Deploy Command: set the worker service's Pre-Deploy Command to
#       `yarn command:prod cron:workflow:automated-cron-trigger`. No custom
#       image required.
#   (B) Custom Dockerfile: build a thin wrapper image that COPYs this file to
#       /usr/local/bin/entrypoint-worker.sh and sets it as ENTRYPOINT.
#
# STRATIA: the `# STRATIA:` marker below is a rebase anchor — grep for it
# during monthly upstream rebases so the script is re-applied if deleted.
# STRATIA: do not remove this script unless Phase 3 cron automations are
# STRATIA: retired in a follow-up plan.

set -euo pipefail

echo "[stratia-entrypoint] starting twenty worker..."

# Start the worker as a background process so we can register the
# workflow cron trigger after it has initialized its queue connections.
yarn worker:prod &
WORKER_PID=$!

# Give the worker ~5 seconds to bind Redis/Postgres connections before
# attempting to register the cron trigger. 5s is empirically enough for
# Twenty's worker boot on Railway (typically <2s) without blocking startup.
sleep 5

echo "[stratia-entrypoint] registering workflow cron trigger (belt-and-suspenders)..."

# yarn command:prod cron:workflow:automated-cron-trigger
# This is the command name verified in
# twenty/packages/twenty-server/src/modules/workflow/workflow-trigger/automated-trigger/crons/commands/workflow-cron-trigger.cron.command.ts
# Failing to register is non-fatal — the upstream server entrypoint usually
# handled it already and we do not want the worker container to crash-loop
# if Redis happens to be briefly unreachable at startup.
if yarn command:prod cron:workflow:automated-cron-trigger; then
  echo "[stratia-entrypoint] WorkflowCronTrigger registration succeeded"
else
  echo "[stratia-entrypoint] WARN: cron:workflow:automated-cron-trigger failed to register — check WorkflowCronTrigger logs in the next 60s"
fi

echo "[stratia-entrypoint] cron registration done, waiting on worker PID=$WORKER_PID"
wait $WORKER_PID
