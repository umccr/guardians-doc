resource "seqera_workspace" "workspace" {
  org_id     = var.seqera_org_id
  name       = var.seqera_short_name
  full_name  = var.seqera_short_name
  visibility = "PRIVATE"
}
