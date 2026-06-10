
# an IAM user which will be used by Seqera to then create Batch environments
resource "aws_iam_user" "batch_forge_user" {
  name = "seqera-${var.seqera_short_name}-batch-forge-user"
}

# an IAM group we will put the user in - this is recommended AWS technique (see IAM.2 security control)
resource "aws_iam_group" "batch_forge_group" {
  name = "seqera-${var.seqera_short_name}-batch-forge-group"
}

resource "aws_iam_user_group_membership" "batch_forge_user_in_group" {
  user = aws_iam_user.batch_forge_user.name

  groups = [
    aws_iam_group.batch_forge_group.name
  ]
}

# standard policies as recommended by Seqera documentation
# https://github.com/seqeralabs/nf-tower-aws/tree/master/forge

resource "aws_iam_policy" "batch_forge_policy" {
  # NOTE: these can't be inline policies as they are > 2048 characters
  # therefore we need to make a uniquely named policy for each user
  name_prefix = "seqera-${var.seqera_short_name}-forge-policy"
  description = "Policy giving permissions to Forge to create Seqera compute environments"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Resource = "*",
        Action = [
          "ssm:GetParameters",
          "iam:CreateInstanceProfile",
          "iam:DeleteInstanceProfile",
          "iam:GetRole",
          "iam:RemoveRoleFromInstanceProfile",
          "iam:CreateRole",
          "iam:CreateServiceLinkedRole",
          "iam:DeleteRole",
          "iam:AttachRolePolicy",
          "iam:PutRolePolicy",
          "iam:AddRoleToInstanceProfile",
          "iam:PassRole",
          "iam:DetachRolePolicy",
          "iam:ListAttachedRolePolicies",
          "iam:DeleteRolePolicy",
          "iam:ListRolePolicies",
          "iam:TagRole",
          "iam:TagInstanceProfile",
          "batch:CreateComputeEnvironment",
          "batch:DescribeComputeEnvironments",
          "batch:CreateJobQueue",
          "batch:DescribeJobQueues",
          "batch:UpdateComputeEnvironment",
          "batch:DeleteComputeEnvironment",
          "batch:UpdateJobQueue",
          "batch:DeleteJobQueue",
          "fsx:DeleteFileSystem",
          "fsx:DescribeFileSystems",
          "fsx:CreateFileSystem",
          "fsx:TagResource",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeAccountAttributes",
          "ec2:DescribeSubnets",
          "ec2:DescribeLaunchTemplates",
          "ec2:DescribeLaunchTemplateVersions",
          "ec2:CreateLaunchTemplate",
          "ec2:DeleteLaunchTemplate",
          "ec2:DescribeKeyPairs",
          "ec2:DescribeVpcs",
          "ec2:DescribeInstanceTypeOfferings",
          "ec2:GetEbsEncryptionByDefault",
          "elasticfilesystem:DescribeMountTargets",
          "elasticfilesystem:CreateMountTarget",
          "elasticfilesystem:CreateFileSystem",
          "elasticfilesystem:DescribeFileSystems",
          "elasticfilesystem:DeleteMountTarget",
          "elasticfilesystem:DeleteFileSystem",
          "elasticfilesystem:UpdateFileSystem",
          "elasticfilesystem:PutLifecycleConfiguration",
          "elasticfilesystem:TagResource"
        ]
      }
    ]
  })
}

resource "aws_iam_policy" "launch_policy_base" {
  name_prefix = "seqera-${var.seqera_short_name}-launch-policy"
  description = "Policy giving base permissions for both Seqera Launch and Batch Forge"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # we do not mind allowing all the buckets to be listed by the UI
      {
        Effect   = "Allow"
        Resource = "*",
        Action = [
          "s3:ListAllMyBuckets",
          "s3:GetBucketLocation",
          "s3:GetBucketAcl"
        ]
      },
      # we are happy to give broad read-only S3 access to the UI and forge - but only for
      # buckets *outside* our own account
      # access to *inside* our account we want to give explicitly
      {
        Effect   = "Allow"
        Resource = "*",
        Action = [
          "s3:Get*",
          "s3:List*"
        ]
        Condition = {
          "StringNotEquals" : {
            "s3:ResourceAccount" : [
              data.aws_caller_identity.current.account_id
            ]
          }
        }
      },
      {
        Effect   = "Allow"
        Resource = "*",
        Action = [
          "batch:DescribeJobQueues",
          "batch:CancelJob",
          "batch:SubmitJob",
          "batch:ListJobs",
          "batch:TagResource",
          "batch:DescribeComputeEnvironments",
          "batch:TerminateJob",
          "batch:DescribeJobs",
          "batch:RegisterJobDefinition",
          "batch:DescribeJobDefinitions",
          "ecs:DescribeTasks",
          "ec2:DescribeInstances",
          "ec2:DescribeInstanceTypes",
          "ec2:DescribeInstanceAttribute",
          "ecs:DescribeContainerInstances",
          "ec2:DescribeInstanceStatus",
          "ec2:DescribeImages",
          "logs:Describe*",
          "logs:Get*",
          "logs:List*",
          "logs:StartQuery",
          "logs:StopQuery",
          "logs:TestMetricFilter",
          "logs:FilterLogEvents",
          "ses:SendRawEmail"
        ]
      }
    ]
  })
}

resource "aws_iam_policy" "launch_data_policy" {
  name_prefix = "seqera-${var.seqera_short_name}-launch-data-policy"
  description = "Policy giving working bucket data access for Seqera Launch"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Resource = aws_s3_bucket.working_bucket.arn,
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
      },
      {
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.working_bucket.arn}/*",
        Action = [
          "s3:GetObject",
          "s3:GetObjectTagging",
          "s3:PutObject",
          "s3:PutObjectTagging",
          "s3:DeleteObject"
        ]
      }

    ]
  })
}

resource "aws_iam_policy" "launch_secret_policy" {
  name_prefix = "seqera-${var.seqera_short_name}-launch-secret-policy"
  description = "Policy giving secrets access for Seqera Launch"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Resource = "*",
        Action = [
          "secretsmanager:DescribeSecret",
          "secretsmanager:DeleteSecret",
          "secretsmanager:ListSecrets",
          "secretsmanager:CreateSecret"
        ]
      }
    ]
  })
}


resource "aws_iam_group_policy_attachment" "attach_policies_to_group_1" {
  group      = aws_iam_group.batch_forge_group.name
  policy_arn = aws_iam_policy.batch_forge_policy.arn
}

resource "aws_iam_group_policy_attachment" "attach_policies_to_group_2" {
  group      = aws_iam_group.batch_forge_group.name
  policy_arn = aws_iam_policy.launch_policy_base.arn
}

resource "aws_iam_group_policy_attachment" "attach_policies_to_group_3" {
  group      = aws_iam_group.batch_forge_group.name
  policy_arn = aws_iam_policy.launch_data_policy.arn
}

resource "aws_iam_group_policy_attachment" "attach_policies_to_group_4" {
  group      = aws_iam_group.batch_forge_group.name
  policy_arn = aws_iam_policy.launch_secret_policy.arn
}

