resource "seqera_workspace_participant" "maintainers" {
  for_each = toset(sort(var.seqera_maintainers))

  org_id       = var.seqera_org_id
  workspace_id = seqera_workspace.workspace.id
  email        = each.key
  role         = "maintain"
}
