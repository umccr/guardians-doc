# Seqera AWS Terraform

An example of deploying a Seqera workspace on AWS using Terraform. This
includes *both* the AWS resources and the corresponding API calls on
a Seqera instance to create the workspace.

All AWS settings such as VPC subnets are automatically passed across
into the Seqera workspace configuration – meaning that there is no
need for any manual copy/paste or clicking in the Seqera web UI
to properly configure workspaces.

## Usage

Set the following environment variables to your details of your Seqera
instance.

```bash
export TF_VAR_seqera_server_url="https://seqera.our.org.au/api"
export TF_VAR_seqera_bearer_auth="eyJ0...."
export TF_VAR_seqera_org_id="12345678905678"
```

You must also set your AWS credentials in the usual way. For instance, we use `granted` so we
do `assume our-account-name` which sets `AWS_ACCESS_KEY_ID` and
`AWS_SECRET_ACCESS_KEY` correctly for operation in our account. You could equally use
profiles or any other supported technique with Terraform for providing
AWS credentials.

There is a step-by-step guide to this technique at the location where
this repo is published.
