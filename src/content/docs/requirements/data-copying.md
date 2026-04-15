---
title: Data Copying
---

## Document History

| Version | Date | Who | Change Summary |
|---------|------|-----|----------------|
| initial | May 2025 | AP | First version adding most content |

## Overarching User Story

As a technical administrator for datasets, I want to be able to copy numbers of objects from location to
location with a high degree of confidence in the integrity of the copied data. For governance reasons I
need to be able to selectively copy objects and not always copy an entire dataset. The types of objects
I need to copy are those involved in genomics – so objects may be both large and voluminous. I need to
be able to set the copy going and come back to it later – without necessarily keeping the triggering
device online – as for some datasets the copy may take hours or days.

The purpose of me copying the datasets is I either might be giving another researcher group a copy of
the data for their analysis, or I might be copying data between environments for our own purposes such
as consolidating data into one cloud or bringing data to a location where it has specific compute facilities.

It is not a requirement that I necessarily "own" the datasets but as a technical administrator for the
dataset it is assumed that I have a reasonable level of read access to the data.

## Roles

**Technical administrator** — a person who is managing datasets in object stores and wishes to move
  objects around – whilst this role is part of the overall motivation for the service, we instead
  will talk about a more generic Invoker.

**Invoker** — the person requesting the copy service initiate a copy – there is no permission model within the copy service (other than AWS permissions) - so we make no further assumptions about what role they are playing.

**Installer** — the person who has installed the copy service – has rights to install software that itself then can access objects and object store permissions.

## Requirements

| ID | Requirement | Comment / Rationale |
|----|-------------|---------------------|
| REQ-1 | The invoker can provide a list of specific objects to be copied and provide this in some easily constructable form when invoking the copy service | See NF-2 – the list of objects to copy could be many megabytes – so cannot fit on a command line (for instance) |
| REQ-2 | The invoker can provide some level of wildcards when specifying objects to be copied and those wildcards will expand to match those in the object store | |
| REQ-3 | The invoker can change the folder/directory structure of the source objects as part of the copy by specifying detailed instructions for where objects need to go beyond just an overall destination | |
| REQ-4 | *(converted to NF-6)* | |
| REQ-5 | The invoker can start a copy operation and track the resulting operation status over its duration | |
| REQ-6 | The invoker can specify an object that is in some form of storage that is not immediately accessible – and the service will wait for the object to become available | Genomic objects can go into cold storage (tape etc) and it should be the responsibility of the copy service to thaw the objects in a way suitable for copying |
| REQ-7 | If requiring objects be thawed from cold storage, the invoker can specify the rate at which these objects are thawed as there might be cost implications | This would only be true for object stores that offer cold storage and differential thawing rates |
| REQ-8 | The invoker can ask the service for a report on the eventual status of the copy for each object including statistics | See NF-2 – for a large list of objects the report could be in gigabytes |
| REQ-9 | The invoker can specify a destination that does not yet exist and wait for the destination to become set up correctly | Some transfers will be cross organisation and the correct destination setup will be outside the control of the invoker – it is useful to be able to trigger the copy service and have it wait days/weeks for the destination to be ready |
| REQ-10 | The invoker can specify a source of the copy that is a bucket in AWS S3 | |
| REQ-11 | The invoker can specify a destination of the copy that is a bucket in AWS S3 | |
| REQ-12 | The invoker can specify a source that is an S3 compatible service located on-prem at University of Melbourne | |
| REQ-13 | The invoker can request a copy operation to be performed twice and it will then behave idempotently such that if they already exist at the destination they are not recopied | It is useful to be able to rerun a copy (or re-run a similar copy) and have it do only the work needed to copy objects not already copied. See NF-5 |
| REQ-14 | The invoker can request that "cheap" compute is used | Depending on the transfer needs and appetite for restarts, the invoker may like to trade-off time and guarantees of completeness for cost |

## Non-Functional Requirements

| ID | Description | Comment / Rationale |
|----|-------------|---------------------|
| NF-1 | The system supports individual objects up to 256 GiB in size | This is larger than a normal high coverage whole genome object |
| NF-2 | The system supports datasets that may contain 1 million objects | National genomic initiatives in 2025 are talking about cohorts of the size 100,000 to 1,000,000 participants. This is not our expectation for the scale of our datasets – but choosing 1 million objects feels like a target that is achievable and gives us space to grow |
| NF-3 | The system supports data transfers that may take days | The expectation is that data transfers may take days (both in the size of data and the fact that some operations like bringing data from cold storage takes hours to days). The system should be able to operate with the expectation that it might run for days |
| NF-4 | Data transfers should not take weeks | Whilst it is expected that some aspects of the copy process may take days, the system should not be so slow that large datasets are unduly held up in the copy process. The system should attempt to use bandwidth where available and act concurrently where appropriate. If a reasonable sized transfer took weeks to copy then this would be a failure |
| NF-5 | Costs should be minimised, or at least should be controllable by the user as to how much exposure to costs they might have | Copying large datasets can be expensive in terms of network traffic (charges for moving data across a specific network) and compute (paying for the system doing the copy). The system should take cost minimisation as a design consideration |
| NF-6 | Copying objects from one location to another will be performed with a high degree of confidence | Large objects that get transferred between systems should be checkable to ensure that they have not incurred any data loss or alteration |


## Solution Architecture

Firstly, we should note that whilst the requirements for the copy service are somewhat technologically agnostic – in practice we will need to write and run the service in a particular cloud or on-prem location. Due to egress and speed concerns, a copy service written to run in AWS but which can copy objects between Google Cloud buckets – is not the service you would use to copy the Google objects.

To that end, we have documented here *only* a copy service that runs in AWS.

However the cloud-checksum tool that is used within the service *is* a tool that can be run anywhere – and performs a lot of the heavy lifting.

We will need to consider whether to write a different copy service for Kubernetes (say) that would then be the copy service to use for Google. This would only be done were the need to arise.

### Tool Design

- Reporting
- Checksumming
- Multi-part copying

## Contrasts

- Rclone
- Rsync
- Standard AWS tooling

## Glossary

| Term | Definition |
|------|------------|
| Dataset | A collection of objects coinciding with a meaningful grouping |
| File | See *object*. An object held on a filesystem is often referred to just as a file |
| Filesystem | A collection of files/objects, normally stored with "POSIX semantics" |
| Object | An immutable collection of bytes with potentially extra "metadata" key pairs |
| Object store | A collection of objects is stored in an object store – an object store can generally scale larger than a traditional filesystem – but has a more limited set of operations ("S3 semantics") |
| POSIX semantics | *(definition to be added)* |
| S3 semantics | *(definition to be added)* |

## Costings

### Large Data Copy Scenario

| Parameter | Value |
|-----------|-------|
| Number of objects | 1,000,000 (1M) |
| Average object size | 100 KiB |

### Cost of Creating Fake Dataset

| Item | Rate | Cost |
|------|------|------|
| PUT pricing (Australia) | $0.0055 per 1,000 | $0.0000055 per object |
| Storage pricing (Australia) | $0.025 per GiB | |
| Storage cost per month | number of objects × average object size × storage pricing | ~$2.38 |
| PUT cost | number of objects × PUT pricing Australia | $5.50 |

### Cost of Copying Fake Dataset

| Item | Rate | Cost |
|------|------|------|
| GET pricing (Australia) | $0.00044 per 1,000 | $4.40 |
| HEAD objects phase | number of objects × GET pricing Australia | $0.44 |