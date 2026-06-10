
resource "aws_s3_bucket" "working_bucket" {
  bucket           = format("seqera-%s-work-%s-%s-an", var.seqera_short_name, data.aws_caller_identity.current.account_id, data.aws_region.current.region)
  bucket_namespace = "account-regional"

  # working artifacts should not need to be retained
  force_destroy = true
}

resource "aws_s3_bucket_policy" "working_bucket_policy" {
  bucket = aws_s3_bucket.working_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Deny",
        // by default - we do not want other Seqera users in the same account to be able to operate on the
        // content of the working bucket
        // this lets us create multiple workspaces in the same account but have the
        // working buckets separated *inside the seqera UI*. Outside the Seqera UI - AWS users will
        // be able to alter bucket policies and all sorts of things so it is not a comprehensive
        // security policy in that regard. It mainly denies casual browsing.
        Principal = "*",
        Action    =  ["s3:GetObject*", "s3:PutObject*", "s3:List*", "s3:DeleteObject*", "s3:RestoreObject"],
        Resource = [
          aws_s3_bucket.working_bucket.arn,
          "${aws_s3_bucket.working_bucket.arn}/*"
        ],
        Condition = {
          ArnLike = {
            "aws:PrincipalArn" = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/seqera-*-batch-forge-user"
          }
          StringNotEquals = {
            "aws:userid" = aws_iam_user.batch_forge_user.unique_id
          }
        }
      }
    ]
  })
}
