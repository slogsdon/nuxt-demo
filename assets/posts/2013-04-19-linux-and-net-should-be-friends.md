---
title: Linux and .NET should be friends
author: shane
layout: post
date: 2013-04-19
categories:
  - All Posts
  - Programming
tags:
  - .net
  - linux
alias:
  - /linux-and-net-should-be-friends/
  - /net/linux-and-net-should-be-friends/
  - /posts/net/linux-and-net-should-be-friends/
description: Linux and Microsoft's .NET framework haven't always seen eye to eye. The Mono Project looks to get Linux and .NET on the same page.
---

Linux and Microsoft's .NET framework haven't always seen eye to eye. Linux allows the web to be written and hosted with software that costs nothing. On the other hand, .NET needs a copy of Visual Studio in which to be written (not free) and needs a copy of Windows on which to be run (also not free). All of that remains to be _mostly_ true thanks to the [Mono Project][1].

<!--more-->

## Why Linux?

I'm a open-source hobbyist. Always have been. The idea of open-source software has always intrigued me, mainly with the idea that if I was presented with something and I wanted to change it, I could. There's a part of WordPress that I despise. Consider it changed, either with a plugin or even changing the core code. With the release of services like GitHub that allow the distribution of and collaboration on open-source software, this becomes even easier.

Whilst dealing with open-source software, I had always read Linux takes the cake in terms of hosting said software. Apache, Light HTTP, nginx. MonogDB, MySQL, Postgres, Redis. Perl, PHP, Python, Ruby. All of these are open-source. All run on Linux. All are free.99.

I have grown fond of the tools available in Linux environments and the accessibility of which i can attain these tools. Apache isn't cutting it anymore? I can install nginx and its low-memory footprint with a simple `apt-get install nginx`. Package managers like apt, yum, etc. allow me to run that command to install and configure practically all the software I would need to run a web site and do it easily.

## Why .NET?

With all this talk of open-source, why would I want to include the closed-source .NET framework?

  1. It's fast thanks to the precompiled nature of .NET.
  2. Visual Studio.
  3. We focus on development with .NET at work.

I like speed. I have spent hours upon hours configuring Varnish and nginx as reverse-proxy caches on various servers. I am even porting WordPress functionality into a plugin for [another CMS][2] to speed up the software. Both of these (plus loads more) all in the name of speed.

I like Visual Studio. Nay, I love it. Arguably one of the best IDE's available today. Full debugging features, NuGet, and the speed increases made in 2012 are some of of the parts that make my job easier.

## Linux and .NET together? You're a fool!

The Mono Project has been moving along swimmingly. Its current major version (3, in beta) a large majority of .NET 4.5 (the most recent release) and almost all of .NET 4. Double plus good signs that .NET on Linux operating systems are headed in the right direction. It doesn't hurt that Microsoft is open-sourcing many of the core libraries that make up .NET, allowing the Mono Project team to include those libraries in mono. I was able to get a .NET 4 WebForms project running on Ubuntu Sever 12.10 with the latest nginx package, mono 3.0.6 (from [meeby's beta packages][3], and xsp built from the latest source.

With a basic implementation running behind nginx, I can now start getting into more in-depth projects, incorporating MongoDB (and not worrying about it eating all of Windows' memory) and Varnish. Soon, I will be creating a step-by-step screencast to help others set up similar environments, so stay in the loop.

 [1]: http://www.mono-project.org
 [2]: https://github.com/slogsdon/unamed
 [3]: https://www.meebey.net/posts/mono_3.0_preview_debian_ubuntu_packages/
