variable "seqera_bearer_auth" {
  type      = string
  sensitive = true
}
variable "seqera_server_url" {
  type = string
}
variable "seqera_org_id" {
  type = number
}
variable "seqera_short_name" {
  type = string
  default = "analysis"
}
variable "seqera_maintainers" {
  type = list(string)
  default = [
    // insert a list of email address (as registered in your seqera instance)
    // for users that will be made maintainers in the workspace
  ]
}
