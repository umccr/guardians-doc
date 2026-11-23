/*
 * GUARDIANS C4 views — static and dynamic diagrams.
 * Included by workspace.dsl via !include.
 *
 * Every view has a stable key; that key becomes the SVG filename under
 * public/diagrams/architecture/ when rendered by scripts/architecture/render.sh.
 */


dynamic gdn "gdn-dataset-ingest" "A custodian brings a dataset into the node." {
    gdn.copy -> custodianStore "Reads (and thaws if needed) source objects"
    gdn.copy -> gdn.cache "Writes objects and verifies checksums"
    autolayout lr
}

dynamic gdn "gdn-access-application" "A researcher applies for, and is granted, access to a dataset." {
    researcher -> rems "Opens the catalogue and starts an application"
    researcher -> rems "Completes the form and accepts licences"
    custodian -> rems "Reviews and approves the application"
    autolayout lr
}

dynamic gdn "gdn-data-access" "An approved researcher reads genomic data from their environment." {
    researcher -> seqera "Runs an analysis"
    gdn.htsget -> gdn.cache "Reads indexes to work out byte ranges"
//    seqera -> gdn.cache "Fetches the byte ranges named in the tickets"
    autolayout lr
}

