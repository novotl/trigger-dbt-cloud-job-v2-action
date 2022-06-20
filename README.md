# Trigger DBT Cloud Job action

This action triggers a job run hosted on [DBT Cloud](https://cloud.getdbt.com).

**Supports: DBT Cloud API v2**.

### Inputs.
  > **Required**:
  > - dbt_cloud_token - DBT cloud api token.
  > - dbt_cloud_account_id - DBT cloud account id.
  > - dbt_cloud_job_id - DBT cloud job id.
  
  > **Optional**:
  > - cause - Cause message to use. [Default=`"Triggered from Github"`].
  > - interval - The interval between polls in seconds. [Default=`30`].
  > - git_sha - The git sha to check out before running this job.
  > - git_branch - The git branch to check out before running this job.
  > - schema_override - Override the destination schema in the configured target for this job.

### Example usage.
```yaml
uses: triedandtested-dev/trigger-dbt-cloud-job-v2-action@v1.3
with:
  dbt_cloud_token: '${{ secrets.DBT_CLOUD_API_TOKEN }}'.
  dbt_cloud_account_id: ${{ secrets.DBT_ACCOUNT_ID }}
  dbt_cloud_job_id: 00000 # id of job you want to run.
  cause: 'Tiggered from my action'
  interval: 30
```
