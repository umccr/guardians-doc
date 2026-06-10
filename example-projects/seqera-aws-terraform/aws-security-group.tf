
# NOTE that we choose to put the instances in a public subnet so we should
# be relatively careful of the ingress rules on this security group
# here we have a default of no access from external IPs
resource "aws_security_group" "security_group" {
  name_prefix = "seqera-${var.seqera_short_name}-security-group"
  description = "Allow suitable traffic for Seqera batch instances"
  vpc_id      = aws_vpc.main.id

  # see terraform docs for security groups - this may help with deleting resources
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4" {
  # allow all traffic out
  security_group_id = aws_security_group.security_group.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}
