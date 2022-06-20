const axios = require('axios')
const core = require('@actions/core');

const run_status = {
  1: 'Queued',
  2: 'Starting',
  3: 'Running',
  10: 'Success',
  20: 'Error',
  30: 'Cancelled'
}

const dbt_cloud_api = axios.create({
  baseURL: 'https://cloud.getdbt.com/api/v2/',
  timeout: 1000,
  headers: {
    'Authorization': `Bearer ${core.getInput('dbt_cloud_token')}`,
    'Content-Type': 'application/json'
  }
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function run_job(account_id, job_id, cause, git_sha, git_branch, schema_override) {
  body = {
    'cause': cause
  }

  if (git_sha) {
    body['git_sha'] = git_sha
  }

  if (git_branch) {
    body['git_branch'] = git_branch
  }

  if (schema_override) {
    body['schema_override'] = schema_override
  }

  return new Promise((resolve, reject) => {
    dbt_cloud_api.post(`/accounts/${account_id}/jobs/${job_id}/run/`, body)
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

function get_job_run(account_id, run_id) {
  return new Promise((resolve, reject) => {
    dbt_cloud_api.get(`/accounts/${account_id}/runs/${run_id}/`)
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}


async function executeAction() {

  const account_id = core.getInput('dbt_cloud_account_id');
  const job_id = core.getInput('dbt_cloud_job_id');
  const cause = core.getInput('message');
  const git_sha = core.getInput('git_sha');
  const git_branch = core.getInput('git_branch');
  const schema_override = core.getInput('schema_override');

  let res = await run_job(account_id, job_id, cause, git_sha, git_branch, schema_override);
  let run_id = res.data.id;

  core.info(`Triggered job. ${res.data.href}`);

  while (true) {
    await sleep(core.getInput('interval') * 1000);
    let res = await get_job_run(account_id, run_id);
    let run = res.data;

    core.info(`${run.id} - ${run_status[run.status]}`);

    if (run.finished_at) {
      core.info('job finished');

      let status = run_status[run.status];

      if (status != 'Success') {
        core.setFailed(`job finished with '${status}'.`);
        return;
      }

      core.info(`job finished with '${status}'.`);
      return `job finished with '${status}'.`;
    }
  }
}



executeAction().catch(e => {
  core.setFailed('There has been a problem with running your dbt cloud job: ' + e.message);
});

