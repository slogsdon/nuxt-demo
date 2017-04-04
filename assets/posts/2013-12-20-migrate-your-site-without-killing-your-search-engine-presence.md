---
title: Migrate Your Site Without Killing Your Search Engine Presence
author: shane
layout: post
date: 2013-12-20
categories:
  - All Posts
  - DevOps
  - Programming
tags:
  - apache
  - devops
  - migration
  - nginx
  - redirects
alias:
  - /migrate-your-site-without-killing-your-search-engine-presence/
  - /posts/devops/migrate-your-site-without-killing-your-search-engine-presence/
image: view-down-alley.jpeg
description: SEO is a hard beast to tame. Once you have everything just right, moving to a new platform, a new URL structure, or even a new domain can be stressful without taking the necessary steps first.
---

Let's face it. Search engine optimization (SEO) is a hard beast to tame. Once you have everything just right, moving to a new platform, a new URL structure, or even a new domain can be stressful without taking the necessary steps first. Oh, you need a guide? Let me walk you through.

<!--more-->

## Preparation

### Is this really necessary?

Do yourself a solid, and ask yourself these questions. If you're moving to a new platform, is there a way to set your routes and resources to use the same URL structure that you're currently using? Are your current URLs really that bad? If a new domain, why is it necessary to switch?

Really thinking about and answering those questions will make sure you're going through with this for the right reasons. Prepare for possible enhancements in the future.

### Determine new URL structure

Looking to your application for what's possible and looking to your content for what's available, this is where you decide on your new URL structure. Be concise with what you decide. You don't need or want super long URLs. They also need to be a nice mix of simplicity and proper hierarchy for SEO benefits.

This step is mostly on you. Make wise decisions that make sense for your content. Take into account conventions used by others.

### How are the redirects going to be handled?

Like it or not, this process is not immediate. There are going to be links somewhere that will be using the your old URL structure, whether they be bookmarks, links in forum or blog posts, search engine listings, etc. We want to be sure you don't lose the traffic from those links, so redirects are going to be the key to your success in this endeavor.

#### Letting your web server handle it

Web server based redirects will be your best bet. They will help reduce latency in the request by redirecting it before your application has a chance to touch it. Seeing that [Apache][1] and [nginx][2], there will be examples of ways to set up the redirects in both later in this section. In any case, we want to use permanent (301) redirects to let browsers and search engine bots know that the old resource will never be used again and to remember the new URL.

If you're using a control panel like CPanel, Plesk, etc., you may have the option to set up your redirects through the control panel. Beware that some, like Plesk, use temporary (302) redirects which are not desired. In those cases, you will want to set up your redirect rules manually with a `.htaccess` file. Hosts with control panels typically use Apache for the web server, so `.htaccess` files, which are Apache-specific, will work just fine. If nginx is used, a `.htaccess` file will accomplish nothing, so redirect will need to be set up in the virtual host config file for the domain.

##### Side note for static sites on [GitHub Pages][3] or [S3][4]

Since static site generators and hosting on GitHub or S3 are all the rage right now, I should make a couple notes.

If you're using S3, congratulations! Follow the [AWS docs][5], and set up your redirects in the AWS S3 console.

If you're using GitHub Pages, bad news bears for you. Redirects are not yet supported by the web server, so you're reduced down to using Javascript or a meta refresh if you want your website to handle the redirect. Doing either of those, you will want to add a `<link rel="canonical" href="http://www.yourdomain.com/...">` to prevent duplicate content as the redirects are only issued as temporary (302).

##### Examples

The following are just examples for Apache and nginx. You will need to adjust/add to these to match your use case.

###### Apache

These can be placed in your virtual host config file in a `<Directory>` node or in a `.htaccess` file:

```conf
# Redirecting basic matches using Redirect.
# Be sure to list more precise rules first. They are interpreted in order
Redirect permanent /s/your-awesome-service http://www.yourdomain.com/services/your-awesome-service
Redirect permanent /post-about-something http://www.yourdomain.com/posts/post-about-something
Redirect permanent /s http://www.yourdomain.com/services

# Redirecting using mod_rewrite (if available)
# Be sure to list more precise rules first. They are interpreted in order
RewriteEngine on
RewriteRule ^/s/(.+)$ http://www.yourdomain.com/services/$1 [R=301,L]
RewriteRule ^/s$ http://www.yourdomain.com/services [R=301,L]
# Treat all other requests as posts
RewriteRule ^(.+)$ http://www.yourdomain.com/posts$1 [R=301,L]
```

###### nginx

These will need to be placed in a `server` configuration block:

```nginx
# exact match for /s
location = /s {
    rewrite ^ http://www.yourdomain.com/services permanent;
}

# match all requests under /s/
rewrite ^/s/(.+)$ http://www.yourdomain.com/services/$1 permanent;

# exact match for /post-about-something
location = /post-about-something {
    rewrite ^ http://www.yourdomain.com/posts/post-about-something permanent;
}
```

#### Your application is next up

If you cannot or are unwilling to set up your redirects using your web server, your next best option is probably going to be your application.

For applications similar to WordPress with large plugin/extension libraries, look for one that will handle the redirects for you. WordPress, as an example, has the [Redirection][6] plugin.

For frameworks and some languages, there will typically be a method somewhere to allow for the redirect, otherwise, you will need to set the HTTP status code and `Location` header with the new location manually as long as you haven't started sending a response to the end-user. Router configurations are a great place for setting redirect rules. If your using a MVC framework, your controller actions could be another option.

With .NET, you can use something like this:

```csharp
// .NET versions < 4.0
Response.Redirect(newLocation, false);
Response.StatusCode = 301;
Response.End();

// .NET versions 4.0+
Response.PermanentRedirect(newLocation);
```

You can use this in PHP:

```php
header('HTTP/1.1 301 Moved Permanently');
header('Location: ' + newLocation);
exit();
```

### Let the search engines know

This is one of the simpler steps in the process, but it can be quite important. Create an up-to-date version of your sitemap, whether it be a true sitemap, a RSS feed, or an Atom feed. Along with sending 301 redirects for your old links, this will tell the search engines to crawl your site again, looking for your content at the new URLs in the process. By having the proper URL in the search engine results, this also helps your end-users (your audience) from having to follow a redirect, which is even more important when they are using mobile devices.

## Execution

Since I've recently decided that my own site was in need of change, we'll walkthrough my decisions and actions with migrating to a new URL strucure and a new domain.

### Is this necessary?

_If you're moving to a new platform, is there a way to set your routes and resources to use the same URL structure that you're currently using?_ I'm moving to using [Jekyll][7] on [GitHub Pages][3], so yes is the answer to this question. Jekyll has the ability to set a permalink structure that can mimic a multitude of possibilities, even setting it on a post-by-post basis.

_Are your current URLs really that bad?_ Yes, the were. My old application (which was based on another) only allowed for a single level for the site's hierarchy without expanding on the functionality. Could I have done that? Yes. Did I want to do more than I already had (I had added the ability for categories by extending the use of the posts' slugs)? No, because I'm lazy. I didn't want to put in the extra time involved with modifying my old application.

_If a new domain, why is it necessary to switch?_ This is mainly for an imporvement on my email. I currently have a rather long email address (shane@shanelogsdon.com), but I want a nice simple email (shane@logsdon.io). This doesn't simplify my web site's URL (same amount of characters) unless I take home on the root domain (logsdon). It does, however, match my email, which makes sense to me. With this domain change, I can add family members easily, if they'd like, to email and hosting.

### Determining new URLs

I want a nice and simple URL structure for my own content. This is what I came up with:

    /posts/[category]/[post]
    /categories/[category]
    /projects/[project]
    /contact/
    /videos/ (for eventual screencasts)


This will lend to being able to add new sections as I desire, such as the "videos" portion that I will eventually have for screencasts. It's simple. It lets me organize the content in a sensible manner.

### Setting up my redirects

I only had a short list of links that I needed to worry. Here they are with there they will point to on the new site:

    /
        -> http://slogsdon.com/
    /installing-nginx-percona-php-fpm-with-homebrew-on-mountain-lion
        -> /posts/devops/installing-nginx-percona-php-...
    /linux-and-net-should-be-friends
        -> /posts/net/linux-and-net-...
    /using-obtvse
        -> /posts/ruby/using-obtvse
    /migrating-from-mysql-server-to-percona-server
        -> /posts/devops/migrating-from-mysql-...
    /vagrant-is-awesome
        -> /posts/devops/vagrant-is-awesome
    /im-already-tired-of-rails-already
        -> /posts/ruby/im-already-tired-...
    /chicagoboss
        -> /posts/erlang/chicagoboss
    /migrating-to-acvte
        -> /posts/golang/migrating-to-acvte
    /erlang/implementing-user-authentication-with-bcrypt-in-chicagoboss
        -> /posts/erlang/implementing-user-authen...
    /list/get-awesome-with-list---nov-2013
        -> /posts/list/get-awesome-with-list-nov-2013
    /elixir/writing-api-wrappers-with-elixir
        -> /posts/elixir/writing-api-wra...


I ran into some luck with my redirects since I was moving to GitHub pages where redirects cannot be done with the web server. Because I was moving to a different domain as well, I left my old domain pointed to my cloud server, setting up my redirects in my nginx `shanelogsdon.com` server block.

### Updating my sitemap

After creating a new Atom feed with Jekyll, I submitted it to my Google Webmasters Tools account. While most (read all) of my organic traffic comes from Google, I decided this would be a nice chance to see it anyone actually uses Bing, so I submitted to Bing's webmasters tools as well. I know what you're thinking, and I didn't know Bing had a set of webmasters tools as well.

## Post-Mortem

Following the steps outlined above, I was able to change domains and URL structure for all of my content without a loss in traffic. My cloud server continues to redirect requests to my old application/domain, and both Bing and Google have the new URLs and domain in their search results.

Overall, it looks like I'll get through this alive. If you need to go through this process as well, I hope that the steps detailed above will help guide you to success.

 [1]: http://httpd.apache.org/
 [2]: http://nginx.org/
 [3]: https://pages.github.com/
 [4]: http://aws.amazon.com/s3/
 [5]: http://docs.aws.amazon.com/AmazonS3/latest/dev/how-to-page-redirect.html#page-redirect-using-console
 [6]: http://wordpress.org/plugins/redirection/
 [7]: http://jekyllrb.com/
