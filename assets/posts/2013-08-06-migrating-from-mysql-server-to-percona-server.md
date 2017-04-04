---
title: Migrating from MySQL Server to Percona Server
author: shane
layout: post
date: 2013-08-06
categories:
  - All Posts
  - DevOps
tags:
  - mysql
  - percona
alias:
  - /migrating-from-mysql-server-to-percona-server/
  - /devops/migrating-from-mysql-server-to-percona-server/
---

## What is Percona Server, and why should I care?

Blogs across the Internet have been benchmarking Percona Server against MySQL Server, e.g. [MySQL Performance Blog][1], and the results continually seem to have Percona ahead in many regards. This increased and stable performance for your database will help ensure performance and reliability in your applications.

<!--more-->

According to [Percona's site][2],

> Percona Server is an enhanced, drop-in MySQL replacement. With Percona Server,
>
>   * Queries will run faster and more consistently
>   * You can consolidate servers on powerful hardware
>   * Sharding is delayed or avoided entirely
>   * You can save money on hosting fees and power
>   * You can spend less time tuning and administering
>   * You can achieve higher uptime
>   * Troubleshooting does not require guesswork
>
> A free open source solution, Percona Server is a MySQL alternative which offers breakthrough performance, scalability, features, and instrumentation. Self-tuning algorithms and support for extremely high-performance hardware make it the clear choice for organizations that demand excellent performance and reliability from their MySQL database server.

## Alright, how do I get this installed on my server? Will I lose existing data?

Transitioning to Percona Server is as easy as 1, 2, 3.

  1. Backup your databases with mysqldump or another similar method. (Recommended, but not required.)
  2. Uninstall MySQL Server with apt-get remove mysql-server (on Ubuntu).
  3. Install Percona Server with these steps:
      1. `apt-key adv --keyserver keys.gnupg.net --recv-keys 1C4CBDCDCD2EFD2A`
      2. `deb http://repo.percona.com/apt [YOUR UBUNTU VERSION, e.g. quantal for 12.10] main`
      3. `deb-src http://repo.percona.com/apt [YOUR UBUNTU VERSION] main`
      4. `apt-get update`
      5. `apt-get install percona-server-5.5`

The MySQL command-line tools and drivers should continue to work as they did prior to the transition to Percona Server, so your workflow will remain the same for managing and interfacing with Percona Server.

 [1]: http://www.mysqlperformanceblog.com/2013/05/08/mysql-and-percona-server-in-linkbench-benchmark/
 [2]: http://www.percona.com/software/percona-server
