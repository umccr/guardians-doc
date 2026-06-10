# generate an access key for the IAM user - which will be available to create Seqera
# credentials
# NOTE: whilst the secret in this is marked "secure" - care still needs to be
#       taken because this value will go into the Terraform state in plain text. So make sure
#       terraform state is not trivially readable by end users
resource "aws_iam_access_key" "batch_forge_access_key" {
  user = aws_iam_user.batch_forge_user.name
}
