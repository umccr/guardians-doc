# the AWS permissions associated with our users will immediately be used by Seqera for
# creating compute environments - which means that unless all the policy attachments etc
# have propagated through AWS "eventual consistency" - you can get a race condition of
# the compute env creation failing in various way
# we add in this deliberate delay to allow the AWS network and AWS IAM system to settle
# 30 seconds is arbitrary but seems perfectly adequate so far
resource "time_sleep" "wait_for_user_complete" {
  create_duration = "30s"
  depends_on = [
    aws_iam_group_policy_attachment.attach_policies_to_group_1,
    aws_iam_group_policy_attachment.attach_policies_to_group_2,
    aws_iam_group_policy_attachment.attach_policies_to_group_3,
    aws_iam_group_policy_attachment.attach_policies_to_group_4,
    aws_iam_access_key.batch_forge_access_key,
    // the VPC endpoint will only be created after the vpc and subnets so it is a good
    // one to wait for
    aws_vpc_endpoint.s3
  ]
}
