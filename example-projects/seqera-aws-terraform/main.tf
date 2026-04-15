terraform {
  backend "s3" {
    bucket       = "terraform-state"
    key          = "terraform.tfstate"
    region       = "ap-southeast-2"
    use_lockfile = true
  }

  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
    seqera = {
      source  = "seqeralabs/seqera"
      version = "~>0.30.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-2"
}

provider "seqera" {
  server_url  = "seqera.biocommons.org"
  bearer_auth = "atoken"
}
