---
title: Vagrant is Awesome
author: shane
layout: post
date: 2013-08-07
categories:
  - All Posts
  - DevOps
tags:
  - devops
  - phalcon
  - php
  - vagrant
alias: /vagrant-is-awesome/
---

I've been working on PHP web apps for years, and over time, my development workflow has remained fairly constant:

  1. Configure new app in apache/nginx
  2. Starting coding to find out my environment is broken
  3. Fix my environment
  4. Continue coding
  5. Get bored
  6. See step 1

Managing DevOps items when I should be focusing on building a product is not beneficial to my productivity.

<!--more-->

## Enter [Vagrant][1].

Ever wanted to have a dev environment built for you automatically? Yeah, who doesn't? Vagrant can do that for you. With the help of Oracle's [VirtualBox][2], Vagrant creates a virtual machine, can provision it with the packages and services you define in a text file, and creates helpful links in between your host OS and the guest OS.

## [Phalcon PHP][3]

I need to write another post entitled "Phalcon is Awesome". I've only recently started to develop with the C-extension based PHP framework, but boy does it pack a punch. One phrase before I do a write-up: [~800 requests per second][4].

The only downside of using Phalcon is having to compile and load it for use by PHP. `git clone`-ing the [cphalcon repo][5] and running the build script is easy enough, but what if you're getting help from a creative that has no idea how to set up a virtual host on their local machine, let alone compiling a PHP extension?

## Use Vagrant, of course!

I've been using Vagrant to host a Phalcon project for a while, and I managed to extract out the Vagrant goodies into a stand-alone project: [vagrant-phalcon][6]. With the help of a Puppet manifest and a bash script, vagrant-phalcon helps developers of all skill levels start with Phalcon with an easy `vagrant up` command. Details from the README.md:

> #### Getting Started
>
>   1. Download and install [VirtualBox][2]
>   2. Download and install [Vagrant][1]
>   3. Clone this repo
>   4. Run `vagrant up` in the repo directory
>   5. Visit `http://localhost:8081/` in your favorite browser
>
> ##### Note
>
> Nginx is configured by default to use `./src/Public/` as the root directory. If your public directory differs, be sure to update the `Vagrantfile` to reflect your needs.

While not perfect, it does the job of setting up a Phalcon dev environment quite well, so I felt content with releasing it out into the wild. Happen to find a problem with it or have a suggestion? Submit an [issue][7], or better yet, submit a [pull-request][8].

Here's an ascii-cast walkthrough:

 [1]: http://www.vagrantup.com/
 [2]: https://www.virtualbox.org/
 [3]: http://www.phalconphp.com/
 [4]: http://systemsarchitect.net/performance-benchmark-of-popular-php-frameworks/ "Performance benchmarks of PHP frameworks"
 [5]: https://github.com/phalcon/cphalcon
 [6]: https://github.com/slogsdon/vagrant-phalcon
 [7]: https://github.com/slogsdon/vagrant-phalcon/issues
 [8]: https://github.com/slogsdon/vagrant-phalcon/pulls
