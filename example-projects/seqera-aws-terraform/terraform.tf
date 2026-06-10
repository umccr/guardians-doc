terraform {
  required_providers {
    time = {
      source  = "hashicorp/time"
      version = "~>0"
    }
    aws = {
      source = "hashicorp/aws"
      version = "~>6"
    }
    seqera = {
      source  = "seqeralabs/seqera"
      version = "0.40.0-rc8"
    }
  }
}

provider "aws" {
  region = "ap-southeast-2"
}

# we create AWS resources in the context of the current AWS caller
# so sometimes we need this value
data "aws_caller_identity" "current" { }

# equally the current region is useful
data "aws_region" "current" { }

data "aws_availability_zones" "available" {
  state = "available"
}

provider "seqera" {
  server_url  = var.seqera_server_url
  bearer_auth = var.seqera_bearer_auth
}
