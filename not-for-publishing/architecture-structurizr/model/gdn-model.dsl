/*
 * GUARDIANS C4 model — people, systems, and containers.
 * Included by workspace.dsl via !include.
 */

properties  {

    "structurizr.groupSeparator" "/"

}

aaf  = softwareSystem "AAF" "Australian Access Federation identity provider." "External"

group "Australian Genomics Community"  {


    rems  = softwareSystem "REMS" "Manages data access applications and entitlements." "External"

    group "Custodian organisation"  {

        custodian  =  person "Data Custodian" "Holds genomic data and decides who may access it."

        custodianStore  =  softwareSystem "Long Term Data Storage" "Object storage holding the custodian's source data." "Storage"
    }

    group "Node organisation"  {

        dataManager  =  person "Data Manager" "Coordinates data activity for a node to the benefit of data custodians and researchers."

        gdn  =  softwareSystem "Genomic Data Node" "Bridges custodian-held data and researcher environments."  {

            copy  =  container "Data Copy" "Copies datasets from custodian storage into the node." "AWS Step Functions"
            cache  =  container "Dataset Cache" "Holds cached datasets." "Amazon S3" "Storage"

            gdn.copy  ->  custodianStore "Caches data from" "S3 API or other"
            gdn.copy  ->  gdn.cache "Caches datasets to"

            htsget  =  container "htsget" "Streams authorised slices of genomic data." "htsget-rs"
            dataReleaser  =  container "Data Releaser" "Coordinates actaul data release" "data-releaser"

            gdn.htsget  ->  gdn.cache "Serves data from"

        }

        dataManager  ->  gdn.dataReleaser "Controls data activity in"

    }

    group "Researcher organisation"  {

        seqera  =  softwareSystem "Seqera" "An analyses environment for researchers." "External"

        researcher  =  person "Researcher" "Does science using data."
    }

}

rems  ->  aaf "Provides login support"

custodian  ->  rems "Approves access applications in"

researcher  ->  rems "Applies for data access in"
researcher  ->  seqera "Analyses data in"

dataManager  ->  rems "Get permissions to share from"

seqera  ->  gdn "Fetches data from" "S3 API / htsget API"
seqera -> aaf "Provides login support"
