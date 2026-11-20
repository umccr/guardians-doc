/*
 * GUARDIANS solution architecture (C4 model).
 *
 * Render to SVG with:   ./scripts/architecture/render.sh
 * Output goes to:       public/diagrams/architecture/<view-key>.svg
 *
 * Every view needs a stable key (the first string after the scope) because
 * the key becomes the SVG filename referenced from the docs.
 */
workspace "GUARDIANS" "Solution architecture for the GUARDIANS genomic data nodes." {

    !identifiers hierarchical

    model {
        custodian = person "Data Custodian" "Holds genomic data and decides who may access it."
        researcher = person "Researcher" "Applies for access to, and analyses, released datasets."

        aaf = softwareSystem "AAF" "Australian Access Federation identity provider." "External"
        custodianStore = softwareSystem "Custodian Storage" "Object storage (S3 or S3-compatible) holding the custodian's source data." "External"

        gdn = softwareSystem "Genomic Data Node" "Bridges custodian-held data and researcher environments." {
            rems = container "REMS" "Manages data access applications and entitlements." "Clojure"
            copy = container "Data Copy" "Copies datasets from custodian storage into the node." "AWS Step Functions"
            storage = container "Dataset Storage" "Holds formatted datasets awaiting release." "Amazon S3" "Storage"
            htsget = container "htsget" "Streams authorised slices of genomic data." "htsget-rs"
        }

        env = softwareSystem "Researcher Environment" "Compute environment where approved research happens." "External"

        custodian -> gdn.rems "Approves access applications in"
        custodian -> gdn.copy "Initiates dataset copies with"
        researcher -> gdn.rems "Applies for data access in"
        researcher -> env "Analyses data in"
        researcher -> aaf "Authenticates with"
        gdn.rems -> aaf "Delegates login to" "OIDC"
        gdn.copy -> custodianStore "Reads source objects from" "S3 API"
        gdn.copy -> gdn.storage "Writes datasets to"
        gdn.htsget -> gdn.storage "Reads data from"
        gdn.htsget -> gdn.rems "Checks entitlements with"
        env -> gdn.htsget "Requests htsget tickets from" "HTTPS"
        env -> gdn.storage "Fetches ticketed byte ranges from" "HTTPS (pre-signed URLs)"
    }

    views {
        systemContext gdn "gdn-context" "System context of a genomic data node." {
            include *
            autolayout lr
        }

        container gdn "gdn-containers" "Containers within a genomic data node." {
            include *
            autolayout lr
        }

        dynamic gdn "gdn-dataset-ingest" "A custodian brings a dataset into the node." {
            custodian -> gdn.copy "Starts a copy with a list of objects"
            gdn.copy -> custodianStore "Reads (and thaws if needed) source objects"
            gdn.copy -> gdn.storage "Writes objects and verifies checksums"
            autolayout lr
        }

        dynamic gdn "gdn-access-application" "A researcher applies for, and is granted, access to a dataset." {
            researcher -> gdn.rems "Opens the catalogue and starts an application"
            gdn.rems -> aaf "Redirects the researcher to log in"
            researcher -> gdn.rems "Completes the form and accepts licences"
            custodian -> gdn.rems "Reviews and approves the application"
            autolayout lr
        }

        dynamic gdn "gdn-data-access" "An approved researcher reads genomic data from their environment." {
            researcher -> env "Runs an analysis"
            env -> gdn.htsget "Requests a region of a sample"
            gdn.htsget -> gdn.rems "Checks the caller's entitlements"
            gdn.htsget -> gdn.storage "Reads indexes to work out byte ranges"
            env -> gdn.storage "Fetches the byte ranges named in the tickets"
            autolayout lr
        }

        styles {
            element "Element" {
                color #ffffff
            }
            element "Person" {
                shape person
                background #08427b
            }
            element "Software System" {
                background #1168bd
            }
            element "Container" {
                background #438dd5
            }
            element "External" {
                background #999999
            }
            element "Storage" {
                shape cylinder
            }
        }
    }

}
