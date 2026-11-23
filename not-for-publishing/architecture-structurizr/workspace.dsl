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
        !include model/gdn-model.dsl
    }

    views {
        // set up styles first
        !include views/styles.dsl

        !include views/gdn-system-landscape.dsl
        !include views/gdn-system-context.dsl
        !include views/gdn-container.dsl
        !include views/gdn-views.dsl
    }

}
