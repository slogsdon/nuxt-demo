---
title: I’m already tired of Rails…already
author: shane
layout: post
date: 2013-08-15
categories:
  - All Posts
tags:
  - acvte
  - golang
  - obtvse2
  - ruby
alias:
  - /im-already-tired-of-rails-already/
  - /posts/ruby/im-already-tired-of-rails-already/
---

Neckbeards of the Internet. Prepare yourselves for the following comment: I don't think Rails is for me.

I love Ruby as a scripting language. Its syntax is elegant and expressive. The tools available for both Ruby and Rails are fantastically built and really help drive the community behind them. The features built into the Rails framework leave me wanting similar features in other frameworks written in other languages.

These points don't have any effect on my main gripes with Rails. I've always strived for low memory consumption and fast execution times when it comes to my web applications. Using .NET at work, our in-house SAAS products all conform to these goals, and I always aim at having my personal projects hitting them as well, even if they aren't compiled. Being a PHP developer at heart, I love the benefits of an interpreted language running a web app, but when the app is consuming way more memory than I think it should, it's time to replace it.

<!--more-->

## Story Time

When I first launched this site, I was publishing with [Scriptogr.am][1] but soon decided to self-host. In a weekend, I custom-rolled a solution similar to Scriptogr.am, with markdown files being parsed for the same information used by Scriptogr.am, written in C# with MVC4. It was fast enough, and Mono was only using ~80MB. Not perfect but acceptable.

Fast-forward a couple months. I've always wanted liked the [obtvse][2] project, so I decided to take the Rails app for a spin as my production site. Migration was simple once I figured out the proper steps needed to host it behind nginx. Having already set up a reverse-proxy cache, my page load times are nothing to shake a stick at, but NewRelic reports my app response times to be 20-30ms slower than a [Phalcon][3]-based app I'm currently developing, which consistently has response-times lower than 6ms.

Maybe the memory consumption is lower? Don't count on it. The single ruby process running obtvse via Passenger is using 135MB, while the master php-fpm process and the two php-fpm worker processes running that Phalcon project are using a combined total of 33MB. A disparity of 100MB seems like a lot to me. Where is it all going? Someone probably knows but not me.

## golang to the rescue?

As a career developer, I'm always messing with the latest and greatest tools and languages that interest me. Coming across [Revel][4], a web application framework for Go, I decided to take it for a test run. After updating my go environment to make use of the newly released `go1.1.2`, I easily had a revel app up and running.

After the initial compile after starting the app, something I've grown accustom to from deploying .NET apps at work, response times reported by Chrome Inspector are sitting at about 6ms locally. Right on par with Phalcon. How about memory consumption? Using `revel run revel-test` to run it, the app is using 7MB with `revel` itself using 10MB. I'm assuming this will decrease after building for production, but even at 17MB, the Revel app is coming in as the lightweight champ.

## What now?

Obviously, I still need to code out features in my goblog project to mirror what I've come to expect from obtvse, but as long as the performance of the app remains steady, this site will soon be a golang site.

I'm already excited, and I haven't even started. I wonder if I can write a lean GitHub clone that doesn't use upwards of 500MB of my server's RAM. Yeah, I'm looking at you, [GitLab][5]. I like you, but that's stupid.

 [1]: http://scriptogr.am/
 [2]: https://github.com/natew/obtvse2
 [3]: http://phalconphp.com/
 [4]: http://robfig.github.io/revel/
 [5]: https://github.com/gitlabhq/gitlabhq
