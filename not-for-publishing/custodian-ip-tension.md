---

## Appendix: The Custodian-IP Tension

_A thought piece — not necessarily a discussion to open with stakeholders, but worth articulating._

There is a persistent tension in genomic data sharing negotiations around intellectual property that reveals a conceptual confusion between **custodianship** and **ownership**.

Data custodians — hospitals, biobanks, research institutes — are stewards. They hold and govern data on behalf of participants, under ethics approval and consent. Their role is protective and administrative: they invested in collection, processing, storage, and curation. This is real and valuable work, but it is not the kind of intellectual contribution that generates IP rights under Australian law.

IP rights (patents, copyright) arise from **intellectual creativity** — the act of invention, discovery, or original expression. Raw genomic data is not subject to copyright (it is factual information, not creative expression). A curated database might attract limited compilation copyright, but the underlying sequences are not "owned" by anyone in the IP sense.

Yet in practice, custodial institutions routinely negotiate DSAs as if they hold IP rights over the data itself — demanding:

- Co-authorship on publications arising from data use
- Revenue-sharing from commercialisation of findings
- Veto or approval rights over publications
- Assignment or licensing of IP arising from analyses performed on "their" data

The justifications typically offered are:

- "We invested in collecting and curating this data" — a legitimate interest in recognition and sustainability, but not an IP entitlement
- "Our ethics approval requires us to control downstream use" — a governance obligation to participants, not a property right against researchers
- "Our institutional IP policy requires claims on anything touching our resources" — a policy choice by the institution, not a legal right

This conflation of custodial responsibility with ownership claims is one of the major sources of friction in data sharing. Negotiations that should take days take months. Collaborations that should span multiple institutions collapse into bilateral arrangements because the IP negotiations are too complex. Researchers avoid datasets with onerous IP terms, reducing the impact of publicly-funded data collections.

### Relevance to the infrastructure operator

One of the advantages of a thin infrastructure operator explicitly disclaiming any IP interest is that it **breaks this pattern** rather than adding another claimant to the table. The operator's position is simple: "We provide plumbing. We have no interest in what you discover using it. Our service agreement covers operational matters only." (This posture is developed further in [The Thin Infrastructure Operator Model](/genomic-data-nodes/thin-operator-model/).)

This is analogous to how AWS, Azure, or GCP operate — no cloud provider claims IP over research conducted on their infrastructure. The infrastructure operator should adopt the same posture, and make it contractually unambiguous.

More broadly, if the sector can establish shared infrastructure with a clean IP position, it may also create pressure for custodians to re-examine their own IP claims — particularly where those claims slow down research without meaningfully benefiting participants or the public interest. But that is a conversation for another day.


---

## Key Themes

### Data Sovereignty and Jurisdiction

- Where does the data physically reside, and which legal jurisdiction governs it?
- Cross-border data sharing implications (e.g. Australian Privacy Act, GDPR equivalence)
- Institutional vs national vs international governance layers

### Consent and Authorisation Models

- Patient/participant consent — granularity, withdrawal, re-consent
- Tiered/dynamic consent frameworks
- Distinction between consent for clinical care vs research use

### Trust Frameworks

- What does "trust" mean between nodes?
- Federation vs centralisation — trust at the network level
- Identity assurance and authentication as a foundation of trust (AAI/AAF)
- Mutual recognition of governance standards between institutions

### Data Access Governance

- Who decides who can access what?
- Data Access Committees (DACs) — role, composition, decision-making
- Programmatic vs human-in-the-loop access decisions
- Audit trails and accountability

### Legal Instruments

- Data sharing agreements — bilateral vs multilateral
- Memoranda of understanding (MOUs)
- Material/data transfer agreements
- Contractual vs statutory obligations
- Liability and indemnity between nodes

### Intellectual Property and Benefit Sharing

- IP arising from federated analyses
- Benefit-sharing with data contributors / communities
- Publication and attribution norms

### Risk and Compliance

- Re-identification risk in genomic data
- Safe harbour / five safes framework applicability
- Breach notification and incident response across nodes

---
