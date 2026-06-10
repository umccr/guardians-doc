resource "seqera_aws_batch_ce" "compute" {
  workspace_id = seqera_workspace.workspace.id

  name           = "${var.seqera_short_name}-compute-env"
  description    = "AWS Batch compute environment for workspace ${var.seqera_short_name}"
  credentials_id = seqera_aws_credential.credential.credentials_id

  config = {
    forge = {
      // alloc_strategy
      allow_buckets = [
        // this needs to be the last entry and must match the work_dir
        // (otherwise seqera and the terraform will drift)
        "s3://${aws_s3_bucket.working_bucket.id}"
      ]
      // arm64_enabled
      dispose_on_deletion = true
      // ebs_boot_size
      max_cpus        = 64
      min_cpus        = 0
      security_groups = [aws_security_group.security_group.id]
      subnets         = [for s in aws_subnet.public : s.id]
      type   = "SPOT"
      vpc_id = aws_vpc.main.id
    }
    region   = aws_s3_bucket.working_bucket.region
    work_dir = "s3://${aws_s3_bucket.working_bucket.id}"
  }
}
