resource "seqera_aws_credential" "credential" {
  depends_on = [
    time_sleep.wait_for_user_complete
  ]

  name         = "${var.seqera_short_name}-credentials"
  workspace_id = seqera_workspace.workspace.id

  access_key = aws_iam_access_key.batch_forge_access_key.id
  secret_key = aws_iam_access_key.batch_forge_access_key.secret
}
