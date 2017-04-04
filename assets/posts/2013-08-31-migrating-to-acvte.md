---
title: Migrating to Acvte
author: shane
layout: post
date: 2013-08-31
categories:
  - All Posts
  - DevOps
tags:
  - acvte
  - devops
  - golang
  - rails
alias: /migrating-to-acvte/
---

Remember [this][1]? I do. I finally got [acvte][2] to a point where I was comfortable using it in production for this website.

<!--more-->

So far, the performance improvement has been totally worth the sixteen days it has taken to get to this point. Check out the memory usage drop that I grabbed from NewRelic:

<center>
  <amp-img width="640" height="254" src="http://i.imgur.com/J57L8U7.png" alt="" />
</center>

And a more quantitative view:

<center>
  <amp-img width="340" height="480" src="http://i.imgur.com/HaFbS2x.png" alt="" />
</center>

Right before 12:05 is when I flipped the switch[^1]. I killed the config using the rails-based [obtvse2][3] and migrated to the one using acvte. The drop in the graph above shows that switch in more of a defined manner than I was expecting.

The table above details the actual memory usage of both apps. Obtvse2, well rails actually, was using 113MB, an average amount across the app's lifespan. Acvte, on the other hand, was only using 8MB. Here's a fun fact. Three instances of acvte (`blog`, `acvte`, and `bash` in the table) combined used only ~21% of the memory used by the rails app. The `bash` instance was me running acvte in dev mode for some debugging, while the other two were running via `upstart`.

Sadly, I don't have definitive numbers on app response time from the server as NewRelic doesn't support Go at the moment, although I can estimate using Chrome Developer Tools. NewRelic is showing that obtvse2 had an average response time of 67ms. Chrome shows an estimated average response time of 4ms, assuming response time is Time &#8211; Latency[^2].

## On the whole, [Preparation H feels good][4]

Go has left me wanting more. I just want more. More time with it. More projects written in it. Development time with it is quick, writing, compiling, and running, while the code is concise and easy to read for when I don't document (considering my track record with code, that will be most of the time).

[^1]: Obtvse2 was running as a Passenger app, while acvte was running as itself. Both were reverse-proxied from nginx, had varnish acting as an edge cache, and were running on a 1GB Memory, 1 Core, 30GB SSD cloud instance from DigitalOcean.
[^2]: Definition of Time (total duration) and Latency (time to first byte) from <a href="https://developers.google.com/chrome-developer-tools/docs/network">Google</a>.

 [1]: http://shanelogsdon.com/im-already-tired-of-rails-already
 [2]: https://github.com/slogsdon/acvte
 [3]: https://github.com/natew/obtvse2
 [4]: http://www.youtube.com/watch?v=mi5kXcc-TJ8
